class CustomForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.shadowRoot.innerHTML = `
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap">
            <style>
:host {
    font-family: 'Archivo', sans-serif;
    background-color: #222;
    justify-content: flex-start;
    align-items: left;
    height: auto;
    margin: 0;
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

.slider-container {
    margin-bottom: 20px;
}

@media (max-width: 480px) {
    .slider-container {
        margin-bottom: 15px;
    }
}

.logo {
    width: 30px;
    height: 30px;
    position: absolute;
    top: 8px;
    right: 12px;
}

@media (max-width: 480px) {
    .logo {
        width: 26px;
        height: 26px;
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

@media (max-width: 480px) {
    .questions {
        font-size: 14px;
    }
}

.eligibilityLabel {
    color: #696969;
}

@media (max-width: 480px) {
    .eligibilityLabel {
        font-size: 14px;
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

/* Partie remplie avant le curseur pour Firefox */
input[type=range]::-moz-range-progress {
    background: #e68900;
    height: 6px;
    border-radius: 5px;
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
    margin: 0 0 0 0;
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

.apply-btn:hover {
    background: #e68900;
}

.apply-btn:active {
    background: #d67800;
}

.apply-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

@media (max-width: 480px) {
    .apply-btn {
        width: 95%;
        height: 44px;
        font-size: 16px;
        margin-bottom: 10px;
    }
}
            </style>
            <form id="advanceForm">
            <div class="slider-container">
                <img src="https://guittoncandice.github.io/soundcheck_advance_eligibility_form/logo.jpg" class="logo" />
                <p class="questions">How many events do you promote a year?</p>
                <p class="amount answers" id="eventsCount">25 events</p>
                <input type="range" min="1" max="50" value="25" id="eventsSlider">
            </div>
            <div class="slider-container">
                <p class="questions">How much gross ticket sales do you sell a year?</p>
                <p class="amount answers" id="ticketSales">$10,000,000</p>
                <input type="range" min="500000" max="20000000" step="500000" value="10000000" id="salesSlider">
            </div>
            <div class="slider-container">
                <p class="questions">For how long has your company been operating?</p>
                <p class="amount answers" id="yearsOperating">5 years</p>
                <input type="range" min="1" max="10" value="5" id="yearsSlider">
            </div>
            <div class="eligibilityDiv">
                <p class="eligibilityLabel">You could be eligible for up to:</p>
                <p class="eligibility" id="eligibilityAmount">$120,000</p>
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
                var input = event.target.value;
                if(input == 1) this.shadowRoot.getElementById("yearsOperating").innerText = `${input} year`;
                else if(input == 10) this.shadowRoot.getElementById("yearsOperating").innerText = `${input}+ years`;
                else this.shadowRoot.getElementById("yearsOperating").innerText = `${input} years`;
                this.calculateAdvance();
            });

            this.shadowRoot.getElementById("eventsSlider").addEventListener("input", (event) => {
                var input = event.target.value;
                if(input == 1) this.shadowRoot.getElementById("eventsCount").innerText = `${input} event`;
                else if(input == 50) this.shadowRoot.getElementById("eventsCount").innerText = `${input}+ events`;
                else this.shadowRoot.getElementById("eventsCount").innerText = `${input} events`;
                this.calculateAdvance();
            });    
            this.shadowRoot.getElementById("salesSlider").addEventListener("input", (event) => {
                var input = event.target.value;
                if(input == 20000000) this.shadowRoot.getElementById("ticketSales").innerText =`$${Number(input).toLocaleString("en-US")}+`;
                else this.shadowRoot.getElementById("ticketSales").innerText =`$${Number(input).toLocaleString("en-US")}`;
                this.calculateAdvance();
            });  
        this.shadowRoot.querySelectorAll("input[type=range]").forEach(slider => {
            function updateProgress() {
                let percent = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
                slider.style.setProperty("--progress", percent + "%");
            }
        
            slider.addEventListener("input", updateProgress);
            updateProgress(); // Initialise la valeur au chargement de la page
        });

    }
    
    getRiskScore(value, riskScoreTable) {
        let range = riskScoreTable.find(entry => value >= entry.min && value <= entry.max);
        return range ? range.score : 0;
    }
  
    calculateAdvance() {
        let sales = this.shadowRoot.getElementById("salesSlider").value;
        var events = this.shadowRoot.getElementById("eventsSlider").value;
        var years = this.shadowRoot.getElementById("yearsSlider").value;

        // Maximum advance cap: $500k
        const maxAdvance = 500000;

        // Years in Business Risk Score
        const yearsRiskScore = [
            { min: 1, max: 1, score: 5 },      // Less than 1 year
            { min: 2, max: 2, score: 3 },      // 1-2 years
            { min: 3, max: 5, score: 1.5 },    // 2-5 years
            { min: 6, max: 9, score: 0.5 },    // 5-10 years
            { min: 10, max: 10, score: 0 }     // 10+ years
        ];

        // Number of Events Risk Score
        const eventsRiskScore = [
            { min: 1, max: 1, score: 9 },      // 1 event
            { min: 2, max: 3, score: 7.2 },    // 2-3 events
            { min: 4, max: 6, score: 5.85 },   // 4-6 events
            { min: 7, max: 10, score: 4.5 },   // 7-10 events
            { min: 11, max: 20, score: 2.7 },  // 11-20 events
            { min: 21, max: 49, score: 0.45 }, // 21+ events
            { min: 50, max: 50, score: 0 }     // 50+ events
        ];

        // Get risk scores
        var yearsRisk = this.getRiskScore(years, yearsRiskScore);
        var eventsRisk = this.getRiskScore(events, eventsRiskScore);

        // Calculate combined risk score
        var combinedRiskScore = yearsRisk + eventsRisk;

        console.log(`Years: ${years}, Years Risk: ${yearsRisk}`);
        console.log(`Events: ${events}, Events Risk: ${eventsRisk}`);
        console.log(`Combined Risk Score: ${combinedRiskScore}`);

        // Determine Max Advance % based on combined risk score
        var maxAdvancePercentage;
        if (combinedRiskScore >= 0 && combinedRiskScore <= 4) {
            maxAdvancePercentage = 0.10;  // 10%
        } else if (combinedRiskScore > 4 && combinedRiskScore <= 8) {
            maxAdvancePercentage = 0.075; // 7.5%
        } else if (combinedRiskScore > 8 && combinedRiskScore <= 12) {
            maxAdvancePercentage = 0.05;  // 5%
        } else if (combinedRiskScore > 12 && combinedRiskScore <= 14) {
            maxAdvancePercentage = 0.025; // 2.5%
        } else {
            maxAdvancePercentage = 0.025; // Default to lowest if score exceeds 14
        }

        console.log(`Max Advance %: ${maxAdvancePercentage * 100}%`);

        // Calculate advance amount
        let eligibility = sales * maxAdvancePercentage;

        // Apply $500k cap
        if (eligibility > maxAdvance) {
            eligibility = maxAdvance;
        }

        console.log(`Calculated Advance: $${parseInt(eligibility).toLocaleString("en-US")}`);

        this.shadowRoot.getElementById("eligibilityAmount").innerText = `$${parseInt(eligibility).toLocaleString("en-US")}`;
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

        const webhookUrl = "https://hook.us1.make.com/evf9ux3vu39oorpgerjpytmlada1kgee";

        const data = {
            yearInBusiness: years,
            numberOfEvent: events,
            grossTicketSales: sales,
            amountEligible: eligibility,
            email: email
        };

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
                alert("Application soumise avec succès!");
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
