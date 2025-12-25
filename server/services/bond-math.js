/**
 * Core mathematical engine for bond calculations.
 */

/**
 * Numerical solver for YTM (Newton-Raphson)
 */
function solveYTM(P, F, c, n, initialGuess = 0.05) {
    const maxIterations = 100;
    const tolerance = 1e-10;
    let y = initialGuess;

    for (let i = 0; i < maxIterations; i++) {
        let PV = 0;
        let dPV = 0;

        for (let t = 1; t <= n; t++) {
            const couponPayment = F * c;
            PV += couponPayment / Math.pow(1 + y, t);
            dPV -= t * couponPayment / Math.pow(1 + y, t + 1);
        }

        PV += F / Math.pow(1 + y, n);
        dPV -= n * F / Math.pow(1 + y, n + 1);

        PV -= P;

        if (Math.abs(PV) < tolerance) return y;

        y = y - PV / dPV;

        if (y < -0.99) y = -0.99;
    }

    return y;
}

/**
 * Macaulay Duration calculation
 */
function calculateDuration(F, c, y, n, P) {
    let numerator = 0;

    for (let t = 1; t <= n; t++) {
        const couponPayment = F * c;
        numerator += t * couponPayment / Math.pow(1 + y, t);
    }

    numerator += n * F / Math.pow(1 + y, n);

    return numerator / P;
}

/**
 * Fair Price Calculation (Step 4 in Valuation Screener)
 */
function calculateFairPrice(faceValue, couponRate, requiredYield, yearsToMaturity, frequency) {
    const m = parseFloat(frequency);
    const N = yearsToMaturity * m;
    const y_m = requiredYield / m;
    const C = faceValue * (couponRate / m);
    let fairPrice = 0;

    for (let t = 1; t <= N; t++) {
        fairPrice += C / Math.pow(1 + y_m, t);
    }

    fairPrice += faceValue / Math.pow(1 + y_m, N);
    return fairPrice;
}

module.exports = {
    solveYTM,
    calculateDuration,
    calculateFairPrice
};
