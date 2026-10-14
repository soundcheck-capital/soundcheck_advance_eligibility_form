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
