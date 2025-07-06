from django.http import HttpResponse
from django.http import HttpResponseBadRequest
import requests
import json

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

def issues(request):
    URI = f"{SENTRY_URI}/projects/{SENTRY_ORGANIZATION_SLUG}/{SENTRY_PROJECT_ID}/issues/"
    try:
        response = requests.get(URI, headers = HEADERS)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except Exception as error:
        print(f"Error getting issues: {error}")
        return HttpResponseBadRequest

def events(request):
    URI = f"{SENTRY_URI}/projects/{SENTRY_ORGANIZATION_SLUG}/{SENTRY_PROJECT_ID}/events"
    try:
        response = requests.get(URI, headers = HEADERS)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except Exception as error:
        print(f"Error getting issues: {error}")
        return HttpResponseBadRequest


