import os
import json
import requests
from django.http import HttpResponse, HttpResponseBadRequest
from rest_framework.decorators import api_view

ORGANIZATION_SLUG = os.environ.get("SENTRY_ORGANIZATION_SLUG")
PROJECT_ID = os.environ.get("SENTRY_PROJECT_ID")
BEARER_AUTH = os.environ.get("SENTRY_BEARER_AUTH")
BASE_URI = "https://sentry.io/api/0"
HEADERS = {
    "Authorization": f"Bearer {BEARER_AUTH}"
}

@api_view(["GET"])
def get_issue_events(request, **kwargs):
    URI = f"{BASE_URI}/organizations/{ORGANIZATION_SLUG}/issues/{kwargs.get("issue_id")}/events/"
    try:
        response = requests.get(URI, headers = HEADERS)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching issue events from Sentry: {e}")
        return HttpResponseBadRequest(f"Error fetching issue events: {e}")
    except Exception as error:
        print(f"An unexpected error occurred in get_issue_events: {error}")
        return HttpResponseBadRequest(f"An unexpected error occurred: {error}")

@api_view(["PUT"])
def update_issue_status(request, **kwargs):
    URI = f"{BASE_URI}/organizations/{ORGANIZATION_SLUG}/issues/{kwargs.get("issue_id")}/"
    try:
        response = requests.put(URI, headers = HEADERS, json = {"status": request.data.get("status")})
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except requests.exceptions.RequestException as e:
        print(f"Error updating issue status in Sentry: {e}")
        return HttpResponseBadRequest(f"Error updating issue status: {e}")
    except Exception as error:
        print(f"An unexpected error occurred in update_issue_status: {error}")
        return HttpResponseBadRequest(f"An unexpected error occurred: {error}")

@api_view(["GET"])
def get_issues(request, **kwargs):
    URI = f"{BASE_URI}/projects/{ORGANIZATION_SLUG}/{PROJECT_ID}/issues/"
    print(f"Attempting to fetch issues from Sentry URI: {BASE_URI}")
    try:
        response = requests.get(URI, headers = HEADERS)
        print(f"Sentry API response status for issues: {response.status_code}")
        print(f"Sentry API response content for issues: {response.text[:500]}...") # Log first 500 chars
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching issues from Sentry: {e}")
        return HttpResponseBadRequest(f"Error fetching issues: {e}")
    except Exception as error:
        print(f"An unexpected error occurred in get_issues: {error}")
        return HttpResponseBadRequest(f"An unexpected error occurred: {error}")

@api_view(["GET"])
def get_events(request, **kwargs):
    URI = f"{BASE_URI}/projects/{ORGANIZATION_SLUG}/{PROJECT_ID}/events"
    try:
        response = requests.get(URI, headers = HEADERS)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching events from Sentry: {e}")
        return HttpResponseBadRequest(f"Error fetching events: {e}")
    except Exception as error:
        print(f"An unexpected error occurred in get_events: {error}")
        return HttpResponseBadRequest(f"An unexpected error occurred: {error}")
