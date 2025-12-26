/**
 * Smart Evaluator Service
 * Handles business logic for the 8-point analysis framework.
 */

function evaluate(data) {
    const {
        mode, dirtyPrice, ytm, couponType,
        maturityDate: maturityDateStr,
        fitchRating, modifiedDuration,
        inflationRate, currencyDev,
        priceYearHigh, priceYearLow, // Note: frontend sends yearRangeHigh/Low
        purchasePrice, currentInvestment
    } = data;

    // Validate essential inputs
    if (!dirtyPrice || dirtyPrice <= 0) throw new Error("Price must be positive.");
    if (ytm === undefined || ytm === null) throw new Error("YTM is required.");
    const maturityDate = new Date(maturityDateStr);
    if (isNaN(maturityDate.getTime())) throw new Error("Invalid Maturity Date");

    // Extract new inputs
    const {
        openPrice, dayPriceHigh, dayPriceLow,
        yearPriceHigh, yearPriceLow,
        accruedInterest = 0,
        faceValue = 100
    } = data;

    let totalScore = 0;
    const results = {};

    // STEP 1: Price & Valuation (25%)
    let step1 = { status: 'fail', score: 0, value: '', detail: '' };

    if (mode === 'buy') {
        // 1A. Liquidity Check (Volatility)
        const daySpread = dayPriceLow > 0 ? (dayPriceHigh - dayPriceLow) / dayPriceLow : 0;
        const isVolatile = daySpread > 0.02; // >2% intraday swing is volatile for bonds

        // 1B. Price Valuation (52-Week Range methodology)
        const range = yearPriceHigh - yearPriceLow;
        // Low Price = High Value (Good Entry)
        // Percentile: 0% = At Low (Best), 100% = At High (Worst)
        const pricePercentile = range === 0 ? 0.5 : (dirtyPrice - yearPriceLow) / range;

        if (pricePercentile < 0.2) {
            step1.status = 'pass';
            step1.detail = `Price $${dirtyPrice} is near 52-week low ($${yearPriceLow}). Strong Value Entry.`;
            step1.score = 2;
        } else if (pricePercentile < 0.6) {
            step1.status = 'caution';
            step1.detail = `Price is moderate. ${isVolatile ? 'Warning: High Intraday Volatility.' : 'Acceptable entry.'}`;
            step1.score = isVolatile ? 0.5 : 1; // Penalty for volatility
        } else {
            step1.status = 'fail';
            step1.detail = `Price $${dirtyPrice} is near 52-week high ($${yearPriceHigh}). Overvalued.`;
            step1.score = 0;
        }

        // True Cost & Gain Insight
        const cleanPrice = dirtyPrice - accruedInterest;
        const capitalGain = faceValue - cleanPrice;
        step1.value = `Clean: $${cleanPrice.toFixed(2)}`;

        let extraInfo = [];
        if (accruedInterest > 0) extraInfo.push(`+$${accruedInterest.toFixed(2)} Accrued`);
        if (capitalGain > 0) extraInfo.push(`Guaranteed Capital Gain: $${capitalGain.toFixed(2)}`);

        if (extraInfo.length > 0) step1.detail += ` (${extraInfo.join(', ')})`;

    } else {
        // Hold/Sell Mode - Profit Analysis
        const effectiveCost = purchasePrice; // Could add transaction costs here later
        const pnl = ((dirtyPrice - effectiveCost) / effectiveCost) * 100;

        if (pnl > 5) {
            step1.status = 'pass';
            step1.detail = `Position is profitable (+${pnl.toFixed(2)}%). Hold for gains.`;
            step1.score = 2;
        } else if (pnl > -3) {
            step1.status = 'caution';
            step1.detail = `Position near breakeven (${pnl.toFixed(2)}%). Watch closely.`;
            step1.score = 1;
        } else {
            step1.status = 'fail';
            step1.detail = `Position underwater (${pnl.toFixed(2)}%). Consider stop-loss.`;
            step1.score = 0;
        }
        step1.value = `P&L: ${pnl > 0 ? '+' : ''}${pnl.toFixed(2)}%`;
    }
    totalScore += step1.score * 0.25;
    results.step1 = step1;

    // STEP 2: Real Yield & Spread Analysis (40%)
    const realYield = ((1 + ytm) / ((1 + inflationRate) * (1 + currencyDev))) - 1;
    const spread = ytm - (data.riskFreeRate || 0);

    let step2 = { status: 'fail', score: 0, value: `${(realYield * 100).toFixed(2)}%`, detail: '' };

    if (realYield > 0.02 && spread > 0.015) {
        step2.status = 'pass';
        step2.score = 2;
        step2.detail = 'Returns beat inflation. Healthy spread vs Risk Free Rate.';
    } else if (realYield > 0) {
        step2.status = 'caution';
        step2.score = 1;
        step2.detail = spread < 0.015 ? 'Yield positive, but Spread < 1.5% (Risk not justified).' : 'Returns barely cover inflation.';
        if (spread < 0.015) step2.score = 0.5; // Penalty for low spread
    } else {
        step2.status = 'fail';
        step2.score = 0;
        step2.detail = 'Returns do not cover inflation/currency loss.';
    }

    // Annual Income
    const annualIncome = faceValue * (data.couponRate || 0);
    step2.value = `Real: ${(realYield * 100).toFixed(2)}%`;
    if (annualIncome > 0) step2.detail += ` Pays $${annualIncome.toFixed(2)}/yr.`;

    step2.formula = `Spread: ${(spread * 100).toFixed(2)}% | Real Yield: ((1 + YTM) / (Inflation * FX)) - 1`;
    totalScore += step2.score * 0.40;
    results.step2 = step2;

    // STEP 3: Interest Rate Risk (15%)
    let step3 = { status: 'fail', score: 0, value: `${modifiedDuration.toFixed(2)} years`, detail: '' };
    const priceDrop1pct = modifiedDuration * 1;
    step3.detail = `If rates rise 1%, price drops ~${priceDrop1pct.toFixed(2)}%.`;

    if (modifiedDuration < 4) {
        step3.status = 'pass';
        step3.score = 2;
    } else if (modifiedDuration < 7) {
        step3.status = 'caution';
        step3.score = 1;
    } else {
        step3.status = 'fail';
        step3.score = 0;
    }
    totalScore += step3.score * 0.15;
    results.step3 = step3;

    // STEP 4: Credit Risk (10%)
    const investmentGrade = ['AAA', 'AA', 'A', 'BBB'];
    const junk = ['BB', 'B', 'CCC'];
    let step4 = { status: 'fail', score: 0, value: fitchRating, detail: '' };

    if (investmentGrade.includes(fitchRating)) {
        step4.status = 'pass';
        step4.score = 2;
        step4.detail = 'Investment Grade.';
    } else if (junk.includes(fitchRating)) {
        step4.status = 'caution';
        step4.score = 1;
        step4.detail = 'High Yield / Non-Investment Grade.';
    } else {
        step4.status = 'fail';
        step4.score = 0;
        step4.detail = 'High Risk / Unrated.';
    }
    totalScore += step4.score * 0.10;
    results.step4 = step4;

    // STEP 5: Coupon Structure (5%)
    let step5 = { status: 'caution', score: 1, value: couponType.toUpperCase(), detail: '' };

    if (couponType === 'fixed') {
        step5.status = 'pass';
        step5.score = 2;
        step5.detail = 'Predictable cash flow.';
    } else if (couponType === 'floating') {
        step5.status = 'caution';
        step5.score = 1;
        step5.detail = 'Variable cash flow.';
    } else {
        step5.status = 'caution';
        step5.score = 1; // Zero coupon
        step5.detail = 'No interim cash flow.';
    }
    totalScore += step5.score * 0.05;
    results.step5 = step5;

    // STEP 6: Time to Maturity (5%)
    const today = new Date();
    const yearsToMat = (maturityDate - today) / (1000 * 60 * 60 * 24 * 365.25);
    let step6 = { status: 'caution', score: 1, value: `${yearsToMat.toFixed(1)} years`, detail: '' };

    if (yearsToMat < 5) {
        step6.status = 'pass';
        step6.score = 2;
        step6.detail = 'Short duration, lower risk.';
    } else if (yearsToMat < 10) {
        step6.status = 'caution';
        step6.score = 1;
        step6.detail = 'Medium duration.';
    } else {
        step6.status = 'caution';
        step6.score = 1;
        step6.detail = 'Long duration, higher uncertainty.';
    }
    totalScore += step6.score * 0.05;
    results.step6 = step6;

    // Final Compilation
    return {
        totalScore: parseFloat(totalScore.toFixed(2)),
        results: results,
        breakdown: {
            step1: (results.step1.score * 0.25).toFixed(2),
            step2: (results.step2.score * 0.40).toFixed(2),
            step3: (results.step3.score * 0.15).toFixed(2),
            step4: (results.step4.score * 0.10).toFixed(2),
            step5: (results.step5.score * 0.05).toFixed(2),
            step6: (results.step6.score * 0.05).toFixed(2)
        }
    };
}

module.exports = { evaluate };
