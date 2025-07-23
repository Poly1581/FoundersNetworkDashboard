/**
 * HubSpot API functions
 * Extracted from dataManager for use with React Query
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// Error handling helper
const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    if (error.response) {
        return `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
    } else if (error.request) {
        return 'Network error: Unable to reach server';
    } else {
        return `Request error: ${error.message}`;
    }
};

// HubSpot API functions
export const fetchHubSpotIntegrations = async () => {
    try {
        const response = await apiClient.get('/api/hubspot/integration-status/');
        return response.data;
    } catch (error) {
        throw new Error(handleError(error, 'fetchHubSpotIntegrations'));
    }
};

// Fetch all HubSpot data at once
export const fetchAllHubSpotData = async () => {
    try {
        const integrations = await fetchHubSpotIntegrations();

        return {
            deals: [], // Mock empty deals data
            integrations: integrations || [],
            activities: [], // Mock empty activities data
            loading: false,
            error: null
        };
    } catch (error) {
        throw new Error(handleError(error, 'fetchAllHubSpotData'));
    }
};