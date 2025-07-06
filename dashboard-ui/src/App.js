import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import {
    Container,
    Typography,
    Box,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    Grid,
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
    Switch,
    Divider,
    TextField
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    NotificationImportant as NotifyIcon,
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowRight as ArrowRightIcon
} from '@mui/icons-material';

import {
    Popover,
    CircularProgress,
    Link
} from '@mui/material';

// --- Event Detail Popover Component ---
function EventDetailPopover({ issue, events, anchorEl, onClose }) {
    const open = Boolean(anchorEl);

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
        >
            <Box sx={{ p: 2, maxWidth: 500 }}>
                {issue && (
                    <Typography variant="h6" gutterBottom>
                        {issue.title}
                    </Typography>
                )}
                {events.length > 0 ? (
                    <List dense>
                        {/* Display details of the latest event */}
                        <ListItem>
                            <ListItemText
                                primary="Latest Event ID"
                                secondary={
                                    <Link href={`${issue.permalink}events/${events[0].id}/`} target="_blank" rel="noopener">
                                        {events[0].id}
                                    </Link>
                                }
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Message" secondary={events[0].message} />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Timestamp" secondary={new Date(events[0].dateCreated).toLocaleString()} />
                        </ListItem>
                    </List>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}
            </Box>
        </Popover>
    );
}

/**
 * A helper function to handle errors from the Sentry API.
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
 * Automatically reroutes to backend (:8000)
 */
const sentryApi = axios.create({
    baseURL: "http://localhost:8000"
})

/**
 * Fetches a list of unresolved issues for your project.
 * @returns {Promise<Array>} A promise that resolves to an array of issue objects.
 */
const fetchIssues = async () => {
    try {
        const response = await sentryApi.get("/issues");
        return response.data;
    } catch (error) {
        handleError("fetching issues", error);
    }
};

/**
 * Fetches a list of unresolved issues for your project.
 * @returns {Promise<Array>} A promise that resolves to an array of issue objects.
 */
const fetchEvents = async () => {
    try {
        const response = await sentryApi.get("/events");
        return response.data;
    } catch (error) {
        handleError("fetching events", error);
    }
};

/**
 * Updates an issue's status (e.g., to "resolved").
 * @param {string} issueId The ID of the issue to update.
 * @param {string} status The new status, e.g., "resolved" or "ignored".
 * @returns {Promise<Object>} A promise that resolves to the updated issue object.
 */
const updateIssueStatus = async (issueId, status) => {
    try {
        const response = await sentryApi.put(`/issues/${issueId}`, {status});
        return response.data;
    } catch (error) {
        handleError("updating issue status", error);
    }
};

// --- Text Variables (Sentry-only) ---
const textContent = {
    header: {
        title: 'Sentry Dashboard',
        simpleView: 'Simple View',
        technicalView: 'Technical View',
        checkNow: 'Check Now'
    },
    nonCritical: {
        heading: 'Non-Critical Services Down',
        monitoredSuffix: 'Sentry integrations monitored',
        memberImpact: 'Member Impact:',
        criticalServices: 'Critical Sentry-Tracked Services:'
    },
    systemHealth: {
        heading: 'System Health',
        overallUptime: 'Overall Uptime (30d):',
        activeAlerts: 'Active Sentry Alerts:',
        celeryQueue: 'Celery Queue:',
        lastFullCheck: 'Last Full Check:',
        recentErrors: 'Recent Errors: View All'
    },
    activeIssues: {
        heading: 'Active Issues',
        resolveIssue: 'Resolve Issue',
        viewDetails: 'View Details',
        suggestedActions: 'Suggested Actions:',
        recentErrors: 'Recent Errors:'
    },
    integrationDetails: {
        heading: 'Sentry Integration Details',
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
        heading: 'Recent Sentry Alerts',
        filter: 'Filter',
        viewAll: 'View All',
        acknowledge: 'Acknowledge',
        details: 'Details'
    },
    quickActions: {
        heading: 'Quick Actions',
        emergencyMode: 'Emergency Mode',
        maintenanceMode: 'Maintenance Mode',
        notifyMembers: 'Notify Members',
        runHealthCheck: 'Run Health Check'
    },
    memberCommunication: {
        heading: 'Member Communication',
        criticalFeatures: 'Critical Features',
        allWorking: 'All Working',
        memberFacingIssues: 'Member-Facing Issues',
        affectedSuffix: 'Affected',
        memberNotification: 'Member Notification',
        recommended: 'Recommended',
        outageMessage: 'Critical services are down. Consider notifying members about the outage.',
        composeLabel: 'Compose Notification Message',
        composePlaceholder: 'Write your message…',
        generateMessage: 'Generate Message',
        severityInfo: 'Severity: Info'
    },
    automationSettings: {
        heading: 'Automation Settings',
        autoSlack: 'Auto Slack Notifications',
        autoSlackSecondary: 'Send alerts to Slack channels from Sentry',
        autoStatusPage: 'Auto StatusPage Updates',
        autoStatusPageSecondary: 'Create incidents from Sentry errors automatically',
        sentryIntegration: 'Sentry Integration',
        sentryIntegrationSecondary: 'Sync error data with Sentry'
    },
    quickLinksFooter: {
        statusPage: 'StatusPage.io',
        sentry: 'Sentry',
        slack: 'Slack',
        footerText: 'Sentry Dashboard · All data from Sentry · Last check: 7 days ago · AU 196'
    }
};

// --- Header Bar ---
function Header({ view, onViewChange, onRefresh }) {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Typography variant="h4">{textContent.header.title}</Typography>
            <Box>
                <ToggleButtonGroup value={view} size="small" exclusive onChange={(_, v) => v && onViewChange(v)} sx={{ mr: 2 }}>
                    <ToggleButton value="simple">{textContent.header.simpleView}</ToggleButton>
                    <ToggleButton value="tech">{textContent.header.technicalView}</ToggleButton>
                </ToggleButtonGroup>
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

// --- Simple View ---
function SimpleView({ issues, onViewDetails, onResolveIssue }) {
    return (
        <>
            <CollapsibleSection title={textContent.activeIssues.heading}>
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
                            <TableRow key={issue.id}>
                                <TableCell>{issue.title}</TableCell>
                                <TableCell>
                                    <Chip label={issue.status} size="small" color={issue.status === 'unresolved' ? 'error' : 'success'} />
                                </TableCell>
                                <TableCell align="right">
                                    {issue.status === 'unresolved' && (
                                        <Button size="small" onClick={() => onResolveIssue(issue.id)}>
                                            {textContent.activeIssues.resolveIssue}
                                        </Button>
                                    )}
                                    {/* Make sure this passes the event object 'e' */}
                                    <Button size="small" startIcon={<InfoIcon />} onClick={(e) => onViewDetails(e, issue.id)}>
                                        {textContent.activeIssues.viewDetails}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CollapsibleSection>
        </>
    );
}

// --- Technical View ---
// This view still uses some placeholder data. You can adapt it to use live data.
function TechnicalView({ issues, onViewDetails, slackAuto, toggleSlack, statusAuto, toggleStatus, sentryAuto, toggleSentry }) {
    return (
        <>
            {/* These components can be adapted to use live data from new API calls */}
            <NonCriticalSection data={{ total: 0, healthy: 0, degraded: 0, down: 0, memberImpact: [], criticalServices: [] }} />
            <SystemHealthSection data={{ overallUptime: 'N/A', activeAlerts: issues.length, celeryQueue: 'N/A', lastFullCheck: 'N/A' }} />

            <ActiveIssuesSection issues={issues} onViewDetails={onViewDetails} />

            <IntegrationDetailsSection integrations={[]} />
            <RecentAlertsSection alerts={[]} />
            <QuickActionsSection />
            <MemberCommunicationSection data={{ criticalFeatures: 'N/A', memberFacingIssues: 0 }} />
            <AutomationSettingsSection
                slackAuto={slackAuto} toggleSlack={toggleSlack}
                statusAuto={statusAuto} toggleStatus={toggleStatus}
                sentryAuto={sentryAuto} toggleSentry={toggleSentry}
            />
            <QuickLinksFooter />
        </>
    );
}

// --- Section Components (largely unchanged) ---
function NonCriticalSection({ data }) {
    if (!data) return null;
    return (
        <CollapsibleSection title={textContent.nonCritical.heading}>
            <Typography>{data.total} {textContent.nonCritical.monitoredSuffix}</Typography>
            <Box display="flex" gap={2} my={2}>
                <Chip label={`${data.healthy} Healthy`} color="success" />
                <Chip label={`${data.degraded} Degraded`} color="warning" />
                <Chip label={`${data.down} Down`} color="error" />
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="subtitle2">{textContent.nonCritical.memberImpact}</Typography>
                    <List dense>{data.memberImpact.map((m,i)=><ListItem key={i}><ListItemText primary={m} /></ListItem>)}</List>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="subtitle2">{textContent.nonCritical.criticalServices}</Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">{data.criticalServices.map((s,i)=><Chip key={i} label={s} color="error" />)}</Box>
                </Grid>
            </Grid>
        </CollapsibleSection>
    );
}

function SystemHealthSection({ data }) {
    if (!data) return null;
    return (
        <CollapsibleSection title={textContent.systemHealth.heading}>
            <Grid container spacing={2} mt={1}>
                <Grid item><Typography>{textContent.systemHealth.overallUptime} <strong>{data.overallUptime}</strong></Typography></Grid>
                <Grid item><Typography>{textContent.systemHealth.activeAlerts} <strong>{data.activeAlerts}</strong></Typography></Grid>
                <Grid item><Typography>{textContent.systemHealth.celeryQueue} <strong>{data.celeryQueue}</strong></Typography></Grid>
                <Grid item><Typography>{textContent.systemHealth.lastFullCheck} <strong>{data.lastFullCheck}</strong></Typography></Grid>
                <Grid item><Button size="small">{textContent.systemHealth.recentErrors}</Button></Grid>
            </Grid>
        </CollapsibleSection>
    );
}

function ActiveIssuesSection({ issues, onViewDetails }) {
    if (!issues) return null;
    return (
        <CollapsibleSection title={textContent.activeIssues.heading}>
            <Grid container spacing={2} mb={4}>
                {issues.map(issue => (
                    <Grid item xs={12} md={6} key={issue.id}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="subtitle1">
                                        {issue.title} {issue.metadata.value && <Chip label={issue.metadata.value} size="small" />}
                                    </Typography>

                                    <Button size="small" onClick={(e) => onViewDetails(e, issue.id)}>
                                        {textContent.activeIssues.viewDetails}
                                    </Button>

                                </Box>
                                <List dense>
                                    <ListItem><ListItemText primary="Status" secondary={issue.status} /></ListItem>
                                    <ListItem><ListItemText primary="First Seen" secondary={new Date(issue.firstSeen).toLocaleString()} /></ListItem>
                                    <ListItem><ListItemText primary="Assignee" secondary={issue.assignedTo ? issue.assignedTo.name : 'Unassigned'} /></ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </CollapsibleSection>
    );
}

function IntegrationDetailsSection({ integrations }) {
    if (!integrations) return null;
    return (
        <CollapsibleSection title={textContent.integrationDetails.heading}>
            {integrations.length === 0 ? <Typography>No integration data.</Typography> :
                <Table sx={{ mb: 4 }}>
                    <TableHead>
                        <TableRow>
                            {Object.values(textContent.integrationDetails.columns).map(col => (
                                <TableCell key={col}>{col}</TableCell>
                            ))}
                            <TableCell align="right"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {integrations.map(i => (
                            <TableRow key={i.name}>
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
                                    <Button size="small">{textContent.integrationDetails.viewDetails}</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>}
        </CollapsibleSection>
    );
}

function RecentAlertsSection({ alerts }) {
    if (!alerts) return null;
    return (
        <CollapsibleSection title={textContent.recentAlerts.heading}>
            <Box mb={2} display="flex" justifyContent="flex-end" alignItems="center">
                <Button size="small">{textContent.recentAlerts.filter}</Button>
                <Button size="small">{textContent.recentAlerts.viewAll}</Button>
            </Box>
            {alerts.length === 0 ? <Typography>No recent alerts.</Typography> :
                <List>
                    {alerts.map((a, i) => (
                        <ListItem
                            key={i}
                            secondaryAction={
                                <Box>
                                    <Button size="small">{textContent.recentAlerts.acknowledge}</Button>
                                    <Button size="small">{textContent.recentAlerts.details}</Button>
                                </Box>
                            }
                        >
                            {a.severity === 'Warning'
                                ? <WarningIcon color="warning" sx={{ mr: 1 }} />
                                : <ErrorIcon color="error" sx={{ mr: 1 }} />
                            }
                            <ListItemText
                                primary={a.message}
                                secondary={`${a.time} — ${a.details}`}
                            />
                        </ListItem>
                    ))}
                </List>}
        </CollapsibleSection>
    );
}

function QuickActionsSection() {
    return (
        <CollapsibleSection title={textContent.quickActions.heading}>
            <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                <Button variant="contained" color="error">{textContent.quickActions.emergencyMode}</Button>
                <Button variant="contained">{textContent.quickActions.maintenanceMode}</Button>
                <Button variant="outlined" startIcon={<NotifyIcon />}>{textContent.quickActions.notifyMembers}</Button>
                <Button variant="outlined" startIcon={<RefreshIcon />}>{textContent.quickActions.runHealthCheck}</Button>
            </Box>
        </CollapsibleSection>
    );
}

function MemberCommunicationSection({ data }) {
    if (!data) return null;
    return (
        <CollapsibleSection title={textContent.memberCommunication.heading}>
            <List dense>
                <ListItem>
                    <ListItemText
                        primary={textContent.memberCommunication.criticalFeatures}
                        secondary={data.criticalFeatures}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={textContent.memberCommunication.memberFacingIssues}
                        secondary={`${data.memberFacingIssues} ${textContent.memberCommunication.affectedSuffix}`}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={textContent.memberCommunication.memberNotification}
                        secondary={textContent.memberCommunication.recommended}
                    />
                </ListItem>
            </List>
            <Typography color="error" gutterBottom>
                {textContent.memberCommunication.outageMessage}
            </Typography>
            <TextField
                fullWidth
                multiline
                rows={3}
                label={textContent.memberCommunication.composeLabel}
                placeholder={textContent.memberCommunication.composePlaceholder}
            />
            <Box mt={2}>
                <Button variant="contained">
                    {textContent.memberCommunication.generateMessage}
                </Button>
                <Chip
                    label={textContent.memberCommunication.severityInfo}
                    sx={{ ml: 2 }}
                />
            </Box>
        </CollapsibleSection>
    );
}

function AutomationSettingsSection({
                                       slackAuto, toggleSlack,
                                       statusAuto, toggleStatus,
                                       sentryAuto, toggleSentry
                                   }) {
    return (
        <CollapsibleSection title={textContent.automationSettings.heading}>
            <List>
                <ListItem>
                    <ListItemText
                        primary={textContent.automationSettings.autoSlack}
                        secondary={textContent.automationSettings.autoSlackSecondary}
                    />
                    <Switch checked={slackAuto} onChange={toggleSlack} />
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText
                        primary={textContent.automationSettings.autoStatusPage}
                        secondary={textContent.automationSettings.autoStatusPageSecondary}
                    />
                    <Switch checked={statusAuto} onChange={toggleStatus} />
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText
                        primary={textContent.automationSettings.sentryIntegration}
                        secondary={textContent.automationSettings.sentryIntegrationSecondary}
                    />
                    <Switch checked={sentryAuto} onChange={toggleSentry} />
                </ListItem>
            </List>
        </CollapsibleSection>
    );
}

function QuickLinksFooter() {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} pb={4}>
            <Box display="flex" gap={2}>
                <Button size="small">{textContent.quickLinksFooter.statusPage}</Button>
                <Button size="small">{textContent.quickLinksFooter.sentry}</Button>
                <Button size="small">{textContent.quickLinksFooter.slack}</Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
                {textContent.quickLinksFooter.footerText}
            </Typography>
        </Box>
    );
}

// --- MAIN APP COMPONENT ---
export default function App() {
    const [view, setView] = useState('simple');

    // State for automation toggles
    const [slackAuto, setSlackAuto] = useState(true);
    const [statusAuto, setStatusAuto] = useState(false);
    const [sentryAuto, setSentryAuto] = useState(true);

    // State for live Sentry data, loading, and errors
    const [issues, setIssues] = useState([]);
    const [events, setEvents] = useState([]); // Currently unused, but ready for expansion
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Inside the App component, add these lines
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to fetch data from Sentry
    const loadData = async () => {
        try {
            setLoading(true);
            const fetchedIssues = await fetchIssues();
            setIssues(fetchedIssues);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch Sentry issues:", err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when the component first mounts
    useEffect(() => {
        loadData();
    }, []); // Empty dependency array ensures this runs only once

    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverData, setPopoverData] = useState({ issue: null, events: [] });

    /**
     * Fetches a list of individual events for a specific issue.
     * @param {string} issueId The ID of the issue to fetch events for.
     * @returns {Promise<Array>} A promise that resolves to an array of event objects.
     */
    const fetchEventsForIssue = async (issueId) => {
        axios(`http://localhost:8000/issues/${issueId}/events`)
        .then((response) => response.data)
        .catch((error) => {
            handleError("fetching events for issue", error);
            return {};
        });
    };

    const handleViewDetails = async (event, issueId) => {
        // 1. Set the anchor element to the button that was clicked
        setAnchorEl(event.currentTarget);

        const issue = issues.find(iss => iss.id === issueId);
        // 2. Set initial data to show a loading state in the popover
        setPopoverData({ issue, events: [] });

        try {
            // 3. Fetch the event data from the Sentry API
            const fetchedEvents = await fetchEventsForIssue(issueId);
            // 4. Update the popover with the complete data
            setPopoverData({ issue, events: fetchedEvents });
        } catch (err) {
            console.error("Could not fetch events for issue:", err);
            // You could set an error message in the popoverData state here
        }
    };

    // Add a handler to close the popover
    const handleClosePopover = () => {
        setAnchorEl(null);
    };

    // Handler to resolve an issue using the API
    const handleResolveIssue = async (issueId) => {
        try {
            // Immediately update the UI for a better user experience (optimistic update)
            setIssues(prevIssues => prevIssues.filter(issue => issue.id !== issueId));

            // Make the API call to resolve the issue
            await updateIssueStatus(issueId, 'resolved');

        } catch (err) {
            console.error("Failed to resolve issue:", err);
            // If the API call fails, we should revert the UI change by refetching the data
            loadData();
            alert(`Failed to resolve issue: ${err.message}`);
        }
    };

    // Render loading or error states
    if (loading) {
        return <Container sx={{ py: 4 }}><Typography variant="h5">Loading Sentry Data...</Typography></Container>;
    }

    if (error) {
        return <Container sx={{ py: 4 }}><Typography color="error">Error fetching data: {error}</Typography></Container>;
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Header
                view={view}
                onViewChange={setView}
                onRefresh={loadData}
            />

            {/* 1. Render the Popover component here, passing in the necessary state */}
            <EventDetailPopover
                issue={popoverData.issue}
                events={popoverData.events}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
            />

            {view === 'simple' ? (
                <SimpleView
                    issues={issues}
                    // 2. The 'events' prop is no longer needed here
                    onViewDetails={handleViewDetails}
                    onResolveIssue={handleResolveIssue}
                />
            ) : (
                <TechnicalView
                    issues={issues}
                    onViewDetails={handleViewDetails}
                    slackAuto={slackAuto}
                    toggleSlack={() => setSlackAuto(!slackAuto)}
                    statusAuto={statusAuto}
                    toggleStatus={() => setStatusAuto(!statusAuto)}
                    sentryAuto={sentryAuto}
                    toggleSentry={() => setSentryAuto(!sentryAuto)}
                />
            )}
        </Container>
    );
}
