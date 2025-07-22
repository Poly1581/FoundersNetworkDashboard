import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Collapse, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Chip, List, ListItem, ListItemText, Button, CircularProgress, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { KeyboardArrowDown as ArrowDownIcon, KeyboardArrowRight as ArrowRightIcon, Info as InfoIcon } from '@mui/icons-material';
import CollapsibleSection from './CollapsibleSection';
import IntegrationDetailsSection from './IntegrationDetailsSection';
import HubSpotLineChart from './HubSpotLineChart';
import HubSpotPieChart from './HubSpotPieChart';
import HubSpotBarChart from './HubSpotBarChart';
import { useData } from './hooks/useData';

const textContent = {
    hubspot: {
        title: 'HubSpot',
        activeDeals: {
            heading: 'Active Deals',
            viewDeal: 'View Deal',
        },
        activeIssues: {
            heading: 'Active CRM Issues',
            resolveIssue: 'Resolve Issue',
            viewDetails: 'View Details',
        },
        integrationDetails: {
            heading: 'Integration Details',
            columns: {
                service: 'Service',
                category: 'Category',
                status: 'Status',
                responseTime: 'Response Time',
                lastSuccess: 'Last Success',
                uptime: 'Uptime',
                issue: 'Issue'
            },
            viewDetails: 'View Details'
        },
        recentActivities: {
            heading: 'Recent Activities',
            filter: 'Filter',
            viewAll: 'View All',
            details: 'Details'
        },
        recentAlerts: {
            heading: 'Recent CRM Alerts',
            filter: 'Filter',
            viewAll: 'View All',
            acknowledge: 'Acknowledge',
            details: 'View Details'
        },
    }
};

// Mock API functions for HubSpot
const fetchHubSpotData = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                deals: [
                    { id: 1, title: 'New Deal with Acme Corp', stage: 'Discovery', amount: '$50,000' },
                    { id: 2, title: 'Expansion with Globex Inc', stage: 'Proposal', amount: '$120,000' },
                ],
                activities: [
                    { id: 1, type: 'Email', summary: 'Follow-up with Jane Doe', time: '2 hours ago' },
                    { id: 2, type: 'Call', summary: 'Initial call with John Smith', time: 'Yesterday' },
                ],
                issues: [
                    { id: 'hs-001', title: 'Contact sync failing for large batches', status: 'unresolved', level: 'error', lastSeen: new Date(Date.now() - 3600000).toISOString(), category: 'Contact Sync Error' },
                    { id: 'hs-002', title: 'Deal pipeline updates delayed', status: 'unresolved', level: 'warning', lastSeen: new Date(Date.now() - 7200000).toISOString(), category: 'Pipeline Sync Error' },
                    { id: 'hs-003', title: 'Property mapping conflicts detected', status: 'resolved', level: 'error', lastSeen: new Date(Date.now() - 14400000).toISOString(), category: 'Property Mapping Error' },
                ],
                integrations: [
                    { name: 'HubSpot API', category: 'CRM', status: 'Healthy', responseTime: '120ms', lastSuccess: 'Just now', uptime: '99.99%', issue: null },
                ]
            });
        }, 800); // Simulate network delay
    });
};


function ActiveDealsSection({ deals, textContent }) {
    return (
        <CollapsibleSection title={textContent.heading}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Stage</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell align="right"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {deals.map(deal => (
                        <TableRow key={deal.id}>
                            <TableCell>{deal.title}</TableCell>
                            <TableCell>{deal.stage}</TableCell>
                            <TableCell>{deal.amount}</TableCell>
                            <TableCell align="right">
                                <Button size="small">{textContent.viewDeal}</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CollapsibleSection>
    );
}

function RecentActivitiesSection({ activities, textContent }) {
    return (
        <CollapsibleSection title={textContent.heading}>
            <List>
                {activities.map(activity => (
                    <ListItem key={activity.id}>
                        <ListItemText primary={activity.summary} secondary={`${activity.type} - ${activity.time}`} />
                        <Button size="small">{textContent.details}</Button>
                    </ListItem>
                ))}
            </List>
        </CollapsibleSection>
    );
}

function ActiveIssuesSection({ issues, onViewDetails, onResolveIssue, expandedRows, textContent }) {
    return (
        <CollapsibleSection title={textContent.heading}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {issues.map(issue => (
                        <React.Fragment key={issue.id}>
                            <TableRow>
                                <TableCell>{issue.title}</TableCell>
                                <TableCell>
                                    <Chip label={issue.status} size="small" color={issue.status === 'unresolved' ? 'error' : 'success'} />
                                </TableCell>
                                <TableCell align="right">
                                    {issue.status === 'unresolved' && (
                                        <Button size="small" onClick={() => onResolveIssue(issue.id)}>
                                            {textContent.resolveIssue}
                                        </Button>
                                    )}
                                    <Button size="small" startIcon={<InfoIcon />} onClick={() => onViewDetails(issue.id)}>
                                        {textContent.viewDetails}
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                    <Collapse in={expandedRows.includes(issue.id)} timeout="auto" unmountOnExit>
                                        <Box sx={{ margin: 1 }}>
                                            <Typography variant="h6" gutterBottom component="div">
                                                Issue Details
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Category: {issue.category} | Level: {issue.level} | Last Seen: {new Date(issue.lastSeen).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </CollapsibleSection>
    );
}

function RecentAlertsSection({ alerts, showFilter, toggleFilter, filter, onFilterChange, expandedAlertDetails, onViewAlertDetails, textContent }) {
    return (
        <CollapsibleSection title={textContent.heading}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Severity</TableCell>
                        <TableCell>Message</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell align="right"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {alerts.map((alert, index) => (
                        <React.Fragment key={index}>
                            <TableRow>
                                <TableCell>
                                    <Chip label={alert.severity} size="small" color={alert.severity === 'Error' ? 'error' : 'warning'} />
                                </TableCell>
                                <TableCell>{alert.message}</TableCell>
                                <TableCell>{alert.time}</TableCell>
                                <TableCell align="right">
                                    <Button size="small" onClick={() => onViewAlertDetails(index)}>
                                        {textContent.details}
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                    <Collapse in={expandedAlertDetails.includes(index)} timeout="auto" unmountOnExit>
                                        <Box sx={{ margin: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Details: {alert.details || 'No additional details available.'}
                                            </Typography>
                                        </Box>
                                    </Collapse>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </CollapsibleSection>
    );
}

export default function HubSpotSection({ allExpanded, timeRange, onTimeRangeChange }) {
    const { data, loading, error } = useData('hubspotData', fetchHubSpotData);
    const [expandedIntegrations, setExpandedIntegrations] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [expandedAlertDetails, setExpandedAlertDetails] = useState([]);
    const [hiddenIssueIDs, setHiddenIssueIDs] = useState([]);
    const [hubspotAlerts, setHubspotAlerts] = useState([]);

    useEffect(() => {
        if (allExpanded && data) {
            setExpandedIntegrations(data.integrations.map((_, index) => index));
            setExpandedRows(data.issues ? data.issues.map(issue => issue.id) : []);
            setExpandedAlertDetails(hubspotAlerts.map((_, index) => index));
        } else {
            setExpandedIntegrations([]);
            setExpandedRows([]);
            setExpandedAlertDetails([]);
        }
    }, [allExpanded, data, hubspotAlerts]);

    useEffect(() => {
        if (data?.issues) {
            const transformedAlerts = data.issues.map(issue => ({
                severity: issue.level === 'error' ? 'Error' : 'Warning',
                message: issue.title,
                time: new Date(issue.lastSeen).toLocaleString(),
                details: `Category: ${issue.category} | Status: ${issue.status}`,
                originalIssue: issue
            }));
            setHubspotAlerts(transformedAlerts);
        }
    }, [data]);

    const handleViewIntegrationDetails = useCallback((index) => {
        const newExpandedIntegrations = expandedIntegrations.includes(index)
            ? expandedIntegrations.filter(i => i !== index)
            : [...expandedIntegrations, index];
        setExpandedIntegrations(newExpandedIntegrations);
    }, [expandedIntegrations]);

    const handleViewDetails = useCallback((issueId) => {
        const newExpandedRows = expandedRows.includes(issueId)
            ? expandedRows.filter(id => id !== issueId)
            : [...expandedRows, issueId];
        setExpandedRows(newExpandedRows);
    }, [expandedRows]);

    const handleViewAlertDetails = useCallback((index) => {
        const newExpandedAlertDetails = expandedAlertDetails.includes(index)
            ? expandedAlertDetails.filter(i => i !== index)
            : [...expandedAlertDetails, index];
        setExpandedAlertDetails(newExpandedAlertDetails);
    }, [expandedAlertDetails]);

    const handleResolveIssue = useCallback(async (issueId) => {
        setHiddenIssueIDs(prev => [...prev, issueId]);
        // Mock resolve - in real app would call API
        console.log('Resolving HubSpot issue:', issueId);
    }, []);

    if (loading) {
        return <CollapsibleSection title={textContent.hubspot.title}><CircularProgress /></CollapsibleSection>;
    }

    if (error) {
        return <CollapsibleSection title={textContent.hubspot.title}><Typography color="error">Error fetching HubSpot data: {error.message}</Typography></CollapsibleSection>;
    }

    const visibleIssues = data?.issues ? data.issues.filter(issue => !hiddenIssueIDs.includes(issue.id)) : [];

    return (
        <CollapsibleSection title={textContent.hubspot.title}>
            <IntegrationDetailsSection 
                integrations={data?.integrations || []} 
                textContent={textContent.hubspot.integrationDetails} 
                onAndViewDetails={handleViewIntegrationDetails} 
                expandedIntegrations={expandedIntegrations} 
            />
            <ActiveIssuesSection 
                issues={visibleIssues} 
                onViewDetails={handleViewDetails} 
                onResolveIssue={handleResolveIssue} 
                expandedRows={expandedRows} 
                textContent={textContent.hubspot.activeIssues} 
            />
            <RecentAlertsSection 
                alerts={hubspotAlerts} 
                showFilter={false} 
                toggleFilter={() => {}} 
                filter={{}} 
                onFilterChange={() => {}} 
                expandedAlertDetails={expandedAlertDetails} 
                onViewAlertDetails={handleViewAlertDetails} 
                textContent={textContent.hubspot.recentAlerts} 
            />
            <ActiveDealsSection deals={data?.deals || []} textContent={textContent.hubspot.activeDeals} />
            <RecentActivitiesSection activities={data?.activities || []} textContent={textContent.hubspot.recentActivities} />
        </CollapsibleSection>
    );
}
