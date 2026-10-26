// Checks the widget's estimate against express-form's tests/unit/estimate.test.ts
// (the sheet's "TEST 8/24/26 (Boris)" block, Venue/Other/Promoter rows).
// Run: node test_scenarios.js
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const ctx = { HTMLElement: class {}, customElements: { define() {} } };
vm.runInNewContext(fs.readFileSync(__dirname + '/assets/scriptform.js', 'utf8'), ctx);

const cases = [
    // [years, events, sales, expected]
    [2, 8, 2_500_000, 250_000],  // score 14 → 10%
    [7, 30, 1_000_000, 150_000], // score 7 → 15%
    [6, 50, 1_000_000, 200_000], // score 3 → 20%
    [10, 60, 1_000_000, 200_000], // score 0 → 20%
    [4, 3, 500_000, 50_000],     // score 13 → 10%
    [1, 1, 200_000, 10_000],     // score 18 → 5%
    [10, 1, 15_000_000, 1_000_000], // $1M cap
    [0, 0, 100_000, 5_000],      // no floor
    [5, 25, 2_500_000, 375_000], // widget defaults: score 9 → 15%
];

for (const [years, events, sales, expected] of cases) {
    assert.strictEqual(ctx.advanceMax(years, events, sales), expected, `${years}y ${events}ev $${sales}`);
}
console.log(`ok: ${cases.length} cases`);

// Partner pages (bem): payload for the n8n website webhook, null when a required field is missing.
const f = { partner: 'bem', partnerQuote: ' 150000 ', firstName: ' Ann ', lastName: 'Lee', website: 'qwix.com', email: 'a@b.co', years: '5', events: '25', sales: '2500000', sourceUrl: 'https://x/bem/' };
const p = ctx.partnerPayload(f);
assert.strictEqual(p.formType, 'simulator');
assert.strictEqual(p.partner, 'bem');
assert.strictEqual(p.partnerQuote, 150000);
assert.strictEqual(p.firstName, 'Ann');
assert.strictEqual(p.website, 'qwix.com');
assert.strictEqual(p.advanceAmount, 375000);
assert.strictEqual(p.sourceUrl, 'https://x/bem/');
for (const k of ['partnerQuote', 'firstName', 'lastName', 'website']) assert.strictEqual(ctx.partnerPayload({ ...f, [k]: ' ' }), null, k);
assert.strictEqual(ctx.partnerPayload({ ...f, partnerQuote: '0' }), null, 'zero quote');
console.log('ok: partner payload');

// Partner pages: the theme picks the name shown in "How much is your X quote?", the logo and the fonts.
assert.strictEqual(ctx.partnerConfig('bem').name, 'BEM');
assert.strictEqual(ctx.partnerConfig('hive').name, 'Hive');
assert.strictEqual(ctx.partnerConfig('prism').name, 'Prism');
assert.strictEqual(ctx.partnerConfig('prism').logo, 'prism_logo_white.png');
for (const t of ['venue-pilot', null, 'constructor']) assert.strictEqual(ctx.partnerConfig(t), null, String(t));
console.log('ok: partner config');
