import axios from 'axios';

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

export const fetchSentryMembers = async () => {
    try {
        const response = await backendApi.get("/api/sentry/members/");
        return response.data;
    } catch (error) {
        handleError("fetching sentry members", error);
    }
};