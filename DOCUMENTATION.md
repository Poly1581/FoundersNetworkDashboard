# Founders Network Dashboard Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Usage Guide](#usage-guide)
6. [API Reference](#api-reference)
7. [Testing Framework](#testing)

## Overview

The Founders Network Health Dashboard is a centralized platform observability tool designed to provide real-time visibility into FN's critical integrations before they impact members. This dashboard monitors API endpoints, displays pertinent and helpful error information, and detects error patterns specific to FN's platform, and can be made admin-only when inserted into the FN codebase.

### Core Design Principles
- **Real-time Internal Monitoring**: Provides immediate visibility into integration health
- **Automatic Problem Detection**: Health checks automatically detect issues
- **API Endpoint Monitoring**: Monitors actual API endpoints, and FN can easily link their own APIs to be monitored
- **Performance Tracking**: Tracks response times and error patterns
- **Integration-Specific**: Customized for FN's specific integrations (Sentry, Mailgun, etc.)

### Current Integrations
- **Sentry**: Error tracking and monitoring
- **Mailgun**: Email service monitoring

## Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (Django)      │◄──►│   APIs          │
│   Port: 3000    │    │   Port: 8000    │    │                 │
└─────────────────┘    └─────────────────┘    │  ┌─────────────┐│
                                              │  │   Sentry    ││
                                              │  └─────────────┘│
                                              │  ┌─────────────┐│
                                              │  │   Mailgun   ││
                                              │  └─────────────┘│
                                              └─────────────────┘
```

### Frontend Architecture
- **Framework**: React 18 with Material-UI
- **State Management**: React Context API with useReducer
- **Key Components**:
  - `App.js`: Main application container
  - `Overview.js`: Dashboard overview with charts
  - `LiveData.js`: Real-time data display
  - `SentrySection.js`: Sentry-specific monitoring
  - `MailgunSection.js`: Mailgun-specific monitoring
  - `UnifiedStackedBarChart.js`: Data visualization

### Backend Architecture
- **Framework**: Django 5.2 with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production)
- **Key Modules**: `views.py`: Main API endpoints
  - `sentry_views.py`: Sentry-specific endpoints
  - `mailgun_views.py`: Mailgun-specific endpoints
  - `integration_views.py`: Integration health checks
  - `helpers.py`: Utility functions

### Data Flow
1. **Data Collection**: Backend polls external APIs (Sentry, Mailgun)
2. **Data Processing**: Raw data is filtered and transformed
3. **Caching**: Responses are cached for performance (5-15 minutes)
4. **Frontend Display**: React components render processed data
5. **Real-time Updates**: Manual refresh or automatic polling

## Installation & Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.14+ (for local development)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FoundersNetworkDashboard
   ```

2. **Create environment file**
    Create an `.env` file in the `dashboardAPI` subdirectory with the following variables:

```bash
# Sentry Configuration
SENTRY_ORGANIZATION_SLUG=your_sentry_organization_slug
SENTRY_PROJECT_ID=your_sentry_project_id
SENTRY_BEARER_AUTH=your_sentry_bearer_token

# Mailgun Configuration
MAILGUN_API_NAME=your_mailgun_api_name
MAILGUN_API_KEY=your_mailgun_api_key

# Django Configuration
DEBUG=True
```

3. **Start the application**
   ```bash
   ./rebuild.sh
   ```

4. **Access the dashboard**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Development Setup
In the case that the rebuild script does not work correctly, development can be done manually. Note that this method will install **a lot** of requirements locally, and should only really be done in case the docker development method does not work.

1. **Backend Development**
   ```bash
   cd dashboardAPI
   pip install -r requirements.txt
   python manage.py runserver
   ```

2. **Frontend Development**
   ```bash
   cd dashboard-ui
   npm install
   npm start
   ```

## Configuration

### Getting Credentials

#### Sentry Setup
1. **Organization Slug**: Found in your Sentry organization URL
   - Example: `https://sentry.io/organizations/your-org-slug/`
2. **Project ID**: Found in project settings
   - Navigate to Project Settings → General
3. **Bearer Token**: Create an API token
   - Go to Settings → Developer Settings → New Internal Integration
   - Grant appropriate permissions (project:read, event:read)

#### Mailgun Setup
1. **API Name**: Your verified domain name
   - Found in Mailgun dashboard under Domains
2. **API Key**: Your Mailgun API key
   - Found in Settings → API Keys

### Docker Configuration
The application uses Docker Compose for containerization, which is configured in [compose.yml](compose.yml).

## Usage Guide

### Dashboard Navigation

#### Overview Page
- **Integration Status**: Real-time health of all integrations
- **API Errors Chart**: Visual representation of errors over time
- **Time Range Filter**: Select 1 day, 7 days, 30 days, or 90 days
- **Interactive Chart**: Click error types to filter, double-click to investigate

#### Live Data Page
- **Sentry Section**: Active issues, integration details, recent alerts
- **Mailgun Section**: Email statistics, domain status, recent events
- **Real-time Filtering**: Filter by time range and data type
- **Issue Management**: Resolve issues directly from the dashboard

### Key Features

#### Real-time Monitoring
- **Health Checks**: Automatic monitoring of API endpoints
- **Response Time Tracking**: Monitor API performance
- **Error Detection**: Automatic detection of integration issues
- **Alert System**: Real-time alerts for critical issues

#### Data Visualization
- **Stacked Bar Charts**: Show error trends over time
- **Integration Status Cards**: Quick health overview
- **Detailed Tables**: Comprehensive data views
- **Interactive Filters**: Dynamic data filtering

#### Issue Management
- **Issue Resolution**: Mark issues as resolved
- **Status Updates**: Update issue status in real-time
- **Detailed Views**: Expand issues for detailed information
- **Bulk Operations**: Handle multiple issues efficiently

### Common Operations

#### Checking Integration Health
1. Navigate to the Overview page
2. Review the Integration Status section
3. Look for any "Unhealthy" status indicators
4. Click "View Details" for more information

#### Investigating Errors
1. Go to the Live Data page
2. Select the Sentry section
3. Review Active Issues
4. Click on an issue to expand details
5. Use the chart to see error patterns

#### Monitoring Email Services
1. Navigate to the Mailgun section
2. Check email statistics and delivery rates
3. Review domain status
4. Monitor recent email events

## API Reference

### Backend API Endpoints

#### Sentry Endpoints
```http
GET /api/sentry/issues/
GET /api/sentry/issues/{issue_id}/events/
PUT /api/sentry/issues/{issue_id}/
GET /api/sentry/events/
GET /api/sentry/alerts/
GET /api/sentry/members/
```

#### Mailgun Endpoints
```http
GET /api/mailgun/queue-status/
PUT /api/mailgun/account-metrics/
PUT /api/mailgun/account-usage-metrics/
PUT /api/mailgun/logs/
GET /api/mailgun/stats/totals/
GET /api/mailgun/stats/filter/
GET /api/mailgun/mailing-list-members/{list_address}/
```

#### Integration Health Endpoints
```http
GET /api/sentry/integration-status/
```

### Frontend API Integration

#### Data Fetching
```javascript
// Fetch Sentry issues
const issues = await fetchIssues();

// Fetch integration status
const status = await fetchSentryIntegrationStatus();

// Update issue status
await updateIssueStatus(issueId, 'resolved');
```

#### State Management
```javascript
// Access global state
const { state, dispatch } = useContext(AppContext);

// Load data
const { loadSentryData } = useContext(AppContext);

// Update filters
const { updateFilteredData } = useContext(AppContext);
```

### Project Structure
```
FoundersNetworkDashboard/
├── dashboardAPI/                       # Django backend
│   ├── dashboardAPI/
│   │   ├── tests/
│   │   │   ├── __init__.py             # Necessary to find tests
│   │   │   ├── test_integrations.py    # Tests for integrations
│   │   │   ├── test_mailgun.py         # Tests for mailgun
│   │   │   └── test_sentry.py          # Tests for sentry
│   │   ├── views.py                    # Main API endpoints
│   │   ├── sentry_views.py             # Sentry-specific endpoints
│   │   ├── mailgun_views.py            # Mailgun-specific endpoints
│   │   ├── integration_views.py        # Health checks
│   │   ├── helpers.py                  # Utility functions
│   │   └── settings.py                 # Django settings
│   ├── requirements.txt                # Python dependencies
│   ├── Dockerfile                      # Backend container
│   └── .env                            # Environment variables (duplicate)
│
├── dashboard-ui/                       # React frontend
│   ├── src/
│   │   ├── components/                 # React components
│   │   ├── context/                    # State management
│   │   ├── api/                        # API integration
│   │   └── utils/                      # Utility functions
│   ├── package.json                    # Node dependencies
│   └── Dockerfile                      # Frontend container
├── compose.yml                         # Docker Compose configuration
└── rebuild.sh                          # Build script
```

### Security Considerations
- **API Key Management**: Secure credential storage
- **Access Control**: Admin-only access
- **Data Privacy**: Minimal data collection
- **Audit Logging**: Track all access and changes
- **Regular Updates**: Keep dependencies updated

## Testing

Testing is fully integrated with the docker deployment system through multistage Dockerfiles. During the process of building the frontend and backend, tests are run automatically and the build will fail if these tests do not pass. Docker is also configured with build checks enabled in order to test the docker build system itself.

### Backend Tests

Since the backend is written in Django, the testing framework for the backend uses [Django testing framework](https://docs.djangoproject.com/en/5.2/topics/testing/). The current testing suite is composed of unit tests for sentry, mailgun, and integrations and makes use of the [Django test client](https://docs.djangoproject.com/en/5.2/topics/testing/tools/#the-test-client) in order to check that routes are functioning properly (i.e. returning status 200 with a good request). Tests are automatically discovered via python's [unittest test discovery](https://docs.python.org/3/library/unittest.html#test-discovery), and any additional tests for the backend should be placed in the `/dashboardAPI/dashboardAPI/tests/` directory and start with `test_` to be discovered properly. Testing could be improved further by validating response schema as described in the [Sentry API documentation](https://docs.sentry.io/api/) and the [Mailgun API documentation](https://documentation.mailgun.com/docs/mailgun/api-reference).

### Frontend Tests

The testing framework for the frontend uses [jest](https://jestjs.io/). Node modules are transformed using babel-jest and axios is excluded from from transformation using [transformIgnorePatterns](https://jestjs.io/docs/configuration#transformignorepatterns-arraystring). CSS modules are mocked using [jest-css-modules](https://www.npmjs.com/package/jest-css-modules) - though jest now supports mocking css modules using identity-obj-proxy as described [here](https://jestjs.io/docs/webpack#mocking-css-modules). ResizeObserver is mocked as tests would fail without mocking. In the future, mocking api endpoints would be highly advisable in order to test the frontend, though this was infeasable due to time constraints.



---

*Last Updated: 2025-08-05*
*Version: 2.0.0* 
