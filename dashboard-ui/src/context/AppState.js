import React, { useReducer, startTransition, useCallback } from 'react';
import AppContext from './AppContext';
import { appReducer, FETCH_DATA_START, FETCH_DATA_SUCCESS, FETCH_DATA_FAILURE } from './AppReducer';
import { fetchIssues, fetchEventsForIssue, fetchSentryIntegrationStatus } from '../api';

// Utility function from App.js
function getTimeOffsetFromNow(timestampStr) {
    const dateTimeStr = timestampStr.replace("Timestamp: ", "");
    const pastDate = new Date(dateTimeStr);
    const now = new Date();
    return Math.floor((pastDate.getTime() - now.getTime()) / 1000);
}

const AppState = ({ children }) => {
    const initialState = {
        allExpanded: false,
        activePage: 'overview',
        timeRange: '7d',
        sentryIssues: [],
        allEventsData: {},
        allEventsForChart: [],
        sentryIntegrations: [],
        hubspotIntegrations: [
            { name: 'HubSpot API', category: 'CRM', status: 'Healthy', responseTime: '120ms', lastSuccess: 'Just now', uptime: '99.99%', issue: null },
        ],
        allIntegrations: [],
        loading: true,
        error: null,
    };

    const [state, dispatch] = useReducer(appReducer, initialState);

    const loadSentryData = useCallback(async () => {
        startTransition(() => {
            dispatch({ type: FETCH_DATA_START });
        });

        try {
            const [fetchedIssues, fetchedSentryIntegrations] = await Promise.all([
                fetchIssues(),
                fetchSentryIntegrationStatus(),
            ]);

            const eventPromises = fetchedIssues.map(issue => fetchEventsForIssue(issue.id));
            const allEventsByIssue = await Promise.all(eventPromises);

            const eventsDataMap = fetchedIssues.reduce((acc, issue, index) => {
                acc[issue.id] = allEventsByIssue[index];
                return acc;
            }, {});

            const flattenedEvents = fetchedIssues.flatMap((issue, index) => {
                const eventsForIssue = allEventsByIssue[index] || [];
                const category = issue.metadata.type || issue.type;
                return eventsForIssue.map(event => ({
                    ...event,
                    level: issue.level,
                    issueCategory: category,
                    offsetSeconds: getTimeOffsetFromNow(`Timestamp: ${event.dateCreated}`),
                }));
            });
            
            startTransition(() => {
                dispatch({
                    type: FETCH_DATA_SUCCESS,
                    payload: {
                        sentryIssues: fetchedIssues,
                        sentryIntegrations: fetchedSentryIntegrations,
                        allEventsData: eventsDataMap,
                        allEventsForChart: flattenedEvents,
                        hubspotIntegrations: initialState.hubspotIntegrations, // Keep mock data
                    }
                });
            });

        } catch (err) {
            startTransition(() => {
                dispatch({ type: FETCH_DATA_FAILURE, payload: err.message });
            });
            console.error("Failed to fetch Sentry data:", err);
        }
    }, [dispatch, initialState.hubspotIntegrations]);

    return (
        <AppContext.Provider value={{ state, dispatch, loadSentryData }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppState;
