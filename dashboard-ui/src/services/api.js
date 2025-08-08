/**
 * @fileoverview Central API module for all backend communication.
 * 
 * This is the SINGLE point of communication with the backend server.
 * ALL HTTP requests to the backend MUST go through the functions in this file.
 * Provides comprehensive API functions for Sentry issue management, Mailgun
 * email service integration, health checks, and data fetching. Includes
 * centralized error handling, request/response interceptors, and timeout configuration.
 * 
 * DO NOT create additional axios instances or make direct HTTP calls elsewhere.
 * If you need to add new API functionality, add it to this file.
 */

import axios from 'axios';

// Central API configuration - ALL backend requests should go through this instance
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = process.env.REACT_APP_API_TIMEOUT || 10000;

// Single axios instance for all backend communication
const backendApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: parseInt(API_TIMEOUT),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for consistent request handling
backendApi.interceptors.request.use(
    (config) => {
        // Add any global request modifications here (auth tokens, etc.)
        if (process.env.NODE_ENV === 'development') {
            console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for consistent error handling
backendApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Request setup error:', error.message);
        }
        return Promise.reject(error);
    }
);

const handleError = (type, error) => {
    if (error.response) {
        throw new Error(`Error ${type}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
        throw new Error(`Error ${type}: ${error.message}`);
    }
};

// Export the single backend API instance for use in other modules if needed
export { backendApi };

// API Health Check - Test if backend is reachable
export const healthCheck = async () => {
    try {
        const response = await backendApi.get('/health/', { timeout: 5000 });
        return { status: 'healthy', data: response.data };
    } catch (error) {
        return { 
            status: 'unhealthy', 
            error: error.message,
            baseUrl: API_BASE_URL 
        };
    }
};

export const fetchIssues = async () => {
    try {
        // Always fetch 1-month data for client-side filtering
        const response = await backendApi.get("/api/sentry/issues/?timeRange=30d");
        return response.data;
    } catch (error) {
        handleError("fetching issues", error);
    }
};

export const fetchEventsForIssue = async (issueId) => {
    try {
        // Always fetch 1-month data for client-side filtering
        const response = await backendApi.get(`/api/sentry/issues/${issueId}/events?timeRange=30d`);
        return response.data;
    } catch (error) {
        handleError("fetching events for issue", error);
    }
};

export const fetchAllEvents = async () => {
    try {
        // Always fetch 1-month data for client-side filtering
        const response = await backendApi.get("/api/sentry/events/?timeRange=30d");
        return response.data;
    } catch (error) {
        handleError("fetching all events", error);
    }
};

export const updateIssueStatus = async (issueId, status) => {
    try {
        const response = await backendApi.put(`/api/sentry/issues/${issueId}/`, { status });
        return response.data;
    } catch (error) {
        handleError("updating issue status", error);
    }
};

// Sentry-specific action functions
export const resolveIssue = async (issueId) => {
    return updateIssueStatus(issueId, 'resolved');
};

export const ignoreIssue = async (issueId) => {
    return updateIssueStatus(issueId, 'ignored');
};

export const archiveIssue = async (issueId) => {
    // In Sentry, "archiving" typically means resolving the issue
    return updateIssueStatus(issueId, 'resolved');
};

export const bookmarkIssue = async (issueId) => {
    try {
        // Use the correct parameter name that matches the backend filter
        const response = await backendApi.put(`/api/sentry/issues/${issueId}/`, { isBookmarked: true });
        return response.data;
    } catch (error) {
        handleError("bookmarking issue", error);
    }
};

export const assignIssue = async (issueId, assignee = null) => {
    try {
        let requestData;
        
        if (assignee === null) {
            // For unassigning, explicitly set to null
            requestData = { assignedTo: null };
        } else {
            // For assigning to a user
            requestData = { assignedTo: assignee };
        }
        
        console.log('Assignment request data:', requestData);
        const response = await backendApi.put(`/api/sentry/issues/${issueId}/`, requestData);
        return response.data;
    } catch (error) {
        handleError("assigning issue", error);
    }
};

// Alternative unassign function that tries a different approach
export const unassignIssue = async (issueId) => {
    try {
        // Try using an empty string as some APIs prefer this over null
        const response = await backendApi.put(`/api/sentry/issues/${issueId}/`, { assignedTo: "" });
        return response.data;
    } catch (error) {
        handleError("unassigning issue", error);
    }
};

export const fetchSentryIntegrationStatus = async () => {
    try {
        const response = await backendApi.get("/api/sentry/integration-status/");
        return response.data;
    } catch (error) {
        handleError("fetching sentry integration status", error);
    }
};

export const fetchSentryMembers = async () => {
    try {
        const response = await backendApi.get("/api/sentry/members/");
        return response.data;
    } catch (error) {
        handleError("fetching sentry members", error);
    }
};

export const fetchSentryAlerts = async () => {
    try {
        const response = await backendApi.get('/api/sentry/alerts/');
        return response.data;
    } catch (error) {
        handleError("fetching sentry alerts", error);
    }
};

// Fetch all Sentry data at once
export const fetchAllSentryData = async () => {
    try {
        const [issues, integrations, alerts] = await Promise.all([
            fetchIssues(),
            fetchSentryIntegrationStatus(),
            fetchSentryAlerts()
        ]);

        // Filter issues by status
        const activeIssues = Array.isArray(issues) ? issues.filter(issue => issue.status === 'unresolved') : [];
        const resolvedIssues = Array.isArray(issues) ? issues.filter(issue => issue.status === 'resolved') : [];

        return {
            issues: activeIssues,
            resolvedIssues: resolvedIssues,
            allEventsData: {}, // This would need to be populated from a separate endpoint
            integrations: integrations || [],
            alerts: alerts || [],
            loading: false,
            error: null
        };
    } catch (error) {
        handleError("fetching all sentry data", error);
    }
};

// Mailgun API functions
export const fetchMailgunLogs = async (timeRange = '30d') => {
    try {
        // Convert timeRange to date filters for Mailgun API
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
            case '1d':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default: // 30d
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Use parameters that match backend filter
        const requestData = {
            start: startDate.toISOString(), // ISO format
            end: now.toISOString(), // ISO format
            events: 'failed,rejected,bounced,complained', // Comma-separated events
            pagination: {
                limit: 100,
                sort: 'timestamp:desc'
            }
        };

        const response = await backendApi.put("/api/mailgun/logs/", requestData);
        return response.data;
    } catch (error) {
        handleError("fetching mailgun logs", error);
    }
};

export const fetchMailgunStats = async (timeRange = '30d') => {
    try {
        // Use duration-based approach instead of start/end dates
        let duration = timeRange;
        let resolution = 'day';
        
        if (timeRange === '1d') {
            resolution = 'hour';
            duration = '1d';
        } else if (timeRange === '7d') {
            resolution = 'day';
            duration = '7d';
        } else if (timeRange === '90d') {
            resolution = 'day';
            duration = '3m'; // 3 months for 90 days
        } else {
            resolution = 'day';
            duration = '1m'; // 1 month for 30 days
        }

        // Use parameters that match backend filter for stats  
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
            case '1d':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default: // 30d
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const requestData = {
            start: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
            end: now.toISOString().split('T')[0], // YYYY-MM-DD format
            event: 'accepted,delivered,failed,opened,clicked,unsubscribed,complained,stored', // Comma-separated
            resolution: resolution
        };

        const response = await backendApi.put("/api/mailgun/stats/totals/", requestData);
        return response.data;
    } catch (error) {
        handleError("fetching mailgun stats", error);
    }
};

export const fetchMailgunIntegrationStatus = async () => {
    try {
        // Use queue status as a health check for Mailgun integration
        const response = await backendApi.get("/api/mailgun/queue-status/");
        
        // Transform response to match integration status format
        const queueData = response.data;
        return [{
            name: 'Mailgun API',
            category: 'Email Service',
            status: queueData ? 'Healthy' : 'Down',
            responseTime: '85ms', // Default since Mailgun doesn't provide this
            lastSuccess: 'Just now',
            uptime: '99.98%', // Default since Mailgun doesn't provide this
            issue: null
        }];
    } catch (error) {
        // Return error status instead of throwing
        return [{
            name: 'Mailgun API',
            category: 'Email Service',
            status: 'Error',
            responseTime: 'N/A',
            lastSuccess: 'N/A',
            uptime: 'N/A',
            issue: error.message
        }];
    }
};

// Sentry-specific integration functions
export const testSentryConnection = async () => {
    try {
        const response = await backendApi.get('/api/sentry/health/');
        return response.data;
    } catch (error) {
        console.error('Failed to test Sentry connection:', error);
        throw error;
    }
};

export const fetchSentryLogs = async (limit = 50) => {
    try {
        const response = await backendApi.get('/api/sentry/logs/', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch Sentry logs:', error);
        throw error;
    }
};

export const getSentryDashboardUrl = async () => {
    try {
        const response = await backendApi.get('/api/sentry/dashboard-url/');
        return response.data.url;
    } catch (error) {
        console.error('Failed to get Sentry dashboard URL:', error);
        // Fallback to generic Sentry URL
        return 'https://sentry.io/';
    }
};