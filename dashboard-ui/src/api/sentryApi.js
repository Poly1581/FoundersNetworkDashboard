/**
 * Sentry API functions
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

// Sentry API functions
export const fetchSentryIssues = async () => {
    try {
        const response = await apiClient.get('/api/sentry/issues/');
        return response.data;
    } catch (error) {
        throw new Error(handleError(error, 'fetchSentryIssues'));
    }
};

export const fetchSentryIntegrations = async () => {
    try {
        const response = await apiClient.get('/api/sentry/integration-status/');
        return response.data;
    } catch (error) {
        throw new Error(handleError(error, 'fetchSentryIntegrations'));
    }
};

export const fetchSentryAlerts = async () => {
    // Return empty array since alerts endpoint doesn't exist yet
    return [];
};

export const updateIssueStatus = async (issueId, status) => {
    try {
        const response = await apiClient.patch(`/api/sentry/issues/${issueId}/`, { status });
        return response.data;
    } catch (error) {
        throw new Error(handleError(error, 'updateIssueStatus'));
    }
};

// Fetch all Sentry data at once
export const fetchAllSentryData = async () => {
    try {
        const [issues, integrations, alerts] = await Promise.all([
            fetchSentryIssues(),
            fetchSentryIntegrations(),
            fetchSentryAlerts()
        ]);

        return {
            issues: issues.issues || [],
            resolvedIssues: issues.resolved_issues || [],
            allEventsData: issues.all_events_data || {},
            integrations: integrations || [],
            alerts: alerts || [],
            loading: false,
            error: null
        };
    } catch (error) {
        throw new Error(handleError(error, 'fetchAllSentryData'));
    }
};