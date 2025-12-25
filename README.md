# 🔍 BondMetrics Pro

**BondMetrics Pro** is an institutional-grade bond evaluation suite featuring a modern client-server architecture. It combines robust financial modeling with a secure, privacy-focused analytics engine to provide a premium and unified analysis experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Security](https://img.shields.io/badge/Security-Zero%20Dependency-brightgreen)
![Analytics](https://img.shields.io/badge/Analytics-Built%20In-blueviolet)

---

## 🚀 Live Demo

[View Live Demo](https://Toobyloba.github.io/bond-analysis-tools/main/Bond-Analysis-Tools-Hub.html) *(Replace with your GitHub Pages URL)*

---

## 📊 What's Included

This repository contains 5 distinct bond analysis tools plus a new Admin Dashboard:

| Tool | Complexity | Best For | Key Features |
|------|-----------|----------|-------------|
| **Analysis Flowchart** | Medium | Quick pass/fail decisions | 4-phase veto gates, sequential screening |
| **Valuation Screener** | High | Detailed fair price analysis | Fair price DCF calculation, 6-step framework |
| **Bond Screener** | High | International bonds with FX risk | Currency risk, inflation-adjusted returns |
| **Complete Evaluation** | Very High | Institutional analysis | 7-phase comprehensive decision matrix |
| **Screener Pro** | Very High | Scoring and ranking bonds | Weighted scoring system (0-14 points) |

### 🛠️ Management & Administration

**Admin Dashboard**: A secure, internal-only platform for system management.
- **Micro-Analytics**: Real-time traffic tracking (Visitors, Bots, Hourly stats).
- **User Management**: Add and manage admin access securely.
- **Privacy First**: No cookies, no external trackers, compliant by design.

---

## 🏗️ Architecture & Modernization

This suite utilizes a **Full-Stack Architecture** optimized for performance, security, and zero external dependencies (no database required).

- **Backend**: Node.js/Express server handling financial modeling, authentication, and analytics.
- **Frontend**: Modern HTML5/CSS3 with a Global Design System (`css/global.css`) for a consistent, premium experience.
- **Data**: Lightweight JSON-based persistence for users, sessions, and analytics statistics.
- **Security**: Native `crypto` module implementation for PBKDF2 password hashing and secure session management.

---

## ✨ Key Features

### Core Capabilities
- **Precision YTM**: Yield-to-Maturity calculation via Newton-Raphson iteration.
- **DCF Valuation**: Fair price discovery using Discounted Cash Flow models.
- **Sensitivity Analysis**: Macaulay Duration and price volatility modeling.
- **Risk Assessment**: Real-yield, Credit Spread, and FX risk evaluation.

### 🛡️ Security & Analytics (New)
- **Zero-Dependency Auth**: Custom authentication service using native Node.js crypto libraries.
- **Privacy-First Analytics**: Server-side tracking of visits, unique humans vs. bots, and hourly traffic.
- **Persistent Sessions**: Secure file-based session management that survives server restarts.
- **Role-Based Access**: Protects the Admin Dashboard and user management APIs.

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v14 or higher)

### Quick Start
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Toobyloba/bond-analysis-tools.git
    cd bond-analysis-tools
    ```

2.  **Start the Server**:
    *(No `npm install` needed for core features if using zero-dependency setup)*
    ```bash
    node server/index.js
    ```
    The server runs at `http://localhost:3000`.

3.  **Create Initial Admin**:
    A script is provided to create the first admin user (bypassing auth checks):
    ```bash
    node server/create-initial-user.js admin yourSECUREpassword
    ```

4.  **Login**:
    Navigate to [http://localhost:3000/Admin-Login.html](http://localhost:3000/Admin-Login.html).

---

## 📂 Project Structure

```
BondVerificationTools/
├── css/
│   └── global.css          # Universal design system (Variables, UI components)
├── js/
│   ├── navigation.js       # Dynamic header injection
│   ├── footer.js           # Dynamic footer injection
│   └── api-client.js       # Shared API communication logic
├── server/
│   ├── data/               # JSON data store (users, analytics, sessions)
│   ├── services/
│   │   ├── auth.js         # Security service (Hashing, Tokens)
│   │   ├── analytics.js    # Traffic tracking service
│   │   └── bond-math.js    # Financial calculation engine
│   └── index.js            # Main Express server
├── *.html                  # Frontend Tool Pages
└── README.md               # Project Documentation
```

---

## 🔒 Security Note
This project uses a file-based JSON database for simplicity. 
- **Production Use**: For high-scale production, replace the JSON read/write logic in `server/services/` with a database adapter (PostgreSQL/MongoDB).
- **Secrets**: Ensure `server/data/*.json` files are **never committed** to version control (added to `.gitignore`).

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
- LinkedIn: [Toobyloba](https://linkedin.com/in/toobyloba)

---

## 📜 License
MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments
Built using standard bond mathematics and valuation principles from:
- *Fixed Income Securities* by Frank Fabozzi
- *Investment Analysis and Portfolio Management* by Reilly & Brown
- CFA Institute Fixed Income curriculum

---

## 📧 Contact
Questions or feedback?  
Open an issue or reach out via [your-email@example.com]

---

## ⭐ Show Your Support
If you find these tools useful, please consider:
- ⭐ Starring this repository
- 🍴 Forking for your own projects
- 📢 Sharing with others in finance/investing

**Disclaimer**: These tools are for educational and informational purposes only. They are not investment advice. Always conduct thorough due diligence and consult with qualified financial professionals before making investment decisions.
