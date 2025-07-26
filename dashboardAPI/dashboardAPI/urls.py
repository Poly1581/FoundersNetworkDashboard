"""
URL configuration for dashboardAPI project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based vi ews
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('',  Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from . import sentry_views as sentry
from . import integration_views as integration
from . import mailgun_views as mailgun
from . import hubspot_views as hubspot

urlpatterns = [
    path('admin/', admin.site.urls),
    # Sentry API endpoints
    path("api/sentry/issues/<int:issue_id>/events/", sentry.get_issue_events, name="get issue events"),
    path("api/sentry/issues/<int:issue_id>/", sentry.update_issue_status, name="update issue status"),
    path("api/sentry/issues/", sentry.get_issues, name="get issues"),
    path("api/sentry/events/", sentry.get_events, name="get events"),
    path("api/sentry/alerts/", sentry.get_sentry_alerts, name="get alerts"),
    path("api/sentry/stats/endpoints/", sentry.get_sentry_endpoint_stats, name="get sentry endpoint stats"),

    # Integration API endpoints
    path("api/sentry/integration-status/", integration.get_sentry_integration_status, name="get sentry integration status"),
    path("api/hubspot/integration-status/", integration.get_hubspot_integration_status, name="get hubspot integration status"),

    # Mailgun API endpoints
    path("api/mailgun/queue-status/", mailgun.get_queue_status, name="get mailgun whitelist"),
    path("api/mailgun/account-metrics/", mailgun.get_account_metrics, name="get mailgun account metrics"),
    path("api/mailgun/account-usage-metrics/", mailgun.get_account_usage_metrics, name="get mailgun account usage metrics"),
    path("api/mailgun/logs/", mailgun.get_logs, name="get mailgun logs"),
    path("api/mailgun/stats/totals", mailgun.get_stat_totals, name = "get mailgun stat totals"),
    path("api/mailgun/stats/filter", mailgun.get_filtered_grouped_stats, name = "get filtered mailgun stats"),
    path("api/mailgun/mailing-lists/", mailgun.get_mailing_lists, name = "get mailing lists"),
    path("api/mailgun/mailing-list-members/<str:list_address>/", mailgun.get_mailing_list_members, name = "get mailing list members"),
    
    # New Mailgun endpoints for dashboard
    path("api/mailgun/events/", mailgun.get_mailgun_events, name="get mailgun events"),
    path("api/mailgun/integrations/", mailgun.get_mailgun_integrations, name="get mailgun integrations"),
    
    # HubSpot API endpoints
    path("api/hubspot/issues/", hubspot.get_hubspot_issues, name="get hubspot issues"),
    path("api/hubspot/integrations/", hubspot.get_hubspot_integrations, name="get hubspot integrations"),
]
