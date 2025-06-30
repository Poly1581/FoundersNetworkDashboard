import React, { useState, useEffect } from 'react';
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
    Switch,
    Divider,
    TextField,
    IconButton,
    Collapse
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    NotificationImportant as NotifyIcon,
    KeyboardArrowDown as ArrowDownIcon,
    KeyboardArrowRight as ArrowRightIcon
} from '@mui/icons-material';

// --- Text Variables (replaceable via API) ---
const textContent = {
    header: {
        title: 'Platform Status',
        subtitle: "Is the platform working? What's broken?",
        simpleView: 'Simple View',
        technicalView: 'Technical View',
        checkNow: 'Check Now'
    },
    nonCritical: {
        heading: 'Non-Critical Services Down',
        monitoredSuffix: 'integrations monitored',
        memberImpact: 'Member Impact:',
        criticalServices: 'Critical Services:'
    },
    activeIssues: {
        heading: 'Active Issues Requiring Attention',
        fixIssue: 'Fix Issue',
        suggestedActions: 'Suggested Actions:',
        recentErrors: 'Recent Errors:'
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
    quickActions: {
        heading: 'Quick Actions',
        emergencyMode: 'Emergency Mode',
        maintenanceMode: 'Maintenance Mode',
        notifyMembers: 'Notify Members',
        runHealthCheck: 'Run Health Check'
    },
    systemHealth: {
        heading: 'System Health',
        overallUptime: 'Overall Uptime (30d):',
        activeAlerts: 'Active Alerts:',
        celeryQueue: 'Celery Queue:',
        lastFullCheck: 'Last Full Check:',
        recentErrors: 'Recent Errors: View All'
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
        autoSlackSecondary: 'Send alerts to team Slack channels',
        autoStatusPage: 'Auto StatusPage Updates',
        autoStatusPageSecondary: 'Create incidents on status page automatically',
        sentryIntegration: 'Sentry Integration',
        sentryIntegrationSecondary: 'Sync error data with Sentry'
    },
    quickLinksFooter: {
        statusPage: 'StatusPage.io',
        sentry: 'Sentry',
        slack: 'Slack',
        footerText: 'Observability Dashboard · Services Down · Admin User · Last check: 7 days ago · AU 196'
    }
};

// --- Header Bar (NOT collapsible) ---
function Header({ view, onViewChange }) {
    return (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
            <Box>
                <Typography variant="h4">{textContent.header.title}</Typography>
                <Typography color="text.secondary">{textContent.header.subtitle}</Typography>
            </Box>
            <Box>
                <ToggleButtonGroup
                    value={view}
                    size="small"
                    exclusive
                    onChange={(_, v) => v && onViewChange(v)}
                    sx={{ mr: 2 }}
                >
                    <ToggleButton value="simple">{textContent.header.simpleView}</ToggleButton>
                    <ToggleButton value="tech">{textContent.header.technicalView}</ToggleButton>
                </ToggleButtonGroup>
                <Button variant="outlined" startIcon={<RefreshIcon />} sx={{ mr: 1 }}>
                    {textContent.header.checkNow}
                </Button>
                <IconButton><SettingsIcon /></IconButton>
            </Box>
        </Box>
    );
}

// --- Collapsible Card Wrapper ---
function CollapsibleCard({ title, children, defaultOpen = true, sx = {}, noCard = false }) {
    const [open, setOpen] = useState(defaultOpen);
    const CardWrap = noCard ? React.Fragment : Card;
    return (
        <CardWrap {...(noCard ? {} : { sx: { mb: 4, ...sx } })}>
            <Box display="flex" alignItems="center" justifyContent="space-between"
                 sx={noCard ? { mb: 1 } : { p: 2, pb: 0 }}>
                <Typography variant="h6">{title}</Typography>
                <IconButton
                    onClick={() => setOpen(o => !o)}
                    size="small"
                    aria-label={open ? "Collapse section" : "Expand section"}
                >
                    {open ? <ArrowDownIcon /> : <ArrowRightIcon />}
                </IconButton>
            </Box>
            <Collapse in={open} timeout="auto" unmountOnExit>
                {noCard ? children : <CardContent>{children}</CardContent>}
            </Collapse>
        </CardWrap>
    );
}

// --- Simple View Component ---
function SimpleView({ data, slackAuto, toggleSlack, statusAuto, toggleStatus, sentryAuto, toggleSentry }) {
    const { nonCritical, integrations, memberCommunication } = data;

    return (
        <>
            {/* Overview */}
            <CollapsibleCard title="Overview">
                <Typography>Some systems are down</Typography>
                <Typography>Some features may not work</Typography>
                <Box mt={2}>
                    <Button variant="contained" startIcon={<NotifyIcon />}>
                        Notify Members
                    </Button>
                </Box>
                <Typography mt={2}>Expected fix time: 1-4 hours (non-critical)</Typography>
            </CollapsibleCard>

            {/* What Members Are Experiencing */}
            <CollapsibleCard title="What Members Are Experiencing">
                <List dense>
                    {nonCritical?.memberImpact?.map((m, i) => (
                        <ListItem key={i}>
                            <ListItemText primary={m} />
                        </ListItem>
                    ))}
                </List>
            </CollapsibleCard>

            {/* System Status (Simple) */}
            <CollapsibleCard title="System Status (Simple View)">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Service</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {integrations.map(i => (
                            <TableRow key={i.name}>
                                <TableCell>{i.name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={i.status}
                                        size="small"
                                        color={
                                            i.status === 'Healthy'
                                                ? 'success'
                                                : i.status === 'Degraded'
                                                    ? 'warning'
                                                    : 'error'
                                        }
                                    />
                                </TableCell>
                                <TableCell>
                                    {i.status !== 'Healthy' && (
                                        <>
                                            Issue started: <strong>{i.lastSuccess}</strong>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CollapsibleCard>

            {/* What To Do */}
            <CollapsibleCard title="What To Do">
                <List dense>
                    <ListItem>
                        <ListItemText
                            primary="Contact Developer"
                            secondary="For urgent technical issues"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Notify Members"
                            secondary="Send update about service issues"
                        />
                    </ListItem>
                </List>
            </CollapsibleCard>

            {/* Member Communication */}
            <MemberCommunicationSection data={memberCommunication} />

            {/* Automation & Quick Links */}
            <AutomationSettingsSection
                slackAuto={slackAuto} toggleSlack={toggleSlack}
                statusAuto={statusAuto} toggleStatus={toggleStatus}
                sentryAuto={sentryAuto} toggleSentry={toggleSentry}
            />
            <QuickLinksFooter />
        </>
    );
}

// --- Technical Sections ---
function NonCriticalSection({ data }) {
    if (!data) return null;
    return (
        <CollapsibleCard title={textContent.nonCritical.heading}>
            <Typography>
                {data.total} {textContent.nonCritical.monitoredSuffix}
            </Typography>
            <Box display="flex" gap={2} my={2}>
                <Chip label={`${data.healthy} Healthy`} color="success" />
                <Chip label={`${data.degraded} Degraded`} color="warning" />
                <Chip label={`${data.down} Down`} color="error" />
            </Box>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography variant="subtitle2">
                        {textContent.nonCritical.memberImpact}
                    </Typography>
                    <List dense>
                        {(data.memberImpact || []).map((m, i) => (
                            <ListItem key={i}>
                                <ListItemText primary={m} />
                            </ListItem>
                        ))}
                    </List>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="subtitle2">
                        {textContent.nonCritical.criticalServices}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        {(data.criticalServices || []).map(s => (
                            <Chip key={s} label={s} color="error" />
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </CollapsibleCard>
    );
}

function SystemHealthSection({ data }) {
    if (!data) return null;
    return (
        <CollapsibleCard title={textContent.systemHealth.heading}>
            <Grid container spacing={2} mt={1}>
                <Grid item>
                    <Typography>
                        {textContent.systemHealth.overallUptime}{' '}
                        <strong>{data.overallUptime}</strong>
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography>
                        {textContent.systemHealth.activeAlerts}{' '}
                        <strong>{data.activeAlerts}</strong>
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography>
                        {textContent.systemHealth.celeryQueue}{' '}
                        <strong>{data.celeryQueue}</strong>
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography>
                        {textContent.systemHealth.lastFullCheck}{' '}
                        <strong>{data.lastFullCheck}</strong>
                    </Typography>
                </Grid>
                <Grid item>
                    <Button size="small">
                        {textContent.systemHealth.recentErrors}
                    </Button>
                </Grid>
            </Grid>
        </CollapsibleCard>
    );
}

function ActiveIssuesSection({ issues }) {
    if (!issues) return null;
    return (
        <CollapsibleCard title={textContent.activeIssues.heading}>
            <Grid container spacing={2} mb={4}>
                {issues.map(issue => (
                    <Grid item xs={12} md={6} key={issue.name}>
                        <Card variant="outlined">
                            <CardContent>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="subtitle1">
                                        {issue.name}{' '}
                                        <Chip label={issue.priority} size="small" />
                                    </Typography>
                                    <Button size="small">
                                        {textContent.activeIssues.fixIssue}
                                    </Button>
                                </Box>
                                <List dense>
                                    <ListItem>
                                        <ListItemText
                                            primary="Status"
                                            secondary={issue.status}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Down Since"
                                            secondary={issue.downSince}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText
                                            primary="Error Count"
                                            secondary={issue.errorCount}
                                        />
                                    </ListItem>
                                    {issue.rootCause && (
                                        <ListItem>
                                            <ListItemText
                                                primary="Root Cause"
                                                secondary={issue.rootCause}
                                            />
                                        </ListItem>
                                    )}
                                </List>
                                <Typography variant="subtitle2">
                                    {textContent.activeIssues.suggestedActions}
                                </Typography>
                                <List dense>
                                    {(issue.suggested || []).map((a, i) => (
                                        <ListItem key={i}>
                                            <ListItemText primary={a} />
                                        </ListItem>
                                    ))}
                                </List>
                                {issue.recentErrors && (
                                    <>
                                        <Typography variant="subtitle2">
                                            {textContent.activeIssues.recentErrors}
                                        </Typography>
                                        <List dense>
                                            {issue.recentErrors.map((e, i) => (
                                                <ListItem key={i}>
                                                    <ListItemText primary={e} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </CollapsibleCard>
    );
}

function IntegrationDetailsSection({ integrations }) {
    if (!integrations) return null;
    return (
        <CollapsibleCard title={textContent.integrationDetails.heading}>
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
                                    color={
                                        i.status === 'Healthy'
                                            ? 'success'
                                            : i.status === 'Degraded'
                                                ? 'warning'
                                                : 'error'
                                    }
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>{i.responseTime}</TableCell>
                            <TableCell>{i.lastSuccess}</TableCell>
                            <TableCell>{i.uptime}</TableCell>
                            <TableCell>{i.issue || '—'}</TableCell>
                            <TableCell align="right">
                                <Button size="small">
                                    {textContent.integrationDetails.viewDetails}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CollapsibleCard>
    );
}

function RecentAlertsSection({ alerts }) {
    if (!alerts) return null;
    return (
        <CollapsibleCard title={textContent.recentAlerts.heading}>
            <Box mb={2} display="flex" justifyContent="flex-end" alignItems="center">
                <Button size="small">{textContent.recentAlerts.filter}</Button>
                <Button size="small">{textContent.recentAlerts.viewAll}</Button>
            </Box>
            <List>
                {alerts.map((a, i) => (
                    <ListItem
                        key={i}
                        secondaryAction={
                            <Box>
                                <Button size="small">
                                    {textContent.recentAlerts.acknowledge}
                                </Button>
                                <Button size="small">
                                    {textContent.recentAlerts.details}
                                </Button>
                            </Box>
                        }
                    >
                        {a.severity === 'Warning' ? (
                            <WarningIcon color="warning" sx={{ mr: 1 }} />
                        ) : (
                            <ErrorIcon color="error" sx={{ mr: 1 }} />
                        )}
                        <ListItemText
                            primary={a.message}
                            secondary={`${a.time} — ${a.details}`}
                        />
                    </ListItem>
                ))}
            </List>
        </CollapsibleCard>
    );
}

function QuickActionsSection() {
    return (
        <CollapsibleCard title={textContent.quickActions.heading}>
            <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                <Button variant="contained" color="error">
                    {textContent.quickActions.emergencyMode}
                </Button>
                <Button variant="contained">
                    {textContent.quickActions.maintenanceMode}
                </Button>
                <Button variant="outlined" startIcon={<NotifyIcon />}>
                    {textContent.quickActions.notifyMembers}
                </Button>
                <Button variant="outlined" startIcon={<RefreshIcon />}>
                    {textContent.quickActions.runHealthCheck}
                </Button>
            </Box>
        </CollapsibleCard>
    );
}

function MemberCommunicationSection({ data }) {
    if (!data) return null;
    return (
        <CollapsibleCard title={textContent.memberCommunication.heading}>
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
            <Typography color="error" paragraph>
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
        </CollapsibleCard>
    );
}

function AutomationSettingsSection({
                                       slackAuto,
                                       toggleSlack,
                                       statusAuto,
                                       toggleStatus,
                                       sentryAuto,
                                       toggleSentry
                                   }) {
    return (
        <CollapsibleCard title={textContent.automationSettings.heading}>
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
        </CollapsibleCard>
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

// --- Main Component ---
export default function App() {
    const [view, setView] = useState('simple');
    const [slackAuto, setSlackAuto] = useState(true);
    const [statusAuto, setStatusAuto] = useState(false);
    const [sentryAuto, setSentryAuto] = useState(true);

    // Unified state for all dashboard data, initially empty
    const [dashboardData, setDashboardData] = useState({
        nonCritical: null,
        systemHealth: null,
        activeIssues: [],
        integrations: [],
        recentAlerts: [],
        memberCommunication: null,
    });

    // Example: modular fetch function (replace with your real APIs)
    async function fetchDashboardData() {
        // Simulate fetching (replace with actual API calls)
        const data = {
            nonCritical: {
                total: 4,
                healthy: 2,
                degraded: 1,
                down: 1,
                memberImpact: ['Member data sync paused', 'Payment processing delays'],
                criticalServices: ['Stripe', 'Mailgun']
            },
            systemHealth: {
                overallUptime: '50.0%',
                activeAlerts: 196,
                celeryQueue: '988 jobs',
                lastFullCheck: '7 days ago'
            },
            activeIssues: [
                {
                    name: 'Database Latency',
                    priority: 'High',
                    status: 'Degraded',
                    downSince: '2 hours ago',
                    errorCount: 120,
                    rootCause: 'Connection pool exhaustion',
                    suggested: ['Increase pool size', 'Investigate recent deployments'],
                    recentErrors: ['Timeout Error at 12:01', 'Connection refused at 11:58']
                }
            ],
            integrations: [
                {
                    name: 'Stripe',
                    category: 'Payments',
                    status: 'Healthy',
                    responseTime: '120ms',
                    lastSuccess: '5m ago',
                    uptime: '99.9%',
                    issue: ''
                },
                {
                    name: 'Mailgun',
                    category: 'Email',
                    status: 'Degraded',
                    responseTime: '250ms',
                    lastSuccess: '2m ago',
                    uptime: '98.7%',
                    issue: 'Delayed responses'
                }
            ],
            recentAlerts: [
                {
                    severity: 'Warning',
                    message: 'High memory usage detected',
                    time: '10m ago',
                    details: 'Node 3 memory at 85%'
                },
                {
                    severity: 'Error',
                    message: 'Failed health check on API',
                    time: '30m ago',
                    details: '500 Internal Server Error'
                }
            ],
            memberCommunication: {
                criticalFeatures: 'All Working',
                memberFacingIssues: 1,
            }
        };
        setDashboardData(data);
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Header view={view} onViewChange={setView} />
            {view === 'simple' ? (
                <SimpleView
                    data={dashboardData}
                    slackAuto={slackAuto}
                    toggleSlack={() => setSlackAuto(!slackAuto)}
                    statusAuto={statusAuto}
                    toggleStatus={() => setStatusAuto(!statusAuto)}
                    sentryAuto={sentryAuto}
                    toggleSentry={() => setSentryAuto(!sentryAuto)}
                />
            ) : (
                <>
                    <NonCriticalSection data={dashboardData.nonCritical} />
                    <SystemHealthSection data={dashboardData.systemHealth} />
                    <ActiveIssuesSection issues={dashboardData.activeIssues} />
                    <IntegrationDetailsSection integrations={dashboardData.integrations} />
                    <RecentAlertsSection alerts={dashboardData.recentAlerts} />
                    <QuickActionsSection />
                    <MemberCommunicationSection data={dashboardData.memberCommunication} />
                    <AutomationSettingsSection
                        slackAuto={slackAuto}
                        toggleSlack={() => setSlackAuto(!slackAuto)}
                        statusAuto={statusAuto}
                        toggleStatus={() => setStatusAuto(!statusAuto)}
                        sentryAuto={sentryAuto}
                        toggleSentry={() => setSentryAuto(!sentryAuto)}
                    />
                    <QuickLinksFooter />
                </>
            )}
        </Container>
    );
}