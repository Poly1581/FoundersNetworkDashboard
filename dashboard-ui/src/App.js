import React, { useEffect, useContext, Suspense, useCallback, useTransition } from 'react';
import AppContext from './context/AppContext';
import { SET_ACTIVE_PAGE, SET_TIME_RANGE, SET_ALL_EXPANDED } from './context/AppReducer';
import Sidebar from './Sidebar';
import './App.css';
import { Container, Box, CircularProgress } from '@mui/material';

const Overview = React.lazy(() => import('./Overview'));
const LiveData = React.lazy(() => import('./LiveData'));

export default function App() {
    const { state, dispatch, loadSentryData } = useContext(AppContext);
    const {
        activePage,
        allExpanded,
        timeRange,
        allIntegrations,
        allEventsForChart,
        sentryIssues,
        allEventsData,
        sentryIntegrations,
        hubspotIntegrations,
        loading,
        error,
    } = state;
    const [isPending, startTransition] = useTransition();


    useEffect(() => {
        loadSentryData();
    }, [loadSentryData]);

    const handlePageChange = useCallback((page) => {
        startTransition(() => {
            dispatch({ type: SET_ACTIVE_PAGE, payload: page });
        });
    }, [dispatch]);

    const handleTimeRangeChange = useCallback((newTimeRange) => {
        if (newTimeRange) {
            dispatch({ type: SET_TIME_RANGE, payload: newTimeRange });
        }
    }, [dispatch]);

    const handleRefreshAll = useCallback(() => {
        loadSentryData();
    }, [loadSentryData]);

    const handleExpandAll = useCallback(() => {
        dispatch({ type: SET_ALL_EXPANDED });
    }, [dispatch]);

    const sentryProps = {
        issues: sentryIssues,
        allEventsData,
        integrations: sentryIntegrations,
        loading,
        error,
    };

    const hubspotProps = {
        integrations: hubspotIntegrations,
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar activePage={activePage} onPageChange={handlePageChange} />
            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'transparent', p: 3, opacity: isPending ? 0.7 : 1 }}>
                <Container maxWidth="xl" sx={{ p: 0 }}>
                    <Suspense fallback={<CircularProgress />}>
                        {activePage === 'overview' && (
                            <Overview
                                allIntegrations={allIntegrations}
                                allEventsForChart={allEventsForChart}
                                timeRange={timeRange}
                                onTimeRangeChange={handleTimeRangeChange}
                            />
                        )}
                        {activePage === 'liveData' && (
                            <LiveData
                                allExpanded={allExpanded}
                                onRefresh={handleRefreshAll}
                                onExpandAll={handleExpandAll}
                                sentryProps={sentryProps}
                                hubspotProps={hubspotProps}
                            />
                        )}
                    </Suspense>
                </Container>
            </Box>
        </Box>
    );
}

