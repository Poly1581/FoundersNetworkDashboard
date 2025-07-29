import os
from rest_framework.decorators import api_view
from .helpers import make_request, filter_request_data
import json
import requests
from django.http import HttpResponse, HttpResponseBadRequest
from datetime import datetime


ORGANIZATION_SLUG = os.environ.get("SENTRY_ORGANIZATION_SLUG")
PROJECT_ID = os.environ.get("SENTRY_PROJECT_ID")
BEARER_AUTH = os.environ.get("SENTRY_BEARER_AUTH")
BASE_URI = "https://sentry.io/api/0"
HEADERS = {
    "Authorization": f"Bearer {BEARER_AUTH}"
}

@api_view(["GET"])
def get_issue_events(request, **kwargs):
    '''
        Endpoint to access sentry issue events
        See: https://docs.sentry.io/api/events/list-an-issues-events/
    '''
    return make_request({
        "uri": f"{BASE_URI}/organizations/{ORGANIZATION_SLUG}/issues/{kwargs.get("issue_id")}/events/",
        "method": "get",
        "headers": {
            "Authorization": f"Bearer {BEARER_AUTH}"
        },
    })

@api_view(["PUT"])
def update_issue_status(request, **kwargs):
    '''
        Endpoint to update sentry issue status
        See: https://docs.sentry.io/api/events/update-an-issue/
    '''
    return make_request({
        "uri": f"{BASE_URI}/organizations/{ORGANIZATION_SLUG}/issues/{kwargs.get("issue_id")}/",
        "method": "put",
        "headers": {
            "Authorization": f"Bearer {BEARER_AUTH}"
        },
        "json": filter_request_data(request.data, "update_issue_status"),
    })

@api_view(["GET"])
def get_issues(request, **kwargs):
    '''
        Endpoint to access sentry issues
        See: https://docs.sentry.io/api/events/list-a-projects-issues/
    '''
    return make_request({
        "uri": f"{BASE_URI}/projects/{ORGANIZATION_SLUG}/{PROJECT_ID}/issues/",
        "method": "get",
        "headers": {
            "Authorization": f"Bearer {BEARER_AUTH}"
        },
    })

@api_view(["GET"])
def get_events(request, **kwargs):
    '''
        Endpoint to access sentry events
        See: https://docs.sentry.io/api/events/list-a-projects-error-events/
    '''
    return make_request({
        "uri": f"{BASE_URI}/projects/{ORGANIZATION_SLUG}/{PROJECT_ID}/events",
        "method": "get",
        "headers": {
            "Authorization": f"Bearer {BEARER_AUTH}"
        },
    })

@api_view(["GET"])
def get_sentry_alerts(request, **kwargs):
    """
    Fetch recent alerts from Sentry by transforming recent issues into alert format
    """
    try:
        # Get recent issues from Sentry
        issues_uri = f"{BASE_URI}/projects/{ORGANIZATION_SLUG}/{PROJECT_ID}/issues/"
        response = requests.get(issues_uri, headers=HEADERS, params={'statsPeriod': '24h'})
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
