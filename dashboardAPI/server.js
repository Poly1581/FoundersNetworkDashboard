const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Received ${req.method} ${req.path}`);
    next();
});

// Mock data
const mockIssues = [
    {
        id: '12345',
        title: 'TypeError in user authentication module',
        status: 'unresolved',
        level: 'error',
        lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        culprit: 'auth/login.js in authenticate',
        shortId: 'AUTH-001',
        permalink: 'https://sentry.io/organizations/founders-network/issues/'
    },
    {
        id: '54321',
        title: 'Database connection timeout',
        status: 'unresolved',
        level: 'error',
        lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        culprit: 'db/connection.js in connect',
        shortId: 'DB-002',
        permalink: 'https://sentry.io/organizations/founders-network/issues/'
    },
    {
        id: '67890',
        title: 'API rate limit exceeded',
        status: 'unresolved',
        level: 'warning',
        lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        culprit: 'api/middleware.js in rateLimiter',
        shortId: 'API-003',
        permalink: 'https://sentry.io/organizations/founders-network/issues/'
    }
];

const mockEvents = {
    '12345': [
        {
            id: 'evt-001',
            message: 'Cannot read property "email" of undefined',
            dateCreated: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        }
    ],
    '54321': [
        {
            id: 'evt-002',
            message: 'Connection timeout after 30000ms',
            dateCreated: new Date(Date.now() - 1000 * 60 * 15).toISOString()
        }
    ],
    '67890': [
        {
            id: 'evt-003',
            message: 'Rate limit of 100 requests per minute exceeded',
            dateCreated: new Date(Date.now() - 1000 * 60 * 5).toISOString()
        }
    ]
};

const mockIntegrations = [
    {
        name: 'Sentry Error Tracking',
        category: 'Monitoring',
        status: 'Healthy',
        responseTime: '45ms',
        lastSuccess: '2 minutes ago',
        uptime: '99.9%',
        issue: '3'
    },
    {
        name: 'Database Connection',
        category: 'Infrastructure',
        status: 'Degraded',
        responseTime: '120ms',
        lastSuccess: '5 minutes ago',
        uptime: '98.5%',
        issue: '12'
    },
    {
        name: 'External API',
        category: 'Integration',
        status: 'Down',
        responseTime: 'Timeout',
        lastSuccess: '1 hour ago',
        uptime: '95.2%',
        issue: '45'
    }
];

// API Routes
app.get('/api/sentry/issues', (req, res) => {
    res.json(mockIssues);
});

app.get('/api/sentry/issues/:id/events', (req, res) => {
    const issueId = req.params.id;
    const events = mockEvents[issueId] || [];
    res.json(events);
});

app.get('/api/sentry/integration-status', (req, res) => {
    // Calculate errors per minute
    const errorsPerMinute = Math.floor(Math.random() * 5) + 1;
    console.log(`Calculated ${errorsPerMinute} errors in the last minute`);

    res.json(mockIntegrations);
});

app.put('/api/sentry/issues/:id', (req, res) => {
    const issueId = req.params.id;
    const { status } = req.body;

    console.log(`[${new Date().toISOString()}] Updating issue ${issueId} to status: ${status}`);

    // Find and update the issue
    const issue = mockIssues.find(i => i.id === issueId);
    if (issue) {
        issue.status = status;
        res.json(issue);
    } else {
        res.status(404).json({ error: 'Issue not found' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`Dashboard API server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});