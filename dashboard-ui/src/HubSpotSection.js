import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Collapse, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Chip, List, ListItem, ListItemText, Button, CircularProgress } from '@mui/material';
import { KeyboardArrowDown as ArrowDownIcon, KeyboardArrowRight as ArrowRightIcon } from '@mui/icons-material';
import CollapsibleSection from './CollapsibleSection';
import IntegrationDetailsSection from './IntegrationDetailsSection';
import { useData } from './hooks/useData';

const textContent = {
    hubspot: {
        title: 'HubSpot',
        activeDeals: {
            heading: 'Active Deals',
            viewDeal: 'View Deal',
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

export default function HubSpotSection({ allExpanded }) {
    const { data, loading, error } = useData('hubspotData', fetchHubSpotData);
    const [expandedIntegrations, setExpandedIntegrations] = useState([]);

    useEffect(() => {
        if (allExpanded && data) {
            setExpandedIntegrations(data.integrations.map((_, index) => index));
        } else {
            setExpandedIntegrations([]);
        }
    }, [allExpanded, data]);

    const handleViewIntegrationDetails = useCallback((index) => {
        const newExpandedIntegrations = expandedIntegrations.includes(index)
            ? expandedIntegrations.filter(i => i !== index)
            : [...expandedIntegrations, index];
        setExpandedIntegrations(newExpandedIntegrations);
    }, [expandedIntegrations]);

    if (loading) {
        return <CollapsibleSection title={textContent.hubspot.title}><CircularProgress /></CollapsibleSection>;
    }

    if (error) {
        return <CollapsibleSection title={textContent.hubspot.title}><Typography color="error">Error fetching HubSpot data: {error.message}</Typography></CollapsibleSection>;
    }

    return (
        <CollapsibleSection title={textContent.hubspot.title}>
            <IntegrationDetailsSection integrations={data?.integrations || []} textContent={textContent.hubspot.integrationDetails} onAndViewDetails={handleViewIntegrationDetails} expandedIntegrations={expandedIntegrations} />
            <ActiveDealsSection deals={data?.deals || []} textContent={textContent.hubspot.activeDeals} />
            <RecentActivitiesSection activities={data?.activities || []} textContent={textContent.hubspot.recentActivities} />
        </CollapsibleSection>
    );
}
