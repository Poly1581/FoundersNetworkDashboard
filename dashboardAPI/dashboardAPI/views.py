import json
import requests
from django.http import HttpResponse
from rest_framework.decorators import api_view
from django.http import HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt

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
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except Exception as error:
        print(f"Error getting issues: {error}")
        return HttpResponseBadRequest

@api_view(["PUT"])
def update_issue_status(request, **kwargs):
    URI = f"{SENTRY_URI}/organizations/{SENTRY_ORGANIZATION_SLUG}/issues/{kwargs.get("issue_id")}/"
    try:
        response = requests.put(URI, headers = HEADERS, json = {"status": request.data.get("status")})
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except Exception as error:
        print(f"Error getting issues: {error}")
        return HttpResponseBadRequest

@api_view(["GET"])
def get_issues(request, **kwargs):
    URI = f"{SENTRY_URI}/projects/{SENTRY_ORGANIZATION_SLUG}/{SENTRY_PROJECT_ID}/issues/"
    try:
        response = requests.get(URI, headers = HEADERS)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except Exception as error:
        print(f"Error getting issues: {error}")
        return HttpResponseBadRequest

@api_view(["GET"])
def get_events(request, **kwargs):
    URI = f"{SENTRY_URI}/projects/{SENTRY_ORGANIZATION_SLUG}/{SENTRY_PROJECT_ID}/events"
    try:
        response = requests.get(URI, headers = HEADERS)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except Exception as error:
        print(f"Error getting issues: {error}")
        return HttpResponseBadRequest

