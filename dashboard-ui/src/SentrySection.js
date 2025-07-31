import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CircularProgress, Typography, Box, Card, CardContent } from '@mui/material';
import IntegrationDetailsSection from './IntegrationDetailsSection';
import ActiveIssuesSection from './ActiveIssuesSection';
import { updateIssueStatus } from './api';
import CollapsibleSection from './CollapsibleSection';
import { filterLiveDataByTimeRange, filterByGlobalTimeRange } from './utils/dataFilters';

const textContent = {
    sentry: {
        title: 'Sentry',
        activeIssues: {
            heading: 'Active Issues',
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
        recentAlerts: {
            heading: 'Recent Alerts',
            filter: 'Filter',
            viewAll: 'View All',
            acknowledge: 'Acknowledge',
            details: 'View Details'
        },
    }
};

export default function SentrySection({ issues, integrations, loading, error, allExpanded, liveDataFilter, allEvents, timeRange, onTimeRangeChange }) {
    // Use props from context instead of individual data fetching for better performance
    const refreshIssues = useCallback(() => {
        // This would trigger a refresh from the parent component
        console.log('Refresh requested - handled by parent');
    }, []);
    
    const [hiddenIssueIDs, setHiddenIssueIDs] = useState([]);
    const [sentryAlerts, setSentryAlerts] = useState([]);
    const [filter, setFilter] = useState({
        status: '',
        level: '',
        date: '',
    });
    const [showFilter, setShowFilter] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const [expandedAlertDetails, setExpandedAlertDetails] = useState([]);
    const [expandedIntegrations, setExpandedIntegrations] = useState([]);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [highlightedIssueType, setHighlightedIssueType] = useState(null);

    // Check for highlight instructions from investigation panel
    useEffect(() => {
        const highlightType = sessionStorage.getItem('highlightIssueType');
        const fromInvestigation = sessionStorage.getItem('highlightFromInvestigation');
        
        if (highlightType && fromInvestigation === 'true') {
            setHighlightedIssueType(highlightType);
            
            // Clear the session storage
            sessionStorage.removeItem('highlightIssueType');
            sessionStorage.removeItem('highlightFromInvestigation');
            
            // Auto-expand issues of this type
            const matchingIssues = issues?.filter(issue => 
                (issue.metadata?.type || issue.type) === highlightType
            ) || [];
            
            if (matchingIssues.length > 0) {
                setExpandedRows(matchingIssues.map(issue => issue.id));
                // Select the first matching issue
                setSelectedIssue(matchingIssues[0]);
            }
            
            // Clear highlight after 5 seconds
            setTimeout(() => {
                setHighlightedIssueType(null);
            }, 5000);
        }
    }, [issues]);

    useEffect(() => {
        if (allExpanded) {
            setExpandedRows(issues ? issues.map(issue => issue.id) : []);
            setExpandedAlertDetails(sentryAlerts.map((_, index) => index));
            setExpandedIntegrations(integrations ? integrations.map((_, index) => index) : []);
        } else {
            setExpandedRows([]);
            setExpandedAlertDetails([]);
            setExpandedIntegrations([]);
        }
    }, [allExpanded, issues, sentryAlerts, integrations]);

    useEffect(() => {
        if (issues) {
            const transformedAlerts = issues.map(issue => ({
                severity: issue.level === 'error' ? 'Error' : issue.level === 'warning' ? 'Warning' : 'Warning',
                message: issue.title,
                time: new Date(issue.lastSeen).toLocaleString(),
                details: issue.culprit || issue.shortId,
                originalIssue: issue
            }));
            setSentryAlerts(transformedAlerts);
        }
    }, [issues]);


    // Apply global time filtering first, then live data filtering, then local filtering
    const globalTimeFilteredAlerts = useMemo(() => {
        return filterByGlobalTimeRange(sentryAlerts, timeRange);
    }, [sentryAlerts, timeRange]);
    
    const liveFilteredAlerts = useMemo(() => {
        return filterLiveDataByTimeRange(globalTimeFilteredAlerts, null, liveDataFilter);
    }, [globalTimeFilteredAlerts, liveDataFilter]);

    const filteredAlerts = useMemo(() => liveFilteredAlerts.filter(alert => {
        const originalIssue = alert.originalIssue;

        if (filter.status && originalIssue.status !== filter.status) {
            return false;
        }

        if (filter.level) {
            let mappedLevel;
            if (originalIssue.level === 'error') {
                mappedLevel = 'down';
            } else if (originalIssue.level === 'warning') {
                mappedLevel = 'degraded';
            } else {
                mappedLevel = 'healthy';
            }
            if (mappedLevel !== filter.level) {
                return false;
            }
        }

        if (filter.date) {
            const lastSeen = new Date(originalIssue.lastSeen);
            const now = new Date();
            let daysAgo;

            if (filter.date === '1d') {
                daysAgo = 1;
            } else if (filter.date === '7d') {
                daysAgo = 7;
            } else if (filter.date === '30d') {
                daysAgo = 30;
            }

            const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
            if (lastSeen < cutoffDate) {
                return false;
            }
        }

        return true;
    }), [liveFilteredAlerts, filter]);

    const handleResolveIssue = useCallback(async (issueId) => {
        setHiddenIssueIDs(prev => [...prev, issueId]);

        try {
            await updateIssueStatus(issueId, 'resolved');
            refreshIssues();
        } catch (err) {
            console.error("Failed to resolve issue:", err);
            setHiddenIssueIDs(prev => prev.filter(id => id !== issueId));
            alert(`Failed to resolve issue: ${err.message}`);
        }
    }, [refreshIssues]);

    const handleViewDetails = useCallback((issueId) => {
        const issue = issues.find(i => i.id === issueId);
        if (selectedIssue?.id === issueId) {
            setSelectedIssue(null);
        } else {
            setSelectedIssue(issue);
        }
        
        const newExpandedRows = expandedRows.includes(issueId)
            ? expandedRows.filter(id => id !== issueId)
            : [...expandedRows, issueId];
        setExpandedRows(newExpandedRows);
    }, [expandedRows, issues, selectedIssue]);

    const handleViewAlertDetails = useCallback((index) => {
        const newExpandedAlertDetails = expandedAlertDetails.includes(index)
            ? expandedAlertDetails.filter(i => i !== index)
            : [...expandedAlertDetails, index];
        setExpandedAlertDetails(newExpandedAlertDetails);
    }, [expandedAlertDetails]);

    const handleViewIntegrationDetails = useCallback((index) => {
        const newExpandedIntegrations = expandedIntegrations.includes(index)
            ? expandedIntegrations.filter(i => i !== index)
            : [...expandedIntegrations, index];
        setExpandedIntegrations(newExpandedIntegrations);
    }, [expandedIntegrations]);


    // Apply global time filtering first, then live data filtering to issues and integrations
    const globalTimeFilteredIssues = useMemo(() => {
        return filterByGlobalTimeRange(issues, timeRange);
    }, [issues, timeRange]);
    
    const liveFilteredIssues = useMemo(() => {
        return filterLiveDataByTimeRange(globalTimeFilteredIssues, null, liveDataFilter);
    }, [globalTimeFilteredIssues, liveDataFilter]);

    const globalTimeFilteredIntegrations = useMemo(() => {
        return filterByGlobalTimeRange(integrations, timeRange);
    }, [integrations, timeRange]);
    
    const liveFilteredIntegrations = useMemo(() => {
        return filterLiveDataByTimeRange(globalTimeFilteredIntegrations, null, liveDataFilter);
    }, [globalTimeFilteredIntegrations, liveDataFilter]);

    if (loading) {
        return <CollapsibleSection title={textContent.sentry.title}><CircularProgress /></CollapsibleSection>;
    }

    if (error) {
        return <CollapsibleSection title={textContent.sentry.title}><Typography color="error">Error fetching Sentry data: {error.message}</Typography></CollapsibleSection>;
    }

    const visibleIssues = liveFilteredIssues ? liveFilteredIssues.filter(issue => !hiddenIssueIDs.includes(issue.id)) : [];

    return (
        <CollapsibleSection title={textContent.sentry.title}>

            <ActiveIssuesSection 
                issues={visibleIssues} 
                onViewDetails={handleViewDetails} 
                onResolveIssue={handleResolveIssue} 
                allEventsData={{}} 
                expandedRows={expandedRows} 
                textContent={textContent.sentry.activeIssues} 
                selectedIssue={selectedIssue}
                highlightedIssueType={highlightedIssueType}
            />


            <IntegrationDetailsSection 
                integrations={liveFilteredIntegrations || []} 
                textContent={textContent.sentry.integrationDetails} 
                onAndViewDetails={handleViewIntegrationDetails} 
                expandedIntegrations={expandedIntegrations} 
            />
        </CollapsibleSection>
    );
}
