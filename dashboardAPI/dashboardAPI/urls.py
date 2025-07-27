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

urlpatterns = [
    # Sentry API endpoints
<<<<<<< HEAD
    path("issues/<str:issue_id>/events/", views.get_issue_events, name="get issue events"),
    path("issues/<str:issue_id>/", views.update_issue_status, name="update issue status"),
    path("issues/", views.get_issues, name="get issues"),
    path("events/", views.get_events, name="get events"),
    path("integration-status/", views.get_sentry_integration_status, name="get sentry integration status"),
    path("stats/endpoints/", views.get_sentry_endpoint_stats, name="get sentry endpoint stats"),
=======
    path("api/sentry/issues/<int:issue_id>/events/", sentry.get_issue_events, name="get issue events"),
    path("api/sentry/issues/<int:issue_id>/", sentry.update_issue_status, name="update issue status"),
    path("api/sentry/issues/", sentry.get_issues, name="get issues"),
    path("api/sentry/events/", sentry.get_events, name="get events"),
    path("api/sentry/alerts/", sentry.get_sentry_alerts, name="get alerts"),

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
>>>>>>> main
]
