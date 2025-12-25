/**
 * Frontend API client for Bond Verification Tools
 */
const API_BASE_URL = 'http://localhost:3000/api/v1';

const BondAPI = {
    /**
     * Generic fetch wrapper
     */
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Call Failed:', error);
            throw error;
        }
    },

    /**
     * Calculate Bond Screener results
     */
    async evaluateScreener(data) {
        return this.post('/calculate/screener', data);
    },

    /**
     * Calculate Bond Screener Pro results
     */
    async evaluateScreenerPro(data) {
        return this.post('/calculate/screener-pro', data);
    },

    /**
     * Calculate Bond Valuation results
     */
    async evaluateValuation(data) {
        return this.post('/calculate/valuation', data);
    },

    /**
     * Calculate Complete Bond Evaluation results
     */
    async evaluateComplete(data) {
        return this.post('/calculate/complete', data);
    },

    /**
     * Calculate Flowchart Analysis results
     */
    async evaluateFlowchart(data) {
        return this.post('/calculate/flowchart', data);
    }
};

window.BondAPI = BondAPI;
