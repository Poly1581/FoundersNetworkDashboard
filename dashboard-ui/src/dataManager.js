/**
 * Centralized Data Manager
 * Handles all data fetching and state management for the dashboard
 */

import axios from 'axios';

// Backend API Client
const backendApi = axios.create({
    baseURL: "http://localhost:8000"
});

/**
 * Error handler for API requests
 */
const handleError = (type, error) => {
    if (error.response) {
        throw new Error(`Error ${type}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
        throw new Error(`Error ${type}: ${error.message}`);
    }
};

/**
 * API Functions
 */
const api = {
    // Sentry APIs
    fetchIssues: async () => {
        try {
            const response = await backendApi.get("/api/sentry/issues");
            return response.data;
        } catch (error) {
            handleError("fetching issues", error);
        }
    },

    fetchEventsForIssue: async (issueId) => {
        try {
            const response = await backendApi.get(`/api/sentry/issues/${issueId}/events`);
            return response.data;
        } catch (error) {
            handleError("fetching events for issue", error);
        }
    },

    updateIssueStatus: async (issueId, status) => {
        try {
            const response = await backendApi.put(`/api/sentry/issues/${issueId}`, { status });
            return response.data;
        } catch (error) {
            handleError("updating issue status", error);
        }
    },

    fetchSentryIntegrationStatus: async () => {
        try {
            const response = await backendApi.get("/api/sentry/integration-status");
            return response.data;
        } catch (error) {
            handleError("fetching sentry integration status", error);
        }
    },

    // HubSpot APIs
    fetchHubSpotDeals: async () => {
        try {
            const response = await backendApi.get("/api/hubspot/deals");
            return response.data;
        } catch (error) {
            handleError("fetching HubSpot deals", error);
        }
    },

    fetchHubSpotActivities: async () => {
        try {
            const response = await backendApi.get("/api/hubspot/activities");
            return response.data;
        } catch (error) {
            handleError("fetching HubSpot activities", error);
        }
    },

    fetchHubSpotIntegrationStatus: async () => {
        try {
            const response = await backendApi.get("/api/hubspot/integration-status");
            return response.data;
        } catch (error) {
            handleError("fetching HubSpot integration status", error);
        }
    }
};

/**
 * Data Manager Class
 * Centralized state management and data fetching
 */
class DataManager {
    constructor() {
        this.data = {
            sentry: {
                issues: [],
                resolvedIssues: [],
                integrations: [],
                alerts: [],
                allEventsData: {},
                loading: false,
                error: null,
                lastFetch: null
            },
            hubspot: {
                deals: [],
                activities: [],
                integrations: [],
                loading: false,
                error: null,
                lastFetch: null
            },
            global: {
                lastFetch: null,
                loading: false
            }
        };

        this.listeners = new Set();
    }

    /**
     * Subscribe to data changes
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * Notify all listeners of data changes
     */
    notify() {
        this.listeners.forEach(callback => callback(this.data));
    }

    /**
     * Get current data state
     */
    getData() {
        return this.data;
    }

    /**
     * Load all data at application startup
     */
    async loadAllData() {
        this.data.global.loading = true;
        this.notify();

        try {
            // Load Sentry and HubSpot data in parallel
            await Promise.all([
                this.loadSentryData(),
                this.loadHubSpotData()
            ]);

            this.data.global.lastFetch = new Date();
        } catch (error) {
            console.error('Error loading all data:', error);
        } finally {
            this.data.global.loading = false;
            this.notify();
        }
    }

    /**
     * Load Sentry data
     */
    async loadSentryData() {
        this.data.sentry.loading = true;
        this.data.sentry.error = null;
        this.notify();

        try {
            // Fetch all Sentry data in parallel
            const [issues, integrations] = await Promise.all([
                api.fetchIssues(),
                api.fetchSentryIntegrationStatus()
            ]);

            this.data.sentry.issues = issues;
            this.data.sentry.integrations = integrations;

            // Transform issues to alerts
            const alerts = issues.map(issue => ({
                severity: issue.level === 'error' ? 'Error' : issue.level === 'warning' ? 'Warning' : 'Warning',
                message: issue.title,
                time: new Date(issue.lastSeen).toLocaleString(),
                details: issue.culprit || issue.shortId,
                originalIssue: issue
            }));
            this.data.sentry.alerts = alerts;

            // Fetch events for all issues
            const eventPromises = issues.map(issue => api.fetchEventsForIssue(issue.id));
            const allEvents = await Promise.all(eventPromises);

            const eventsData = issues.reduce((acc, issue, index) => {
                acc[issue.id] = allEvents[index];
                return acc;
            }, {});

            this.data.sentry.allEventsData = eventsData;
            this.data.sentry.lastFetch = new Date();

        } catch (error) {
            this.data.sentry.error = error.message;
            console.error('Error loading Sentry data:', error);
        } finally {
            this.data.sentry.loading = false;
            this.notify();
        }
    }

    /**
     * Load HubSpot data
     */
    async loadHubSpotData() {
        this.data.hubspot.loading = true;
        this.data.hubspot.error = null;
        this.notify();

        try {
            // Fetch all HubSpot data in parallel
            const [deals, activities, integrations] = await Promise.all([
                api.fetchHubSpotDeals(),
                api.fetchHubSpotActivities(),
                api.fetchHubSpotIntegrationStatus()
            ]);

            this.data.hubspot.deals = deals;
            this.data.hubspot.activities = activities;
            this.data.hubspot.integrations = integrations;
            this.data.hubspot.lastFetch = new Date();

        } catch (error) {
            this.data.hubspot.error = error.message;
            console.error('Error loading HubSpot data:', error);
        } finally {
            this.data.hubspot.loading = false;
            this.notify();
        }
    }

    /**
     * Refresh specific section data
     */
    async refreshSection(section) {
        switch (section) {
            case 'sentry':
                await this.loadSentryData();
                break;
            case 'hubspot':
                await this.loadHubSpotData();
                break;
            case 'all':
                await this.loadAllData();
                break;
            default:
                console.warn(`Unknown section: ${section}`);
        }
    }

    /**
     * Update issue status (for Sentry)
     */
    async updateIssueStatus(issueId, status) {
        try {
            // Find the issue to update
            const issueToUpdate = this.data.sentry.issues.find(issue => issue.id === issueId);
            if (!issueToUpdate) return;

            // Optimistically update the UI
            if (status === 'resolved') {
                this.data.sentry.issues = this.data.sentry.issues.filter(issue => issue.id !== issueId);
                this.data.sentry.resolvedIssues = [...this.data.sentry.resolvedIssues, { ...issueToUpdate, status: 'resolved' }];
            }
            this.notify();

            // Make API call
            await api.updateIssueStatus(issueId, status);

        } catch (error) {
            // Revert optimistic update on error
            if (status === 'resolved') {
                const issueToRevert = this.data.sentry.resolvedIssues.find(issue => issue.id === issueId);
                if (issueToRevert) {
                    this.data.sentry.resolvedIssues = this.data.sentry.resolvedIssues.filter(issue => issue.id !== issueId);
                    this.data.sentry.issues = [...this.data.sentry.issues, { ...issueToRevert, status: 'unresolved' }];
                    this.notify();
                }
            }
            throw error;
        }
    }
}

// Create singleton instance
const dataManager = new DataManager();

export default dataManager;