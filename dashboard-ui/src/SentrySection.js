import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import IntegrationDetailsSection from './IntegrationDetailsSection';
import ActiveIssuesSection from './ActiveIssuesSection';
import RecentAlertsSection from './RecentAlertsSection';
import { updateIssueStatus } from './api';
import CollapsibleSection from './CollapsibleSection';
import { filterLiveDataByTimeRange } from './utils/dataFilters';

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

export default function SentrySection({ issues, integrations, loading, error, allExpanded, liveDataFilter }) {
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


    // Apply live data filtering first, then local filtering
    const liveFilteredAlerts = useMemo(() => {
        return filterLiveDataByTimeRange(sentryAlerts, null, liveDataFilter);
    }, [sentryAlerts, liveDataFilter]);

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

    const handleViewIntegrationDetails = useCallback((index) => {
        const newExpandedIntegrations = expandedIntegrations.includes(index)
            ? expandedIntegrations.filter(i => i !== index)
            : [...expandedIntegrations, index];
        setExpandedIntegrations(newExpandedIntegrations);
    }, [expandedIntegrations]);

    // Apply live data filtering to issues and integrations as well
    const liveFilteredIssues = useMemo(() => {
        return filterLiveDataByTimeRange(issues, null, liveDataFilter);
    }, [issues, liveDataFilter]);

    const liveFilteredIntegrations = useMemo(() => {
        return filterLiveDataByTimeRange(integrations, null, liveDataFilter);
    }, [integrations, liveDataFilter]);

    if (loading) {
        return <CollapsibleSection title={textContent.sentry.title}><CircularProgress /></CollapsibleSection>;
    }

    if (error) {
        return <CollapsibleSection title={textContent.sentry.title}><Typography color="error">Error fetching Sentry data: {error.message}</Typography></CollapsibleSection>;
    }

    const visibleIssues = liveFilteredIssues ? liveFilteredIssues.filter(issue => !hiddenIssueIDs.includes(issue.id)) : [];

    return (
        <CollapsibleSection title={textContent.sentry.title}>
            <IntegrationDetailsSection 
                integrations={liveFilteredIntegrations || []} 
                textContent={textContent.sentry.integrationDetails} 
                onAndViewDetails={handleViewIntegrationDetails} 
                expandedIntegrations={expandedIntegrations} 
            />
            <ActiveIssuesSection 
                issues={visibleIssues} 
                onViewDetails={handleViewDetails} 
                onResolveIssue={handleResolveIssue} 
                allEventsData={{}} 
                expandedRows={expandedRows} 
                textContent={textContent.sentry.activeIssues} 
            />
            <RecentAlertsSection 
                alerts={filteredAlerts} 
                showFilter={showFilter} 
                toggleFilter={() => setShowFilter(prev => !prev)} 
                filter={filter} 
                onFilterChange={setFilter} 
                expandedAlertDetails={expandedAlertDetails} 
                onViewAlertDetails={handleViewAlertDetails} 
                textContent={textContent.sentry.recentAlerts} 
            />
        </CollapsibleSection>
    );
}
