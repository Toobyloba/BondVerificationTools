const express = require('express');
const cors = require('cors');
const path = require('path');
const authService = require('./services/auth');
const analyticsService = require('./services/analytics');
const { solveYTM, calculateDuration, calculateFairPrice } = require('./services/bond-math');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} `);
    next();
});

// 1. Analytics Middleware (Global for HTML pages)
app.use(analyticsService.track);

// 2. Auth Routes
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const token = authService.login(username, password);
    if (token) {
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    // Optional: Protect this route so only logged-in admins can create users
    // const token = req.headers['authorization']?.split(' ')[1];
    // if (!authService.verifyToken(token)) return res.sendStatus(403);

    const { username, password } = req.body;
    try {
        const token = req.headers['authorization']?.split(' ')[1]; // Pass token if we decide to lock it
        authService.register(username, password, token);
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

app.get('/api/auth/check', authService.authenticate, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// 3. Analytics API (Protected)
app.get('/api/analytics/stats', authService.authenticate, (req, res) => {
    res.json(analyticsService.getStats());
});

app.post('/api/analytics/event', (req, res) => {
    const { type } = req.body;
    analyticsService.trackEvent(type);
    res.json({ success: true });
});

/**
 * API Route: Bond Screener Evaluation
 * Ported from Bond-Screener.html
 */
app.post('/api/v1/calculate/screener', (req, res) => {
    try {
        const {
            faceValue, marketPrice, couponRate, yearsToMaturity,
            inflation, riskFreeYTM, currencyDepreciation, homeInflation,
            holdingPeriod, isCallable, tradingVolume, bondRating
        } = req.body;

        const F = parseFloat(faceValue);
        const P = parseFloat(marketPrice);
        const c = parseFloat(couponRate) / 100;
        const n = parseFloat(yearsToMaturity);
        const pi = parseFloat(inflation) / 100;
        const rf = parseFloat(riskFreeYTM) / 100;
        const deltaC = parseFloat(currencyDepreciation) / 100;
        const piHome = parseFloat(homeInflation) / 100;
        const hp = parseFloat(holdingPeriod);
        const vol = parseFloat(tradingVolume);

        if (P <= 0 || F <= 0 || n <= 0) {
            return res.status(400).json({ error: 'Price, Face Value, and Years to Maturity must be positive.' });
        }

        // Calculations
        const CY = (F * c) / P;
        const YTM = solveYTM(P, F, c, n);

        if (YTM <= 0) {
            return res.json({
                immediateReject: true,
                ytm: YTM,
                reason: 'YTM ≤ 0%. You would be paying to lend money.'
            });
        }

        const RY = (1 + YTM) / (1 + pi) - 1;
        const D = calculateDuration(F, c, YTM, n, P);
        const priceChangeEstimate = -D * 0.01;
        const spread = YTM - rf;
        const realReturnHomeC = ((1 + YTM) * (1 + deltaC)) / (1 + piHome) - 1;

        // Checkpoints
        const durationThreshold = n / 2;
        const minSpreadThreshold = bondRating === 'BBB' ? 0.015 : bondRating.startsWith('BB') ? 0.04 : 0.008;
        const callabilityPass = !isCallable || YTM > 0.05;
        const liquidityPass = vol >= 1;

        const checkpoints = {
            cy: { passed: true, value: CY, detail: `CY = ${(CY * 100).toFixed(2)}% ` },
            ytm: { passed: YTM > 0, value: YTM, detail: `YTM = ${(YTM * 100).toFixed(2)}% ` },
            ry: { passed: RY > 0.015, value: RY, detail: `RY = ${(RY * 100).toFixed(2)}% (Threshold: > 1.5 %)` },
            duration: { passed: D < durationThreshold, value: D, detail: `Duration = ${D.toFixed(2)} yrs(Threshold: <${durationThreshold.toFixed(1)})` },
            holdingPeriod: { passed: D <= hp, value: hp, detail: `Holding Period(${hp} yrs) vs Duration(${D.toFixed(2)} yrs)` },
            creditSpread: { passed: spread > minSpreadThreshold, value: spread, detail: `Spread = ${(spread * 100).toFixed(2)}% (Needed for ${bondRating}: ${(minSpreadThreshold * 100).toFixed(1)}%)` },
            currencyRisk: { passed: realReturnHomeC > 0, value: realReturnHomeC, detail: `Real Return(Home) = ${(realReturnHomeC * 100).toFixed(2)}% ` },
            callability: { passed: callabilityPass, value: isCallable, detail: isCallable ? 'Bond is callable' : 'Not callable' },
            liquidity: { passed: liquidityPass, value: vol, detail: `Daily Volume = $${vol.toFixed(1)} M` }
        };

        const allPass = Object.values(checkpoints).every(cp => cp.passed);

        res.json({
            metrics: {
                currentYield: CY,
                ytm: YTM,
                realYield: RY,
                duration: D,
                creditSpread: spread,
                priceSensitivity: priceChangeEstimate
            },
            checkpoints,
            decision: allPass ? 'BUY' : 'REJECT'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * API Route: Bond Screener Pro Evaluation
 * Ported from Bond-Screener-Pro.html
 */
app.post('/api/v1/calculate/screener-pro', (req, res) => {
    // Similar implementation for Pro...
    // To keep it clean, I'll implement the logic here as well.
    try {
        const {
            bondPrice, faceValue, couponRate, yearsToMaturity,
            ytm, currentYield, treasuryYTM, inflation,
            duration, holdingPeriod, isCallable, tradingVolume, creditRating,
            couponType
        } = req.body;

        const P = parseFloat(bondPrice);
        const F = parseFloat(faceValue);
        const c = parseFloat(couponRate) / 100;
        const n = parseFloat(yearsToMaturity);
        const y = parseFloat(ytm) / 100;
        const cy = parseFloat(currentYield) / 100;
        const rf = parseFloat(treasuryYTM) / 100;
        const pi = parseFloat(inflation) / 100;
        const d = parseFloat(duration);
        const hp = parseFloat(holdingPeriod);
        const vol = parseFloat(tradingVolume);

        let totalScore = 0;
        const scores = {};

        // Step 2: Price Validation
        const priceVsPar = (P - F) / F;
        const score2 = Math.abs(priceVsPar) < 0.15 ? 2 : 1;
        totalScore += score2;
        scores.step2 = score2;

        // Step 3a: Coupon Type
        const score3a = couponType === 'fixed' ? 2 : 1;
        totalScore += score3a;
        scores.step3a = score3a;

        // Step 3b: Yield Relationship
        const score3b = cy <= y ? 2 : 1;
        totalScore += score3b;
        scores.step3b = score3b;

        // Step 4: Real Yield
        const realYield = y - pi;
        const score4 = realYield > 0.01 ? 2 : realYield > 0 ? 1 : 0;
        totalScore += score4;
        scores.step4 = score4;

        // Step 5a: Duration Risk
        const score5a = d <= hp ? 2 : 1;
        totalScore += score5a;
        scores.step5a = score5a;

        // Step 5b: Credit Spread
        const spread = y - rf;
        const minSpreadThreshold = creditRating === 'BBB' ? 0.015 : creditRating === 'BB' ? 0.04 : 0.008;
        const score5b = spread >= minSpreadThreshold ? 2 : spread > 0 ? 1 : 0;
        totalScore += score5b;
        scores.step5b = score5b;

        // Step 5c: Callability
        const score5c = !isCallable ? 2 : (y >= 0.05 ? 1 : 0);
        totalScore += score5c;
        scores.step5c = score5c;

        // Step 6a: Liquidity
        const score6a = vol >= 1 ? 2 : 1;
        totalScore += score6a;
        scores.step6a = score6a;

        let recommendation = '';
        if (totalScore >= 12) recommendation = 'GOOD BUY';
        else if (totalScore >= 8) recommendation = 'HOLD / WATCH';
        else recommendation = 'REJECT / AVOID';

        res.json({
            totalScore,
            scores,
            recommendation,
            metrics: {
                priceVsPar,
                realYield,
                creditSpread: spread
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * API Route: Bond Valuation Evaluation
 * Ported from Bond-Valuation-Screener.html
 */
app.post('/api/v1/calculate/valuation', (req, res) => {
    try {
        const {
            bondPrice, faceValue, couponRate, yearsToMaturity,
            ytm, requiredYield, frequency, couponType,
            creditRating, isCallable, liquidity, currencyRisk,
            holdingPlan
        } = req.body;

        const P = parseFloat(bondPrice);
        const F = parseFloat(faceValue);
        const cr = parseFloat(couponRate) / 100;
        const n = parseFloat(yearsToMaturity);
        const r_y = parseFloat(requiredYield) / 100;
        const m = parseFloat(frequency);

        // Core Metrics
        const fairPrice = calculateFairPrice(F, cr, r_y, n, m);
        const priceVsFair = ((P - fairPrice) / fairPrice) * 100;
        const currentYield = (F * cr / P) * 100;

        // Risks
        const investmentGrade = ['AAA', 'AA', 'A', 'BBB'].includes(creditRating);
        const couponRiskStatus = couponType === 'fixed' ? 'pass' : couponType === 'floating' ? 'caution' : 'fail';
        const liquidityStatus = liquidity === 'tight' ? 'pass' : liquidity === 'moderate' ? 'caution' : 'fail';
        const currencyStatus = currencyRisk === 'none' ? 'pass' : currencyRisk === 'low' ? 'caution' : 'fail';

        const risks = [
            { name: 'Credit Risk', status: investmentGrade ? 'pass' : 'caution', detail: investmentGrade ? `${creditRating} - Investment Grade` : `${creditRating} - Junk` },
            { name: 'Coupon Type', status: couponRiskStatus, detail: couponType },
            { name: 'Callability', status: isCallable ? 'caution' : 'pass', detail: isCallable ? 'Callable' : 'Non-Callable' },
            { name: 'Liquidity', status: liquidityStatus, detail: liquidity },
            { name: 'Currency Risk', status: currencyStatus, detail: currencyRisk },
            { name: 'Holding Plan', status: holdingPlan === 'maturity' ? 'pass' : 'caution', detail: holdingPlan }
        ];

        // Decision Logic
        const meetsReturn = (parseFloat(ytm) / 100) >= r_y;
        const passesAllRisks = risks.every(r => r.status !== 'fail');
        const isCheap = P < fairPrice;
        const mainCriteriaPass = meetsReturn && passesAllRisks;
        const valuationPass = isCheap || (priceVsFair <= 2);

        let recommendation = '';
        if (mainCriteriaPass && valuationPass) recommendation = 'BUY';
        else if (!mainCriteriaPass) recommendation = 'AVOID';
        else recommendation = 'HOLD / WATCH';

        res.json({
            metrics: {
                fairPrice,
                priceVsFair,
                currentYield,
                annualCoupon: F * cr,
                periodCoupon: (F * cr) / m
            },
            risks,
            recommendation
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * API Route: Bond Evaluation Complete
 * Ported from Bond-Evaluation-Complete.html
 */
app.post('/api/v1/calculate/complete', (req, res) => {
    try {
        const {
            bondPrice, faceValue, couponRate, yearsToMaturity,
            ytm, inflation, riskFreeYTM, bondRating,
            duration, holdingPeriod, isCallable, tradingVolume,
            currencyDepreciation, homeInflation
        } = req.body;

        const P = parseFloat(bondPrice);
        const F = parseFloat(faceValue);
        const c = parseFloat(couponRate) / 100;
        const n = parseFloat(yearsToMaturity);
        const y = parseFloat(ytm) / 100;
        const pi = parseFloat(inflation) / 100;
        const rf = parseFloat(riskFreeYTM) / 100;
        const d = parseFloat(duration);
        const hp = parseFloat(holdingPeriod);
        const vol = parseFloat(tradingVolume);
        const dc = parseFloat(currencyDepreciation) / 100;
        const pih = parseFloat(homeInflation) / 100;

        // Step 1: Real Yield
        const realYield = (1 + y) / (1 + pi) - 1;
        const ryPass = realYield > 0.015;

        // Step 2: Credit Spread
        const spread = y - rf;
        const minSpread = bondRating === 'BBB' ? 0.015 : bondRating.startsWith('BB') ? 0.04 : 0.008;
        const spreadPass = spread > minSpread;

        // Step 3: Duration
        const durationPass = d < (n / 2) && d <= hp;

        // Step 4: Home Currency Return
        const homeReturn = ((1 + y) * (1 + dc)) / (1 + pih) - 1;
        const homePass = homeReturn > 0;

        // Step 5: Fine Print
        const callPass = !isCallable || y > 0.05;
        const liqPass = vol >= 1;

        const results = {
            realYield: { passed: ryPass, value: realYield, detail: `RY = ${(realYield * 100).toFixed(2)}% ` },
            spread: { passed: spreadPass, value: spread, detail: `Spread = ${(spread * 100).toFixed(2)}% (Target for ${bondRating}: ${(minSpread * 100).toFixed(1)}%)` },
            duration: { passed: durationPass, value: d, detail: `Duration = ${d.toFixed(2)} yrs vs HP = ${hp} yrs` },
            homeReturn: { passed: homePass, value: homeReturn, detail: `Real Home Return = ${(homeReturn * 100).toFixed(2)}% ` },
            callability: { passed: callPass, value: isCallable, detail: isCallable ? 'Callable' : 'Non-Callable' },
            liquidity: { passed: liqPass, value: vol, detail: `Volume = $${vol.toFixed(1)} M` }
        };

        const allPass = Object.values(results).every(r => r.passed);

        res.json({
            results,
            decision: allPass ? 'BUY' : 'AVOID'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * API Route: Bond Analysis Flowchart
 * Ported from Bond-Analysis-Flowchart.html
 */
app.post('/api/v1/calculate/flowchart', (req, res) => {
    try {
        const {
            bondPrice, faceValue, couponRate, yearsToMaturity,
            requiredYield, creditSpread, couponType,
            isCallable, rateOutlook, durationMatch
        } = req.body;

        const P = parseFloat(bondPrice);
        const F = parseFloat(faceValue);
        const cr = parseFloat(couponRate) / 100;
        const n = parseFloat(yearsToMaturity);
        const ry = parseFloat(requiredYield) / 100;
        const cs = parseFloat(creditSpread) / 100;

        const fairPrice = calculateFairPrice(F, cr, ry, n, 2); // Semi-annual assumed in original flowchart
        const priceVsFair = ((P - fairPrice) / fairPrice) * 100;
        const isCheap = P < fairPrice;
        const currentYield = (F * cr / P) * 100;
        const realYield = ry - 0.025; // Constant inflation as per original logic

        // Phase 1 Status
        const gate1aStatus = isCheap ? 'pass' : 'fail';
        const gate1bStatus = cs >= 0.01 ? 'pass' : 'fail';
        const phase1Pass = (gate1aStatus === 'pass') && (gate1bStatus === 'pass');

        // Phase 2 Status
        const gate2aStatus = realYield >= 0 ? 'pass' : 'fail';
        const gate2bStatus = currentYield >= (ry * 100) ? 'pass' : 'caution';
        const phase2Pass = (gate2aStatus === 'pass') && (gate2bStatus !== 'fail');

        // Phase 3 Status
        const gate3aStatus = couponType === 'fixed' ? 'pass' : couponType === 'floating' ? 'caution' : 'fail';
        const gate3bStatus = durationMatch === 'good' ? 'pass' : durationMatch === 'moderate' ? 'caution' : 'fail';
        const gate3cStatus = !isCallable ? 'pass' : 'caution';

        const allCriticalPass = phase1Pass && phase2Pass;
        const riskFlags = (gate3aStatus !== 'pass' ? 1 : 0) + (gate3bStatus !== 'pass' ? 1 : 0) + (gate3cStatus !== 'pass' ? 1 : 0);

        let decision = 'STOP';
        if (allCriticalPass && riskFlags === 0) decision = 'EXECUTE';
        else if (allCriticalPass && riskFlags > 0) decision = 'EXECUTE WITH CAUTION';

        res.json({
            metrics: {
                fairPrice,
                priceVsFair,
                isCheap,
                currentYield,
                realYield
            },
            gates: {
                gate1aStatus, gate1bStatus, phase1Pass,
                gate2aStatus, gate2bStatus, phase2Pass,
                gate3aStatus, gate3bStatus, gate3cStatus
            },
            decision,
            riskFlags
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Bond Analysis Server running on port ${PORT} `);
});
