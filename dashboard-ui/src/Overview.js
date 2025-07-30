import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Tooltip, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import UnifiedStackedBarChart from './UnifiedStackedBarChart';
import IntegrationStatusList from './IntegrationStatusList';

// --- MOCK DATA FOR MAILGUN FRONTEND CHART ---
const mockMailgunEvents = [
    { id: 'm1', timestamp: new Date('2025-07-28T10:05:00Z'), level: 'error', issueCategory: 'Delivery Issue' },
    { id: 'm2', timestamp: new Date('2025-07-28T15:00:00Z'), level: 'warning', issueCategory: 'API Rate Limit' },
    { id: 'm3', timestamp: new Date('2025-07-29T09:20:00Z'), level: 'error', issueCategory: 'Reputation Issue' },
    { id: 'm4', timestamp: new Date('2025-07-29T10:30:00Z'), level: 'error', issueCategory: 'Connection Error' },
    { id: 'm5', timestamp: new Date('2025-07-29T11:10:00Z'), level: 'warning', issueCategory: 'Delivery Issue' },
];
// --- END OF MOCK DATA ---


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
                                mailgunEvents={mockMailgunEvents}
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