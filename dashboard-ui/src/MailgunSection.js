import React, {useContext, useState, useMemo, useEffect} from 'react';
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
    const [expandedStats, setExpandedStats] = useState([]);
    const [selectedStat, setSelectedStat] = useState(null);

    const handleViewDetails = (index) => {
        const stat = stats[index];
        if (selectedStat?.type === stat.type) {
            setSelectedStat(null);
        } else {
            setSelectedStat(stat);
        }
        
        const newExpandedStats = expandedStats.includes(index)
            ? expandedStats.filter(i => i !== index)
            : [...expandedStats, index];
        setExpandedStats(newExpandedStats);
    };

    const getStatColor = (statType) => {
        switch (statType?.toLowerCase()) {
            case 'sent':
            case 'delivered':
            case 'opened':
            case 'clicked':
                return '#2e7d32'; // green
            case 'bounced':
            case 'failed':
                return '#d32f2f'; // red
            case 'complained':
                return '#ed6c02'; // orange
            default:
                return '#1976d2'; // blue
        }
    };

    if (!stats || stats.length === 0) {
        return (
            <CollapsibleSection title={textContent.heading}>
                <Typography>No email statistics available.</Typography>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection title={textContent.heading}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
                {stats.map((stat, index) => (
                    <React.Fragment key={index}>
                        <Card 
                            sx={{ 
                                textAlign: 'center', 
                                cursor: 'pointer',
                                backgroundColor: selectedStat?.type === stat.type ? 'action.selected' : 'inherit',
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                            onClick={() => handleViewDetails(index)}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ color: getStatColor(stat.type), fontWeight: 600 }}>
                                    {stat.count || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {stat.type}
                                </Typography>
                            </CardContent>
                        </Card>
                        
                        {/* Expanded details */}
                        {expandedStats.includes(index) && (
                            <Box sx={{ 
                                gridColumn: '1 / -1',
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                backgroundColor: '#f8f9fa',
                                p: 3,
                                mb: 2
                            }}>
                                <Box sx={{ 
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    p: 3
                                }}>
                                    <Typography variant="h6" gutterBottom sx={{ 
                                        color: 'primary.main', 
                                        fontWeight: 600,
                                        borderBottom: '2px solid #e0e0e0',
                                        pb: 1,
                                        mb: 2
                                    }}>
                                        {stat.type} Statistics Details
                                    </Typography>
                                    
                                    {/* Statistics information grid */}
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Event Type:</strong> <span style={{ color: '#666' }}>{stat.type}</span>
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Total Count:</strong> <span style={{ color: getStatColor(stat.type) }}>{stat.count || 0}</span>
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Rate:</strong> <span style={{ color: '#666' }}>
                                                    {stats.find(s => s.type === 'sent')?.count ? 
                                                        `${((stat.count / stats.find(s => s.type === 'sent').count) * 100).toFixed(2)}%` : 
                                                        'N/A'
                                                    }
                                                </span>
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Period:</strong> <span style={{ color: '#666' }}>Last 30 days</span>
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Status:</strong> <span style={{ 
                                                    color: stat.type === 'failed' || stat.type === 'bounced' ? '#d32f2f' : '#2e7d32'
                                                }}>
                                                    {stat.type === 'failed' || stat.type === 'bounced' ? 'Needs Attention' : 'Normal'}
                                                </span>
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Trend:</strong> <span style={{ color: '#666' }}>
                                                    {stat.count > 100 ? '↗ Increasing' : stat.count > 50 ? '→ Stable' : '↘ Decreasing'}
                                                </span>
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Description section */}
                                    <Box sx={{ 
                                        backgroundColor: '#f5f5f5', 
                                        p: 2, 
                                        borderRadius: 1, 
                                        mb: 2,
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                            Description:
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            {stat.type === 'sent' && 'Total number of emails sent through Mailgun.'}
                                            {stat.type === 'delivered' && 'Emails successfully delivered to recipient\'s inbox.'}
                                            {stat.type === 'opened' && 'Recipients who opened the email (tracking pixel loaded).'}
                                            {stat.type === 'clicked' && 'Recipients who clicked on links within the email.'}
                                            {stat.type === 'bounced' && 'Emails that bounced due to invalid addresses or full mailboxes.'}
                                            {stat.type === 'failed' && 'Emails that failed to send due to various errors.'}
                                            {stat.type === 'complained' && 'Recipients who marked the email as spam.'}
                                            {!['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'complained'].includes(stat.type) && 
                                                'Email event statistics for the selected time period.'}
                                        </Typography>
                                    </Box>

                                    {/* Actions section */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        gap: 2, 
                                        mt: 3,
                                        pt: 2,
                                        borderTop: '1px solid #e0e0e0'
                                    }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexWrap: 'wrap',
                                            gap: 1
                                        }}>
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open('#', '_blank');
                                                }}
                                            >
                                                VIEW DETAILED REPORT
                                            </Button>
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Exporting data for:', stat.type);
                                                }}
                                                color="primary"
                                            >
                                                Export Data
                                            </Button>
                                            {(stat.type === 'bounced' || stat.type === 'failed') && (
                                                <Button 
                                                    variant="outlined" 
                                                    size="small" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Viewing suppression list');
                                                    }}
                                                    color="warning"
                                                >
                                                    View Suppression List
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        )}
                    </React.Fragment>
                ))}
            </Box>
        </CollapsibleSection>
    );
}

function DomainsSection({ domains, textContent }) {
    const [expandedDomains, setExpandedDomains] = useState([]);
    const [selectedDomain, setSelectedDomain] = useState(null);

    const handleViewDetails = (index) => {
        const domain = domains[index];
        if (selectedDomain?.name === domain.name) {
            setSelectedDomain(null);
        } else {
            setSelectedDomain(domain);
        }
        
        const newExpandedDomains = expandedDomains.includes(index)
            ? expandedDomains.filter(i => i !== index)
            : [...expandedDomains, index];
        setExpandedDomains(newExpandedDomains);
    };

    const getDomainStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'verified':
                return '#2e7d32';
            case 'inactive':
            case 'unverified':
                return '#d32f2f';
            case 'pending':
                return '#ed6c02';
            default:
                return '#666';
        }
    };

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
                        <TableCell>Domain</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {domains.map((domain, index) => (
                        <React.Fragment key={index}>
                            <TableRow 
                                hover
                                sx={{ 
                                    cursor: 'pointer',
                                    backgroundColor: selectedDomain?.name === domain.name ? 'action.selected' : 
                                        domain.status === 'active' ? '#e8f5e8' : domain.status === 'inactive' ? '#ffebee' : 'inherit',
                                    '&:hover': {
                                        backgroundColor: 'action.hover'
                                    }
                                }}
                                onClick={() => handleViewDetails(index)}
                            >
                                <TableCell>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            fontWeight: selectedDomain?.name === domain.name ? 'bold' : 'normal',
                                            color: selectedDomain?.name === domain.name ? 'primary.main' : 'inherit'
                                        }}
                                    >
                                        {domain.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={domain.status}
                                        color={domain.status === 'active' ? 'success' : 'error'}
                                        size="small"
                                        sx={{ cursor: 'pointer' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={domain.type || 'Sending'}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                </TableCell>
                            </TableRow>
                            {expandedDomains.includes(index) && (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ backgroundColor: '#f8f9fa', py: 3, px: 3 }}>
                                        <Box sx={{ 
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                            p: 3
                                        }}>
                                            <Typography variant="h6" gutterBottom sx={{ 
                                                color: 'primary.main', 
                                                fontWeight: 600,
                                                borderBottom: '2px solid #e0e0e0',
                                                pb: 1,
                                                mb: 2
                                            }}>
                                                Domain Configuration Details
                                            </Typography>
                                            
                                            {/* Domain information grid */}
                                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                                                <Box>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Domain Name:</strong> <span style={{ color: '#666' }}>{domain.name}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Status:</strong> <span style={{ color: getDomainStatusColor(domain.status) }}>{domain.status}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Type:</strong> <span style={{ color: '#666' }}>{domain.type || 'Sending'}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Created:</strong> <span style={{ color: '#666' }}>{domain.created_at ? new Date(domain.created_at).toLocaleDateString() : 'N/A'}</span>
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>SMTP Login:</strong> <span style={{ color: '#666' }}>{domain.smtp_login || 'N/A'}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Spam Action:</strong> <span style={{ color: '#666' }}>{domain.spam_action || 'disabled'}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Wildcard:</strong> <span style={{ color: '#666' }}>{domain.wildcard ? 'Yes' : 'No'}</span>
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        <strong>Force DKIM Authority:</strong> <span style={{ color: '#666' }}>{domain.force_dkim_authority ? 'Yes' : 'No'}</span>
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* DNS Records section */}
                                            <Box sx={{ 
                                                backgroundColor: '#f5f5f5', 
                                                p: 2, 
                                                borderRadius: 1, 
                                                mb: 2,
                                                border: '1px solid #e0e0e0'
                                            }}>
                                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                                    Required DNS Records:
                                                </Typography>
                                                <Typography variant="body2" sx={{ 
                                                    fontFamily: 'monospace', 
                                                    color: '#666',
                                                    wordBreak: 'break-word',
                                                    mb: 1
                                                }}>
                                                    <strong>TXT Record:</strong> v=spf1 include:mailgun.org ~all
                                                </Typography>
                                                <Typography variant="body2" sx={{ 
                                                    fontFamily: 'monospace', 
                                                    color: '#666',
                                                    wordBreak: 'break-word',
                                                    mb: 1
                                                }}>
                                                    <strong>DKIM:</strong> k=rsa; p=MIGfMA0GCSqGSIb3...
                                                </Typography>
                                                <Typography variant="body2" sx={{ 
                                                    fontFamily: 'monospace', 
                                                    color: '#666',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    <strong>CNAME:</strong> email.{domain.name} → mailgun.org
                                                </Typography>
                                            </Box>

                                            {/* Verification status */}
                                            <Box sx={{ 
                                                backgroundColor: domain.status === 'active' ? '#e8f5e8' : '#ffebee', 
                                                p: 2, 
                                                borderRadius: 1, 
                                                mb: 2,
                                                border: `1px solid ${domain.status === 'active' ? '#c8e6c8' : '#ffcdd2'}`
                                            }}>
                                                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1, color: getDomainStatusColor(domain.status) }}>
                                                    Verification Status:
                                                </Typography>
                                                <Typography variant="body2" sx={{ 
                                                    color: getDomainStatusColor(domain.status),
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {domain.status === 'active' && 'Domain is verified and ready to send emails.'}
                                                    {domain.status === 'inactive' && 'Domain verification failed. Please check DNS records.'}
                                                    {domain.status === 'pending' && 'Domain verification is in progress.'}
                                                    {!['active', 'inactive', 'pending'].includes(domain.status) && 'Domain status unknown.'}
                                                </Typography>
                                            </Box>

                                            {/* Actions section */}
                                            <Box sx={{ 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                gap: 2, 
                                                mt: 3,
                                                pt: 2,
                                                borderTop: '1px solid #e0e0e0'
                                            }}>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    flexWrap: 'wrap',
                                                    gap: 1
                                                }}>
                                                    <Button 
                                                        variant="contained" 
                                                        size="small" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open('#', '_blank');
                                                        }}
                                                    >
                                                        MANAGE DOMAIN
                                                    </Button>
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('Verifying domain:', domain.name);
                                                        }}
                                                        color="primary"
                                                        disabled={domain.status === 'active'}
                                                    >
                                                        Verify Domain
                                                    </Button>
                                                    <Button 
                                                        variant="outlined" 
                                                        size="small" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('Testing domain:', domain.name);
                                                        }}
                                                        color="info"
                                                    >
                                                        Test Email
                                                    </Button>
                                                    {domain.status !== 'active' && (
                                                        <Button 
                                                            variant="outlined" 
                                                            size="small" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                console.log('Viewing DNS help for:', domain.name);
                                                            }}
                                                            color="warning"
                                                        >
                                                            DNS Setup Help
                                                        </Button>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </CollapsibleSection>
    );
}

function ActiveEventsSection({ events, textContent }) {
    const [expandedRows, setExpandedRows] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [highlightedEventType, setHighlightedEventType] = useState(null);
    const [investigationContext, setInvestigationContext] = useState(null);

    // Check for highlight instructions from investigation panel (Mailgun version)
    useEffect(() => {
        const highlightType = sessionStorage.getItem('highlightMailgunEventType');
        const fromInvestigation = sessionStorage.getItem('highlightMailgunFromInvestigation');
        const contextData = sessionStorage.getItem('investigationContext');
        const expandedEvents = sessionStorage.getItem('expandedRows');

        if (highlightType && fromInvestigation === 'true') {
            setHighlightedEventType(highlightType);
            setExpandedRows(expandedEvents ? JSON.parse(expandedEvents) : []);
            
            // Parse and store investigation context for detailed display
            if (contextData) {
                try {
                    const context = JSON.parse(contextData);
                    setInvestigationContext(context);
                } catch (error) {
                    console.error('Failed to parse investigation context:', error);
                }
            }
            
            // Clear the session storage
            sessionStorage.removeItem('highlightMailgunEventType');
            sessionStorage.removeItem('highlightMailgunFromInvestigation');
            sessionStorage.removeItem('investigationContext');

            // Auto-expand events of this type
            const matchingEvents = events?.filter(event => {
                const eventType = event.event || event.type || event.category || 'Unknown Event';
                return eventType === highlightType;
            }) || [];
            
            if (matchingEvents.length > 0) {
                const eventIds = matchingEvents.map((event, index) => event.id || index.toString());
                setExpandedRows(eventIds);
                // Select the first matching event for detailed display
                setSelectedEvent(matchingEvents[0]);
                
                // Ensure proper focus and highlighting behavior
                setTimeout(() => {
                    if (matchingEvents[0]) {
                        // Ensure the event is properly selected and highlighted
                        setSelectedEvent(matchingEvents[0]);
                        
                        // Section-level scrolling is handled by LiveData component
                        // Just focus on the specific event after a delay
                        setTimeout(() => {
                            const eventElement = document.querySelector(`[data-event-id="${eventIds[0]}"]`);
                            if (eventElement) {
                                eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 1500); // Wait for LiveData scroll to complete first
                    }
                }, 200); // Small delay to ensure DOM is updated
            }
            
            // Clear highlight after 10 seconds
            setTimeout(() => {
                setHighlightedEventType(null);
                setInvestigationContext(null);
            }, 10000);
        }
    }, [events]);

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
        // Check if this event should be highlighted from investigation
        const eventTypeKey = event.event || event.type || event.category || 'Unknown Event';
        const isHighlighted = highlightedEventType && eventTypeKey === highlightedEventType;
        
        if (isHighlighted) {
            return '#fff3cd'; // warm yellow highlight
        }
        
        // Highlight failed or error events
        if (event.level === 'error' || event.event === 'failed' || event.severity === 'failed') {
            return '#ffebee'; // light red
        } else if (event.level === 'warning' || event.event === 'bounced' || event.severity === 'warning') {
            return '#fff3e0'; // light orange
        }
        return 'inherit';
    };

    const getSeverityColor = (event) => {
        if (event.level === 'error' || event.event === 'failed' || event.severity === 'failed') {
            return '#d32f2f';
        } else if (event.level === 'warning' || event.event === 'bounced' || event.severity === 'warning') {
            return '#ed6c02';
        }
        return '#2e7d32';
    };

    if (!events || events.length === 0) {
        return (
            <CollapsibleSection title={textContent.heading}>
                <Typography>No recent email events.</Typography>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection title={textContent.heading} id="mailgun-recent-events">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Event</TableCell>
                        <TableCell align="center">Category</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Recipient</TableCell>
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
                                    data-event-id={eventId}
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
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontWeight: selectedEvent?.id === eventId || selectedEvent === eventId ? 'bold' : 'normal',
                                                color: selectedEvent?.id === eventId || selectedEvent === eventId ? 'primary.main' : 'inherit'
                                            }}
                                        >
                                            {event.event || 'Unknown Event'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {(() => {
                                            // Determine the category to display
                                            const eventTypeKey = event.event || event.type || event.category || 'Unknown Event';
                                            const displayCategory = event.issueCategory || eventTypeKey;
                                            const typeColor = getConsistentColorForCategory(displayCategory);
                                            const isHighlighted = highlightedEventType && eventTypeKey === highlightedEventType;
                                            
                                            return (
                                                <Chip
                                                    label={displayCategory}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: typeColor,
                                                        color: 'white',
                                                        fontSize: '0.75rem',
                                                        height: '20px',
                                                        border: isHighlighted ? '2px solid #ffc107' : 'none',
                                                        '& .MuiChip-label': {
                                                            px: 1
                                                        }
                                                    }}
                                                />
                                            );
                                        })()}
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
                                    <TableCell>
                                        <Typography variant="body2">
                                            {event.recipient || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                    </TableCell>
                                </TableRow>
                                {expandedRows.includes(eventId) && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ backgroundColor: '#f8f9fa', py: 3, px: 3 }}>
                                            <Box sx={{ 
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 2,
                                                backgroundColor: 'white',
                                                p: 3
                                            }}>
                                                <Typography variant="h6" gutterBottom sx={{ 
                                                    color: 'primary.main', 
                                                    fontWeight: 600,
                                                    borderBottom: '2px solid #e0e0e0',
                                                    pb: 1,
                                                    mb: 2
                                                }}>
                                                    Email Event Details
                                                </Typography>
                                                
                                                {/* Main event information grid */}
                                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Event ID:</strong> <span style={{ color: '#666' }}>{event.id || 'N/A'}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Event Type:</strong> <span style={{ color: '#666' }}>{event.event || 'Unknown'}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Recipient:</strong> <span style={{ color: '#666' }}>{event.recipient || 'N/A'}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Severity:</strong> <span style={{ color: getSeverityColor(event) }}>{event.level || event.severity || 'info'}</span>
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Timestamp:</strong> <span style={{ color: '#666' }}>{event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Delivery Status:</strong> <span style={{ color: '#666' }}>{event.deliveryStatus || 'N/A'}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Subject:</strong> <span style={{ color: '#666' }}>{event.subject || 'N/A'}</span>
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            <strong>Domain:</strong> <span style={{ color: '#666' }}>{event.domain || 'N/A'}</span>
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Message details section */}
                                                {event.message && (
                                                    <Box sx={{ 
                                                        backgroundColor: '#f5f5f5', 
                                                        p: 2, 
                                                        borderRadius: 1, 
                                                        mb: 2,
                                                        border: '1px solid #e0e0e0'
                                                    }}>
                                                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                                            Message Details:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            fontFamily: 'monospace', 
                                                            color: getSeverityColor(event),
                                                            wordBreak: 'break-word'
                                                        }}>
                                                            {event.message}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* User variables section */}
                                                {event.userVariables && Object.keys(event.userVariables).length > 0 && (
                                                    <Box sx={{ 
                                                        backgroundColor: '#f5f5f5', 
                                                        p: 2, 
                                                        borderRadius: 1, 
                                                        mb: 2,
                                                        border: '1px solid #e0e0e0'
                                                    }}>
                                                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                                            User Variables:
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ 
                                                            fontFamily: 'monospace',
                                                            color: '#666',
                                                            wordBreak: 'break-word'
                                                        }}>
                                                            {JSON.stringify(event.userVariables, null, 2)}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                {/* Tags section */}
                                                {event.tags && event.tags.length > 0 && (
                                                    <Box sx={{ 
                                                        backgroundColor: '#f5f5f5', 
                                                        p: 2, 
                                                        borderRadius: 1, 
                                                        mb: 2,
                                                        border: '1px solid #e0e0e0'
                                                    }}>
                                                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                                            Tags:
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                            {event.tags.map((tag, tagIndex) => (
                                                                <Chip 
                                                                    key={tagIndex}
                                                                    label={tag}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
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
        <div id="mailgun-section">
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
        </div>
    );
}