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
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from . import views

urlpatterns = [
    # Sentry API endpoints
    path("api/sentry/issues/<int:issue_id>/events/", views.get_issue_events, name="get issue events"),
    path("api/sentry/issues/<int:issue_id>/", views.update_issue_status, name="update issue status"),
    path("api/sentry/issues/", views.get_issues, name="get issues"),
    path("api/sentry/events/", views.get_events, name="get events"),
    path("api/sentry/integration-status/", views.get_sentry_integration_status, name="get sentry integration status"),

    # HubSpot API endpoints (placeholder implementations)
    path("api/hubspot/integration-status/", views.get_hubspot_integration_status, name="get hubspot integration status"),

    # Mailgun API endpoints
    path("api/mailgun/queue-status/", views.get_mailgun_queue_status, name="get mailgun whitelist"),
    path("api/mailgun/account-metrics/", views.get_mailgun_account_metrics, name="get mailgun account metrics"),
    path("api/mailgun/account-usage-metrics/", views.get_mailgun_account_usage_metrics, name="get"),
]
