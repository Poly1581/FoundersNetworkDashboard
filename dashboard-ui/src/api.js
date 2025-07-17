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
        const response = await backendApi.get("/issues/");
        return response.data;
    } catch (error) {
        handleError("fetching issues", error);
    }
};

export const fetchEventsForIssue = async (issueId) => {
    try {
        const response = await backendApi.get(`/issues/${issueId}/events`);
        return response.data;
    } catch (error) {
        handleError("fetching events for issue", error);
    }
};

export const updateIssueStatus = async (issueId, status) => {
    try {
        const response = await backendApi.put(`/issues/${issueId}`, { status });
        return response.data;
    } catch (error) {
        handleError("updating issue status", error);
    }
};

export const fetchSentryIntegrationStatus = async () => {
    try {
        const response = await backendApi.get("/integration-status/");
        return response.data;
    } catch (error) {
        handleError("fetching sentry integration status", error);
    }
};
