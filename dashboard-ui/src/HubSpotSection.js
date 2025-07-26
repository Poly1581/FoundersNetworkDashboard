import React, {useContext, useState} from 'react';
import {
    Box,
    Button,
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



function ActiveDealsSection({ deals, textContent, onViewDetails, expandedDeals }) {
    if (!deals || deals.length === 0) {
        return (
            <CollapsibleSection title={textContent.heading}>
                <Typography>No deals available.</Typography>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection title={textContent.heading}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Stage</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {deals.map(deal => (
                        <React.Fragment key={deal.id}>
                            <TableRow>
                                <TableCell>{deal.title || deal.name}</TableCell>
                                <TableCell>{deal.stage || deal.dealstage}</TableCell>
                                <TableCell>{deal.amount || deal.value || 'N/A'}</TableCell>
                                <TableCell align="right">
                                    <Button size="small" startIcon={<InfoIcon />} onClick={() => onViewDetails && onViewDetails(deal.id)}>
                                        {textContent.viewDeal}
                                    </Button>
                                </TableCell>
                            </TableRow>
                            {expandedDeals && expandedDeals.includes(deal.id) && (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Collapse in={true} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 1, p: 2, backgroundColor: '#f5f5f5' }}>
                                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                    ○ Deal ID: {deal.id}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                    ○ Created: {deal.createdate ? new Date(deal.createdate).toLocaleDateString() : 'N/A'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                    ○ Close Date: {deal.closedate ? new Date(deal.closedate).toLocaleDateString() : 'N/A'}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                    ○ Owner: {deal.hubspot_owner_id || 'Unassigned'}
                                                </Typography>
                                            </Box>
                                        </Collapse>
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
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2">
                                            {issue.title}
                                        </Typography>
                                        {issue.issueCategory && (
                                            <Chip 
                                                label={issue.issueCategory}
                                                size="small"
                                                sx={{ 
                                                    backgroundColor: getConsistentColorForCategory(issue.issueCategory),
                                                    color: 'white',
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </TableCell>
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

export default function HubSpotSection() {
    const { state } = useContext(AppContext);
    const { hubspotIntegrations, hubspotIssues, hubspotDeals, hubspotContacts, loading } = state;
    const [expandedIntegrations, setExpandedIntegrations] = useState([]);
    const [expandedDeals, setExpandedDeals] = useState([]);

    const handleViewIntegrationDetails = (index) => {
        const newExpandedIntegrations = expandedIntegrations.includes(index)
            ? expandedIntegrations.filter(i => i !== index)
            : [...expandedIntegrations, index];
        setExpandedIntegrations(newExpandedIntegrations);
    };

    const handleViewDealDetails = (dealId) => {
        const newExpandedDeals = expandedDeals.includes(dealId)
            ? expandedDeals.filter(id => id !== dealId)
            : [...expandedDeals, dealId];
        setExpandedDeals(newExpandedDeals);
    };

    if (loading) {
        return (
            <CollapsibleSection title={textContent.hubspot.title}>
                <Typography>Loading HubSpot data...</Typography>
            </CollapsibleSection>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                {textContent.hubspot.title}
            </Typography>
            
            <IntegrationDetailsSection 
                integrations={hubspotIntegrations} 
                textContent={textContent.hubspot.integrationDetails} 
                onAndViewDetails={handleViewIntegrationDetails} 
                expandedIntegrations={expandedIntegrations} 
            />
            
            <ActiveDealsSection 
                deals={hubspotDeals} 
                textContent={textContent.hubspot.activeDeals}
                onViewDetails={handleViewDealDetails}
                expandedDeals={expandedDeals}
            />
        </Box>
    );
}
