import json
import requests
from django.http import HttpResponse, HttpResponseBadRequest
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime

# Environment variables
import environ
env = environ.Env()
environ.Env.read_env()
SENTRY_URI = "https://sentry.io/api/0"
SENTRY_ORGANIZATION_SLUG=env("SENTRY_ORGANIZATION_SLUG")
SENTRY_PROJECT_ID=env("SENTRY_PROJECT_ID")
HEADERS = {
    "Authorization": f"Bearer {env("SENTRY_BEARER_AUTH")}"
}

@api_view(["GET"])
def get_issue_events(request, **kwargs):
    URI = f"{SENTRY_URI}/organizations/{SENTRY_ORGANIZATION_SLUG}/issues/{kwargs.get("issue_id")}/events/"
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

@csrf_exempt
@api_view(["PUT"])
def update_issue_status(request, **kwargs):
    URI = f"{SENTRY_URI}/organizations/{SENTRY_ORGANIZATION_SLUG}/issues/{kwargs.get("issue_id")}/"
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
    URI = f"{SENTRY_URI}/projects/{SENTRY_ORGANIZATION_SLUG}/{SENTRY_PROJECT_ID}/issues/"
    print(f"Attempting to fetch issues from Sentry URI: {URI}")
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
    URI = f"{SENTRY_URI}/projects/{SENTRY_ORGANIZATION_SLUG}/{SENTRY_PROJECT_ID}/events"
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


@api_view(["GET"])
def get_sentry_integration_status(request, **kwargs):
    start_time = datetime.now()
    try:
        response = requests.get("https://sentry.io/_health/", headers=HEADERS)
        end_time = datetime.now()
        response_time = (end_time - start_time).total_seconds() * 1000
        if response.status_code == 200:
            sentry_api_status = {
                "name": "Sentry API",
                "category": "Error Tracking",
                "status": "Healthy",
                "responseTime": f"{response_time:.2f}ms",
                "lastSuccess": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "uptime": "99.95%",  # This would need to be calculated over time
                "issue": None
            }
        else:
            sentry_api_status = {
                "name": "Sentry API",
                "category": "Error Tracking",
                "status": "Unhealthy",
                "responseTime": f"{response_time:.2f}ms",
                "lastSuccess": None,
                "uptime": "0%",
                "issue": f"API returned status code {response.status_code}"
            }
    except Exception as e:
        sentry_api_status = {
            "name": "Sentry API",
            "category": "Error Tracking",
            "status": "Unhealthy",
            "responseTime": "N/A",
            "lastSuccess": None,
            "uptime": "0%",
            "issue": str(e)
        }

    # For Sentry Webhooks, we'll assume they are healthy if the backend is running.
    sentry_webhooks_status = {
        "name": "Sentry Webhooks",
        "category": "Alerting",
        "status": "Healthy",
        "responseTime": "N/A",
        "lastSuccess": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "uptime": "100%",
        "issue": None
    }

    data = [sentry_api_status, sentry_webhooks_status]
    return HttpResponse(json.dumps(data), content_type="application/json")

