# Founders Network Dashboard Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Configuration](#configuration)
5. [Usage Guide](#usage-guide)
6. [API Reference](#api-reference)
7. [Integration Guide](#integration-guide)
8. [Development Guide](#development-guide)
9. [Troubleshooting](#troubleshooting)
10. [Future Expansion](#future-expansion)

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
└─────────────────┘    └─────────────────┘    │   ┌─────────────┐│
                                              │   │   Sentry    ││
                                              │   └─────────────┘│
                                              │   ┌─────────────┐│
                                              │   │   Mailgun   ││
                                              │   └─────────────┘│
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
- **Key Modules**:
  - `views.py`: Main API endpoints
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
   // TODO: Where does this get put?

3. **Start the application**
   ```bash
   ./rebuild.sh
   ```

4. **Access the dashboard**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Development Setup (./rebuild.sh does this automatically, but can also be done individually)
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

### Environment Variables
Create a `.env` file in the project root with the following variables:
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
SECRET_KEY=your_django_secret_key
```

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
The application uses Docker Compose for containerization:

```yaml
# compose.yml
services:
  backend:
    container_name: backend
    build: ./dashboardAPI
    ports:
      - "8000:8000"
    env_file:
      - .env

  frontend:
    container_name: frontend
    build: ./dashboard-ui
    ports:
      - "3000:3000"
```

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
GET /api/hubspot/integration-status/
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

## Integration Guide

### Adding New Integrations

#### Backend Integration

#### Frontend Integration

### Webhook Integration

### Custom Health Checks

## Development Guide

### Project Structure
```
FoundersNetworkDashboard/
├── dashboardAPI/              # Django backend
│   ├── dashboardAPI/
│   │   ├── views.py          # Main API endpoints
│   │   ├── sentry_views.py   # Sentry-specific endpoints
│   │   ├── mailgun_views.py  # Mailgun-specific endpoints
│   │   ├── integration_views.py # Health checks
│   │   ├── helpers.py        # Utility functions
│   │   └── settings.py       # Django settings
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile           # Backend container
├── dashboard-ui/             # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # State management
│   │   ├── api/              # API integration
│   │   └── utils/            # Utility functions
│   ├── package.json          # Node dependencies
│   └── Dockerfile           # Frontend container
├── compose.yml              # Docker Compose configuration
├── rebuild.sh               # Build script
└── .env                     # Environment variables
```

### Development Workflow


### Performance Optimization

## Troubleshooting

### Common Issues

## Future Expansion

### Planned Features

#### Additional Integrations

#### Enhanced Monitoring

#### Advanced Analytics

#### User Experience


### Security Considerations
- **API Key Management**: Secure credential storage
- **Access Control**: Admin-only access
- **Data Privacy**: Minimal data collection
- **Audit Logging**: Track all access and changes
- **Regular Updates**: Keep dependencies updated



---

*Last Updated: [Current Date]*
*Version: 1.0.0* 