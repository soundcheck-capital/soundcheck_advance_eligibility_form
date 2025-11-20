# Advance Calculation Update - Test Results

## Changes Implemented

### 1. New Risk-Based Scoring System

The advance calculation now uses an additive risk scoring system instead of the previous percentage-based eligibility factors.

#### Years in Business Risk Score
| Years Operating | Risk Score |
|----------------|------------|
| Less than 1 year (1) | 5 |
| 1-2 years (2) | 3 |
| 2-5 years (3-5) | 1.5 |
| 5-10 years (6-9) | 0.5 |
| 10+ years (10) | 0 |

#### Number of Events Risk Score
| Events per Year | Risk Score |
|----------------|------------|
| 1 event | 9 |
| 2-3 events | 7.2 |
| 4-6 events | 5.85 |
| 7-10 events | 4.5 |
| 11-20 events | 2.7 |
| 21+ events (21-49) | 0.45 |
| 50+ events | 0 |

#### Max Advance % by Combined Risk Score
| Combined Score Range | Max Advance % |
|---------------------|---------------|
| 0 - 4.0 | 10% |
| 4.1 - 8.0 | 7.5% |
| 8.1 - 12.0 | 5% |
| 12.1 - 14.0 | 2.5% |

### 2. Hard Cap at $500,000

- **Previous Cap**: $1,000,000
- **New Cap**: $500,000
- The advance amount will NEVER exceed $500k, regardless of sales volume or risk profile

## Test Results Summary

### ✅ All Tests Passed

All 17 test scenarios passed successfully, including:

1. **Best Case Scenario** (10+ years, 50+ events, $20M sales)
   - Combined Risk Score: 0
   - Max Advance %: 10%
   - Calculated: $2,000,000 → **Capped at $500,000** ✓

2. **Worst Case Scenario** (1 year, 1 event, $20M sales)
   - Combined Risk Score: 14
   - Max Advance %: 2.5%
   - Calculated: $500,000 → **Capped at $500,000** ✓

3. **Mid-Range Scenario** (5 years, 15 events, $10M sales)
   - Combined Risk Score: 4.2
   - Max Advance %: 7.5%
   - Calculated: $750,000 → **Capped at $500,000** ✓

### Key Findings

1. **$500k Cap Works Correctly**: The cap is enforced across all scenarios, even when calculated advance exceeds it
2. **Risk Scoring Logic**: Properly calculates additive risk scores from years and events
3. **Percentage Mapping**: Combined risk scores correctly map to the specified advance percentages
4. **Slider Safety**: All possible slider combinations respect the $500k maximum

## Example Calculations

### Example 1: Established Promoter with High Volume
- **Input**: 7 years, 25 events, $15M sales
- **Years Risk**: 0.5
- **Events Risk**: 0.45
- **Combined Risk**: 0.95 (0-4 range)
- **Max Advance %**: 10%
- **Calculation**: $15M × 10% = $1,500,000
- **Final Advance**: **$500,000** (capped)

### Example 2: New Promoter with Low Volume
- **Input**: 1 year, 1 event, $500k sales
- **Years Risk**: 5
- **Events Risk**: 9
- **Combined Risk**: 14 (12.1-14 range)
- **Max Advance %**: 2.5%
- **Calculation**: $500k × 2.5% = $12,500
- **Final Advance**: **$12,500**

### Example 3: Medium Risk Profile
- **Input**: 5 years, 11 events, $5M sales
- **Years Risk**: 1.5
- **Events Risk**: 2.7
- **Combined Risk**: 4.2 (4.1-8 range)
- **Max Advance %**: 7.5%
- **Calculation**: $5M × 7.5% = $375,000
- **Final Advance**: **$375,000**

## Files Modified

1. **scriptform.js** (lines 217-288)
   - Updated `getRiskScore()` method to work with risk score tables
   - Completely rewrote `calculateAdvance()` method with new scoring logic
   - Changed `maxAdvance` from $1,000,000 to $500,000
   - Added detailed console logging for debugging

## Testing Coverage

- ✅ Boundary testing (score ranges: 0-4, 4.1-8, 8.1-12, 12.1-14)
- ✅ Edge cases (min/max slider values)
- ✅ $500k cap enforcement
- ✅ Various sales amounts with same risk profile
- ✅ All risk score combinations
- ✅ Real-world scenarios

## Deployment Notes

The form uses a custom web component (`<custom-form>`) that encapsulates all logic in Shadow DOM. The changes are backward compatible and will take effect immediately upon deployment to GitHub Pages.

## Conclusion

The new advance calculation system successfully implements the requested risk-based scoring with a $500k cap. All test scenarios pass, and the cap is enforced correctly across all possible slider combinations.
