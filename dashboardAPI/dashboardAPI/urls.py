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

# def get_issue_events(request, issue_id):
# URI = f"organizations/{SENTRY_ORGANIZATION_SLUG}/issues/{issue_id}/events"
# const response = await sentryApi.get(`/issues/${issueId}/events`);
# def get_issue_events(request, issue_id):
urlpatterns = [
    # Without trailing slash
    path('admin', admin.site.urls),
    path("issues/<int:issue_id>/events", views.get_issue_events, name="get issue events without slash"),
    path("issues/<int:issueId>", views.update_issue_status, name="update issue status without slash"),
    path("issues", views.get_issues, name="get issues without slash"),
    path("events", views.get_events, name="get events without slash"),


    # With trailing slash
    path('admin/', admin.site.urls),
    path("issues/<int:issue_id>/events", views.get_issue_events, name="get issue events with slash"),
    path("issues/<int:issueId>", views.update_issue_status, name="update issue status with slash"),
    path("issues", views.get_issues, name="get issues with slash"),
    path("events", views.get_events, name="get events with slash"),
]
