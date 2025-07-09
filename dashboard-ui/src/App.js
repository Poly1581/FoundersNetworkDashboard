import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
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
    Divider,
    Grid
} from '@mui/material';

import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

import {
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowRight as ArrowRightIcon,
    Dashboard as DashboardIcon,
    BarChart as BarChartIcon,
    Link as LinkIcon
} from '@mui/icons-material';

import {
    CircularProgress,
    Link
} from '@mui/material';


// --- Backend API Client ---
// This section handles all communication with the backend service.

/**
 * A helper function to handle errors from the API.
 * @param {string} type The type of action being performed (e.g., "fetching issues").
 * @param {object} error The error object from a failed Axios request.
 * @returns {never} Throws a new error with a formatted message.
 */
const handleError = (type, error) => {
    if (error.response) {
        throw new Error(`Error ${type}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
        throw new Error(`Error ${type}: ${error.message}`);
    }
};

/**
 * An Axios instance to make requests to the backend.
 * Assumes the backend is running on http://localhost:8000.
 */
const backendApi = axios.create({
    baseURL: "http://localhost:5001/api"
});

/**
 * Fetches a list of unresolved issues from the backend.
 * @returns {Promise<Array>} A promise that resolves to an array of issue objects.
 */
const fetchIssues = async () => {
    try {
        const response = await backendApi.get("/sentry/issues/");
        return response.data;
    } catch (error) {
        handleError("fetching issues", error);
    }
};

/**
 * Fetches a list of individual events for a specific issue from the backend.
 * @param {string} issueId The ID of the issue to fetch events for.
 * @returns {Promise<Array>} A promise that resolves to an array of event objects.
 */
const fetchEventsForIssue = async (issueId) => {
    try {
        const response = await backendApi.get(`/sentry/issues/${issueId}/events`);
        return response.data;
    } catch (error) {
        handleError("fetching events for issue", error);
    }
};

/**
 * Updates an issue's status via the backend.
 * @param {string} issueId The ID of the issue to update.
 * @param {string} status The new status, e.g., "resolved" or "ignored".
 * @returns {Promise<Object>} A promise that resolves to the updated issue object.
 */
const updateIssueStatus = async (issueId, status) => {
    try {
        const response = await backendApi.put(`/sentry/issues/${issueId}`, { status });
        return response.data;
    } catch (error) {
        handleError("updating issue status", error);
    }
};


// --- Text Variables ---
const textContent = {
    sidebar: { overview: 'Overview', liveData: 'Live Data' },
    header: {
        title: 'Founders Network Dashboard',
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
            details: 'Details'
        },
    },
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
    },
    quickLinksFooter: {
        statusPage: 'StatusPage.io',
        sentry: 'Sentry',
        slack: 'Slack',
        footerText: 'Dashboard · All data from integrated services · Last check: a few seconds ago'
    }
};

function QuickLinksFooter() {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pb={4}>
            <Box display="flex" gap={1}>
                <Button size="small" startIcon={<LinkIcon />}>{textContent.quickLinksFooter.statusPage}</Button>
                <Button size="small" startIcon={<LinkIcon />}>{textContent.quickLinksFooter.sentry}</Button>
                <Button size="small" startIcon={<LinkIcon />}>{textContent.quickLinksFooter.slack}</Button>
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
            <Typography variant="h5" sx={{ p: 2, fontWeight: 600, textAlign: 'center' }}>FN Dashboard</Typography>
            <Divider />
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
function Header({ onRefresh, onExpandAll }) {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Typography variant="h4">{textContent.header.title}</Typography>
            <Box>
                <Button variant="outlined" onClick={onExpandAll} sx={{ mr: 1 }}>
                    Expand All
                </Button>
                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh} sx={{ mr: 1 }}>
                    {textContent.header.checkNow}
                </Button>
            </Box>
        </Box>
    );
}

// --- Collapsible Wrapper ---
function CollapsibleSection({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <Card sx={{ mb: 4 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={2} pb={0}>
                <Typography variant="h6">{title}</Typography>
                <IconButton onClick={() => setOpen(o => !o)} size="small">
                    {open ? <ArrowDownIcon /> : <ArrowRightIcon />}
                </IconButton>
            </Box>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <CardContent>{children}</CardContent>
            </Collapse>
        </Card>
    );
}

// --- Sentry Section ---
function SentrySection({ allExpanded }) {
    const [issues, setIssues] = useState([]);
    const [hiddenIssueIDs, setHiddenIssueIDs] = useState([]);
    const [sentryAlerts, setSentryAlerts] = useState([]);
    const [sentryIntegrations, setSentryIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({
        status: '',
        level: '',
        date: '',
    });
    const [showFilter, setShowFilter] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
    const [allEventsData, setAllEventsData] = useState({});
    const [expandedAlertDetails, setExpandedAlertDetails] = useState([]);
    const [expandedIntegrations, setExpandedIntegrations] = useState([]);

    useEffect(() => {
        if (allExpanded) {
            setExpandedRows(issues.map(issue => issue.id));
            setExpandedAlertDetails(sentryAlerts.map((_, index) => index));
            setExpandedIntegrations(sentryIntegrations.map((_, index) => index));
        } else {
            setExpandedRows([]);
            setExpandedAlertDetails([]);
            setExpandedIntegrations([]);
        }
    }, [allExpanded, issues, sentryAlerts, sentryIntegrations]);

    const fetchSentryIntegrationStatus = async () => {
        try {
            const response = await backendApi.get("/sentry/integration-status");
            return response.data;
        } catch (error) {
            handleError("fetching sentry integration status", error);
        }
    };

    const filteredAlerts = sentryAlerts.filter(alert => {
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
    });

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const fetchedIssues = await fetchIssues();
            setIssues(fetchedIssues);

            const fetchedSentryIntegrations = await fetchSentryIntegrationStatus();
            setSentryIntegrations(fetchedSentryIntegrations);

            const transformedAlerts = fetchedIssues.map(issue => ({
                severity: issue.level === 'error' ? 'Error' : issue.level === 'warning' ? 'Warning' : 'Warning',
                message: issue.title,
                time: new Date(issue.lastSeen).toLocaleString(),
                details: issue.culprit || issue.shortId,
                originalIssue: issue
            }));
            setSentryAlerts(transformedAlerts);

            const eventPromises = fetchedIssues.map(issue => fetchEventsForIssue(issue.id));
            const allEvents = await Promise.all(eventPromises);

            const eventsData = fetchedIssues.reduce((acc, issue, index) => {
                acc[issue.id] = allEvents[index];
                return acc;
            }, {});

            setAllEventsData(eventsData);

            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleResolveIssue = async (issueId) => {
        setHiddenIssueIDs(prev => [...prev, issueId]);

        try {
            await updateIssueStatus(issueId, 'resolved');
        } catch (err) {
            console.error("Failed to resolve issue:", err);
            setHiddenIssueIDs(prev => prev.filter(id => id !== issueId));
            alert(`Failed to resolve issue: ${err.message}`);
        }
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

    const handleViewIntegrationDetails = (index) => {
        const newExpandedIntegrations = expandedIntegrations.includes(index)
            ? expandedIntegrations.filter(i => i !== index)
            : [...expandedIntegrations, index];
        setExpandedIntegrations(newExpandedIntegrations);
    };

    if (loading) {
        return <CollapsibleSection title={textContent.sentry.title}><Typography>Loading Sentry Data...</Typography></CollapsibleSection>;
    }

    if (error) {
        return <CollapsibleSection title={textContent.sentry.title}><Typography color="error">Error fetching Sentry data: {error}</Typography></CollapsibleSection>;
    }

    const visibleIssues = issues.filter(issue => !hiddenIssueIDs.includes(issue.id));

    return (
        <CollapsibleSection title={textContent.sentry.title}>
            <IntegrationDetailsSection integrations={sentryIntegrations} textContent={textContent.sentry.integrationDetails} onAndViewDetails={handleViewIntegrationDetails} expandedIntegrations={expandedIntegrations} />
            <ActiveIssuesSection issues={visibleIssues} onViewDetails={handleViewDetails} onResolveIssue={handleResolveIssue} allEventsData={allEventsData} expandedRows={expandedRows} textContent={textContent.sentry.activeIssues} />
            <RecentAlertsSection alerts={filteredAlerts} showFilter={showFilter} toggleFilter={() => setShowFilter(prev => !prev)} filter={filter} onFilterChange={setFilter} expandedAlertDetails={expandedAlertDetails} onViewAlertDetails={handleViewAlertDetails} textContent={textContent.sentry.recentAlerts} />
        </CollapsibleSection>
    );
}

// --- HubSpot Section (Mock Data) ---
function HubSpotSection({ allExpanded }) {
    const [expandedIntegrations, setExpandedIntegrations] = useState([]);

    useEffect(() => {
        if (allExpanded) {
            setExpandedIntegrations(mockIntegrations.map((_, index) => index));
        } else {
            setExpandedIntegrations([]);
        }
    }, [allExpanded]);

    const handleViewIntegrationDetails = (index) => {
        const newExpandedIntegrations = expandedIntegrations.includes(index)
            ? expandedIntegrations.filter(i => i !== index)
            : [...expandedIntegrations, index];
        setExpandedIntegrations(newExpandedIntegrations);
    };

    const mockDeals = [
        { id: 1, title: 'New Deal with Acme Corp', stage: 'Discovery', amount: '$50,000' },
        { id: 2, title: 'Expansion with Globex Inc', stage: 'Proposal', amount: '$120,000' },
    ];

    const mockActivities = [
        { id: 1, type: 'Email', summary: 'Follow-up with Jane Doe', time: '2 hours ago' },
        { id: 2, type: 'Call', summary: 'Initial call with John Smith', time: 'Yesterday' },
    ];

    const mockIntegrations = [
        { name: 'HubSpot API', category: 'CRM', status: 'Healthy', responseTime: '120ms', lastSuccess: 'Just now', uptime: '99.99%', issue: null },
    ];

    return (
        <CollapsibleSection title={textContent.hubspot.title}>
            <IntegrationDetailsSection integrations={mockIntegrations} textContent={textContent.hubspot.integrationDetails} onAndViewDetails={handleViewIntegrationDetails} expandedIntegrations={expandedIntegrations} />
            <ActiveDealsSection deals={mockDeals} textContent={textContent.hubspot.activeDeals} />
            <RecentActivitiesSection activities={mockActivities} textContent={textContent.hubspot.recentActivities} />
        </CollapsibleSection>
    );
}

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


function IntegrationDetailsSection({ integrations, textContent, onAndViewDetails, expandedIntegrations }) {
    if (!integrations) return null;
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
                                <TableRow>
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
                                        <Button size="small" onClick={() => onAndViewDetails(index)}>{textContent.viewDetails}</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                                        <Collapse in={expandedIntegrations.includes(index)} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 1 }}>
                                                <Typography variant="h6" gutterBottom component="div">
                                                    Integration Details
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Service: {i.name} | Category: {i.category} | Status: {i.status} | Response Time: {i.responseTime} | Last Success: {i.lastSuccess} | Uptime: {i.uptime} | Issue: {i.issue || '—'}
                                                </Typography>
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

function ActiveIssuesSection({ issues, onViewDetails, onResolveIssue, allEventsData, expandedRows, textContent }) {
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
                                                Event Details
                                            </Typography>
                                            {allEventsData[issue.id] ? (
                                                <Typography variant="body2" color="text.secondary">
                                                    Latest Event ID: <Link href={`${issue.permalink}events/${allEventsData[issue.id][0].id}/`} target="_blank" rel="noopener">{allEventsData[issue.id][0].id}</Link> | Message: {allEventsData[issue.id][0].message} | Timestamp: {new Date(allEventsData[issue.id][0].dateCreated).toLocaleString()}
                                                </Typography>
                                            ) : (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                                    <CircularProgress size={24} />
                                                </Box>
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

function RecentAlertsSection({ alerts, showFilter, toggleFilter, filter, onFilterChange, expandedAlertDetails, onViewAlertDetails, textContent }) {
    if (!alerts) return null;
    return (
        <CollapsibleSection title={textContent.heading}>
            <Box mb={2} display="flex" justifyContent="flex-end" alignItems="center">
                <Button size="small" onClick={toggleFilter}>{textContent.filter}</Button>
                <Button size="small" onClick={() => onFilterChange({ status: '', level: '', date: '' })}>{textContent.viewAll}</Button>
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

// Data for our new charts
const barChartData = [
    { name: 'TypeError', count: 12 },
    { name: 'DB Timeout', count: 8 },
    { name: 'API Error', count: 5 },
    { name: 'Auth Error', count: 3 },
    { name: 'Validation', count: 2 },
];

const pieChartData = [
    { name: 'Error', value: 45 },
    { name: 'Warning', value: 25 },
    { name: 'Info', value: 30 },
];

const PIE_CHART_COLORS = ['#FF6384', '#FFCE56', '#36A2EB'];

const overviewCards = [
    {
        title: 'Issue Types Over Time',
        content: (
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barChartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                    <Bar dataKey="count" fill="#8884d8" />
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
                    <Tooltip wrapperStyle={{ zIndex: 1000 }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        )
    },
    {
        title: 'System Health',
        content: (
            <Box sx={{ textAlign: 'left', width: '100%', mt: 2, p: 1 }}>
                <Typography>Overall Uptime (30d): <Chip component="strong" label="99.8%" color="success" size="small" /></Typography>
                <Typography sx={{ mt: 1 }}>Active Alerts: <Chip component="strong" label="3" color="error" size="small" /></Typography>
                <Typography sx={{ mt: 1 }}>Last Full Check: <strong>a few seconds ago</strong></Typography>
            </Box>
        )
    },
    {
        title: 'Integration Status',
        content: (
            <Box sx={{ mt: 2 }}>
                <Typography>4 integrations monitored</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip label="2 Healthy" color="success" />
                    <Chip label="1 Degraded" color="warning" />
                    <Chip label="1 Down" color="error" />
                </Box>
            </Box>
        )
    }
];
function Overview() {
    return (
        <Box sx={{ p: 3, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>Overview</Typography>
            <Box sx={{
                flexGrow: 1,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gridTemplateRows: { xs: 'repeat(4, 1fr)', md: 'repeat(2, 1fr)' },
                gap: 3,
            }}>
                {overviewCards.map((card, index) => (
                    <Card key={index} sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', width: '100%', flexGrow: 1 }}>
                            <Typography variant="h6" component="div" gutterBottom sx={{ textAlign: 'center' }}>
                                {card.title}
                            </Typography>
                            {card.content}
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}

function LiveData({ allExpanded, onRefresh, onExpandAll }) {
    return (
        <>
            <Header
                onRefresh={onRefresh}
                onExpandAll={onExpandAll}
            />
            <SentrySection allExpanded={allExpanded} />
            <HubSpotSection allExpanded={allExpanded} />
            <QuickLinksFooter />
        </>
    );
}

// --- MAIN APP COMPONENT ---
export default function App() {
    const [allExpanded, setAllExpanded] = useState(false);
    const [activePage, setActivePage] = useState('liveData');

    const handleRefreshAll = () => {
        // In a real app, you would trigger a refresh for all sections.
        // For now, this is a placeholder.
        window.location.reload();
    };

    const handleExpandAll = () => {
        setAllExpanded(prev => !prev);
    };
    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar activePage={activePage} onPageChange={setActivePage} />
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: 'transparent', p: 3 }}>
                <Container maxWidth="xl" sx={{ p: 0 }}>
                    {activePage === 'overview' && <Overview />}
                    {activePage === 'liveData' && (
                        <LiveData
                            allExpanded={allExpanded}
                            onRefresh={handleRefreshAll}
                            onExpandAll={handleExpandAll}
                        />
                    )}
                </Container>
            </Box>
        </Box >
    );
}

