import os
from rest_framework.decorators import api_view
from .helpers import make_request, filter_request_data

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

@api_view(["PATCH"])
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
