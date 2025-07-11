import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Collapse,
    Container,
    IconButton,
    Link,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowRight as ArrowRightIcon
} from '@mui/icons-material';


// --- Backend API Client ---
// This section handles all communication with the backend service.

/**
 * A helper function to handle errors from the API.
 * @param {string} type The type of action being performed (e.g., "fetching issues").
 * @param {object} error The error object from a failed Axios request.
 * @returns {never} Throws a new error with a formatted message.
 */
const handleError = (error, type = undefined) => {
    let event = type ? `Error ${type}:` : "Error";
    let message = error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message;
    throw new Error(`${event} ${message}`);
};

// Consolidated api (services Sentry and HubSpot)
const api = {
    backend: axios.create({
        baseURL: "http://localhost:8000"
    }),
    sentry: {
        async fetchIssues() {
            try {
                const response = await api.backend.get("/issues/");
                return response.data;
            } catch(error) {
                handleError(error, "fetching issues");
            }
        },
        async fetchEventsForIssue(issueId) {
            try {
                const response = await api.backend.get(`/issues/${issueId}/events/`);
                return response.data;
            } catch(error) {
                handleError(error, "fetching events for issue");
            }
        },
        async updateIssueStatus(issueId, status) {
            try {
                const response = await api.backend.put(`/issues/${issueId}/`, { status });
                return response.data;
            } catch (error) {
                handleError(error, "updating issue status");
            }
        },
        async fetchIntegrationStatus() {
            try {
                const response = await api.backend.get("/sentry_integration_status/");
                return response.data;
            } catch (error) {
                handleError(error, "fetching sentry integration status");
            }
        },
    },
    hubSpot: {
        async fetchDeals() {
            return [
                { id: 1, title: 'New Deal with Acme Corp', stage: 'Discovery', amount: '$50,000' },
                { id: 2, title: 'Expansion with Globex Inc', stage: 'Proposal', amount: '$120,000' },
            ];
        },
        async fetchActivities() {
            return [
                { id: 1, type: 'Email', summary: 'Follow-up with Jane Doe', time: '2 hours ago' },
                { id: 2, type: 'Call', summary: 'Initial call with John Smith', time: 'Yesterday' },
            ];
        },
        async fetchIntegrationStatus() {
            return [
                { name: 'HubSpot API', category: 'CRM', status: 'Healthy', responseTime: '120ms', lastSuccess: 'Just now', uptime: '99.99%', issue: null },
            ];
        },
    },
}

// --- Text Variables ---
const textContent = {
    header: {
        title: 'Founders Network Dashboard',
        checkNow: 'Refresh All'
    },
    integrations: {
        heading: 'Integration Details',
        columns: {
            service: 'Service',
            category: 'Category',
            status: 'Status',
            responseTime: 'Response Time',
            lastSuccess: 'Last Success',
            uptime: 'Uptime',
            issue: 'Issue',
        },
        viewDetails: 'View Details',
        reloadTitle: 'Reload Integrations',
    },
    sentry: {
        title: 'Sentry',
        activeIssues: {
            heading: 'Active Issues',
            resolveIssue: 'Resolve Issue',
            filter: 'Filter',
            viewAll: 'View All',
            viewDetails: 'Details',
            reloadTitle: 'Reload Sentry Issues',
        },
        reloadTitle: 'Reload Sentry',
    },
    hubspot: {
        title: 'HubSpot',
        activeDeals: {
            heading: 'Active Deals',
            viewDeal: 'View Deal',
            reloadTitle: 'Reload HubSpot Active Deals',
        },
        recentActivities: {
            heading: 'Recent Activities',
            filter: 'Filter',
            viewAll: 'View All',
            details: 'Details',
            reloadTitle: 'Reload HubSpot Active Deals',
        },
        reloadTitle: 'Reload HubSpot',
    },
    quickLinksFooter: {
        statusPage: 'StatusPage.io',
        sentry: 'Sentry',
        slack: 'Slack',
        footerText: 'Dashboard · All data from integrated services · Last check:',
    }
};


// --- Header Bar ---
function Header({ loadAll, expandAll }) {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Typography variant="h4">{textContent.header.title}</Typography>
            <Box>
                <Button variant="outlined" onClick={() => expandAll()} sx={{ mr: 1 }}>
                    Expand All
                </Button>
                <Button variant="outlined" startIcon={<RefreshIcon/>} onClick={() => loadAll()} sx={{ mr: 1 }}>
                    {textContent.header.checkNow}
                </Button>
            </Box>
        </Box>
    );
}

// --- Collapsible Wrapper ---
function CollapsibleSection({ title, children, expand, reloadTitle = undefined, reload = undefined}) {
    // Keep track of expansion state
    const [prevExpand, setPrevExpand] = useState(expand);
    const [expanded, setExpanded] = useState(expand);

    // Update expansion state when expand is changed
    if(expand !== prevExpand) {
        setExpanded(expand);
        setPrevExpand(expand);
    }

    return (
        <Card sx={{ mb: 4 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" p={2} pb={0}>
                <Typography variant="h6">{title}</Typography>
                <Box>
                    {reloadTitle && <Button variant="outlined" startIcon={<RefreshIcon/>} onClick={() => reload()} sx={{ mr: 1 }}>
                        {reloadTitle}
                    </Button>}
                    <IconButton onClick={() => setExpanded(prev => !prev )} size="small">
                        {expanded ? <ArrowDownIcon/> : <ArrowRightIcon/>}
                    </IconButton>
                </Box>
            </Box>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    {children}
                </CardContent>
            </Collapse>
        </Card>
    );
}

// --- Sentry Section ---
function SentrySection({ issues, loadSentryIssues, sentryIntegrations, loadSentryIntegrations, resolveIssue, expand }) { // UNFINISHED
    // Load and set all sentry data
    const loadAllSentry = () => {
        loadSentryIssues();
        loadSentryIntegrations();
    }

    return (
        <CollapsibleSection
                title={textContent.sentry.title}
                reloadTitle={textContent.sentry.reloadTitle}
                reload={() => loadAllSentry()}
                expand ={expand}
        >
            <IntegrationDetailsSection
                integrations={sentryIntegrations}
                loadIntegrations={() => loadSentryIntegrations()}
                expand={expand}
            />
            <ActiveIssuesSection
                issues={issues}
                loadSentryIssues={() => loadSentryIssues()}
                resolveIssue={(issueId) => resolveIssue(issueId)}
                expand={expand}
            />
        </CollapsibleSection>
    );
}

function ActiveIssuesSection({ issues, loadSentryIssues, resolveIssue, expand }) {
    const [showFilter, setShowFilter] = useState(false);
    const [statusFilter, setStatusFilter] = useState(undefined);
    const [levelFilter, setLevelFilter] = useState(undefined);
    const [dateFilter, setDateFilter] = useState(undefined);

    return (
        <CollapsibleSection
                    title={textContent.sentry.activeIssues.heading}
                    reloadTitle={textContent.sentry.activeIssues.reloadTitle}
                    reload={() => loadSentryIssues()}
                    expand={expand}
        >
            <Box mb={2} display="flex" justifyContent="flex-end" alignItems="center">
                <Button
                    size="small"
                    onClick={() => setShowFilter((prevShowFilter) => !prevShowFilter)}
                >
                    {textContent.sentry.activeIssues.filter}
                </Button>

                <Button
                    size="small"
                    onClick={() => {
                        // Reset all filters
                        setStatusFilter(undefined);
                        setLevelFilter(undefined);
                        setDateFilter(undefined);
                    }}
                >
                    {textContent.sentry.activeIssues.viewAll}
                </Button>
            </Box>
            {showFilter && (
                <Box mb={2}>
                    <Box display="flex" gap={2} mb={2} flexWrap={"wrap"}>
                        <TextField
                            select
                            label="Status"
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 130 }}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            <MenuItem value={undefined}>All</MenuItem>
                            <MenuItem value="unresolved">Unresolved</MenuItem>
                            <MenuItem value="resolved">Resolved</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Level"
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 130 }}
                            onChange={(event) => setLevelFilter(event.target.value)}
                        >
                            <MenuItem value={undefined}>All</MenuItem>
                            <MenuItem value={["fatal", "error"]}>Error</MenuItem>
                            <MenuItem value={["warning"]}>Warning</MenuItem>
                            <MenuItem value={["log", "info"]}>Info</MenuItem>
                        </TextField>
                        <TextField
                            select
                            label="Date Range"
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 160 }}
                            onChange={(event) => setDateFilter(event.target.value)}
                        >
                            <MenuItem value={undefined}>All</MenuItem>
                            <MenuItem value={1}>Last Day</MenuItem>
                            <MenuItem value={7}>Last Week</MenuItem>
                            <MenuItem value={31}>Last Month</MenuItem>
                        </TextField>
                    </Box>
                </Box>
            )}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {issues.filter((issue) => {
                        // Status filter
                        if(!statusFilter) {
                            return true;
                        }
                        return issue.status === statusFilter;
                    }).filter((issue) => {
                        // Level filter
                        if(!levelFilter) {
                            return true;
                        }
                        return levelFilter.includes(issue.level);
                    }).filter((issue) => {
                        // Date filter
                        if(!dateFilter) {
                            return true;
                        }
                        const lastSeen = new Date(issue.lastSeen);
                        const cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() - dateFilter);
                        return cutoffDate < lastSeen;
                    }).map((issue, index) => (
                        <ActiveIssue issue={issue} resolveIssue={(issueId) => resolveIssue(issueId)} expand={expand} key={index}/>
                    ))}
                </TableBody>
            </Table>
        </CollapsibleSection>
    );
}

function ActiveIssue({ issue, resolveIssue, expand }) { 
    // Keep track of expansion state
    const [prevExpand, setPrevExpand] = useState(expand);
    const [expanded, setExpanded] = useState(false);

    // Update expansion state when expand is changed
    if(expand !== prevExpand) {
        setExpanded(expand);
        setPrevExpand(expand);
    }

    return (
        <React.Fragment key={issue.id}>
            <TableRow>
                <TableCell>{issue.title}</TableCell>
                <TableCell>
                    {["fatal", "error"].includes(issue.level) && <ErrorIcon color="error" sx={{ mr: 1}}/>}
                    {["warning"].includes(issue.level) && <WarningIcon color="warning" sx={{ mr: 1}}/>}
                    {["log", "info"].includes(issue.level) && <InfoIcon color="info" sx={{ mr:1 }}/>}
                </TableCell>
                <TableCell>
                    <Chip
                        label={issue.status}
                        size="small"
                        color={issue.status === 'unresolved' ? 'error' : 'success'}
                    />
                </TableCell>
                <TableCell align="right">
                    {issue.status === 'unresolved' && (
                        <Button size="small" onClick={() => resolveIssue(issue.id)}>
                            {textContent.sentry.activeIssues.resolveIssue}
                        </Button>
                    )}
                    <Button size="small" startIcon={<InfoIcon/>} onClick={() => setExpanded(prev => !prev)}>
                        {textContent.sentry.activeIssues.viewDetails}
                    </Button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ margin: 1 }}>
                            <Link href={issue.permalink} target="_blank" rel="noopener">
                                {issue.id}
                            </Link>
                            <Box>
                                {`First Seen: ${new Date(issue.firstSeen).toString()}`}
                            </Box>
                            <Box>
                                {`Last Seen: ${new Date(issue.lastSeen).toString()}`}
                            </Box>
                            <Box>
                                {`Assigned To: ${issue.assignedTo}`}
                            </Box>
                            <Box>
                                {`Priority: ${issue.priority}`}
                            </Box>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

// --- HubSpot Section (Mock Data) ---
function HubSpotSection({ hubSpotDeals, loadHubSpotDeals, hubSpotActivities, loadHubSpotActivities, hubSpotIntegrations, loadHubSpotIntegrations, expand}) {
    // Load all HubSpot data
    const loadAllHubSpot = () => {
        loadHubSpotDeals();
        loadHubSpotActivities();
        loadHubSpotIntegrations();
    }

    return (
        <CollapsibleSection
            title={textContent.hubspot.title}
            reloadTitle={textContent.hubspot.reloadTitle}
            reload={()=>loadAllHubSpot()}
            expand={expand}
        >
            <IntegrationDetailsSection
                integrations={hubSpotIntegrations}
                loadIntegrations={() => loadHubSpotIntegrations()}
                expand={expand}
            />
            <ActiveDealsSection
                hubSpotDeals={hubSpotDeals}
                loadHubSpotDeals={() => loadHubSpotDeals()}
                expand={expand}
            />
            <RecentActivitiesSection
                hubSpotActivities={hubSpotActivities}
                loadHubSpotActivities={() => loadHubSpotActivities()}
                expand={expand}
            />
        </CollapsibleSection>
    );
}

function ActiveDealsSection({ hubSpotDeals, loadHubSpotDeals, expand}) {
    return (
        <CollapsibleSection
                    title={textContent.hubspot.activeDeals.heading}
                    reloadTitle={textContent.hubspot.activeDeals.reloadTitle}
                    reload={() => loadHubSpotDeals()}
                    expand={expand}
        >
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
                    {hubSpotDeals.map(deal => (
                        <TableRow key={deal.id}>
                            <TableCell>{deal.title}</TableCell>
                            <TableCell>{deal.stage}</TableCell>
                            <TableCell>{deal.amount}</TableCell>
                            <TableCell align="right">
                                <Button size="small">{textContent.hubspot.activeDeals.viewDeal}</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CollapsibleSection>
    );
}

function RecentActivitiesSection({ hubSpotActivities, loadHubSpotActivities, expand }) {
    return (
        <CollapsibleSection
            title={textContent.hubspot.recentActivities.heading}
            reloadTitle={textContent.hubspot.recentActivities.reloadTitle}
            reload={() => loadHubSpotActivities()}
            expand={expand}
        >
            <List>
                {hubSpotActivities.map(activity => (
                    <ListItem key={activity.id}>
                        <ListItemText primary={activity.summary} secondary={`${activity.type} - ${activity.time}`} />
                        <Button size="small">{textContent.details}</Button>
                    </ListItem>
                ))}
            </List>
        </CollapsibleSection>
    );
}

function IntegrationDetailsSection({ integrations, loadIntegrations, expand }) {
    if (!integrations) return null;

    if(integrations.length === 0) {
        return (
            <CollapsibleSection title={textContent.integrations.heading} expand={expand}>
                <Typography>
                    No integration data.
                </Typography>
            </CollapsibleSection>
        );
    }

    return (
        <CollapsibleSection title={textContent.integrations.heading} reloadTitle={textContent.integrations.reloadTitle} reload={() => loadIntegrations()} expand={expand}>
            <Table sx={{ mb: 4 }}>
                <TableHead>
                    <TableRow>
                        {Object.values(textContent.integrations.columns).map(title => (
                            <TableCell key={title}>
                                {title}
                            </TableCell>
                        ))}
                        <TableCell align="right"></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {integrations.filter(integration => integration).map((integration, index) => (
                        <Integration integration={integration} expand={expand} key={index}/>
                    ))}
                </TableBody>
            </Table>
        </CollapsibleSection>
    );
}

function Integration({ integration, expand }) {
    // Keep track of expansion state
    const [prevExpand, setPrevExpand] = useState(expand);
    const [expanded, setExpanded] = useState(false);

    // Update expansion state when expand is changed
    if(expand !== prevExpand) {
        setExpanded(expand);
        setPrevExpand(expand);
    }

    return (
        <React.Fragment key={integration.name}>
            <TableRow>
                <TableCell>{integration.name}</TableCell>
                <TableCell>{integration.category}</TableCell>
                <TableCell>
                    <Chip
                        label={integration.status}
                        color={integration.status === 'Healthy' ? 'success' : integration.status === 'Degraded' ? 'warning' : 'error'}
                        size="small"
                    />
                </TableCell>
                <TableCell>{integration.responseTime}</TableCell>
                <TableCell>{integration.lastSuccess}</TableCell>
                <TableCell>{integration.uptime}</TableCell>
                <TableCell>{integration.issue || '—'}</TableCell>
                <TableCell align="right">
                    <Button size="small" onClick={() => setExpanded(prev => !prev)}>{textContent.integrations.viewDetails}</Button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Service: {integration.name} | Category: {integration.category} | Status: {integration.status} | Response Time: {integration.responseTime} | Last Success: {integration.lastSuccess} | Uptime: {integration.uptime} | Issue: {integration.issue || '—'}
                            </Typography>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

function QuickLinksFooter({ lastCheck }) {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pb={4}>
            <Box display="flex" gap={2}>
                <Button size="small">{textContent.quickLinksFooter.statusPage}</Button>
                <Button size="small">{textContent.quickLinksFooter.sentry}</Button>
                <Button size="small">{textContent.quickLinksFooter.slack}</Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
                {`${textContent.quickLinksFooter.footerText} ${lastCheck}`}
            </Typography>
        </Box>
    );
}

// --- MAIN APP COMPONENT ---
export default function App() {
    // Last check state
    const [lastCheck, setLastCheck] = useState("never");

    // Expand all state
    const [expand, setExpand] = useState(true);

    // Sentry related states
    const [sentryIssues, setSentryIssues] = useState([]);
    const [sentryIntegrations, setSentryIntegrations] = useState([]);

    // HubSpot related states
    const [hubSpotDeals, setHubSpotDeals] = useState([]);
    const [hubSpotActivities, setHubSpotActivities] = useState([]);
    const [hubSpotIntegrations, setHubSpotIntegrations] = useState([]);

    // Load and set sentry issues
    const loadSentryIssues = async () => {
        const fetchedIssues = await api.sentry.fetchIssues();
        setSentryIssues(fetchedIssues);
        setLastCheck(new Date().toLocaleTimeString());
    }

    // Load and set sentry integrations
    const loadSentryIntegrations = async () => {
        const fetchedSentryIntegrations = await api.sentry.fetchIntegrationStatus();
        setSentryIntegrations(fetchedSentryIntegrations);
        setLastCheck(new Date().toLocaleTimeString());
    }

    // Load and set hubspot deals
    const loadHubSpotDeals = async () => {
        const fetchedHubSpotDeals = await api.hubSpot.fetchDeals();
        setHubSpotDeals(fetchedHubSpotDeals);
        setLastCheck(new Date().toLocaleTimeString());
    }

    // Load and set hubspot activities
    const loadHubSpotActivities = async () => {
        const fetchedHubSpotActivities = await api.hubSpot.fetchActivities();
        setHubSpotActivities(fetchedHubSpotActivities);
        setLastCheck(new Date().toLocaleTimeString());
    }

    // Load and set hubspot integrations
    const loadHubSpotIntegrations = async () => {
        const fetchedHubSpotIntegrations = await api.hubSpot.fetchIntegrationStatus();
        setHubSpotIntegrations(fetchedHubSpotIntegrations);
        setLastCheck(new Date().toLocaleTimeString());
    }

    // Load all data
    const loadAll = async () => {
        loadSentryIssues();
        loadSentryIntegrations();
        loadHubSpotDeals();
        loadHubSpotActivities();
        loadHubSpotIntegrations();
        setLastCheck(new Date().toLocaleTimeString());
    }

    useEffect(() => {
        loadAll();
    }, []);

    const resolveIssue = async (issueId) => {
        const issue = sentryIssues.find((issue) => issue.id === issueId);
        setSentryIssues(sentryIssues.filter((issue) => issue.id !== issueId));

        try {
            await api.sentry.updateIssueStatus(issueId, "resolved");
        } catch(err) {
            console.error("Failed to resolve issue:", err);
            alert(`Failed to resolve issue: ${err.message}`);
            setSentryIssues(sentryIssues.push(issue));
        }
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Header
                loadAll={() => loadAll()}
                expandAll={() => setExpand(prev => !prev)}
            />
            <SentrySection
                issues={sentryIssues}
                loadSentryIssues={() => loadSentryIssues()}
                sentryIntegrations={sentryIntegrations}
                loadSentryIntegrations={() => loadSentryIntegrations()}
                resolveIssue={(issueId) => resolveIssue(issueId)}
                expand={expand}
            />
            <HubSpotSection
                hubSpotDeals={hubSpotDeals}
                loadHubSpotDeals={() => loadHubSpotDeals()}
                hubSpotActivities={hubSpotActivities}
                loadHubSpotActivities={() => loadHubSpotActivities()}
                hubSpotIntegrations={hubSpotIntegrations}
                loadHubSpotIntegrations={() => loadHubSpotIntegrations()}
                expand={expand}
            />
            <QuickLinksFooter lastCheck={lastCheck}/>
        </Container>
    );
}
