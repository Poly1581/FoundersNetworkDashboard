import React, { useEffect, useContext, Suspense, useCallback, useTransition, useRef } from 'react';
import AppContext from './context/AppContext';
import { SET_ACTIVE_PAGE, SET_TIME_RANGE, SET_ALL_EXPANDED } from './context/AppReducer';
import Sidebar from './Sidebar';
import './App.css';
import { Container, Box, CircularProgress, Alert, Snackbar, Backdrop, AppBar, Toolbar, Typography, Button } from '@mui/material';

const Overview = React.lazy(() => import('./Overview'));
const LiveData = React.lazy(() => import('./LiveData'));

export default function App() {
    const { state, dispatch, loadSentryData, updateFilteredData } = useContext(AppContext);
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
    const initialLoadDone = useRef(false);

    useEffect(() => {
        // Load data automatically on initial page load (only once)
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            loadSentryData();
        }
    }, []); // Empty dependency array to run only once on mount

    const handlePageChange = useCallback((page) => {
        startTransition(() => {
            dispatch({ type: SET_ACTIVE_PAGE, payload: page });
        });
    }, [dispatch]);

    const handleTimeRangeChange = useCallback((newTimeRange) => {
        if (newTimeRange && newTimeRange !== timeRange) {
            dispatch({ type: SET_TIME_RANGE, payload: newTimeRange });
            // Apply client-side filtering immediately for better performance
            updateFilteredData(newTimeRange);
        }
    }, [dispatch, timeRange, updateFilteredData]);

    const handleRefreshAll = useCallback(() => {
        loadSentryData();
        // Apply filtering after loading new data
        setTimeout(() => {
            updateFilteredData();
        }, 100);
    }, [loadSentryData, updateFilteredData]);

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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Main Header with Check Now Button */}
            <AppBar position="static" sx={{ backgroundColor: '#2e7d32', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Founders Network Dashboard
                    </Typography>
                    <Button 
                        color="inherit" 
                        variant="outlined"
                        onClick={handleRefreshAll}
                        disabled={loading}
                        sx={{ 
                            borderColor: 'rgba(255,255,255,0.5)',
                            '&:hover': {
                                borderColor: 'rgba(255,255,255,0.8)',
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Check Now'}
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                <Sidebar activePage={activePage} onPageChange={handlePageChange} />
                <Box component="main" sx={{ flexGrow: 1, bgcolor: 'transparent', p: 3, opacity: isPending ? 0.7 : 1 }}>
                <Container maxWidth="xl" sx={{ p: 0 }}>
                    <Suspense fallback={
                        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                            <CircularProgress size={60} />
                        </Box>
                    }>
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

            {/* Loading overlay for data operations */}
            <Backdrop 
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading && !error}
            >
                <Box textAlign="center">
                    <CircularProgress color="inherit" size={60} />
                    <Box mt={2} color="white">
                        Loading dashboard data...
                    </Box>
                </Box>
            </Backdrop>

            {/* Error notification */}
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="error" variant="filled">
                    {error || 'An error occurred while loading data'}
                </Alert>
            </Snackbar>

            {/* Performance indicator for filtering operations */}
            {isPending && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 16,
                        right: 16,
                        zIndex: 2000,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <CircularProgress size={16} color="inherit" />
                    Filtering data...
                </Box>
            )}
        </Box>
    );
}

