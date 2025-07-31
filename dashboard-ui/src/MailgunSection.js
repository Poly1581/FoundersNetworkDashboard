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
import { getConsistentColorForCategory } from './utils/colorScheme';

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

function ActiveEventsSection({ events, textContent }) {
    const [expandedRows, setExpandedRows] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleViewDetails = (eventId) => {
        const event = events.find(e => e.id === eventId) || events.find((e, index) => index.toString() === eventId);
        if (selectedEvent?.id === eventId || selectedEvent === eventId) {
            setSelectedEvent(null);
        } else {
            setSelectedEvent(event || eventId);
        }
        
        const newExpandedRows = expandedRows.includes(eventId)
            ? expandedRows.filter(id => id !== eventId)
            : [...expandedRows, eventId];
        setExpandedRows(newExpandedRows);
    };

    const getRowColorForEvent = (event, eventType) => {
        // Highlight failed or error events
        if (event.level === 'error' || event.event === 'failed' || event.severity === 'failed') {
            return '#ffebee'; // light red
        } else if (event.level === 'warning' || event.event === 'bounced' || event.severity === 'warning') {
            return '#fff3e0'; // light orange
        }
        return 'inherit';
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
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell>Recipient</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {events.slice(0, 10).map((event, index) => {
                        const eventId = event.id || index.toString();
                        return (
                            <React.Fragment key={eventId}>
                                <TableRow 
                                    hover
                                    sx={{ 
                                        cursor: 'pointer',
                                        backgroundColor: selectedEvent?.id === eventId || selectedEvent === eventId ? 'action.selected' : getRowColorForEvent(event, event.event),
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                    onClick={() => handleViewDetails(eventId)}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: selectedEvent?.id === eventId || selectedEvent === eventId ? 'bold' : 'normal',
                                                    color: selectedEvent?.id === eventId || selectedEvent === eventId ? 'primary.main' : 'inherit'
                                                }}
                                            >
                                                {event.event || 'Unknown Event'}
                                            </Typography>
                                            {event.issueCategory && (
                                                <Chip
                                                    label={event.issueCategory}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: getConsistentColorForCategory(event.issueCategory),
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                        height: '20px',
                                                        '& .MuiChip-label': {
                                                            px: 1
                                                        }
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {event.recipient || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={event.level || event.severity || 'info'} 
                                            size="small" 
                                            color={
                                                event.level === 'error' || event.severity === 'failed' ? 'error' : 
                                                event.level === 'warning' || event.severity === 'warning' ? 'warning' : 'success'
                                            } 
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button 
                                            size="small" 
                                            startIcon={<InfoIcon />} 
                                            variant="outlined"
                                        >
                                            Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                        <Collapse in={expandedRows.includes(eventId)} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 1 }}>
                                                <Typography variant="h6" gutterBottom component="div">
                                                    Event Details
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Event ID: {event.id || 'N/A'}
                                                    {event.message && ` | Message: ${event.message}`}
                                                    {' | Timestamp: '}{new Date(event.timestamp).toLocaleString()}
                                                    {event.deliveryStatus && ` | Delivery Status: ${event.deliveryStatus}`}
                                                </Typography>
                                                {event.userVariables && Object.keys(event.userVariables).length > 0 && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        User Variables: {JSON.stringify(event.userVariables)}
                                                    </Typography>
                                                )}
                                                {event.tags && event.tags.length > 0 && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        Tags: {event.tags.join(', ')}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
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
        <CollapsibleSection title={textContent.mailgun.title}>
            <ActiveEventsSection 
                events={globalTimeFilteredEvents} 
                textContent={textContent.mailgun.recentEvents} 
            />
            
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
        </CollapsibleSection>
    );
}