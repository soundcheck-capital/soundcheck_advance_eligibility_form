/**
 * Test Scenarios for Advance Calculation
 *
 * This file tests the new risk-based scoring system to ensure:
 * 1. Risk scores are calculated correctly
 * 2. Combined scores map to the right percentages
 * 3. Advance never exceeds $500k
 */

// Helper function to calculate risk scores
function getRiskScore(value, riskScoreTable) {
    let range = riskScoreTable.find(entry => value >= entry.min && value <= entry.max);
    return range ? range.score : 0;
}

// Risk scoring tables
const yearsRiskScore = [
    { min: 0, max: 0, score: 10 },   // 0 years
    { min: 1, max: 2, score: 8 },    // 1-2 years
    { min: 3, max: 5, score: 5 },    // 3-5 years
    { min: 6, max: 9, score: 3 },    // 6-9 years
    { min: 10, max: 10, score: 0 }   // 10+ years
];

const eventsRiskScore = [
    { min: 1, max: 1, score: 10 },    // 1 event
    { min: 2, max: 3, score: 8 },     // 2-3 events
    { min: 4, max: 6, score: 7 },     // 4-6 events
    { min: 7, max: 10, score: 6 },    // 7-10 events
    { min: 11, max: 20, score: 5 },   // 11-20 events
    { min: 21, max: 49, score: 4 },   // 21+ events (until 49)
    { min: 50, max: 50, score: 0 }    // 50+ events
];

function calculateAdvance(years, events, sales) {
    const maxAdvance = 500000;

    // Get risk scores
    const yearsRisk = getRiskScore(years, yearsRiskScore);
    const eventsRisk = getRiskScore(events, eventsRiskScore);

    // Calculate combined risk score
    const combinedRiskScore = yearsRisk + eventsRisk;

    // Determine Max Advance % based on combined risk score
    let maxAdvancePercentage;
    if (combinedRiskScore >= 0 && combinedRiskScore <= 5) {
        maxAdvancePercentage = 0.10;  // 10%
    } else if (combinedRiskScore > 5 && combinedRiskScore <= 11) {
        maxAdvancePercentage = 0.075; // 7.5%
    } else if (combinedRiskScore > 11 && combinedRiskScore <= 15) {
        maxAdvancePercentage = 0.05;  // 5%
    } else {
        maxAdvancePercentage = 0.025; // 2.5%
    }

    // Calculate advance amount
    let eligibility = sales * maxAdvancePercentage;

    // Apply $500k cap
    if (eligibility > maxAdvance) {
        eligibility = maxAdvance;
    }

    return {
        yearsRisk,
        eventsRisk,
        combinedRiskScore,
        maxAdvancePercentage: maxAdvancePercentage * 100,
        calculatedAdvance: eligibility,
        cappedAt500k: eligibility === maxAdvance
    };
}

// Test scenarios
console.log("=".repeat(80));
console.log("TEST SCENARIOS FOR ADVANCE CALCULATION");
console.log("=".repeat(80));

const scenarios = [
    // Validation set from provided table (New Model Max)
    { years: 2, events: 8, sales: 2500000, expectedAdvance: 125000, expectedCapped: false, description: "1-2 years, 7-10 events, $2,500,000 GTS" },
    { years: 8, events: 21, sales: 1000000, expectedAdvance: 75000, expectedCapped: false, description: "6-9 years, 21+ events, $1,000,000 GTS" },
    { years: 8, events: 50, sales: 1000000, expectedAdvance: 100000, expectedCapped: false, description: "6-9 years, 50+ events, $1,000,000 GTS" },
    { years: 10, events: 50, sales: 1000000, expectedAdvance: 100000, expectedCapped: false, description: "10+ years, 50+ events, $1,000,000 GTS" },
    { years: 4, events: 50, sales: 500000, expectedAdvance: 50000, expectedCapped: false, description: "3-5 years, 50+ events, $500,000 GTS" },
    { years: 4, events: 7, sales: 250000, expectedAdvance: 18750, expectedCapped: false, description: "3-5 years, 7-10 events, $250,000 GTS" },
    { years: 10, events: 1, sales: 15000000, expectedAdvance: 500000, expectedCapped: true, description: "10+ years, 1 event, $15,000,000 GTS (cap hit)" },
    { years: 10, events: 4, sales: 15000000, expectedAdvance: 500000, expectedCapped: true, description: "10+ years, 4-6 events, $15,000,000 GTS (cap hit)" },
    { years: 10, events: 50, sales: 2724422, expectedAdvance: 272442, expectedCapped: false, description: "10+ years, 50+ events, $2,724,422 GTS" },
];

scenarios.forEach((scenario, index) => {
    const result = calculateAdvance(scenario.years, scenario.events, scenario.sales);

    const roundedAdvance = Math.floor(result.calculatedAdvance);
    const matchesAdvance = typeof scenario.expectedAdvance === "number" ? roundedAdvance === scenario.expectedAdvance : "n/a";
    const matchesCap = typeof scenario.expectedCapped === "boolean" ? result.cappedAt500k === scenario.expectedCapped : "n/a";

    console.log(`\n${index + 1}. ${scenario.description}`);
    console.log("-".repeat(80));
    console.log(`   Input: ${scenario.years} years, ${scenario.events} events, $${scenario.sales.toLocaleString()}`);
    console.log(`   Years Risk Score: ${result.yearsRisk}`);
    console.log(`   Events Risk Score: ${result.eventsRisk}`);
    console.log(`   Combined Risk Score: ${result.combinedRiskScore}`);
    console.log(`   Max Advance %: ${result.maxAdvancePercentage}%`);
    console.log(`   Calculated Advance: $${result.calculatedAdvance.toLocaleString()}`);
    if (result.cappedAt500k) {
        console.log(`   ⚠️  CAPPED AT $500K`);
    }
    if (scenario.expectedAdvance !== undefined) {
        console.log(`   Expected Advance: $${scenario.expectedAdvance.toLocaleString()} => ${matchesAdvance === true ? "PASS" : matchesAdvance === false ? "FAIL" : "n/a"}`);
    }
    if (scenario.expectedCapped !== undefined) {
        console.log(`   Expected Cap Hit: ${scenario.expectedCapped ? "Yes" : "No"} => ${matchesCap === true ? "PASS" : matchesCap === false ? "FAIL" : "n/a"}`);
    }
    console.log(`   ✓ Does not exceed $500k: ${result.calculatedAdvance <= 500000 ? 'PASS' : 'FAIL'}`);
});

console.log("\n" + "=".repeat(80));
console.log("EDGE CASES - Slider Extremes");
console.log("=".repeat(80));

// Test all combinations at extremes
const extremeCases = [
    { years: 1, events: 1, sales: 500000 },    // Min everything
    { years: 1, events: 1, sales: 20000000 },  // Min years/events, max sales
    { years: 10, events: 50, sales: 500000 },  // Max years/events, min sales
    { years: 10, events: 50, sales: 20000000 }, // Max everything
];

extremeCases.forEach((testCase, index) => {
    const result = calculateAdvance(testCase.years, testCase.events, testCase.sales);
    console.log(`\n${index + 1}. Years: ${testCase.years}, Events: ${testCase.events}, Sales: $${testCase.sales.toLocaleString()}`);
    console.log(`   Combined Risk: ${result.combinedRiskScore}, Advance %: ${result.maxAdvancePercentage}%`);
    console.log(`   Advance: $${result.calculatedAdvance.toLocaleString()}`);
    console.log(`   ✓ Valid: ${result.calculatedAdvance <= 500000 ? 'PASS' : 'FAIL'}`);
});

console.log("\n" + "=".repeat(80));
console.log("ALL TESTS COMPLETED");
console.log("=".repeat(80));
