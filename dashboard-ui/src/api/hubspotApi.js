import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const fetchHubSpotIssues = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/hubspot/issues/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching HubSpot issues:', error);
        throw new Error(`Failed to fetch HubSpot issues: ${error.message}`);
    }
};

export const fetchHubSpotIntegrations = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/hubspot/integrations/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching HubSpot integrations:', error);
        throw new Error(`Failed to fetch HubSpot integrations: ${error.message}`);
    }
};

export const fetchHubSpotDeals = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/hubspot/deals/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching HubSpot deals:', error);
        throw new Error(`Failed to fetch HubSpot deals: ${error.message}`);
    }
};

export const fetchHubSpotContacts = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/hubspot/contacts/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching HubSpot contacts:', error);
        throw new Error(`Failed to fetch HubSpot contacts: ${error.message}`);
    }
};

export const fetchAllHubSpotData = async () => {
    try {
        const [issues, integrations] = await Promise.all([
            fetchHubSpotIssues(),
            fetchHubSpotIntegrations()
        ]);

        return {
            issues,
            integrations,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching all HubSpot data:', error);
        throw new Error(`Failed to fetch HubSpot data: ${error.message}`);
    }
};