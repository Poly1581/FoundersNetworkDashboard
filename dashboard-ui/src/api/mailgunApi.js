import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export const fetchMailgunEvents = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/mailgun/events/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Mailgun events:', error);
        throw new Error(`Failed to fetch Mailgun events: ${error.message}`);
    }
};

export const fetchMailgunStats = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/mailgun/stats/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Mailgun stats:', error);
        throw new Error(`Failed to fetch Mailgun stats: ${error.message}`);
    }
};

export const fetchMailgunIntegrations = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/mailgun/integrations/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Mailgun integrations:', error);
        throw new Error(`Failed to fetch Mailgun integrations: ${error.message}`);
    }
};

export const fetchMailgunDomains = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/mailgun/domains/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching Mailgun domains:', error);
        throw new Error(`Failed to fetch Mailgun domains: ${error.message}`);
    }
};

export const fetchAllMailgunData = async () => {
    try {
        const [events, integrations] = await Promise.all([
            fetchMailgunEvents(),
            fetchMailgunIntegrations()
        ]);

        return {
            events,
            integrations,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error fetching all Mailgun data:', error);
        throw new Error(`Failed to fetch Mailgun data: ${error.message}`);
    }
};