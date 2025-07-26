import axios from 'axios';
import {fetchAllHubSpotData} from './api/hubspotApi';
import {fetchAllMailgunData} from './api/mailgunApi';

const handleError = (type, error) => {
    if (error.response) {
        throw new Error(`Error ${type}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
        throw new Error(`Error ${type}: ${error.message}`);
    }
};

const backendApi = axios.create({
    baseURL: "http://localhost:8000"
});

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
        const response = await backendApi.get(`/api/sentry/issues/${issueId}/events/?timeRange=30d`);
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
    // Sentry doesn't have a direct "archive" - typically uses "ignored" or "resolved"
    return updateIssueStatus(issueId, 'ignored');
};

export const bookmarkIssue = async (issueId) => {
    try {
        // For bookmark, we'll use a generic API call that could be extended
        const response = await backendApi.put(`/api/sentry/issues/${issueId}/`, { isBookmarked: true });
        return response.data;
    } catch (error) {
        handleError("bookmarking issue", error);
    }
};

export const assignIssue = async (issueId, assignee = null) => {
    try {
        const response = await backendApi.put(`/api/sentry/issues/${issueId}/`, { assignedTo: assignee });
        return response.data;
    } catch (error) {
        handleError("assigning issue", error);
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

// HubSpot API exports
export const fetchHubSpotData = fetchAllHubSpotData;

// Mailgun API exports  
export const fetchMailgunData = fetchAllMailgunData;
