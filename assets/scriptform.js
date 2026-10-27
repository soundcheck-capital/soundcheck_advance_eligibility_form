/**
 * Quick estimate, ported from express-form lib/estimate.ts (the "new model" sheet,
 * tab "(1) Pre-Qual + Express"): risk score = years + events scores, the score band
 * picks the rate, advance = rate × gross ticket sales, capped at $1M.
 * The widget doesn't ask the company type, so it uses the Venue/Other/Promoter rate.
 */
function advanceMax(years, events, sales) {
    const yearsScore = years >= 10 ? 0 : years >= 6 ? 3 : years >= 3 ? 5 : years >= 1 ? 8 : 10;
    const eventsScore = events >= 50 ? 0 : events >= 21 ? 4 : events >= 11 ? 5 : events >= 7 ? 6 : events >= 4 ? 7 : events >= 2 ? 8 : 10;
    const score = yearsScore + eventsScore;
    const rate = score <= 5 ? 0.2 : score <= 11 ? 0.15 : score <= 15 ? 0.1 : 0.05;
    return Math.min(1000000, Math.round(rate * sales));
}

/**
 * Partner pages (bem): payload for the website simulator's n8n webhook, which creates contact +
 * company + deal in HubSpot tagged with the partner. null when a required field is missing.
 */
function partnerPayload(f) {
    const t = (v) => String(v ?? '').trim();
    const partnerQuote = Number(t(f.partnerQuote));
    if (!t(f.firstName) || !t(f.lastName) || !t(f.website) || !(partnerQuote > 0)) return null;
    return {
        formType: 'simulator',
        partner: f.partner,
        partnerQuote,
        firstName: t(f.firstName),
        lastName: t(f.lastName),
        website: t(f.website),
        email: f.email,
        yearsInBusiness: f.years,
        numberOfEvents: f.events,
        grossTicketSales: f.sales,
        advanceAmount: advanceMax(Number(f.years), Number(f.events), Number(f.sales)),
        sourceUrl: f.sourceUrl,
    };
}

/**
 * Partner pages: what changes per partner. The theme (bem, hive, prism) is also the partner tag
 * sent to n8n. null for themes that aren't partners.
 */
function partnerConfig(theme) {
    const partners = {
        bem: { name: 'BEM', logo: 'bem_logo_white.png', logoAlt: 'Bauer Entertainment Marketing logo',
            fonts: 'family=Lato:wght@300;400;700&family=Merriweather:wght@300;400' },
        hive: { name: 'Hive', logo: 'hive_logo_white.png', logoAlt: 'Hive logo',
            fonts: 'family=Anton&family=Archivo:wght@400;500;600' },
        prism: { name: 'Prism', logo: 'prism_logo_white.png', logoAlt: 'Prism.fm logo',
            fonts: 'family=Poppins:wght@400;500;600;700' },
        // Not a vendor with a quote, and no ticketing-company question (it lists their competitors).
        theticketingco: { name: 'The Ticketing Co.', logo: 'theticketingco_logo_white.svg', logoAlt: 'The Ticketing Co. logo',
            quoteLabel: 'How much funding do you need?', cta: 'Apply for funding →' },
    };
    return Object.hasOwn(partners, theme) ? partners[theme] : null;
}

class CustomForm extends HTMLElement {
    connectedCallback() {
        // Allow ?theme=venue-pilot on the page URL; an explicit data-theme wins.
        const theme = new URLSearchParams(window.location.search).get('theme');
        if (theme && !this.hasAttribute('data-theme')) this.setAttribute('data-theme', theme);
        const partner = partnerConfig(this.getAttribute('data-theme'));
        if (partner) {
            this.setAttribute('data-partner', '');
            const logo = this.shadowRoot.querySelector('.partner-logo');
            logo.src = new URL(partner.logo, this.assetBase).toString();
            logo.alt = partner.logoAlt;
            this.shadowRoot.getElementById('partnerQuoteLabel').textContent = partner.quoteLabel || `How much is your ${partner.name} quote?`;
            if (partner.cta) this.shadowRoot.querySelector('.apply-btn').textContent = partner.cta;
            // @font-face is ignored inside shadow DOM, so theme fonts must be loaded on the page.
            if (partner.fonts && !document.getElementById('partner-fonts')) {
                const fonts = document.createElement('link');
                fonts.id = 'partner-fonts';
                fonts.rel = 'stylesheet';
                fonts.href = `https://fonts.googleapis.com/css2?${partner.fonts}&display=swap`;
                document.head.appendChild(fonts);
            }
        }
        // In an iframe (e.g. soundcheckcapital.com/bem), post the card height like the Express form
        // does, so the parent's ExpressEmbed sizes the iframe. +48 = the single-page host padding.
        if (window.parent !== window) {
            const form = this.shadowRoot.getElementById('advanceForm');
            new ResizeObserver(() => window.parent.postMessage(
                { type: 'soundcheck-express:height', height: Math.ceil(form.getBoundingClientRect().height) + 48 }, '*'
            )).observe(form);
        }
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        const scriptFromDom = document.currentScript || Array.from(document.querySelectorAll('script[src]')).find(
            (scriptTag) => scriptTag.src.includes('scriptform.js')
        );
        const scriptSrc = scriptFromDom ? scriptFromDom.src : '';
        const assetBase = scriptSrc ? new URL('.', scriptSrc) : new URL('.', window.location.href);
        this.assetBase = assetBase; // connectedCallback sets the partner logo from it
        const heroLogoSrc = new URL('logo_black_bold.svg', assetBase).toString();
        const logoSrc = new URL('../favicon.svg', assetBase).toString();

        this.shadowRoot.innerHTML = `
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap">
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap">
            <style>
:host {
    font-family: 'Archivo', sans-serif;
    background-color: #222;
    justify-content: flex-start;
    align-items: left;
    height: auto;
    margin: 0;
}

:host([data-appearance="single-page"]) {
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
    box-sizing: border-box;
    padding: 24px;
}

:host([data-theme="venue-pilot"]) {
    --vp-font: 'Open Sans', sans-serif;
    --vp-text: #191F40;
    --vp-background: #FEFCFB;
    --vp-pink: #E9498C;
    --vp-base-150: #F7F4F4;
    --vp-base-600: #6B6E83;
    --vp-base-900: #191F40;
    --vp-base-100: #FEFBFA;
    font-family: var(--vp-font);
    color: var(--vp-text);
}

#advanceForm {
    background: #ffffff;
    border-radius: 10px;
    width: min(90vw, 436px);
    height: auto;
    max-width: 436px;
    min-width: 280px;
    text-align: center;
    overflow: auto;
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 20px 15px;
    box-sizing: border-box;
}

/* Tablet */
@media (max-width: 768px) {
    #advanceForm {
        width: 95vw;
        padding: 18px 12px;
        min-width: 280px;
    }
}

/* Mobile */
@media (max-width: 480px) {
    #advanceForm {
        width: 98vw;
        padding: 15px 10px;
        border-radius: 8px;
        min-width: 260px;
    }
}

:host([data-theme="venue-pilot"]) #advanceForm {
    background: var(--vp-background);
}

:host([data-appearance="single-page"]) #advanceForm {
    background: #ffffff;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
    margin: 0 auto;
}

.slider-container {
    margin-bottom: 20px;
}

@media (max-width: 480px) {
    .slider-container {
        margin-bottom: 15px;
    }
}

.logo {
    height: 30px;
    width: auto;
    max-width: 160px;
    object-fit: contain;
    position: absolute;
    top: 8px;
    right: 12px;
}

:host([data-appearance="single-page"]) .logo {
    display: none;
}

.hero {
    display: none;
}

:host([data-appearance="single-page"]) .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin: 0 0 12px 0;
}

:host([data-appearance="single-page"]) .hero-logo {
    width: 140px;
    height: auto;
}

:host([data-appearance="single-page"]) .hero-heading {
    margin: 0;
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    text-align: center;
    line-height: 1.2;
}

:host([data-appearance="single-page"]) .questions {
    margin: 0 0 12px 0;
}

@media (max-width: 480px) {
    .logo {
        height: 26px;
        max-width: 140px;
        top: 6px;
        right: 8px;
    }
}

.questions {
    color: #434343;
    opacity: 80%;
    font-size: 15px;
    margin-bottom: 0 7px 0 0;
}

.questions,
.eligibilityLabel {
    transition: color 0.2s ease;
}

@media (max-width: 480px) {
    .questions {
        font-size: 14px;
    }
}

.eligibilityLabel {
    color: #696969;
    font-size: 12px;
    line-height: 150%;
    max-width: 450px;
    margin: 8px auto 0 auto;
}

:host([data-theme="venue-pilot"]) .questions,
:host([data-theme="venue-pilot"]) .eligibilityLabel {
    color: var(--vp-base-600);
    font-family: var(--vp-font);
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 150%;
    letter-spacing: 0.2px;
    opacity: 1;
}

@media (max-width: 480px) {
    .eligibilityLabel {
        font-size: 12px;
    }
}

input[type=range] {
    width: 80%;
    height: 3px;
    -webkit-appearance: none;
    appearance: none;
    background: #e68900;
    border-radius: 5px;
    outline: none;
    touch-action: none; /* Meilleure interaction tactile */
}

:host([data-theme="venue-pilot"]) input[type=range] {
    background: transparent;
}

@media (max-width: 480px) {
    input[type=range] {
        width: 85%;
        height: 4px;
    }
}

/* Barre de progression avant et après le curseur (WebKit: Chrome, Safari, Edge) */
input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 2px;
    border-radius: 5px;
    background: linear-gradient(to right, #e68900 var(--progress), #ddd var(--progress));
}

:host([data-theme="venue-pilot"]) input[type=range]::-webkit-slider-runnable-track {
    height: 4px;
    background: linear-gradient(to right, var(--vp-pink) var(--progress), #FEDCEA var(--progress));
}

/* Curseur du slider (WebKit) */
input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #EE8933;
    cursor: pointer;
    margin-top: -4px;
    position: relative;
}

:host([data-theme="venue-pilot"]) input[type=range]::-webkit-slider-thumb {
    width: 14px;
    height: 14px;
    background: var(--vp-pink);
    margin-top: -5px;
}

/* Curseur plus grand sur mobile pour meilleure interaction tactile */
@media (max-width: 480px) {
    input[type=range]::-webkit-slider-thumb {
        width: 14px;
        height: 14px;
        margin-top: -5px;
    }

    input[type=range]::-moz-range-thumb {
        width: 20px;
        height: 20px;
    }
}

/* Barre pour Firefox */
input[type=range]::-moz-range-track {
    width: 100%;
    height: 2px;
    border-radius: 5px;
    background: #ddd;
}

:host([data-theme="venue-pilot"]) input[type=range]::-moz-range-track {
    height: 4px;
    background: #FEDCEA;
}

/* Partie remplie avant le curseur pour Firefox */
input[type=range]::-moz-range-progress {
    background: #e68900;
    height: 6px;
    border-radius: 5px;
}

:host([data-theme="venue-pilot"]) input[type=range]::-moz-range-progress {
    background: var(--vp-pink);
}

/* Curseur pour Firefox */
input[type=range]::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #EE8933;
    cursor: pointer;
    border: none;
}

:host([data-theme="venue-pilot"]) input[type=range]::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: var(--vp-pink);
}


.amount {
    font-size: 22px;
    font-weight: 500;
    margin: 0 12px 0 0;
}

@media (max-width: 480px) {
    .amount {
        font-size: 20px;
    }
}

.eligibility {
    font-size: 35px;
    color: #e91e63;
    font-weight: 400;
    margin: 0;
    display: inline;
}

.eligibilityDiv {
    margin-top: 16px;
}

.eligibilityLine {
    color: #000;
    font-size: 35px;
    font-weight: 400;
    margin: 0 0 6px 0;
}

.amount,
.eligibility {
    transition: color 0.2s ease;
}

:host([data-theme="venue-pilot"]) .amount,
:host([data-theme="venue-pilot"]) .eligibility {
    font-family: var(--vp-font);
}

:host([data-theme="venue-pilot"]) .amount {
    color: var(--vp-text);
}

:host([data-theme="venue-pilot"]) .eligibility {
    color: var(--vp-pink);
}

@media (max-width: 768px) {
    .eligibility {
        font-size: 32px;
    }
}

@media (max-width: 480px) {
    .eligibility {
        font-size: 28px;
    }
}

.email-input {
    width: 90%;
    max-width: 100%;
    height: 40px;
    border: 0.3px solid #03010A;
    border-radius: 6px;
    margin-bottom: 10px;
    margin-top: 24px;
    text-indent: 10px;
    padding: 0;
    align-self: center;
    box-sizing: border-box;
    font-size: 16px;
}

:host([data-theme="venue-pilot"]) .email-input {
    background: var(--vp-base-150);
    border: 1px solid var(--vp-base-150);
    color: var(--vp-base-900);
    font-family: var(--vp-font);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
    letter-spacing: 0.2px;
    caret-color: var(--vp-pink);
    outline: none;
}

:host([data-theme="venue-pilot"]) .email-input::placeholder {
    color: var(--vp-base-600);
    font-family: var(--vp-font);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
    letter-spacing: 0.2px;
}

:host([data-theme="venue-pilot"]) .email-input:focus {
    border-color: var(--vp-pink);
    box-shadow: 0 0 0 3px rgba(233, 73, 140, 0.15);
}

@media (max-width: 480px) {
    .email-input {
        width: 95%;
        height: 44px;
        font-size: 16px; /* Évite le zoom automatique sur iOS */
        margin-top: 18px;
    }
}

.apply-btn {
    background: #ff9800;
    color: white;
    border: none;
    padding: 10px;
    width: 90%;
    max-width: 100%;
    height: 40px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    flex: content;
    align-self: center;
    margin-bottom: 13px;
    box-sizing: border-box;
    transition: background 0.3s ease;
}

:host([data-theme="venue-pilot"]) .apply-btn {
    background: var(--vp-pink);
    color: var(--vp-base-100);
    border-radius: 8px;
    font-family: var(--vp-font);
    font-size: 14px;
    font-weight: 700;
    line-height: 150%;
    letter-spacing: 0.2px;
}

.apply-btn:hover {
    background: #e68900;
}

:host([data-theme="venue-pilot"]) .apply-btn:hover {
    background: #d83e7f;
}

.apply-btn:active {
    background: #d67800;
}

:host([data-theme="venue-pilot"]) .apply-btn:active {
    background: #c33873;
}

.apply-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

:host([data-theme="venue-pilot"]) .apply-btn:disabled {
    background: #eab7ce;
}

@media (max-width: 480px) {
    .apply-btn {
        width: 95%;
        height: 44px;
        font-size: 16px;
        margin-bottom: 10px;
    }
}

/* Partner pages (bem, hive, prism): partner logo instead of ours, their quote instead of our estimate */
.partner-logo {
    display: none;
}

:host([data-partner]) .partner-logo {
    display: block;
    margin: 0 auto;
    width: 180px;
    height: auto;
    filter: invert(1); /* white-on-transparent source logos */
}

:host([data-partner]) .hero-logo {
    display: none;
}

/* BEM (Bauer Entertainment Marketing): colors from bauerentertainmentmarketing.com */

:host([data-theme="bem"]) {
    --bem-font: 'Lato', sans-serif;
    --bem-serif: 'Merriweather', serif;
    --bem-dark: #201A16;
    --bem-purple: #5E4979;
    --bem-purple-dark: #4B3A61;
    --bem-purple-light: #E4DEEA;
    font-family: var(--bem-font);
    color: var(--bem-dark);
}

/* Same purple as soundcheckcapital.com/bem, which embeds this page */
:host([data-theme="bem"][data-appearance="single-page"]) {
    background: #5F497A;
}

/* The client already has a partner quote, so ask for it instead of showing our estimate */
.partner-fields {
    display: none;
    flex-direction: column;
    margin-top: 16px;
}

.partner-fields .email-input {
    margin: 6px 0 0 0;
}

:host([data-partner]) .partner-fields {
    display: flex;
}

:host([data-partner]) .eligibilityDiv {
    display: none;
}

:host([data-theme="bem"]) .eligibilityLine,
:host([data-theme="bem"]) .amount {
    color: var(--bem-dark);
    font-family: var(--bem-font);
    font-weight: 300;
}

/* Their site: Merriweather 300 for body copy, Lato for headings and CTAs */
:host([data-theme="bem"]) .questions,
:host([data-theme="bem"]) .eligibilityLabel,
:host([data-theme="bem"]) .email-input {
    font-family: var(--bem-serif);
    font-weight: 300;
}

:host([data-theme="bem"]) .eligibility {
    color: var(--bem-purple);
}

:host([data-theme="bem"]) input[type=range] {
    background: transparent;
}

:host([data-theme="bem"]) input[type=range]::-webkit-slider-runnable-track {
    background: linear-gradient(to right, var(--bem-purple) var(--progress), var(--bem-purple-light) var(--progress));
}

:host([data-theme="bem"]) input[type=range]::-webkit-slider-thumb {
    background: var(--bem-purple);
}

:host([data-theme="bem"]) input[type=range]::-moz-range-thumb {
    background: var(--bem-purple);
}

:host([data-theme="bem"]) input[type=range]::-moz-range-progress {
    background: var(--bem-purple);
}

:host([data-theme="bem"]) input[type=range]::-moz-range-track {
    background: var(--bem-purple-light);
}

:host([data-theme="bem"]) .email-input:focus {
    outline: none;
    border-color: var(--bem-purple);
    box-shadow: 0 0 0 3px rgba(94, 73, 121, 0.15);
}

:host([data-theme="bem"]) .apply-btn {
    background: var(--bem-purple);
    font-family: var(--bem-font);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
}

:host([data-theme="bem"]) .apply-btn:hover,
:host([data-theme="bem"]) .apply-btn:active {
    background: var(--bem-purple-dark);
}

/* Hive: near-black, square corners. Anton/Archivo stand in for their FK Screamer/FT Regola. */
:host([data-theme="hive"]) {
    --hive-dark: #131417;
    --hive-track: #E2E3E7;
    font-family: 'Archivo', sans-serif;
    color: var(--hive-dark);
}

/* Same near-black as soundcheckcapital.com/hive, which embeds this page */
:host([data-theme="hive"][data-appearance="single-page"]) {
    background: #131417;
}

:host([data-theme="hive"]) #advanceForm,
:host([data-theme="hive"]) .email-input,
:host([data-theme="hive"]) .apply-btn {
    border-radius: 0;
}

:host([data-theme="hive"]) .questions {
    color: #4A4D55;
}

:host([data-theme="hive"]) .amount {
    color: var(--hive-dark);
}

:host([data-theme="hive"]) input[type=range] {
    background: transparent;
}

:host([data-theme="hive"]) input[type=range]::-webkit-slider-runnable-track {
    background: linear-gradient(to right, var(--hive-dark) var(--progress), var(--hive-track) var(--progress));
}

:host([data-theme="hive"]) input[type=range]::-webkit-slider-thumb {
    background: var(--hive-dark);
}

:host([data-theme="hive"]) input[type=range]::-moz-range-thumb {
    background: var(--hive-dark);
}

:host([data-theme="hive"]) input[type=range]::-moz-range-progress {
    background: var(--hive-dark);
}

:host([data-theme="hive"]) input[type=range]::-moz-range-track {
    background: var(--hive-track);
}

:host([data-theme="hive"]) .email-input:focus {
    outline: none;
    border-color: var(--hive-dark);
    box-shadow: 0 0 0 3px rgba(19, 20, 23, 0.15);
}

:host([data-theme="hive"]) .apply-btn {
    background: var(--hive-dark);
    font-family: 'Archivo', sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

:host([data-theme="hive"]) .apply-btn:hover,
:host([data-theme="hive"]) .apply-btn:active {
    background: #2A2C31;
}

/* Prism.fm: purple gradient #6450C1 → #8412AF, Poppins */
:host([data-theme="prism"]) {
    --prism-violet: #6450C1;
    --prism-purple: #8412AF;
    --prism-track: #E4E1F3;
    font-family: 'Poppins', sans-serif;
    color: #1A303C;
}

/* Same gradient as soundcheckcapital.com/prism, which embeds this page */
:host([data-theme="prism"][data-appearance="single-page"]) {
    background: linear-gradient(180deg, #6450C1 0%, #8412AF 100%);
}

:host([data-theme="prism"]) #advanceForm {
    border-radius: 16px;
}

:host([data-theme="prism"]) .email-input,
:host([data-theme="prism"]) .apply-btn {
    border-radius: 8px;
}

:host([data-theme="prism"]) .questions {
    color: #465663;
}

:host([data-theme="prism"]) .amount {
    color: #1A303C;
}

:host([data-theme="prism"]) input[type=range] {
    background: transparent;
}

:host([data-theme="prism"]) input[type=range]::-webkit-slider-runnable-track {
    background: linear-gradient(to right, var(--prism-violet) var(--progress), var(--prism-track) var(--progress));
}

:host([data-theme="prism"]) input[type=range]::-webkit-slider-thumb {
    background: var(--prism-violet);
}

:host([data-theme="prism"]) input[type=range]::-moz-range-thumb {
    background: var(--prism-violet);
}

:host([data-theme="prism"]) input[type=range]::-moz-range-progress {
    background: var(--prism-violet);
}

:host([data-theme="prism"]) input[type=range]::-moz-range-track {
    background: var(--prism-track);
}

:host([data-theme="prism"]) .email-input:focus {
    outline: none;
    border-color: var(--prism-violet);
    box-shadow: 0 0 0 3px rgba(100, 80, 193, 0.15);
}

:host([data-theme="prism"]) .apply-btn {
    background: linear-gradient(90deg, var(--prism-purple) 0%, var(--prism-violet) 100%);
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

:host([data-theme="prism"]) .apply-btn:hover,
:host([data-theme="prism"]) .apply-btn:active {
    background: linear-gradient(90deg, #6E0E93 0%, #5443A8 100%);
}

/* The Ticketing Co.: same navy, blue and pill buttons as soundcheckcapital.com/theticketingco */
:host([data-theme="theticketingco"]) {
    --ttc-navy: #0B1320;
    --ttc-blue: #0048FF;
    --ttc-track: #E3E9F4;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: var(--ttc-navy);
}

/* Same navy as soundcheckcapital.com/theticketingco, which embeds this page */
:host([data-theme="theticketingco"][data-appearance="single-page"]) {
    background: var(--ttc-navy);
}

:host([data-theme="theticketingco"]) #advanceForm {
    border-radius: 20px;
}

:host([data-theme="theticketingco"]) .email-input {
    border-radius: 12px;
}

:host([data-theme="theticketingco"]) .apply-btn {
    border-radius: 999px;
    background: var(--ttc-blue);
    font-family: inherit;
    font-weight: 600;
}

:host([data-theme="theticketingco"]) .apply-btn:hover,
:host([data-theme="theticketingco"]) .apply-btn:active {
    background: #0036C2;
}

:host([data-theme="theticketingco"]) .questions {
    color: #4A5568;
}

:host([data-theme="theticketingco"]) .amount {
    color: var(--ttc-navy);
}

:host([data-theme="theticketingco"]) input[type=range] {
    background: transparent;
}

:host([data-theme="theticketingco"]) input[type=range]::-webkit-slider-runnable-track {
    background: linear-gradient(to right, var(--ttc-blue) var(--progress), var(--ttc-track) var(--progress));
}

:host([data-theme="theticketingco"]) input[type=range]::-webkit-slider-thumb {
    background: var(--ttc-blue);
}

:host([data-theme="theticketingco"]) input[type=range]::-moz-range-thumb {
    background: var(--ttc-blue);
}

:host([data-theme="theticketingco"]) input[type=range]::-moz-range-progress {
    background: var(--ttc-blue);
}

:host([data-theme="theticketingco"]) input[type=range]::-moz-range-track {
    background: var(--ttc-track);
}

:host([data-theme="theticketingco"]) .email-input:focus {
    outline: none;
    border-color: var(--ttc-blue);
    box-shadow: 0 0 0 3px rgba(0, 72, 255, 0.15);
}
            </style>
            <form id="advanceForm">
            <div class="hero">
                <img class="partner-logo" alt="">
                <img src="${heroLogoSrc}" class="hero-logo" alt="SoundCheck Capital logo">
            </div>
            <div class="slider-container">
                <img src="${logoSrc}" class="logo" />
                <p class="questions">How long have you been in business?</p>
                <p class="amount answers" id="yearsOperating">5 years</p>
                <input type="range" min="0" max="10" value="5" id="yearsSlider">
            </div>
            <div class="slider-container">
                <p class="questions">How many events do you promote a year?</p>
                <p class="amount answers" id="eventsCount">25 events</p>
                <input type="range" min="1" max="50" value="25" id="eventsSlider">
            </div>
            <div class="slider-container">
                <p class="questions">How much gross ticket sales do you sell a year?</p>
                <p class="amount answers" id="ticketSales">$2,500,000</p>
                <input type="range" min="100000" max="10000000" step="100000" value="2500000" id="salesSlider">
            </div>
            <div class="eligibilityDiv">
                <p class="eligibilityLine"><span class="eligibilityPrefix">You're eligible for up to </span><span class="eligibility" id="eligibilityAmount">$120,000</span><span class="eligibilitySuffix">!</span></p>
                <p class="eligibilityLabel">This estimate is based on your responses and SoundCheck's market insights. To receive a formal offer, please enter your email.</p>
            </div>
            <div class="partner-fields">
                <p class="questions" id="partnerQuoteLabel"></p>
                <input id="partnerQuote" type="number" min="0" step="any" inputmode="decimal" class="email-input" placeholder="$150,000">
                <input id="firstName" class="email-input" placeholder="First name" autocomplete="given-name">
                <input id="lastName" class="email-input" placeholder="Last name" autocomplete="family-name">
                <input id="website" class="email-input" placeholder="Company website" autocomplete="url">
            </div>
            <input id="email" type="email" class="email-input" placeholder="your-email@google.com">
            <button class="apply-btn" type="submit">Apply Now</button>
        </form>
        `;
       
    
        // Ajouter les événements
        this.shadowRoot.querySelector("#advanceForm").addEventListener("submit", (event) => {
            event.preventDefault();
            this.sendEmail();
        });
        // Mettre à jour les valeurs des sliders
        this.shadowRoot.getElementById("yearsSlider").addEventListener("input", (event) => {
                const input = Number(event.target.value);
                if(input === 0) this.shadowRoot.getElementById("yearsOperating").innerText = `Less than a year`;
                else if(input === 1) this.shadowRoot.getElementById("yearsOperating").innerText = `${input} year`;
                else if(input === 10) this.shadowRoot.getElementById("yearsOperating").innerText = `${input}+ years`;
                else this.shadowRoot.getElementById("yearsOperating").innerText = `${input} years`;
                this.calculateAdvance();
            });

            this.shadowRoot.getElementById("eventsSlider").addEventListener("input", (event) => {
                const input = Number(event.target.value);
                if(input === 1) this.shadowRoot.getElementById("eventsCount").innerText = `${input} event`;
                else if(input === 50) this.shadowRoot.getElementById("eventsCount").innerText = `${input}+ events`;
                else this.shadowRoot.getElementById("eventsCount").innerText = `${input} events`;
                this.calculateAdvance();
            });    
            const formatSalesValue = (value) => {
                if (value >= 10000000) return "$10M+";
                return `$${value.toLocaleString("en-US")}`;
            };

            this.shadowRoot.getElementById("salesSlider").addEventListener("input", (event) => {
                const input = Number(event.target.value);
                this.shadowRoot.getElementById("ticketSales").innerText = formatSalesValue(input);
                this.calculateAdvance();
            });

            this.shadowRoot.getElementById("ticketSales").innerText = formatSalesValue(
                Number(this.shadowRoot.getElementById("salesSlider").value)
            );
        this.shadowRoot.querySelectorAll("input[type=range]").forEach(slider => {
            function updateProgress() {
                let percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
                slider.style.setProperty("--progress", percent + "%");
            }
        
            slider.addEventListener("input", updateProgress);
            updateProgress(); // Initialise la valeur au chargement de la page
        });
        this.calculateAdvance();

    }
    
    calculateAdvance() {
        const sales = Number(this.shadowRoot.getElementById("salesSlider").value);
        const events = Number(this.shadowRoot.getElementById("eventsSlider").value);
        const years = Number(this.shadowRoot.getElementById("yearsSlider").value);
        this.shadowRoot.getElementById("eligibilityAmount").innerText =
            `$${advanceMax(years, events, sales).toLocaleString("en-US")}`;
    }
    
    sendEmail() {
        const email = this.shadowRoot.querySelector("#email").value;
        let sales = this.shadowRoot.getElementById("salesSlider").value;
        var events = this.shadowRoot.getElementById("eventsSlider").value;
        var years = this.shadowRoot.getElementById("yearsSlider").value;
        var eligibility = this.shadowRoot.getElementById("eligibilityAmount").innerText;

        // Validation de l'email
        if (!email || !email.includes('@')) {
            alert("Veuillez entrer une adresse email valide.");
            return;
        }

        let webhookUrl = "https://hook.us1.make.com/evf9ux3vu39oorpgerjpytmlada1kgee";
        const sourceUrl = window.location.href;

        let data = {
            yearInBusiness: years,
            numberOfEvent: events,
            grossTicketSales: sales,
            amountEligible: eligibility,
            email: email,
            sourceUrl: sourceUrl,
        };

        // Partner pages go to the website simulator's n8n webhook instead of the Make email flow.
        const theme = this.getAttribute('data-theme');
        const partner = partnerConfig(theme);
        if (partner) {
            const field = (id) => this.shadowRoot.getElementById(id).value;
            data = partnerPayload({
                partner: theme, partnerQuote: field('partnerQuote'), firstName: field('firstName'),
                lastName: field('lastName'), website: field('website'), email, years, events, sales, sourceUrl,
            });
            if (!data) {
                alert(`Please fill in your ${partner.name} quote, first name, last name and company website.`);
                return;
            }
            webhookUrl = "https://soundcheck-capital.app.n8n.cloud/webhook/api/website";
        }

        // Afficher un indicateur de chargement
        const submitButton = this.shadowRoot.querySelector(".apply-btn");
        const originalText = submitButton.textContent;
        submitButton.textContent = "Envoi en cours...";
        submitButton.disabled = true;

        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                alert("Thank you for your submission. We’ll be in touch shortly.");
                // Réinitialiser le formulaire si souhaité
                this.shadowRoot.querySelector("#email").value = '';
            } else {
                throw new Error('Erreur lors de la soumission');
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            alert("Une erreur s'est produite. Veuillez réessayer.");
        })
        .finally(() => {
            // Restaurer le bouton
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    }
}

// Déclarer la balise personnalisée
customElements.define("custom-form", CustomForm);
