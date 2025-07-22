import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, ToggleButtonGroup, ToggleButton } from '@mui/material';
import SentryLineChart from './SentryLineChart';
import SentryPieChart from './SentryPieChart';
import SentryBarChart from './SentryBarChart';
import HubSpotLineChart from './HubSpotLineChart';
import HubSpotPieChart from './HubSpotPieChart';
import HubSpotBarChart from './HubSpotBarChart';
import IntegrationStatusList from './IntegrationStatusList';
import SystemHealthCard from './SystemHealthCard';
import IntegrationCard from './IntegrationCard';
import CollapsibleSection from './CollapsibleSection';

const overviewCards = [
    {
        title: 'System Health',
        ContentComponent: SystemHealthCard
    },
];


export default function Overview({ allIntegrations, allEventsForChart }) {
    const hasData = allEventsForChart?.length > 0 || allIntegrations?.length > 0;
    
    // Independent time ranges for each section
    const [sentryTimeRange, setSentryTimeRange] = useState('30d');
    const [hubspotTimeRange, setHubspotTimeRange] = useState('30d');

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
                    <CollapsibleSection title="Sentry">
                        {/* Issue Trends Chart at the top */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" component="div">
                                        Issue Trends
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={sentryTimeRange}
                                        exclusive
                                        onChange={(e, val) => setSentryTimeRange(val)}
                                        aria-label="Time range"
                                        size="small"
                                    >
                                        <ToggleButton value="1d" aria-label="1 day">24 hr</ToggleButton>
                                        <ToggleButton value="7d" aria-label="7 days">1 wk</ToggleButton>
                                        <ToggleButton value="30d" aria-label="30 days">1 mo</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                                <SentryLineChart allEvents={allEventsForChart} timeRange={sentryTimeRange} />
                            </CardContent>
                        </Card>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                            gap: 3,
                            mb: 2,
                        }}>
                            <Card>
                                <CardContent>
                                    <SentryPieChart allEvents={allEventsForChart} timeRange={sentryTimeRange} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <SentryBarChart allEvents={allEventsForChart} timeRange={sentryTimeRange} title="Endpoint Error Rates" />
                                </CardContent>
                            </Card>
                        </Box>
                    </CollapsibleSection>

                    <CollapsibleSection title="HubSpot">
                        {/* CRM Issue Trends Chart at the top */}
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" component="div">
                                        CRM Issue Trends
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={hubspotTimeRange}
                                        exclusive
                                        onChange={(e, val) => setHubspotTimeRange(val)}
                                        aria-label="Time range"
                                        size="small"
                                    >
                                        <ToggleButton value="1d" aria-label="1 day">24 hr</ToggleButton>
                                        <ToggleButton value="7d" aria-label="7 days">1 wk</ToggleButton>
                                        <ToggleButton value="30d" aria-label="30 days">1 mo</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                                <HubSpotLineChart timeRange={hubspotTimeRange} />
                            </CardContent>
                        </Card>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                            gap: 3,
                            mb: 2,
                        }}>
                            <Card>
                                <CardContent>
                                    <HubSpotPieChart timeRange={hubspotTimeRange} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent>
                                    <HubSpotBarChart timeRange={hubspotTimeRange} title="CRM Error Breakdown" />
                                </CardContent>
                            </Card>
                        </Box>
                    </CollapsibleSection>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                        gap: 3,
                    }}>
                        <IntegrationStatusList integrations={allIntegrations} />

                        {overviewCards.map(({ title, ContentComponent }, index) => (
                            <Card key={index}>
                                <CardContent>
                                    <Typography variant="h6" component="div" gutterBottom sx={{ textAlign: 'center' }}>
                                        {title}
                                    </Typography>
                                    <ContentComponent />
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
}

