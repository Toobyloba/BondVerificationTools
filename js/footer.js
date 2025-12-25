/**
 * BondMetrics Pro - Shared Footer
 * This script injects the footer into all pages.
 */
document.addEventListener('DOMContentLoaded', () => {
    const year = new Date().getFullYear();

    const footerHTML = `
        <footer class="main-footer">
            <div class="container footer-container">
                <div class="footer-brand">
                    <div class="footer-logo">
                        <span>BondMetrics</span> Pro
                    </div>
                    <p class="footer-tagline">Institutional-grade fixed income analysis suite.</p>
                </div>
                
                <div class="footer-links">
                    <a href="Bond-Analysis-Tools-Hub.html">Home</a>
                    <a href="Bond-Analysis-Flowchart.html">Flowchart</a>
                    <a href="Bond-Valuation-Screener.html">Valuation</a>
                    <a href="Bond-Screener.html">Screener</a>
                    <a href="Bond-Evaluation-Complete.html">Audit</a>
                    <a href="Bond-Screener-Pro.html">Pro</a>
                </div>

                <div class="footer-copyright">
                    &copy; ${year} BondMetrics Pro. All rights reserved.
                </div>
            </div>
        </footer>
    `;

    document.body.insertAdjacentHTML('beforeend', footerHTML);
});
