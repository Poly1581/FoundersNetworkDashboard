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
export const fetchHubSpotDeals = async () => {
    try {
        const response = await apiClient.get('/api/hubspot/deals/');
        return response.data;
    } catch (error) {
        throw new Error(handleError(error, 'fetchHubSpotDeals'));
    }
};

export const fetchHubSpotIntegrations = async () => {
    try {
        const response = await apiClient.get('/api/hubspot/integration-status/');
        return response.data;
    } catch (error) {
        throw new Error(handleError(error, 'fetchHubSpotIntegrations'));
    }
};

export const fetchHubSpotActivities = async () => {
    try {
        const response = await apiClient.get('/api/hubspot/activities/');
        return response.data;
    } catch (error) {
        throw new Error(handleError(error, 'fetchHubSpotActivities'));
    }
};

// Fetch all HubSpot data at once
export const fetchAllHubSpotData = async () => {
    try {
        const [deals, integrations, activities] = await Promise.all([
            fetchHubSpotDeals(),
            fetchHubSpotIntegrations(),
            fetchHubSpotActivities()
        ]);

        return {
            deals: deals || [],
            integrations: integrations || [],
            activities: activities || [],
            loading: false,
            error: null
        };
    } catch (error) {
        throw new Error(handleError(error, 'fetchAllHubSpotData'));
    }
};