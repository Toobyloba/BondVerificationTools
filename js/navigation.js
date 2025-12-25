/**
 * BondMetrics Pro - Shared Navigation
 * This script injects the navigation header into all pages.
 */
document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
        <nav class="main-nav">
            <div class="nav-container">
                <a href="Bond-Analysis-Tools-Hub.html" class="nav-logo">
                    <span>BondMetrics</span> Pro
                </a>
                
                <div class="nav-links" id="navLinks">
                    <a href="Bond-Analysis-Tools-Hub.html" class="nav-link" data-page="hub">Home</a>
                    <a href="Bond-Analysis-Flowchart.html" class="nav-link" data-page="flowchart">Analysis Flowchart</a>
                    <a href="Bond-Valuation-Screener.html" class="nav-link" data-page="valuation">Valuation Screener</a>
                    <a href="Bond-Screener.html" class="nav-link" data-page="screener">Bond Screener</a>
                    <a href="Bond-Evaluation-Complete.html" class="nav-link" data-page="complete">Complete Evaluation</a>
                    <a href="Bond-Screener-Pro.html" class="nav-link" data-page="pro">Screener Pro</a>
                </div>

                <button class="mobile-menu-btn" id="mobileMenuBtn">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    `;

    // Inject the navigation at the start of the body
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // Handle Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Animate hamburger to X (optional, but nice)
            const spans = mobileMenuBtn.querySelectorAll('span');
            mobileMenuBtn.classList.toggle('open');
            if (mobileMenuBtn.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // Set Active Link
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.includes(href)) {
            link.classList.add('active');
        }
    });
});
