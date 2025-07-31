import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Tooltip, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import UnifiedStackedBarChart from './UnifiedStackedBarChart';
import IntegrationStatusList from './IntegrationStatusList';

// Mock data removed - now using real Mailgun API data from props


// Corrected to use props from App.js instead of local state
export default function Overview({ allIntegrations, allEventsForChart, mailgunEvents = [], issues = [], timeRange, onTimeRangeChange }) {
    const hasData = allEventsForChart?.length > 0 || allIntegrations?.length > 0;
    const [investigationData, setInvestigationData] = useState(null);


    return (
        <Box sx={{ p: 3, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>Overview</Typography>

            {!hasData && (
                <Card sx={{ mb: 3, textAlign: 'center', p: 4 }}>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary" gutterBottom>No Data Loaded</Typography>
                        <Typography variant="body2" color="text.secondary">Click the "Check Now" button in the header to load dashboard data.</Typography>
                    </CardContent>
                </Card>
            )}

            {hasData && (
                <>
                    <IntegrationStatusList integrations={allIntegrations} />
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" component="div" mb={2}>API Errors Over Time</Typography>
                                <Tooltip 
                                    title={
                                        <Box>
                                            <Typography variant="body2">
                                                This chart shows API error counts over time. Each color represents a different error type. 
                                                <br />
                                                <br />
                                                You can click an error type to toggle its visibility, double-click to investigate it, or Alt+Click to clear all filters.
                                            </Typography>
                                        </Box>
                                    }
                                >
                                    <IconButton size="small">
                                        <HelpOutlineIcon fontSize='small' />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <UnifiedStackedBarChart
                                events={allEventsForChart}
                                mailgunEvents={mailgunEvents}
                                timeRange={timeRange} // Pass prop down
                                title=""
                                showAPIComparison={true}
                                onInvestigationChange={setInvestigationData}
                            />
                        </CardContent>
                    </Card>
                </>
            )}
        </Box>
    );
}