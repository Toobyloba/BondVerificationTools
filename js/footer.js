/**
 * BondMetrics Pro - Shared Footer
 * This script injects the footer into all pages.
 */
document.addEventListener('DOMContentLoaded', () => {
    const year = new Date().getFullYear();

    const footerHTML = `
        <footer class="main-footer">
            <div class="container footer-container">
                <div class="footer-main-content">
                    <!-- Column 1: Brand -->
                    <div class="footer-col brand-col">
                        <div class="footer-logo">
                            <span>BondMetrics</span> Pro
                        </div>
                        <p class="footer-tagline">Institutional-grade fixed income analysis suite.</p>
                    </div>

                    <!-- Column 2: Disclaimer -->
                    <div class="footer-col disclaimer-col">
                        <div class="footer-disclaimer">
                            <strong>Disclaimer:</strong> This application is for educational and informational purposes only. It does not constitute financial advice, investment recommendations, or an offer to buy or sell any securities. Bond values and risk metrics are calculated estimates; actual market conditions may vary.
                        </div>
                    </div>

                    <!-- Column 3: Menu -->
                    <div class="footer-col menu-col">
                        <h4 class="footer-heading">Quick Links</h4>
                        <div class="footer-links">
                            <a href="Bond-Analysis-Tools-Hub.html">Home</a>
                            <a href="Bond-Analysis-Flowchart.html">Analysis Flowchart</a>
                            <a href="Bond-Valuation-Screener.html">Valuation Screener</a>
                            <a href="Bond-Screener.html">Bond Screener</a>
                            <a href="Bond-Evaluation-Complete.html">Complete Evaluation</a>
                            <a href="Bond-Screener-Pro.html">Screener Pro</a>
                        </div>
                    </div>
                </div>

                <div class="footer-copyright">
                    &copy; ${year} BondMetrics Pro. All rights reserved.
                </div>
            </div>
        </footer>
    `;

    document.body.insertAdjacentHTML('beforeend', footerHTML);
});
