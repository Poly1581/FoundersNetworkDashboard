import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import foundersNetworkLogo from './assets/foundersnetworklogo.png';
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
            <Box sx={{ p: 2, textAlign: 'center' }}>
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
                <Box sx={{ mt: 2 }}>
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

    // Add Integration Status card only when healthy
    const cardsToShow = integrationStatus === 'healthy'
        ? [...baseCards, createIntegrationStatusCard()]
        : baseCards;

    return (
        <Box sx={{ p: 3, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>Overview</Typography>

            {/* Show Integration Status card below title but above other content */}
            {(integrationStatus === 'degraded' || integrationStatus === 'down') && (
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: { xs: '100%', sm: '400px', md: '500px' } }}>
                        <IntegrationStatusCard
                            systems={integrationSystems}
                            status={integrationStatus}
                        />
                    </Box>
                </Box>
            )}

            <Box sx={{
                flexGrow: 1,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 3,
            }}>
                {cardsToShow.map((card, index) => {
                    // Apply green styling when Integration Status is healthy
                    const isIntegrationCard = card.title === 'Integration Status';
                    const isSystemHealthCard = card.title === 'System Health';
                    const isGraphCard = card.title === 'Issues Over Time';
                    const isPieChartCard = card.title === 'Issues by Error Type';
                    const cardSx = {
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        ...(index < 2 && { background: 'transparent', boxShadow: 'none', border: 'none' }),
                        ...((index === 0 || index === 3) && { gridColumn: { md: 'span 2' } }),
                        ...(isIntegrationCard && integrationStatus === 'healthy' && {
                            backgroundColor: '#e8f5e8', // Light green background
                            border: '2px solid #4caf50' // Green border
                        }),
                        ...(isSystemHealthCard && {
                            borderRadius: '16px', // Rounded corners for System Health card
                            backgroundColor: '#fafafa', // Lighter gray background
                            '& .MuiCardContent-root': {
                                backgroundColor: 'transparent', // Remove background from content
                                '& > .MuiTypography-h6': {
                                    backgroundColor: '#1c938a',
                                    color: 'white',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    margin: '-8px -8px 16px -8px'
                                }
                            }
                        }),
                        ...((isGraphCard || isPieChartCard) && {
                            borderRadius: '16px', // Rounded corners like System Health card
                            backgroundColor: '#fafafa' // Lighter gray background
                        })
                    };

                    return (
                        <Card key={index} sx={cardSx}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', width: '100%', flexGrow: 1 }}>
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
    const [activePage, setActivePage] = useState('overview');

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
            <Box component="main" sx={{ flexGrow: 1, bgcolor: 'white', p: 3 }}>
                <Container maxWidth="xl" sx={{ p: 0 }}>
                    {activePage === 'overview' && <Overview integrationStatus={integrationStatus} integrationSystems={integrationSystems} />}
                    {activePage === 'liveData' && (
                        <LiveData
                            allExpanded={allExpanded}
                            onRefresh={handleRefreshAll}
                            onExpandAll={handleExpandAll}
                        />
                    )}
                </Container>
            </Box>
        </Box>
    );
}

