"""
Sentry Error Monitoring Integration Views Module

This module provides API endpoints for interacting with Sentry error monitoring service
within the dashboardAPI project. It includes functionality for retrieving issues, events,
managing issue status, accessing alerts, and managing organization members.

Usage:
    This module is automatically imported by Django's URL routing system and provides
    REST API endpoints that act as proxies to Sentry's API. All requests use authentication
    headers configured in Django settings and include error handling.

API Endpoints:
    GET /api/sentry/issues/{issue_id}/events/  - Get events for a specific issue
    PUT /api/sentry/issues/{issue_id}/         - Update issue status and properties
    GET /api/sentry/issues/                    - List all project issues
    GET /api/sentry/events/                    - List all project events
    GET /api/sentry/alerts/                    - Get recent alerts (transformed from issues)
    GET /api/sentry/members/                   - List organization members for assignment

Authentication:
    All endpoints use SENTRY_BEARER_AUTH token configured in settings.
    Organization slug and project ID are also configured via environment variables.

Functions:
    get_issue_events()         - Retrieve events for a specific issue ID
    update_issue_status()      - Update issue properties like status and assignment
    get_issues()               - List all issues for the project
    get_events()               - List all events for the project
    get_sentry_alerts()        - Transform recent issues into alert format
    get_organization_members() - List organization members for issue assignment

Data Transformation:
    get_sentry_alerts() converts Sentry issues into a standardized alert format
    with severity levels and detailed information for dashboard display.
"""

from rest_framework.decorators import api_view
from .helpers import make_request, filter_request_data
import json
import requests
from django.http import HttpResponse, HttpResponseBadRequest
from datetime import datetime
from django.conf import settings

@api_view(["GET"])
def get_issue_events(request, **kwargs):
    '''
        Endpoint to access sentry issue events
        See: https://docs.sentry.io/api/events/list-an-issues-events/
    '''
    return make_request({
        "uri": f"{settings.SENTRY_BASE_URI}/organizations/{settings.SENTRY_ORGANIZATION_SLUG}/issues/{kwargs.get("issue_id")}/events/",
        "method": "get",
        "headers": settings.SENTRY_HEADERS,
    })

@api_view(["PUT"])
def update_issue_status(request, **kwargs):
    '''
        Endpoint to update sentry issue status
        See: https://docs.sentry.io/api/events/update-an-issue/
    '''
    return make_request({
        "uri": f"{settings.SENTRY_BASE_URI}/organizations/{settings.SENTRY_ORGANIZATION_SLUG}/issues/{kwargs.get("issue_id")}/",
        "method": "put",
        "headers": settings.SENTRY_HEADERS,
        "json": filter_request_data(request.data, "update_issue_status"),
    })

@api_view(["GET"])
def get_issues(request, **kwargs):
    '''
        Endpoint to access sentry issues
        See: https://docs.sentry.io/api/events/list-a-projects-issues/
    '''
    return make_request({
        "uri": f"{settings.SENTRY_BASE_URI}/projects/{settings.SENTRY_ORGANIZATION_SLUG}/{settings.SENTRY_PROJECT_ID}/issues/",
        "method": "get",
        "headers": settings.SENTRY_HEADERS,
    })

@api_view(["GET"])
def get_events(request, **kwargs):
    '''
        Endpoint to access sentry events
        See: https://docs.sentry.io/api/events/list-a-projects-error-events/
    '''
    return make_request({
        "uri": f"{settings.SENTRY_BASE_URI}/projects/{settings.SENTRY_ORGANIZATION_SLUG}/{settings.SENTRY_PROJECT_ID}/events/",
        "method": "get",
        "headers": settings.SENTRY_HEADERS,
    })

@api_view(["GET"])
def get_sentry_alerts(request, **kwargs):
    """
    Fetch recent alerts from Sentry by transforming recent issues into alert format
    """
    try:
        # Get recent issues from Sentry
        issues_uri = f"{settings.SENTRY_BASE_URI}/projects/{settings.SENTRY_ORGANIZATION_SLUG}/{settings.SENTRY_PROJECT_ID}/issues/"
        response = requests.get(issues_uri, headers=settings.SENTRY_HEADERS, params={'statsPeriod': '24h'})
        response.raise_for_status()
        
        issues = response.json()
        alerts = []
        # Transform recent issues into alerts format
        for issue in issues[:10]:  # Limit to 10 most recent
            # Determine severity based on issue level
            severity = "Error" if issue.get('level') == 'error' else "Warning"
            
            # Create alert object
            alert = {
                "message": f"Issue detected: {issue.get('title', 'Unknown issue')}",
                "severity": severity,
                "time": issue.get('lastSeen', datetime.now().isoformat()),
                "details": f"Project: {issue.get('project', {}).get('name', 'Unknown')}",
                "originalIssue": {
                    "id": issue.get('id'),
                    "shortId": issue.get('shortId'),
                    "title": issue.get('title'),
                    "culprit": issue.get('culprit', 'Unknown'),
                    "status": issue.get('status', 'unresolved'),
                    "level": issue.get('level', 'error'),
                    "lastSeen": issue.get('lastSeen'),
                    "permalink": issue.get('permalink', '')
                }
            }
            alerts.append(alert)
        
        return HttpResponse(json.dumps(alerts), content_type="application/json")
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching alerts from Sentry: {e}")
        return HttpResponseBadRequest(f"Error fetching alerts from Sentry: {e}")
        
    except Exception as error:
        print(f"An unexpected error occurred in get_sentry_alerts: {error}")
        return HttpResponseBadRequest(f"An unexpected error occurred: {error}")

@api_view(["GET"])
def get_organization_members(request, **kwargs):
    """
    Fetch organization members from Sentry for issue assignment
    See: https://docs.sentry.io/api/organizations/list-an-organizations-members/
    """
    return make_request({
        "uri": f"{settings.SENTRY_BASE_URI}/organizations/{settings.SENTRY_ORGANIZATION_SLUG}/members/",
        "method": "get",
        "headers": settings.SENTRY_HEADERS,
    })
