# Founders Network Dashboard

A centralized platform observability dashboard for admins to monitor Founders Network's critical integrations in real-time.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- API credentials for Sentry and Mailgun

### Installation
1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd FoundersNetworkDashboard
   ```

2. **Configure environment**
   ```bash
   # Create .env file with your credentials
   cp env.template .env
   ```
   
3. **Start the application**
   ```bash
   ./rebuild.sh
   ```

4. **Access the dashboard**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 📋 What It Monitors

### Current Integrations
- **Sentry**: Error tracking and monitoring
- **Mailgun**: Email service monitoring
- **HubSpot**: CRM integration (planned)

### Key Features
- Real-time integration health monitoring
- API error tracking and visualization
- Response time monitoring
- Issue management and resolution
- Interactive data filtering and charts

## 🛠 Development

Scripts are available to automate the process of rebuilding and redeploying via docker compose. The scripts are available for `bash` and `fish` and allow for rebuilding the entire project or selectively rebuilding the frontend or backend.

```bash
./rebuild.sh           # Rebuild both frontend and backend
./rebuild.sh frontend  # Rebuild frontend only
./rebuild.sh backend   # Rebuild backend only
./rebuild.sh test      # Run backend tests
```

## 📚 Documentation

For comprehensive documentation including:
- Detailed setup instructions
- API reference
- Integration guides
- Troubleshooting
- Future expansion plans

**See [DOCUMENTATION.md](./DOCUMENTATION.md)**

## 🎯 Core Design Principles

**Real-time Internal Monitoring**: Provides immediate visibility into integration health before issues impact members.

**Automatic Problem Detection**: Health checks automatically detect problems through monitoring.

**API Endpoint Monitoring**: Monitors FN's actual API endpoints and tracks response times.

**Integration-Specific**: Customized to FN's specific integrations and error patterns.

## 🔧 Configuration

### Required Environment Variables
```bash
# Sentry Configuration
SENTRY_ORGANIZATION_SLUG=your_sentry_organization_slug
SENTRY_PROJECT_ID=your_sentry_project_id
SENTRY_BEARER_AUTH=your_sentry_bearer_token

# Mailgun Configuration
MAILGUN_API_NAME=your_mailgun_api_name
MAILGUN_API_KEY=your_mailgun_api_key
```

### Getting Credentials
- **Sentry**: Organization slug, project ID, and API token from Sentry settings
- **Mailgun**: Domain name and API key from Mailgun dashboard

## 🚨 Troubleshooting

### Common Issues
- **Environment Variable Errors**: Ensure `.env` file exists and contains all required variables
- **API Connection Issues**: Verify credentials and network connectivity
- **Docker Issues**: Check container logs with `docker logs backend` or with docker desktop

For detailed troubleshooting, see the [Troubleshooting section](./DOCUMENTATION.md#troubleshooting) in the full documentation.

## 🔮 Future Plans

- Additional integrations (HubSpot, Stripe, AWS)
- Advanced analytics and predictive alerts
- Mobile application
- Custom dashboards and alert rules

See the [Future Expansion section](./DOCUMENTATION.md#future-expansion) for detailed roadmap.

---

## Support

- **Documentation**: [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Issues**: Create GitHub issues for bugs or feature requests
- **Development**: Contact the development team for technical questions

---

*Built for Founders Network - Internal Admin Dashboard*
