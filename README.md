# 🔍 BondMetrics Pro

**BondMetrics Pro** is a professional-grade bond evaluation suite featuring a modern client-server architecture. Core mathematical logic is handled by a robust Node.js backend, providing a unified and premium user experience across all analysis frameworks.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 🚀 Live Demo

[View Live Demo](https://Toobyloba.github.io/bond-analysis-tools/main/Bond-Analysis-Tools-Hub.html) *(Replace with your GitHub Pages URL)*

---

## 📊 What's Included

This repository contains 5 distinct bond analysis tools, each with a different evaluation approach:

| Tool | Complexity | Best For | Key Features |
|------|-----------|----------|-------------|
| **Analysis Flowchart** | Medium | Quick pass/fail decisions | 4-phase veto gates, sequential screening |
| **Valuation Screener** | High | Detailed fair price analysis | Fair price DCF calculation, 6-step framework |
| **Bond Screener** | High | International bonds with FX risk | Currency risk, inflation-adjusted returns |
| **Complete Evaluation** | Very High | Institutional analysis | 7-phase comprehensive decision matrix |
| **Screener Pro** | Very High | Scoring and ranking bonds | Weighted scoring system (0-14 points) |

---

## 🏗️ Architecture & Modernization

This suite has been recently upgraded from standalone HTML files to a modern **Full-Stack Architecture**:

- **Backend**: A Node.js/Express server handles all complex financial modeling, including YTM solvers and DCF valuations.
- **Frontend**: Modernized HTML5 interfaces powered by a **Global CSS Design System** (`css/global.css`) for a premium, unified look.
- **API Integration**: Frontend and backend communicate via a structured REST API using an asynchronous client.

---

## ✨ Key Features

- **Server-Side Logic**: High-performance calculation engine separated from the presentation layer.
- **Unified Design System**: A premium, responsive UI with consistent typography, color palettes, and animations.
- **Micro-Animations**: Subtle transitions and fade-in effects for a superior user experience.
- **Scalable Framework**: Easy to add new evaluation phases or calculation endpoints.
- **Educational Transparency**: Formulas and logic are documented and implemented clearly in the backend services.

### Core Capabilities

- **Precision YTM**: Yield-to-Maturity calculation via Newton-Raphson iteration.
- **DCF Valuation**: Fair price discovery using Discounted Cash Flow models.
- **Sensitivity Analysis**: Macaulay Duration and price volatility modeling.
- **Risk Assessment**: Real-yield (inflation), Credit Spread, and FX risk evaluation.
- **Veto-Gate Logic**: Sequential decision-making frameworks for institutional-grade audit.

---

## 🎯 Tool Descriptions

### 1. Bond Analysis Flowchart
**Sequential veto-gate framework with 4 critical phases**

- **Phase 1**: Fair Price Gates (price vs fair value, credit spread)
- **Phase 2**: Real Money Gates (real yield, current yield)
- **Phase 3**: Risk Filter Gates (duration, callability, coupon type)
- **Phase 4**: Final Decision (Execute/Caution/Stop)

**Use Case**: Quick screening when you need immediate go/no-go decisions.

---

### 2. Bond Valuation Screener
**6-step framework with detailed fair price analysis**

- **Steps 1-3**: Cash flow analysis, current yield, YTM
- **Step 4**: Fair price calculation using your required yield
- **Step 5**: Multi-dimensional risk filtering
- **Step 6**: Final investment decision

**Use Case**: Value investing approach, focuses on finding undervalued bonds.

---

### 3. Bond Screener
**Multi-step evaluation with currency and inflation risk**

- **Step 1**: Core yields (CY, YTM)
- **Step 2**: Real yield (inflation-adjusted)
- **Step 3**: Duration and interest rate risk
- **Step 4**: Credit spread analysis
- **Step 5**: Currency risk for foreign bonds
- **Step 6**: Liquidity and fine print

**Use Case**: International bond portfolios with FX exposure.

---

### 4. Complete Bond Evaluation
**7-phase comprehensive institutional-grade analysis**

- **Phase 1**: Data collection
- **Phase 2**: Core metrics calculation
- **Phase 3**: Real returns (inflation & currency)
- **Phase 4**: Interest rate risk
- **Phase 5**: Credit risk
- **Phase 6**: Bond features (callability, liquidity)
- **Phase 7**: Weighted decision matrix

**Use Case**: Full due diligence for large positions or institutional portfolios.

---

### 5. Screener Pro
**Advanced scoring system with 7-step evaluation**

- **Total Score**: 0-14 points (Green=2, Yellow=1, Red=0)
- **Step 2**: Price validation
- **Step 3**: Coupon & yields screening
- **Step 4**: Real metrics (inflation-adjusted)
- **Step 5**: Volatility & credit risk (3 criteria, **2x weight**)
- **Step 6**: Liquidity & fine print
- **Step 7**: Final score & recommendation

**Decision Thresholds**:
- 12-14 points: **GOOD BUY**
- 8-11 points: **HOLD/WATCH**
- 0-7 points: **REJECT/AVOID**

**Use Case**: Comparing multiple bonds, portfolio ranking.

---

## 🚀 Installation & Setup
### 1. Clone the Repository
```bash
git clone https://github.com/Toobyloba/BondVerificationTools.git
cd BondVerificationTools
```

### 2. Setup the Backend Server
The analysis logic now resides in a Node.js environment:
```bash
cd server
npm install
```

### 3. Run the Server
Start the development server (default is port 3000):
```bash
npm run dev
```

### 4. Open the Interface
Access the tools hub by opening the root HTML file in your browser:
- `Bond-Analysis-Tools-Hub.html`

---

## 📁 Project Structure

- **`Bond-*.html`**: Frontend tool pages (Flowchart, Screener, Valuation, etc.)
- **`css/global.css`**: Centralized styling and design tokens.
- **`js/api-client.js`**: Asynchronous API wrapper for backend communication.
- **`server/`**:
  - `index.js`: Express server and REST API endpoints.
  - `services/bond-math.js`: Core mathematical functions (YTM, Duration, DCF).

## 🤝 Contributing

Contributions welcome! If you'd like to improve these tools:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

### Areas for Contribution

- Additional bond types (convertible, inflation-linked, etc.)
- Integration with real-time data sources
- Localization (multi-language support)
- Accessibility improvements
- Mobile UX enhancements
- Additional risk models

---
## ⚠️ Limitations

- **Manual Data Entry**: Requires user to input bond data (no live feeds)
- **No Historical Tracking**: Each analysis is standalone
- **Simplified Models**: Uses standard bond math, not advanced derivatives pricing
- **No Portfolio Analysis**: Analyzes one bond at a time
- **Static Thresholds**: Decision rules are hardcoded (customizable via code edit)

 --- 
## 👨‍💻 About the Author

**Background**: Engineering professional with expertise in semiconductor validation and digital systems, transitioning into financial technology and market analysis.

**Why These Tools?**: Built to bridge technical engineering discipline with financial decision-making. These tools apply the same rigorous, systematic approach used in chip validation to bond investment analysis.

**Technical Philosophy**: 
- Clean, dependency-free code that runs anywhere
- Educational transparency (show the math, not just results)
- Practical frameworks over academic complexity

**Current Focus**: Exploring the intersection of hardware engineering methodologies and financial market analysis, with interests in algorithmic trading systems and quantitative investment frameworks.

**Location**: Based in France

**Connect**: 
- GitHub: [@Toobyloba](https://github.com/Toobyloba)
- LinkedIn: [Toobyloba](https://linkedin.com/in/balogun-tobi)

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built using standard bond mathematics and valuation principles from:
- Fixed Income Securities by Frank Fabozzi
- Investment Analysis and Portfolio Management by Reilly & Brown
- CFA Institute Fixed Income curriculum

---

## 📧 Contact

**Questions or feedback?**  
Open an issue or reach out via [your-email@example.com]

---

## ⭐ Show Your Support

If you find these tools useful, please consider:
- ⭐ Starring this repository
- 🍴 Forking for your own projects
- 📢 Sharing with others in finance/investing

---

**Disclaimer**: These tools are for educational and informational purposes only. They are not investment advice. Always conduct thorough due diligence and consult with qualified financial professionals before making investment decisions.
