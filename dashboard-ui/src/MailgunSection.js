import React, {useContext, useState, useMemo} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import {Info as InfoIcon} from '@mui/icons-material';
import CollapsibleSection from './CollapsibleSection';
import IntegrationDetailsSection from './IntegrationDetailsSection';
import AppContext from './context/AppContext';
import { filterByGlobalTimeRange } from './utils/dataFilters';

const textContent = {
    mailgun: {
        title: 'Mailgun',
        integrationDetails: {
            heading: 'Email Service Integration',
            columns: {
                service: 'Service',
                category: 'Category',
                status: 'Status',
                responseTime: 'Response Time',
                lastSuccess: 'Last Success',
                uptime: 'Uptime',
                issue: 'Error Rate'
            },
            viewDetails: 'View Details'
        },
        emailStats: {
            heading: 'Email Statistics',
            sent: 'Sent',
            delivered: 'Delivered',
            opened: 'Opened',
            clicked: 'Clicked',
            bounced: 'Bounced',
            failed: 'Failed'
        },
        domains: {
            heading: 'Verified Domains',
            domain: 'Domain',
            status: 'Status',
            type: 'Type'
        },
        recentEvents: {
            heading: 'Recent Email Events',
            timestamp: 'Timestamp',
            event: 'Event',
            recipient: 'Recipient',
            details: 'Details'
        }
    }
};

// Chart color scheme for consistent categorization
const getConsistentColorForCategory = (category) => {
    const colorMap = {
        'API Rate Limit': '#DC2626',
        'Connection Error': '#EA580C', 
        'Reputation Issue': '#CA8A04',
        'Delivery Issue': '#16A34A',
        'Pipeline Sync Error': '#0284C7',
        'Contact Sync Error': '#7C3AED',
        'Unknown Error': '#757575'
    };
    return colorMap[category] || '#757575';
};

function EmailStatsSection({ stats, textContent }) {
    if (!stats || stats.length === 0) {
        return (
            <CollapsibleSection title={textContent.heading}>
                <Typography>No email statistics available.</Typography>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection title={textContent.heading}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 2 }}>
                {stats.map((stat, index) => (
                    <Card key={index} sx={{ textAlign: 'center' }}>
                        <CardContent>
                            <Typography variant="h6" color="primary">
                                {stat.count || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stat.type}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </CollapsibleSection>
    );
}

function DomainsSection({ domains, textContent }) {
    if (!domains || domains.length === 0) {
        return (
            <CollapsibleSection title={textContent.heading}>
                <Typography>No domains configured.</Typography>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection title={textContent.heading}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{textContent.domain}</TableCell>
                        <TableCell>{textContent.status}</TableCell>
                        <TableCell>{textContent.type}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {domains.map((domain, index) => (
                        <TableRow key={index}>
                            <TableCell>{domain.name}</TableCell>
                            <TableCell>
                                <Chip
                                    label={domain.status}
                                    color={domain.status === 'active' ? 'success' : 'error'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>{domain.type || 'Sending'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CollapsibleSection>
    );
}

function RecentEventsSection({ events, textContent }) {
    const [expandedEvents, setExpandedEvents] = useState([]);

    const handleViewEventDetails = (index) => {
        const newExpandedEvents = expandedEvents.includes(index)
            ? expandedEvents.filter(i => i !== index)
            : [...expandedEvents, index];
        setExpandedEvents(newExpandedEvents);
    };

    if (!events || events.length === 0) {
        return (
            <CollapsibleSection title={textContent.heading}>
                <Typography>No recent email events.</Typography>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection title={textContent.heading}>
            <List>
                {events.slice(0, 10).map((event, index) => (
                    <React.Fragment key={index}>
                        <ListItem
                            secondaryAction={
                                <Button size="small" startIcon={<InfoIcon />} onClick={() => handleViewEventDetails(index)}>
                                    {textContent.details}
                                </Button>
                            }
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body1">
                                            {`${event.event} - ${event.recipient || 'N/A'}`}
                                        </Typography>
                                        {event.issueCategory && (
                                            <Chip 
                                                label={event.issueCategory}
                                                size="small"
                                                sx={{ 
                                                    backgroundColor: getConsistentColorForCategory(event.issueCategory),
                                                    color: 'white',
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                                secondary={`${new Date(event.timestamp).toLocaleString()} - ${event.message || ''}`}
                            />
                        </ListItem>
                        <Collapse in={expandedEvents.includes(index)} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1, ml: 4, p: 2, backgroundColor: '#f5f5f5' }}>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    ○ Event ID: {event.id || 'N/A'}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    ○ Delivery Status: {event.deliveryStatus || 'N/A'}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    ○ User Variables: {JSON.stringify(event.userVariables || {})}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                    ○ Tags: {event.tags ? event.tags.join(', ') : 'None'}
                                </Typography>
                            </Box>
                        </Collapse>
                    </React.Fragment>
                ))}
            </List>
        </CollapsibleSection>
    );
}

export default function MailgunSection({ allExpanded, liveDataFilter, timeRange, onTimeRangeChange }) {
    const { state } = useContext(AppContext);
    const { mailgunIntegrations, mailgunStats, mailgunDomains, mailgunEvents, loading } = state;
    const [expandedIntegrations, setExpandedIntegrations] = useState([]);
    
    // Apply global time range filtering to all Mailgun data
    const globalTimeFilteredIntegrations = useMemo(() => {
        return filterByGlobalTimeRange(mailgunIntegrations, timeRange);
    }, [mailgunIntegrations, timeRange]);
    
    const globalTimeFilteredStats = useMemo(() => {
        return filterByGlobalTimeRange(mailgunStats, timeRange);
    }, [mailgunStats, timeRange]);
    
    const globalTimeFilteredDomains = useMemo(() => {
        return filterByGlobalTimeRange(mailgunDomains, timeRange);
    }, [mailgunDomains, timeRange]);
    
    const globalTimeFilteredEvents = useMemo(() => {
        return filterByGlobalTimeRange(mailgunEvents, timeRange);
    }, [mailgunEvents, timeRange]);

    const handleViewIntegrationDetails = (index) => {
        const newExpandedIntegrations = expandedIntegrations.includes(index)
            ? expandedIntegrations.filter(i => i !== index)
            : [...expandedIntegrations, index];
        setExpandedIntegrations(newExpandedIntegrations);
    };

    if (loading) {
        return (
            <CollapsibleSection title={textContent.mailgun.title}>
                <Typography>Loading Mailgun data...</Typography>
            </CollapsibleSection>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                {textContent.mailgun.title}
            </Typography>
            
            <IntegrationDetailsSection 
                integrations={globalTimeFilteredIntegrations} 
                textContent={textContent.mailgun.integrationDetails} 
                onAndViewDetails={handleViewIntegrationDetails} 
                expandedIntegrations={expandedIntegrations} 
            />
            
            <EmailStatsSection 
                stats={globalTimeFilteredStats} 
                textContent={textContent.mailgun.emailStats} 
            />
            
            <DomainsSection 
                domains={globalTimeFilteredDomains} 
                textContent={textContent.mailgun.domains} 
            />
            
            <RecentEventsSection 
                events={globalTimeFilteredEvents} 
                textContent={textContent.mailgun.recentEvents} 
            />
        </Box>
    );
}