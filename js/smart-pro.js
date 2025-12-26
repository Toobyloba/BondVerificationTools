/**
 * Smart Evaluator Pro Logic
 * now powered by Server-Side Intelligence
 */

const hostname = window.location.hostname;
const isLocal = !hostname || hostname === 'localhost' || hostname === '127.0.0.1';
const API_URL = isLocal ? 'http://localhost:3000/api' : '/api';

document.addEventListener('DOMContentLoaded', () => {
    // Mode switching
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            updateMode(this.value);
        });
    });

    // Initial mode setup
    const checkedMode = document.querySelector('input[name="mode"]:checked');
    if (checkedMode) updateMode(checkedMode.value);
});

function updateMode(mode) {
    const currentInvField = document.getElementById('currentInvestment');
    const purchasePriceField = document.getElementById('purchasePrice');
    const purchaseDateField = document.getElementById('purchaseDate');

    if (mode === 'buy') {
        currentInvField.disabled = true;
        purchasePriceField.disabled = true;
        purchaseDateField.disabled = true;
    } else {
        currentInvField.disabled = false;
        purchasePriceField.disabled = false;
        purchaseDateField.disabled = false;
    }
}

function createStep(label, title, value, detail, formula = null, status = 'pass') {
    let html = `<div class="step ${status}">`;
    html += `<div class="step-icon">${status === 'pass' ? '✓' : status === 'caution' ? '⚠' : '✗'}</div>`;
    html += `<div class="step-content">`;
    html += `<p class="step-label">${label}</p>`;
    html += `<p class="step-title-text">${title}</p>`;
    if (value !== null) html += `<p class="step-detail"><strong>${value}</strong></p>`;
    html += `<p class="step-detail">${detail}</p>`;
    if (formula) html += `<p class="step-formula">${formula}</p>`;
    html += `</div></div>`;
    return html;
}

async function evaluateBond() {
    const errorContainer = document.getElementById('errorContainer');
    const resultsSection = document.getElementById('resultsSection');

    // Reset UI
    errorContainer.innerHTML = '';
    resultsSection.style.display = 'none';

    // Show loading state (optional, but good UX)
    const btn = document.querySelector('button[onclick="evaluateBond()"]');
    const originalBtnText = btn.innerText;
    btn.innerText = "Analyzing...";
    btn.disabled = true;

    try {
        // Collect Inputs
        const mode = document.querySelector('input[name="mode"]:checked').value;

        const payload = {
            mode,
            dirtyPrice: parseFloat(document.getElementById('dirtyPrice').value),
            currentYield: parseFloat(document.getElementById('currentYield').value) / 100,
            ytm: parseFloat(document.getElementById('ytm').value) / 100,
            couponRate: parseFloat(document.getElementById('couponRate').value) / 100,
            couponType: document.getElementById('couponType').value,
            maturityDate: document.getElementById('maturityDate').value,
            fitchRating: document.getElementById('fitchRating').value,
            macaulayDuration: parseFloat(document.getElementById('macaulayDuration').value),
            modifiedDuration: parseFloat(document.getElementById('modifiedDuration').value),
            inflationRate: parseFloat(document.getElementById('inflationRate').value) / 100,
            currencyDev: parseFloat(document.getElementById('currencyDevaluation').value) / 100,
            riskFreeRate: parseFloat(document.getElementById('riskFreeRate').value) / 100,
            openYield: parseFloat(document.getElementById('openYield').value) / 100,
            priceYearHigh: parseFloat(document.getElementById('yearRangeHigh').value) / 100, // Matches backend expectation
            priceYearLow: parseFloat(document.getElementById('yearRangeLow').value) / 100,

            // Hold/Sell specific
            currentInvestment: parseFloat(document.getElementById('currentInvestment').value) || 0,
            purchasePrice: parseFloat(document.getElementById('purchasePrice').value) || 0,
            purchaseDate: document.getElementById('purchaseDate').value
        };

        // Input Validation (Basic client-side check)
        if (isNaN(payload.dirtyPrice) || payload.dirtyPrice <= 0) throw new Error("Price must be positive.");
        if (!payload.maturityDate) throw new Error("Maturity Date is required.");

        // Call API
        const response = await fetch(`${API_URL}/tools/smart-evaluator`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Analysis failed. Please check your inputs.');
        }

        renderResults(data);

    } catch (e) {
        console.error("Smart Evaluator Error:", e);
        errorContainer.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid #ef4444; text-align: center;">
                <strong>Analysis Failed:</strong> ${e.message}
            </div>
        `;
        resultsSection.style.display = 'none';
    } finally {
        btn.innerHTML = originalBtnText; // Use innerHTML to restore text safely
        btn.disabled = false;
    }
}

function renderResults(data) {
    const { totalScore, results, breakdown } = data;
    const resultsSection = document.getElementById('resultsSection');

    // 1. Render Composite Score
    document.getElementById('scoreValue').innerText = totalScore.toFixed(2);

    // 2. Render Decision Box
    let decisionHtml = '';
    if (totalScore >= 1.6) {
        decisionHtml = `
            <div class="decision-box buy">
                <div class="decision-icon">🚀</div>
                <div class="decision-title">STRONG BUY</div>
                <div class="decision-subtitle">Score indicates high value and controlled risk.</div>
            </div>`;
    } else if (totalScore >= 1.2) {
        decisionHtml = `
            <div class="decision-box hold">
                <div class="decision-icon">✋</div>
                <div class="decision-title">HOLD / WATCH</div>
                <div class="decision-subtitle">Good fundamentals but some risks present.</div>
            </div>`;
    } else {
        decisionHtml = `
            <div class="decision-box sell">
                <div class="decision-icon">🔻</div>
                <div class="decision-title">AVOID / SELL</div>
                <div class="decision-subtitle">Risks outweigh potential returns.</div>
            </div>`;
    }
    document.getElementById('decisionBox').innerHTML = decisionHtml;

    // 3. Render Steps
    // Step 1: Fundamental
    document.getElementById('step1Results').innerHTML = createStep('Step 1', 'Price & Valuation', results.step1.value, results.step1.detail, null, results.step1.status);
    document.getElementById('step2Results').innerHTML = createStep('Step 2', 'Real Yield', results.step2.value, results.step2.detail, results.step2.formula, results.step2.status);
    document.getElementById('step3Results').innerHTML = createStep('Step 3', 'Interest Rate Risk', results.step3.value, results.step3.detail, null, results.step3.status);

    // Step 4-6: Risk
    document.getElementById('step4Results').innerHTML = createStep('Step 4', 'Credit Risk', results.step4.value, results.step4.detail, null, results.step4.status);
    document.getElementById('step5Results').innerHTML = createStep('Step 5', 'Coupon Structure', results.step5.value, results.step5.detail, null, results.step5.status);
    document.getElementById('step6Results').innerHTML = createStep('Step 6', 'Time to Maturity', results.step6.value, results.step6.detail, null, results.step6.status);

    // 4. Render Breakdown
    let breakdownHtml = '';
    breakdownHtml += `<div class="breakdown-item"><div class="breakdown-label">Price & Valuation (25%)</div><div class="breakdown-score">${breakdown.step1}</div></div>`;
    breakdownHtml += `<div class="breakdown-item"><div class="breakdown-label">Real Yield (40%)</div><div class="breakdown-score">${breakdown.step2}</div></div>`;
    breakdownHtml += `<div class="breakdown-item"><div class="breakdown-label">Interest Rate Risk (15%)</div><div class="breakdown-score">${breakdown.step3}</div></div>`;
    breakdownHtml += `<div class="breakdown-item"><div class="breakdown-label">Credit Risk (10%)</div><div class="breakdown-score">${breakdown.step4}</div></div>`;
    breakdownHtml += `<div class="breakdown-item"><div class="breakdown-label">Coupon (5%)</div><div class="breakdown-score">${breakdown.step5}</div></div>`;
    breakdownHtml += `<div class="breakdown-item"><div class="breakdown-label">Maturity (5%)</div><div class="breakdown-score">${breakdown.step6}</div></div>`;
    breakdownHtml += `<div class="breakdown-item total"><div class="breakdown-label">TOTAL SCORE</div><div class="breakdown-score">${totalScore.toFixed(2)} / 2.00</div></div>`;

    document.getElementById('scoreBreakdown').innerHTML = breakdownHtml;

    // Show Results
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}
