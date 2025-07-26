import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, ToggleButtonGroup, ToggleButton } from '@mui/material';
import UnifiedStackedBarChart from './UnifiedStackedBarChart';
import IntegrationStatusList from './IntegrationStatusList';



export default function Overview({ allIntegrations, allEventsForChart, hubspotEvents = [], issues = [] }) {
    const hasData = allEventsForChart?.length > 0 || allIntegrations?.length > 0;
    
    // Unified time range for all charts
    const [timeRange, setTimeRange] = useState('30d');
    const [chartFilter, setChartFilter] = useState(null);
    const [investigationData, setInvestigationData] = useState(null);

    return (
        <Box sx={{ p: 3, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>Overview</Typography>

            {!hasData && (
                <Card sx={{ mb: 3, textAlign: 'center', p: 4 }}>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Data Loaded
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Click the "Check Now" button in the header to load dashboard data.
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {hasData && (
                <>
                    {/* Multi-API Bar Chart */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" component="div" mb={2}>
                                API Errors Over Time
                            </Typography>
                            <UnifiedStackedBarChart 
                                events={allEventsForChart}
                                hubspotEvents={hubspotEvents}
                                timeRange={timeRange}
                                title=""
                                onFilterChange={setChartFilter}
                                selectedFilter={chartFilter}
                                showAPIComparison={true}
                                onInvestigationChange={setInvestigationData}
                            />
                        </CardContent>
                    </Card>

                    <IntegrationStatusList integrations={allIntegrations} />
                </>
            )}
        </Box>
    );
}

