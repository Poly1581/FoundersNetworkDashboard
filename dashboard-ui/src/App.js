import React, { useState } from 'react';
import './App.css';
import { useSentryData, useHubSpotData, useRefreshAllData, useRefreshSection, useUpdateIssueStatus } from './hooks/useDataQueries';
import {
    Container,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    List,
    ListItem,
    ListItemText,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    IconButton,
    Collapse,
    TextField,
    MenuItem,
    Drawer,
    ListItemButton,
    ListItemIcon,
    Tooltip,
    Menu
} from '@mui/material';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

import {
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowRight as ArrowRightIcon,
    Dashboard as DashboardIcon,
    BarChart as BarChartIcon,
    Link as LinkIcon,
    ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';

import {
    CircularProgress,
    Link
} from '@mui/material';


// --- Text Variables ---
const textContent = {
    sidebar: { overview: 'Overview', liveData: 'Live Data' },
    header: {
        title: '',
        checkNow: 'Refresh All'
    },
    sentry: {
        title: 'Sentry',
        activeIssues: {
            heading: 'Active Issues',
            resolveIssue: 'Resolve Issue',
            viewDetails: 'View Details',
        },
        integrationDetails: {
            heading: 'Integrations',
            columns: {
                service: 'Service',
                category: 'Category',
                status: 'Status',
                responseTime: 'Response Time',
                lastSuccess: 'Last Success',
                uptime: 'Uptime',
                issue: 'Errors per min'
            },
            viewDetails: 'View Details'
        },
        recentAlerts: {
            heading: 'Recent Alerts',
            filter: 'Filter',
            viewAll: 'View All',
            acknowledge: 'Acknowledge',
            details: 'Details'
        },
    },
    hubspot: {
        title: 'HubSpot',
        // activeDeals: {
        //     heading: 'Active Deals',
        //     viewDeal: 'View Deal',
        // },
        integrationDetails: {
            heading: 'Integrations',
            columns: {
                service: 'Service',
                category: 'Category',
                status: 'Status',
                responseTime: 'Response Time',
                lastSuccess: 'Last Success',
                uptime: 'Uptime',
                issue: 'Error per min'
            },
            viewDetails: 'View Details'
        },
        // recentActivities: {
        //     heading: 'Recent Activities',
        //     filter: 'Filter',
        //     viewAll: 'View All',
        //     details: 'Details'
        // },
    },
    quickLinksFooter: {
        statusPage: 'https://statuspage.io',
        sentry: 'https://sentry.io',
        slack: 'https://slack.com',
        footerText: 'Dashboard · All data from integrated services · Last check: a few seconds ago'
    }
};

function QuickLinksFooter() {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pb={4}>
            <Box display="flex" gap={1}>
                <Button size="small" startIcon={<LinkIcon />} href={textContent.quickLinksFooter.statusPage} target="_blank" rel="noopener noreferrer">StatusPage.io</Button>
                <Button size="small" startIcon={<LinkIcon />} href={textContent.quickLinksFooter.slack} target="_blank" rel="noopener noreferrer">Slack</Button>
                <Button size="small" startIcon={<LinkIcon />} href={textContent.quickLinksFooter.sentry} target="_blank" rel="noopener noreferrer">Sentry</Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
                {textContent.quickLinksFooter.footerText}
            </Typography>
        </Box>
    );
}

const drawerWidth = 240;

function Sidebar({ activePage, onPageChange }) {
    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    background: 'rgba(248, 250, 252, 0.8)',
                    borderRight: '1px solid rgba(0, 0, 0, 0.08)'
                },
            }}
            variant="permanent"
            anchor="left"
        >
            {/* <Box sx={{ p: 2, textAlign: 'center' }}>
                <img
                    src={foundersNetworkLogo}
                    alt="Founders Network Dashboard"
                    style={{
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: '60px'
                    }}
                />
            </Box>
            <Divider /> */}
            <List>
                <ListItemButton selected={activePage === 'overview'} onClick={() => onPageChange('overview')}>
                    <ListItemIcon><BarChartIcon /></ListItemIcon><ListItemText primary={textContent.sidebar.overview} />
                </ListItemButton>
                <ListItemButton selected={activePage === 'liveData'} onClick={() => onPageChange('liveData')}>
                    <ListItemIcon><DashboardIcon /></ListItemIcon><ListItemText primary={textContent.sidebar.liveData} />
                </ListItemButton>
            </List>
        </Drawer>
    );
}

// --- Header Bar ---
function Header({ onRefresh, onExpandAll, allExpanded, lastFetchTime }) {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Typography variant="h4">{textContent.header.title}</Typography>
            <Box display="flex" flexDirection="column" alignItems="flex-end">
                <Box>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} sx={{ mr: 1 }}>
                        {textContent.header.checkNow}
                    </Button>
                    <Button variant="outlined" onClick={onExpandAll}>
                        {allExpanded ? 'Collapse All' : 'Expand All'}
                    </Button>
                </Box>
                {lastFetchTime && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        Last updated: {lastFetchTime.toLocaleString()}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

// --- Collapsible Wrapper ---
function CollapsibleSection({ title, children, defaultOpen = true, isOpen, onToggle, onRefresh }) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);

    // Use external state if provided, otherwise use internal state
    const open = isOpen !== undefined ? isOpen : internalOpen;
    const handleToggle = onToggle || (() => setInternalOpen(o => !o));

    return (
        <Card sx={{ mb: 4 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={2} pb={0}>
                <Typography variant="h6">{title}</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    {onRefresh && (
                        <IconButton onClick={onRefresh} size="small" title="Refresh Section">
                            <RefreshIcon />
                        </IconButton>
                    )}
                    <IconButton onClick={handleToggle} size="small">
                        {open ? <ArrowDownIcon /> : <ArrowRightIcon />}
                    </IconButton>
                </Box>
            </Box>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <CardContent>{children}</CardContent>
            </Collapse>
        </Card>
    );
}

// --- Sentry Section ---
function SentrySection({ isOpen, onToggle }) {
    const { data: sentry, isLoading, error } = useSentryData();
    const refreshSection = useRefreshSection();
    const updateIssueStatusMutation = useUpdateIssueStatus();

    const [filter, setFilter] = useState({
        status: '',
        level: '',
        date: '',
    });
    const [showFilter, setShowFilter] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const [expandedInactiveRows, setExpandedInactiveRows] = useState([]);
    const [expandedAlertDetails, setExpandedAlertDetails] = useState([]);
    const [expandedIntegrations, setExpandedIntegrations] = useState([]);

    // Provide default values if sentry data is not yet available
    const sentryData = sentry || { issues: [], resolvedIssues: [], allEventsData: {}, integrations: [], alerts: [] };

    const filteredAlerts = sentryData.alerts?.filter(alert => {
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
    }) || [];

    const handleResolveIssue = (issueId) => {
        updateIssueStatusMutation.mutate(
            { issueId, status: 'resolved' },
            {
                onError: (err) => {
                    console.error("Failed to resolve issue:", err);
                    alert(`Failed to resolve issue: ${err.message}`);
                }
            }
        );
    };

    const handleViewDetails = (issueId) => {
        const newExpandedRows = expandedRows.includes(issueId)
            ? expandedRows.filter(id => id !== issueId)
            : [...expandedRows, issueId];
        setExpandedRows(newExpandedRows);
    };

    const handleViewAlertDetails = (index) => {
        const newExpandedAlertDetails = expandedAlertDetails.includes(index)
            ? expandedAlertDetails.filter(i => i !== index)
            : [...expandedAlertDetails, index];
        setExpandedAlertDetails(newExpandedAlertDetails);
    };

    const handleViewInactiveDetails = (issueId) => {
        const newExpandedInactiveRows = expandedInactiveRows.includes(issueId)
            ? expandedInactiveRows.filter(id => id !== issueId)
            : [...expandedInactiveRows, issueId];
        setExpandedInactiveRows(newExpandedInactiveRows);
    };

    const handleViewIntegrationDetails = (index) => {
        const newExpandedIntegrations = expandedIntegrations.includes(index)
            ? expandedIntegrations.filter(i => i !== index)
            : [...expandedIntegrations, index];
        setExpandedIntegrations(newExpandedIntegrations);
    };

    if (isLoading) {
        return <CollapsibleSection title={textContent.sentry.title}><Typography>Loading Sentry Data...</Typography></CollapsibleSection>;
    }

    if (error) {
        return <CollapsibleSection title={textContent.sentry.title}><Typography color="error">Error fetching Sentry data: {error.message}</Typography></CollapsibleSection>;
    }


    return (
        <CollapsibleSection
            title={textContent.sentry.title}
            isOpen={isOpen}
            onToggle={onToggle}
            onRefresh={() => refreshSection('sentry')}
        >
            <IntegrationDetailsSection integrations={sentryData.integrations} textContent={textContent.sentry.integrationDetails} onAndViewDetails={handleViewIntegrationDetails} expandedIntegrations={expandedIntegrations} />
            <ActiveIssuesSection issues={sentryData.issues} onViewDetails={handleViewDetails} onResolveIssue={handleResolveIssue} allEventsData={sentryData.allEventsData} expandedRows={expandedRows} setExpandedRows={setExpandedRows} textContent={textContent.sentry.activeIssues} />
            <InactiveIssuesSection issues={sentryData.resolvedIssues} onViewDetails={handleViewInactiveDetails} allEventsData={sentryData.allEventsData} expandedRows={expandedInactiveRows} setExpandedRows={setExpandedInactiveRows} />
            <RecentAlertsSection alerts={filteredAlerts} showFilter={showFilter} toggleFilter={() => setShowFilter(prev => !prev)} filter={filter} onFilterChange={setFilter} expandedAlertDetails={expandedAlertDetails} onViewAlertDetails={handleViewAlertDetails} setExpandedAlertDetails={setExpandedAlertDetails} textContent={textContent.sentry.recentAlerts} />
        </CollapsibleSection>
    );
}

// --- HubSpot Section ---
function HubSpotSection({ isOpen, onToggle }) {
    const { data: hubspot, isLoading, error } = useHubSpotData();
    const refreshSection = useRefreshSection();
    const [expandedDeals, setExpandedDeals] = useState([]);
    const [expandedActivities, setExpandedActivities] = useState([]);
    const [expandedIntegrations, setExpandedIntegrations] = useState([]);

    // Provide default values if hubspot data is not yet available
    const hubspotData = hubspot || { deals: [], integrations: [], activities: [] };

    const handleViewDealDetails = (dealId) => {
        const newExpandedDeals = expandedDeals.includes(dealId)
            ? expandedDeals.filter(id => id !== dealId)
            : [...expandedDeals, dealId];
        setExpandedDeals(newExpandedDeals);
    };

    const handleViewActivityDetails = (index) => {
        const newExpandedActivities = expandedActivities.includes(index)
            ? expandedActivities.filter(i => i !== index)
            : [...expandedActivities, index];
        setExpandedActivities(newExpandedActivities);
    };

    const handleViewIntegrationDetails = (index) => {
        const newExpandedIntegrations = expandedIntegrations.includes(index)
            ? expandedIntegrations.filter(i => i !== index)
            : [...expandedIntegrations, index];
        setExpandedIntegrations(newExpandedIntegrations);
    };

    if (isLoading) {
        return <CollapsibleSection title={textContent.hubspot.title}><Typography>Loading HubSpot Data...</Typography></CollapsibleSection>;
    }

    if (error) {
        return <CollapsibleSection title={textContent.hubspot.title}><Typography color="error">Error fetching HubSpot data: {error.message}</Typography></CollapsibleSection>;
    }

    return (
        <CollapsibleSection title={textContent.hubspot.title} isOpen={isOpen} onToggle={onToggle} onRefresh={() => refreshSection('hubspot')}>
            <IntegrationDetailsSection integrations={hubspotData.integrations} textContent={textContent.hubspot.integrationDetails} onAndViewDetails={handleViewIntegrationDetails} expandedIntegrations={expandedIntegrations} />
            {/* <ActiveDealsSection deals={deals} onViewDetails={handleViewDealDetails} expandedDeals={expandedDeals} textContent={textContent.hubspot.activeDeals} /> */}
            {/* <RecentActivitiesSection activities={activities} onViewDetails={handleViewActivityDetails} expandedActivities={expandedActivities} textContent={textContent.hubspot.recentActivities} /> */}
        </CollapsibleSection>
    );
}

function IntegrationDetailsSection({ integrations, textContent, onAndViewDetails, expandedIntegrations }) {
    if (!integrations) return null;

    const getRowColor = (status) => {
        switch (status) {
            case 'Healthy':
                return '#e8f5e8'; // light green
            case 'Degraded':
                return '#fff3e0'; // light orange
            case 'Down':
                return '#ffebee'; // light red
            default:
                return 'inherit';
        }
    };
    return (
        <CollapsibleSection title={textContent.heading}>
            {integrations.length === 0 ? <Typography>No integration data.</Typography> :
                <Table sx={{ mb: 4 }}>
                    <TableHead>
                        <TableRow>
                            {Object.values(textContent.columns).map(col => (
                                <TableCell key={col}>{col}</TableCell>
                            ))}
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {integrations.map((i, index) => (
                            <React.Fragment key={i.name}>
                                <TableRow sx={{ backgroundColor: getRowColor(i.status) }}>
                                    <TableCell>{i.name}</TableCell>
                                    <TableCell>{i.category}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={i.status}
                                            color={i.status === 'Healthy' ? 'success' : i.status === 'Degraded' ? 'warning' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{i.responseTime}</TableCell>
                                    <TableCell>{i.lastSuccess}</TableCell>
                                    <TableCell>{i.uptime}</TableCell>
                                    <TableCell>{i.issue || '—'}</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" startIcon={<InfoIcon />} onClick={() => onAndViewDetails(index)}>
                                            {textContent.viewDetails}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                                        <Collapse in={expandedIntegrations.includes(index)} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 1, p: 2, backgroundColor: '#f5f5f5' }}>
                                                <Box sx={{ ml: 2 }}>
                                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                        ○ Connected user: {i.connectedUser || 'admin@foundersnetwork.com'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                        ○ Authorization: {i.authorization || 'Bearer ****...a8f2 (OAuth token)'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                        ○ Last failure: {i.lastFailure || 'Rate limit exceeded - 2024-12-15 14:23:45'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                        ○ Last success: {i.lastSuccess}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>}
        </CollapsibleSection>
    );
}

function ActiveIssuesSection({ issues, onViewDetails, onResolveIssue, allEventsData, expandedRows, setExpandedRows, textContent }) {
    const getRowColorForIssue = (status) => {
        switch (status) {
            case 'unresolved':
                return '#ffebee'; // light red
            case 'resolved':
                return '#e8f5e8'; // light green
            default:
                return 'inherit';
        }
    };

    const handleExpandAll = () => {
        if (!issues || issues.length === 0) return;

        const allIssueIds = issues.map(issue => issue.id);
        const anyExpanded = expandedRows.length > 0;

        if (anyExpanded) {
            // If any are expanded, collapse all
            setExpandedRows([]);
        } else {
            // If none are expanded, expand all
            setExpandedRows(allIssueIds);
        }
    };

    // Add defensive checks for issues array
    if (!issues || issues.length === 0) {
        return (
            <CollapsibleSection title={textContent.heading}>
                <Typography>No active issues found.</Typography>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection title={textContent.heading}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box />
                <Button size="small" onClick={handleExpandAll}>
                    {expandedRows.length > 0 ? 'Collapse All' : 'Expand All'}
                </Button>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {issues.map(issue => (
                        <React.Fragment key={issue.id}>
                            <TableRow sx={{ backgroundColor: getRowColorForIssue(issue.status) }}>
                                <TableCell>{issue.title}</TableCell>
                                <TableCell>
                                    <Chip label={issue.status} size="small" color={issue.status === 'unresolved' ? 'error' : 'success'} />
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        {issue.status === 'unresolved' && (
                                            <Button size="small" onClick={() => onResolveIssue(issue.id)}>
                                                {textContent.resolveIssue}
                                            </Button>
                                        )}
                                        <Button size="small" startIcon={<InfoIcon />} onClick={() => onViewDetails(issue.id)}>
                                            {textContent.viewDetails}
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                    <Collapse in={expandedRows.includes(issue.id)} timeout="auto" unmountOnExit>
                                        <Box sx={{ margin: 1 }}>
                                            <Typography variant="h6" gutterBottom component="div">
                                                Event Details
                                            </Typography>
                                            {allEventsData && allEventsData[issue.id] && allEventsData[issue.id].length > 0 ? (
                                                <Typography variant="body2" color="text.secondary">
                                                    Latest Event ID: <Link href={`${issue.permalink}events/${allEventsData[issue.id][0].id}/`} target="_blank" rel="noopener">{allEventsData[issue.id][0].id}</Link> | Message: {allEventsData[issue.id][0].message} | Timestamp: {new Date(allEventsData[issue.id][0].dateCreated).toLocaleString()}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No event data available for this issue
                                                </Typography>
                                            )}
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

// Inactive Issues Section Component
function InactiveIssuesSection({ issues, onViewDetails, allEventsData, expandedRows, setExpandedRows }) {
    if (issues.length === 0) {
        return null;
    }

    return (
        <CollapsibleSection title="Inactive Issues">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Last Seen</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {issues.map((issue) => (
                        <React.Fragment key={issue.id}>
                            <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                                <TableCell>{issue.title}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={issue.level || 'error'}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#e0e0e0',
                                            color: '#666'
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{new Date(issue.lastSeen).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label="Resolved"
                                        size="small"
                                        sx={{
                                            backgroundColor: '#e8f5e8',
                                            color: '#2e7d32'
                                        }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        size="small"
                                        startIcon={<InfoIcon />}
                                        onClick={() => onViewDetails(issue.id)}
                                        sx={{ color: '#666' }}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                            {expandedRows.includes(issue.id) && (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Issue Details:
                                            </Typography>
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                {issue.culprit || 'No additional details available'}
                                            </Typography>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Recent Events:
                                            </Typography>
                                            {allEventsData && allEventsData[issue.id] && allEventsData[issue.id].length > 0 ? (
                                                <Typography variant="body2" color="text.secondary">
                                                    Latest Event ID: {allEventsData[issue.id][0].id} |
                                                    Message: {allEventsData[issue.id][0].message} |
                                                    Timestamp: {new Date(allEventsData[issue.id][0].dateCreated).toLocaleString()}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    No event data available for this issue
                                                </Typography>
                                            )}
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

function RecentAlertsSection({ alerts, showFilter, toggleFilter, filter, onFilterChange, expandedAlertDetails, onViewAlertDetails, setExpandedAlertDetails, textContent }) {
    if (!alerts) return null;

    const handleExpandAll = () => {
        const allIndices = alerts.map((_, index) => index);
        const anyExpanded = expandedAlertDetails.length > 0;

        if (anyExpanded) {
            // If any are expanded, collapse all
            setExpandedAlertDetails([]);
        } else {
            // If none are expanded, expand all
            setExpandedAlertDetails(allIndices);
        }
    };

    return (
        <CollapsibleSection title={textContent.heading}>
            <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Box />
                <Box display="flex" gap={1}>
                    <Button size="small" onClick={toggleFilter}>{textContent.filter}</Button>
                    <Button size="small" onClick={handleExpandAll}>
                        {expandedAlertDetails.length > 0 ? 'Collapse All' : 'Expand All'}
                    </Button>
                </Box>
            </Box>

            {showFilter && (
                <Box mb={2}>
                    <FilterBar filter={filter} onFilterChange={onFilterChange} />
                </Box>
            )}

            {alerts.length === 0 ? (
                <Typography>No recent alerts.</Typography>
            ) : (
                <List>
                    {alerts.map((a, i) => (
                        <React.Fragment key={i}>
                            <ListItem
                                secondaryAction={
                                    <Box>
                                        <Button size="small" onClick={() => onViewAlertDetails(i)}>{textContent.details}</Button>
                                    </Box>
                                }
                            >
                                {a.severity === 'Warning'
                                    ? <WarningIcon color="warning" sx={{ mr: 1 }} />
                                    : <ErrorIcon color="error" sx={{ mr: 1 }} />}
                                <ListItemText
                                    primary={a.message}
                                    secondary={`${a.time} — ${a.details}`}
                                />
                            </ListItem>
                            <Collapse in={expandedAlertDetails.includes(i)} timeout="auto" unmountOnExit>
                                <Box sx={{ margin: 1, ml: 7 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Short ID: {a.originalIssue.shortId} | Culprit: {a.originalIssue.culprit} | Last Seen: {new Date(a.originalIssue.lastSeen).toLocaleString()} | Status: {a.originalIssue.status}
                                    </Typography>
                                </Box>
                            </Collapse>
                        </React.Fragment>
                    ))}
                </List>
            )}
        </CollapsibleSection>
    );
}



function FilterBar({ filter, onFilterChange }) {
    return (
        <Box display="flex" gap={2} mb={2} flexWrap={"wrap"}>
            <TextField
                select
                label="Status"
                variant="outlined"
                size="small"
                sx={{ minWidth: 130 }}
                value={filter.status}
                onChange={(e) => onFilterChange({ ...filter, status: e.target.value })}
            >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="unresolved">Unresolved</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
            </TextField>

            <TextField
                select
                label="Level"
                variant="outlined"
                size="small"
                sx={{ minWidth: 130 }}
                value={filter.level}
                onChange={(e) => onFilterChange({ ...filter, level: e.target.value })}
            >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="degraded">Degraded</MenuItem>
                <MenuItem value="down">Down</MenuItem>
            </TextField>

            <TextField
                select
                label="Date Range"
                variant="outlined"
                size="small"
                sx={{ minWidth: 160 }}
                value={filter.date}
                onChange={(e) => onFilterChange({ ...filter, date: e.target.value })}
            >
                <MenuItem value="1d">Last 1 Day</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
            </TextField>
        </Box>
    );
}

// Data for our new charts - multi-line chart with different error types by year
const histogramDataByYear = {
    '24-25': [
        { time: 'Jul', typeErrors: 8, dbTimeouts: 4, apiErrors: 1, authErrors: 1 },
        { time: 'Aug', typeErrors: 12, dbTimeouts: 6, apiErrors: 3, authErrors: 2 },
        { time: 'Sep', typeErrors: 15, dbTimeouts: 8, apiErrors: 4, authErrors: 1 },
        { time: 'Oct', typeErrors: 10, dbTimeouts: 5, apiErrors: 2, authErrors: 1 },
        { time: 'Nov', typeErrors: 18, dbTimeouts: 9, apiErrors: 5, authErrors: 3 },
        { time: 'Dec', typeErrors: 22, dbTimeouts: 11, apiErrors: 6, authErrors: 2 },
        { time: 'Jan', typeErrors: 8, dbTimeouts: 4, apiErrors: 2, authErrors: 1 },
        { time: 'Feb', typeErrors: 5, dbTimeouts: 2, apiErrors: 1, authErrors: 0 },
        { time: 'Mar', typeErrors: 7, dbTimeouts: 3, apiErrors: 1, authErrors: 1 },
        { time: 'Apr', typeErrors: 3, dbTimeouts: 2, apiErrors: 1, authErrors: 0 },
        { time: 'May', typeErrors: 10, dbTimeouts: 5, apiErrors: 2, authErrors: 1 },
        { time: 'Jun', typeErrors: 12, dbTimeouts: 6, apiErrors: 3, authErrors: 1 },
    ],
    '23-24': [
        { time: 'Jul', typeErrors: 6, dbTimeouts: 3, apiErrors: 1, authErrors: 0 },
        { time: 'Aug', typeErrors: 9, dbTimeouts: 4, apiErrors: 2, authErrors: 1 },
        { time: 'Sep', typeErrors: 11, dbTimeouts: 6, apiErrors: 3, authErrors: 1 },
        { time: 'Oct', typeErrors: 7, dbTimeouts: 3, apiErrors: 1, authErrors: 0 },
        { time: 'Nov', typeErrors: 14, dbTimeouts: 7, apiErrors: 4, authErrors: 2 },
        { time: 'Dec', typeErrors: 16, dbTimeouts: 8, apiErrors: 4, authErrors: 1 },
        { time: 'Jan', typeErrors: 5, dbTimeouts: 2, apiErrors: 1, authErrors: 0 },
        { time: 'Feb', typeErrors: 3, dbTimeouts: 1, apiErrors: 0, authErrors: 0 },
        { time: 'Mar', typeErrors: 4, dbTimeouts: 2, apiErrors: 1, authErrors: 0 },
        { time: 'Apr', typeErrors: 2, dbTimeouts: 1, apiErrors: 0, authErrors: 0 },
        { time: 'May', typeErrors: 8, dbTimeouts: 4, apiErrors: 2, authErrors: 1 },
        { time: 'Jun', typeErrors: 10, dbTimeouts: 5, apiErrors: 2, authErrors: 1 },
    ],
    '22-23': [
        { time: 'Jul', typeErrors: 4, dbTimeouts: 2, apiErrors: 1, authErrors: 0 },
        { time: 'Aug', typeErrors: 6, dbTimeouts: 3, apiErrors: 1, authErrors: 0 },
        { time: 'Sep', typeErrors: 8, dbTimeouts: 4, apiErrors: 2, authErrors: 1 },
        { time: 'Oct', typeErrors: 5, dbTimeouts: 2, apiErrors: 1, authErrors: 0 },
        { time: 'Nov', typeErrors: 10, dbTimeouts: 5, apiErrors: 3, authErrors: 1 },
        { time: 'Dec', typeErrors: 12, dbTimeouts: 6, apiErrors: 3, authErrors: 1 },
        { time: 'Jan', typeErrors: 3, dbTimeouts: 1, apiErrors: 0, authErrors: 0 },
        { time: 'Feb', typeErrors: 2, dbTimeouts: 1, apiErrors: 0, authErrors: 0 },
        { time: 'Mar', typeErrors: 3, dbTimeouts: 1, apiErrors: 1, authErrors: 0 },
        { time: 'Apr', typeErrors: 1, dbTimeouts: 0, apiErrors: 0, authErrors: 0 },
        { time: 'May', typeErrors: 6, dbTimeouts: 3, apiErrors: 1, authErrors: 0 },
        { time: 'Jun', typeErrors: 8, dbTimeouts: 4, apiErrors: 2, authErrors: 1 },
    ]
};

const pieChartData = [
    { name: 'Error', value: 45 },
    { name: 'Warning', value: 25 },
    { name: 'Info', value: 30 },
];

const PIE_CHART_COLORS = ['#FF6384', '#FFCE56', '#36A2EB'];

// Endpoint error rate data (dummy data for now)
const endpointErrorRates = [
    { endpoint: 'POST /checkout', errorRate: 2.3, totalRequests: 15420 },
    { endpoint: 'GET /dashboard', errorRate: 0.8, totalRequests: 45230 },
    { endpoint: 'POST /login', errorRate: 1.2, totalRequests: 8950 },
    { endpoint: 'GET /api/users', errorRate: 0.5, totalRequests: 32100 },
    { endpoint: 'POST /api/payments', errorRate: 3.1, totalRequests: 6780 },
    { endpoint: 'GET /profile', errorRate: 0.3, totalRequests: 18900 },
    { endpoint: 'PUT /api/settings', errorRate: 1.8, totalRequests: 4560 },
    { endpoint: 'DELETE /api/data', errorRate: 4.2, totalRequests: 2340 },
    { endpoint: 'GET /api/analytics', errorRate: 0.9, totalRequests: 12670 },
    { endpoint: 'POST /api/upload', errorRate: 2.7, totalRequests: 5890 }
];



function IntegrationStatusCard({ systems, status }) {
    console.log('IntegrationStatusCard - status:', status, 'systems:', systems);

    const getStatusColor = () => {
        switch (status) {
            case 'down': return '#ffebee'; // light red background
            case 'degraded': return '#fff3e0'; // light orange background
            default: return '#e8f5e8'; // light green background
        }
    };

    const getBorderColor = () => {
        switch (status) {
            case 'down': return '#f44336'; // red border
            case 'degraded': return '#ff9800'; // orange border
            default: return '#4caf50'; // green border
        }
    };

    const groupedSystems = {
        healthy: systems.filter(s => s.status === 'healthy'),
        degraded: systems.filter(s => s.status === 'degraded'),
        down: systems.filter(s => s.status === 'down')
    };

    return (
        <Card sx={{
            backgroundColor: getStatusColor(),
            border: `2px solid ${getBorderColor()}`,
            p: 2,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', width: '100%', flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom sx={{ textAlign: 'center' }}>
                    Integration Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Typography>{systems.length} integrations monitored</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, flexWrap: 'wrap' }}>
                        {groupedSystems.healthy.length > 0 && (
                            <Tooltip title={
                                <React.Fragment>
                                    {groupedSystems.healthy.map(system => (
                                        <Typography key={system.name} color="inherit">{system.name}</Typography>
                                    ))}
                                </React.Fragment>
                            }>
                                <Chip label={`${groupedSystems.healthy.length} Healthy`} color="success" />
                            </Tooltip>
                        )}
                        {groupedSystems.degraded.length > 0 && (
                            <Tooltip title={
                                <React.Fragment>
                                    {groupedSystems.degraded.map(system => (
                                        <Typography key={system.name} color="inherit">{system.name}</Typography>
                                    ))}
                                </React.Fragment>
                            }>
                                <Chip label={`${groupedSystems.degraded.length} Degraded`} color="warning" />
                            </Tooltip>
                        )}
                        {groupedSystems.down.length > 0 && (
                            <Tooltip title={
                                <React.Fragment>
                                    {groupedSystems.down.map(system => (
                                        <Typography key={system.name} color="inherit">{system.name}</Typography>
                                    ))}
                                </React.Fragment>
                            }>
                                <Chip label={`${groupedSystems.down.length} Down`} color="error" />
                            </Tooltip>
                        )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        <strong>Member Impact:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <strong>Critical Services:</strong>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}

function SystemHealthCard() {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const activeAlerts = [
        { id: 1, title: 'Database Connection Timeout', severity: 'High', time: '2 mins ago' },
        { id: 2, title: 'API Rate Limit Exceeded', severity: 'Medium', time: '5 mins ago' },
        { id: 3, title: 'Memory Usage Above 85%', severity: 'Low', time: '10 mins ago' }
    ];

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={{
            textAlign: 'left',
            width: '100%',
            mt: 2,
            p: 2
        }}>
            <Typography>Overall Uptime (30d): <Chip component="strong" label="99.8%" color="success" size="small" /></Typography>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Active Alerts:</Typography>
                <Button
                    onClick={handleClick}
                    size="small"
                    sx={{
                        minWidth: 'auto',
                        color: 'error.main',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        p: 0.5,
                        fontSize: '1.2rem'
                    }}
                    endIcon={<ArrowDropDownIcon />}
                >
                    3
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {activeAlerts.map((alert) => (
                        <MenuItem key={alert.id} onClick={handleClose}>
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {alert.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {alert.severity} • {alert.time}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))}
                </Menu>
            </Box>
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography>Last Full Check: <strong>a few seconds ago</strong></Typography>
                <IconButton
                    size="small"
                    onClick={() => window.location.reload()}
                    sx={{ ml: 1 }}
                    title="Refresh Dashboard"
                >
                    <RefreshIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
}

function Overview({ integrationStatus, integrationSystems }) {
    const [selectedYear, setSelectedYear] = useState('24-25');

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    // Create dynamic Integration Status card content
    const createIntegrationStatusCard = () => {
        const groupedSystems = {
            healthy: integrationSystems.filter(s => s.status === 'healthy'),
            degraded: integrationSystems.filter(s => s.status === 'degraded'),
            down: integrationSystems.filter(s => s.status === 'down')
        };

        return {
            title: `Integration Status: ${integrationStatus.charAt(0).toUpperCase() + integrationStatus.slice(1)}`,
            content: (
                <Box sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: integrationStatus === 'down' ? 'center' : 'flex-start',
                    textAlign: integrationStatus === 'down' ? 'center' : 'left'
                }}>
                    <Typography>{integrationSystems.length} integrations monitored</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, flexWrap: 'wrap' }}>
                        {groupedSystems.healthy.length > 0 && (
                            <Tooltip title={
                                <React.Fragment>
                                    {groupedSystems.healthy.map(system => (
                                        <Typography key={system.name} color="inherit">{system.name}</Typography>
                                    ))}
                                </React.Fragment>
                            }>
                                <Chip label={`${groupedSystems.healthy.length} Healthy`} color="success" />
                            </Tooltip>
                        )}
                        {groupedSystems.degraded.length > 0 && (
                            <Tooltip title={
                                <React.Fragment>
                                    {groupedSystems.degraded.map(system => (
                                        <Typography key={system.name} color="inherit">{system.name}</Typography>
                                    ))}
                                </React.Fragment>
                            }>
                                <Chip label={`${groupedSystems.degraded.length} Degraded`} color="warning" />
                            </Tooltip>
                        )}
                        {groupedSystems.down.length > 0 && (
                            <Tooltip title={
                                <React.Fragment>
                                    {groupedSystems.down.map(system => (
                                        <Typography key={system.name} color="inherit">{system.name}</Typography>
                                    ))}
                                </React.Fragment>
                            }>
                                <Chip label={`${groupedSystems.down.length} Down`} color="error" />
                            </Tooltip>
                        )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        <strong>Member Impact:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <strong>Critical Services:</strong>
                    </Typography>
                </Box>
            )
        };
    };

    // Create cards with selected year data
    const createOverviewCards = (year) => [
        {
            title: 'Issues Over Time',
            content: (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <TextField
                            select
                            label="Year"
                            value={selectedYear}
                            onChange={handleYearChange}
                            size="small"
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="24-25">24-25</MenuItem>
                            <MenuItem value="23-24">23-24</MenuItem>
                            <MenuItem value="22-23">22-23</MenuItem>
                        </TextField>
                    </Box>
                    <ResponsiveContainer width="80%" height={285}>
                        <LineChart data={histogramDataByYear[year]} margin={{ top: 20, right: 20, left: 40, bottom: 40 }}>
                            <XAxis dataKey="time" />
                            <YAxis />
                            <RechartsTooltip wrapperStyle={{ zIndex: 1000 }} />
                            <Legend />
                            <Line type="monotone" dataKey="typeErrors" stroke="#ff6b6b" strokeWidth={2} dot={{ fill: '#ff6b6b' }} name="Type Errors" />
                            <Line type="monotone" dataKey="dbTimeouts" stroke="#4ecdc4" strokeWidth={2} dot={{ fill: '#4ecdc4' }} name="DB Timeouts" />
                            <Line type="monotone" dataKey="apiErrors" stroke="#45b7d1" strokeWidth={2} dot={{ fill: '#45b7d1' }} name="API Errors" />
                            <Line type="monotone" dataKey="authErrors" stroke="#f9ca24" strokeWidth={2} dot={{ fill: '#f9ca24' }} name="Auth Errors" />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            )
        },
        {
            title: 'Endpoint Error Rates',
            content: (
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                        layout="vertical"
                        data={endpointErrorRates}
                        margin={{ top: 20, right: 30, left: -10, bottom: 20 }}
                        barCategoryGap="5%"
                    >
                        <XAxis
                            type="number"
                            label={{ value: 'Error Rate (%)', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="endpoint"
                            width={100}
                            tick={{ fontSize: 10 }}
                        />
                        <RechartsTooltip
                            wrapperStyle={{ zIndex: 1000 }}
                            formatter={(value, name) => [
                                name === 'errorRate' ? `${value}%` : value,
                                name === 'errorRate' ? 'Error Rate' : 'Total Requests',
                            ]}
                        />
                        <Bar
                            dataKey="errorRate"
                            fill="#ff6b6b"
                            layout="vertical"
                        />
                    </BarChart>
                </ResponsiveContainer>
            )
        },
        {
            title: 'Issues by Error Type',
            content: (
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={pieChartData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <RechartsTooltip wrapperStyle={{ zIndex: 1000 }} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )
        },
        {
            title: 'System Health',
            content: (
                <SystemHealthCard />
            )
        },
    ];

    // Filter cards based on integration status
    const baseCards = createOverviewCards(selectedYear);

    // Always show Integration Status card in top left, Endpoint Error Rates in top right
    const cardsToShow = [
        createIntegrationStatusCard(), // Integration Status (always top left)
        baseCards[1], // Endpoint Error Rates (always top right)
        baseCards[0], // Issues Over Time (spans full width)
        baseCards[2], // Issues by Error Type
        baseCards[3], // System Health
    ];

    return (
        <Box sx={{ p: 3, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h3" gutterBottom sx={{
                fontFamily: "Lato, sans-serif",
                fontStyle: "normal",
                fontWeight: 700
            }}>Overview</Typography>


            <Box sx={{
                flexGrow: 1,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3,
                gridAutoRows: 'min-content',
            }}>
                {cardsToShow.map((card, index) => {
                    // Apply green styling when Integration Status is healthy
                    const isIntegrationCard = card.title.startsWith('Integration Status');
                    const isSystemHealthCard = card.title === 'System Health';
                    const isGraphCard = card.title === 'Issues Over Time';
                    const isPieChartCard = card.title === 'Issues by Error Type';
                    const isEndpointErrorCard = card.title === 'Endpoint Error Rates';
                    const cardSx = {
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        // Issues Over Time spans full width (at index 2)
                        ...(isGraphCard && { gridColumn: { md: 'span 2' } }),
                        // First two cards (Integration Status and Endpoint Error Rates) are always side by side
                        ...(index < 2 && {
                            gridColumn: { md: 'span 1' }, // Explicitly set to span 1 column
                            minHeight: '300px', // Set consistent height for side-by-side cards
                        }),
                        ...(isSystemHealthCard && {
                            borderRadius: '16px',
                            backgroundColor: '#fafafa',
                            '& .MuiCardContent-root': {
                                backgroundColor: 'transparent',
                                '& > .MuiTypography-h6': {
                                    backgroundColor: '#1c938a',
                                    color: 'white',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    margin: '-8px -8px 16px -8px'
                                }
                            }
                        }),
                        ...((isIntegrationCard || isGraphCard || isPieChartCard || isEndpointErrorCard) && {
                            borderRadius: '16px',
                            backgroundColor: '#fafafa'
                        })
                    };

                    return (
                        <Card key={index} sx={cardSx}>
                            <CardContent sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                                flexGrow: 1,
                                ...(isIntegrationCard && integrationStatus === 'down' && {
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                })
                            }}>
                                <Typography variant="h6" component="div" gutterBottom sx={{ textAlign: 'center' }}>
                                    {card.title}
                                </Typography>
                                {card.content}
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
}

function LiveData({ onRefresh, onExpandAll, sentryOpen, hubspotOpen, onSentryToggle, onHubspotToggle, lastFetchTime }) {
    const [notificationMessage, setNotificationMessage] = useState('');

    const handleNotifyMembers = () => {
        // Placeholder function for notify members functionality
        if (notificationMessage.trim()) {
            alert(`Notify Members with message: "${notificationMessage}"`);
        } else {
            alert('Please enter a notification message');
        }
    };

    return (
        <>
            <Header
                onRefresh={onRefresh}
                onExpandAll={onExpandAll}
                allExpanded={sentryOpen || hubspotOpen}
                lastFetchTime={lastFetchTime}
            />
            <SentrySection isOpen={sentryOpen} onToggle={onSentryToggle} />
            <HubSpotSection isOpen={hubspotOpen} onToggle={onHubspotToggle} />

            {/* Notify Members Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4, mb: 2, justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleNotifyMembers}
                    sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        backgroundColor: '#1c938a',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#157a72'
                        }
                    }}
                >
                    Notify Members
                </Button>
                <TextField
                    variant="outlined"
                    placeholder="Enter notification message..."
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    sx={{
                        minWidth: 300,
                        '& .MuiOutlinedInput-root': {
                            height: '56px' // Match button height
                        }
                    }}
                />
            </Box>

            <QuickLinksFooter />
        </>
    );
}

// --- MAIN APP COMPONENT ---
export default function App() {
    const [sentryOpen, setSentryOpen] = useState(true);
    const [hubspotOpen, setHubspotOpen] = useState(true);
    const [lastFetchTime, setLastFetchTime] = useState(new Date());
    const [activePage, setActivePage] = useState(() => {
        // Get the saved page from localStorage, default to 'overview' if not found
        return localStorage.getItem('activePage') || 'overview';
    });

    // Get refresh functions from React Query hooks
    const refreshAllData = useRefreshAllData();

    // Integration systems state
    const [integrationSystems] = useState([
        { name: 'Sentry', status: 'healthy' },
        { name: 'HubSpot', status: 'healthy' },
        { name: 'Slack', status: 'degraded' },
        { name: 'StatusPage.io', status: 'down' }
    ]);

    // Integration status calculation function
    const calculateIntegrationStatus = (systems) => {
        if (systems.some(system => system.status === 'down')) return 'down';
        if (systems.some(system => system.status === 'degraded')) return 'degraded';
        return 'healthy';
    };

    const integrationStatus = calculateIntegrationStatus(integrationSystems);


    const handleRefreshAll = () => {
        refreshAllData();
        setLastFetchTime(new Date());
    };

    const handleExpandAll = () => {
        const anyExpanded = sentryOpen || hubspotOpen;

        if (anyExpanded) {
            // If any main sections are expanded, collapse all main sections only
            setSentryOpen(false);
            setHubspotOpen(false);
        } else {
            // If no main sections are expanded, expand all main sections only
            setSentryOpen(true);
            setHubspotOpen(true);
        }
    };

    const handleSentryToggle = () => {
        setSentryOpen(prev => !prev);
    };

    const handleHubspotToggle = () => {
        setHubspotOpen(prev => !prev);
    };

    // Remove the allExpanded state management since we're not using it for inner sections anymore

    const handlePageChange = (page) => {
        setActivePage(page);
        localStorage.setItem('activePage', page);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar activePage={activePage} onPageChange={handlePageChange} />
            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'white', p: 3 }}>
                {/* User Profile Section */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ mr: 1, fontWeight: 500 }}>
                        Admin User
                    </Typography>
                    <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: '#9e9e9e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {/* Gray circle placeholder for profile picture */}
                    </Box>
                </Box>

                <Container maxWidth="xl" sx={{ p: 0 }}>
                    {activePage === 'overview' && <Overview integrationStatus={integrationStatus} integrationSystems={integrationSystems} />}
                    {activePage === 'liveData' && (
                        <LiveData
                            onRefresh={handleRefreshAll}
                            onExpandAll={handleExpandAll}
                            sentryOpen={sentryOpen}
                            hubspotOpen={hubspotOpen}
                            onSentryToggle={handleSentryToggle}
                            onHubspotToggle={handleHubspotToggle}
                            lastFetchTime={lastFetchTime}
                        />
                    )}
                </Container>
            </Box>
        </Box>
    );
}
