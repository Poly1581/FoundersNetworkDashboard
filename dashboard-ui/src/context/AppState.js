import React, { useReducer, startTransition, useCallback, useMemo } from 'react';
import AppContext from './AppContext';
import { appReducer, FETCH_DATA_START, FETCH_DATA_SUCCESS, FETCH_DATA_FAILURE, UPDATE_FILTERED_DATA, SET_LIVE_DATA_FILTER, SET_GLOBAL_TIME_RANGE } from './AppReducer';
import { fetchIssues, fetchEventsForIssue, fetchSentryIntegrationStatus } from '../api';
import { filterEventsByTimeRange, filterIssuesByTimeRange, createMemoizedFilter } from '../utils/dataFilters';

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
        timeRange: '30d',
        globalTimeRange: '30d',
        liveDataFilter: 'all',
        // Raw data (always 1-month window)
        rawSentryIssues: [],
        rawAllEventsData: {},
        rawAllEventsForChart: [],
        // Filtered data (applied based on timeRange/liveDataFilter)
        sentryIssues: [],
        allEventsData: {},
        allEventsForChart: [],
        sentryIntegrations: [],
        mailgunIntegrations: [
            { name: 'Mailgun API', category: 'Email Service', status: 'Healthy', responseTime: '85ms', lastSuccess: 'Just now', uptime: '99.98%', issue: null },
        ],
        mailgunEvents: [],
        mailgunStats: [],
        mailgunDomains: [],
        allIntegrations: [],
        loading: false,
        error: null,
    };

    const [state, dispatch] = useReducer(appReducer, initialState);
    
    // Create memoized filter functions for performance
    const memoizedEventFilter = useMemo(() => createMemoizedFilter(), []);
    const memoizedIssueFilter = useMemo(() => createMemoizedFilter(), []);

    const loadSentryData = useCallback(async () => {
        startTransition(() => {
            dispatch({ type: FETCH_DATA_START });
        });

        try {
            const [fetchedIssues, fetchedSentryIntegrations] = await Promise.all([
                fetchIssues(),
                fetchSentryIntegrationStatus(),
            ]);

            const eventPromises = fetchedIssues.map(async (issue) => {
                try {
                    return await fetchEventsForIssue(issue.id);
                } catch (error) {
                    console.warn(`Failed to fetch events for issue ${issue.id}:`, error.message);
                    return []; // Return empty array for failed fetches
                }
            });
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
                        mailgunIntegrations: [
                            { name: 'Mailgun API', category: 'Email Service', status: 'Healthy', responseTime: '85ms', lastSuccess: 'Just now', uptime: '99.98%', issue: null },
                        ], // Keep mock data
                        mailgunEvents: [],
                        mailgunStats: [],
                        mailgunDomains: [],
                        mailgunData: {}
                    }
                });
            });

            // Apply initial filtering after data loads (using current timeRange from state)
            setTimeout(() => {
                const currentTimeRange = '30d'; // Use default time range for initial load
                // Filter issues and events based on time range
                const filteredIssues = memoizedIssueFilter(fetchedIssues, currentTimeRange, filterIssuesByTimeRange);
                const filteredEvents = memoizedEventFilter(flattenedEvents, currentTimeRange, filterEventsByTimeRange);
                
                // Filter events data map
                const filteredEventsData = {};
                Object.keys(eventsDataMap).forEach(issueId => {
                    const events = eventsDataMap[issueId];
                    filteredEventsData[issueId] = filterEventsByTimeRange(events, currentTimeRange);
                });

                startTransition(() => {
                    dispatch({
                        type: UPDATE_FILTERED_DATA,
                        payload: {
                            sentryIssues: filteredIssues,
                            allEventsData: filteredEventsData,
                            allEventsForChart: filteredEvents,
                        }
                    });
                });
            }, 100); // Small delay to ensure state is settled


        } catch (err) {
            startTransition(() => {
                dispatch({ type: FETCH_DATA_FAILURE, payload: err.message });
            });
            console.error("Failed to fetch Sentry data:", err);
        }
    }, [dispatch]); // Removed initialState.hubspotIntegrations to prevent recreation

    // Client-side filtering function
    const updateFilteredData = useCallback((newTimeRange = state.timeRange) => {
        const { rawSentryIssues, rawAllEventsData, rawAllEventsForChart } = state;
        
        if (!rawSentryIssues.length) return; // No data to filter yet
        
        // Filter issues and events based on time range
        const filteredIssues = memoizedIssueFilter(rawSentryIssues, newTimeRange, filterIssuesByTimeRange);
        const filteredEvents = memoizedEventFilter(rawAllEventsForChart, newTimeRange, filterEventsByTimeRange);
        
        // Filter events data map
        const filteredEventsData = {};
        Object.keys(rawAllEventsData).forEach(issueId => {
            const events = rawAllEventsData[issueId];
            filteredEventsData[issueId] = filterEventsByTimeRange(events, newTimeRange);
        });

        startTransition(() => {
            dispatch({
                type: UPDATE_FILTERED_DATA,
                payload: {
                    sentryIssues: filteredIssues,
                    allEventsData: filteredEventsData,
                    allEventsForChart: filteredEvents,
                }
            });
        });
    }, [state, memoizedEventFilter, memoizedIssueFilter]);

    // Live data filter setter
    const setLiveDataFilter = useCallback((filterValue) => {
        dispatch({ type: SET_LIVE_DATA_FILTER, payload: filterValue });
    }, [dispatch]);

    // Global time range setter
    const setGlobalTimeRange = useCallback((timeRange) => {
        dispatch({ type: SET_GLOBAL_TIME_RANGE, payload: timeRange });
    }, [dispatch]);

    // Apply initial filtering when raw data becomes available (removed to prevent infinite loop)

    return (
        <AppContext.Provider value={{ 
            state, 
            dispatch, 
            loadSentryData, 
            updateFilteredData,
            setLiveDataFilter,
            setGlobalTimeRange 
        }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppState;
