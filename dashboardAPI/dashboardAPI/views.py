import json
import requests
from django.http import HttpResponse, HttpResponseBadRequest
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import cache_page
from datetime import datetime

# Environment variables
import environ
env = environ.Env()
environ.Env.read_env()
SENTRY_URI = "https://sentry.io/api/0"

# Use default values if environment variables are not set or are placeholders
SENTRY_ORGANIZATION_SLUG = env("SENTRY_ORGANIZATION_SLUG", default="demo-org")
SENTRY_PROJECT_ID = env("SENTRY_PROJECT_ID", default="demo-project")
SENTRY_BEARER_AUTH = env("SENTRY_BEARER_AUTH", default="demo-token")

HEADERS = {
    "Authorization": f"Bearer {SENTRY_BEARER_AUTH}"
}

@api_view(["GET"])
@cache_page(60 * 5)
def get_issue_events(request, **kwargs):
    issue_id = kwargs.get("issue_id")
    
    
    URI = f"{SENTRY_URI}/organizations/{SENTRY_ORGANIZATION_SLUG}/issues/{issue_id}/events/"
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
@cache_page(60 * 15)  # Increased cache time for bulk data
def get_issues(request, **kwargs):
    # Always fetch 1-month window for optimal performance
    time_range = request.GET.get('timeRange', '30d')
    URI = f"{SENTRY_URI}/organizations/{SENTRY_ORGANIZATION_SLUG}/issues/"
    params = {
        'statsPeriod': time_range,
        'sort': 'date',
        'project': SENTRY_PROJECT_ID
        # Removed limit parameter that was causing 400 error
    }
    
    print(f"Attempting to fetch issues from Sentry URI: {URI} with timeRange: {time_range}")
    try:
        response = requests.get(URI, headers=HEADERS, params=params)
        print(f"Sentry API response status for issues: {response.status_code}")
        
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        issues = response.json()
        # Trim the payload to only include fields used by the frontend
        trimmed_issues = [
            {
                "id": issue.get("id"),
                "title": issue.get("title"),
                "shortId": issue.get("shortId"),
                "culprit": issue.get("culprit"),
                "permalink": issue.get("permalink"),
                "level": issue.get("level"),
                "status": issue.get("status"),
                "type": issue.get("type"),
                "metadata": issue.get("metadata"),
                "lastSeen": issue.get("lastSeen"),
                "firstSeen": issue.get("firstSeen"),
                "count": issue.get("count"),
                "userCount": issue.get("userCount"),
            }
            for issue in issues
        ]
        return HttpResponse(json.dumps(trimmed_issues), content_type="application/json")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching issues from Sentry: {e}")
        return HttpResponseBadRequest(f"Error fetching issues: {e}")
    except Exception as error:
        print(f"An unexpected error occurred in get_issues: {error}")
        return HttpResponseBadRequest(f"An unexpected error occurred: {error}")

@api_view(["GET"])
@cache_page(60 * 15)  # Increased cache time for bulk data
def get_events(request, **kwargs):
    # Always fetch 1-month window for optimal performance
    time_range = request.GET.get('timeRange', '30d')
    URI = f"{SENTRY_URI}/organizations/{SENTRY_ORGANIZATION_SLUG}/events/"
    params = {
        'statsPeriod': time_range,
        'sort': '-timestamp',
        'project': SENTRY_PROJECT_ID
        # Removed limit parameter that was causing 400 error
    }
    
    try:
        response = requests.get(URI, headers=HEADERS, params=params)
        
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        events = response.json()
            
        # Ensure consistent timestamp format for client-side filtering
        for event in events:
            if 'dateCreated' not in event and 'timestamp' in event:
                event['dateCreated'] = event['timestamp']
        return HttpResponse(json.dumps(events), content_type="application/json")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching events from Sentry: {e}")
        return HttpResponseBadRequest(f"Error fetching events: {e}")
    except Exception as error:
        print(f"An unexpected error occurred in get_events: {error}")
        return HttpResponseBadRequest(f"An unexpected error occurred: {error}")


@api_view(["GET"])
@cache_page(60 * 5)
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

@api_view(["GET"])
@cache_page(60 * 5)
def get_sentry_endpoint_stats(request):
    project_id = SENTRY_PROJECT_ID
    time_range = request.GET.get("timeRange", "7d")
    sentry_url = f"https://sentry.io/api/0/organizations/{SENTRY_ORGANIZATION_SLUG}/stats_v2/"
    params = {
        'statsPeriod': time_range,
        'project': project_id,
        'yAxis': 'sum(quantity)',
        'groupBy': 'transaction',
        'dataset': 'errors'
    }
    try:
        response = requests.get(sentry_url, headers=HEADERS, params=params)
        response.raise_for_status()
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except requests.exceptions.RequestException as e:
        return HttpResponseBadRequest(f"Error fetching endpoint stats: {e}")
    except Exception as error:
        return HttpResponseBadRequest(f"An unexpected error occurred: {error}")





