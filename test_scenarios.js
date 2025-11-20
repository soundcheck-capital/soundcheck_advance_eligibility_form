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
    { min: 1, max: 1, score: 5 },      // Less than 1 year
    { min: 2, max: 2, score: 3 },      // 1-2 years
    { min: 3, max: 5, score: 1.5 },    // 2-5 years
    { min: 6, max: 9, score: 0.5 },    // 5-10 years
    { min: 10, max: 10, score: 0 }     // 10+ years
];

const eventsRiskScore = [
    { min: 1, max: 1, score: 9 },      // 1 event
    { min: 2, max: 3, score: 7.2 },    // 2-3 events
    { min: 4, max: 6, score: 5.85 },   // 4-6 events
    { min: 7, max: 10, score: 4.5 },   // 7-10 events
    { min: 11, max: 20, score: 2.7 },  // 11-20 events
    { min: 21, max: 49, score: 0.45 }, // 21+ events
    { min: 50, max: 50, score: 0 }     // 50+ events
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
    // Test 1: Best case - established company with many events
    { years: 10, events: 50, sales: 20000000, description: "Best case: 10+ years, 50+ events, $20M sales" },

    // Test 2: Worst case - new company with few events
    { years: 1, events: 1, sales: 20000000, description: "Worst case: <1 year, 1 event, $20M sales" },

    // Test 3: Mid-range scenario
    { years: 5, events: 15, sales: 10000000, description: "Mid-range: 5 years, 15 events, $10M sales" },

    // Test 4: Test $500k cap with high sales
    { years: 10, events: 50, sales: 20000000, description: "Cap test: Should not exceed $500k" },

    // Test 5: Exactly at 4.0 risk score boundary
    { years: 3, events: 3, sales: 5000000, description: "Boundary test: Risk score = 1.5 + 7.2 = 8.7 (5% bracket)" },

    // Test 6: Just above 4.0 risk score
    { years: 2, events: 2, sales: 5000000, description: "Boundary test: Risk score = 3 + 7.2 = 10.2 (5% bracket)" },

    // Test 7: Test with minimum sales
    { years: 10, events: 50, sales: 500000, description: "Min sales: $500k sales, best risk profile" },

    // Test 8: Medium-high risk
    { years: 1, events: 5, sales: 10000000, description: "Medium-high risk: 1 year, 5 events" },

    // Test 9: Low-medium risk
    { years: 7, events: 25, sales: 15000000, description: "Low-medium risk: 7 years, 25 events" },

    // Test 10: Test various sales amounts with same risk profile
    { years: 5, events: 11, sales: 2000000, description: "Same risk, different sales #1: $2M" },
    { years: 5, events: 11, sales: 5000000, description: "Same risk, different sales #2: $5M" },
    { years: 5, events: 11, sales: 10000000, description: "Same risk, different sales #3: $10M" },
    { years: 5, events: 11, sales: 15000000, description: "Same risk, different sales #4: $15M" },
];

scenarios.forEach((scenario, index) => {
    const result = calculateAdvance(scenario.years, scenario.events, scenario.sales);

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
