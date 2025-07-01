// mockData.js

export const mockSettings = {
    slackAuto: true,       // Send Sentry alerts to Slack
    statusAuto: false,     // Auto-update StatusPage from Sentry issues
    sentryAuto: true       // Sentry integration is enabled
};

export const mockDashboardData = {
    nonCritical: {
        total: 3,
        healthy: 1,
        degraded: 1,
        down: 1,
        memberImpact: [
            'Increased login failures reported via Sentry.',
            'Intermittent delays during checkout identified in Sentry traces.'
        ],
        criticalServices: [
            'User Authentication (tracked by Sentry)',
            'Checkout Workflow (monitored by Sentry)'
        ]
    },

    systemHealth: {
        overallUptime: '99.2%',
        activeAlerts: 8,
        celeryQueue: '120 jobs',
        lastFullCheck: 'about 20 hours ago'
    },

    activeIssues: [
        {
            id: '1001',
            title: 'Authentication Timeout',
            priority: 'High',
            status: 'degraded',
            downSince: 'about 20 hours ago',
            errorCount: 120,
            rootCause: 'Sentry reports DB replication lag',
            suggested: [
                'Review Sentry transaction traces for slow queries',
                'Scale out authentication database (as flagged by Sentry)'
            ],
            recentErrors: [
                'Timeout at 15:02 (Sentry event)',
                'Timeout at 14:58 (Sentry event)'
            ]
        },
        {
            id: '1002',
            title: 'Sentry API Rate Limited',
            priority: 'Medium',
            status: 'unresolved',
            downSince: 'about 1 day ago',
            errorCount: 45,
            rootCause: 'Frequent burst events from frontend (seen in Sentry)',
            suggested: [
                'Throttle Sentry SDK on frontend',
                'Check Sentry usage quota'
            ],
            recentErrors: [
                '429 Too Many Requests at 11:34',
                'Timeout at 10:47'
            ]
        }
    ],

    integrations: [
        {
            name: 'Sentry Core',
            category: 'Error Monitoring',
            status: 'Degraded',
            responseTime: '450 ms',
            lastSuccess: 'about 2 hours ago',
            uptime: '98.3%',
            issue: 'Delayed event logging'
        },
        {
            name: 'User Microservice',
            category: 'Microservice',
            status: 'Healthy',
            responseTime: '120 ms',
            lastSuccess: 'about 1 hour ago',
            uptime: '99.9%',
            issue: ''
        }
    ],

    recentAlerts: [
        {
            severity: 'Warning',
            message: 'High memory usage (Sentry alert)',
            time: 'about 3 hours ago',
            details: 'Worker #4 at 92% RAM (reported by Sentry)'
        },
        {
            severity: 'Error',
            message: 'Failed to send error event (Sentry)',
            time: 'about 1 hour ago',
            details: '429 Too Many Requests from Sentry API'
        }
    ],

    memberCommunication: {
        criticalFeatures: 'Authentication, Checkout',
        memberFacingIssues: 2
    }
};