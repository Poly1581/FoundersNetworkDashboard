from django.http import HttpRequest
from django.http import HttpHeaders
from django.http import HttpResponse
from django.http import JsonResponse
import requests
import json

# Environment variables
import environ
env = environ.Env()
environ.Env.read_env()
SENTRY_ORGANIZATION_SLUG=env("SENTRY_ORGANIZATION_SLUG")
SENTRY_PROJECT_ID=env("SENTRY_PROJECT_ID")
SENTRY_BEARER_AUTH=env("SENTRY_BEARER_AUTH")
SENTRY_DSN=env("SENTRY_DSN")

def sentrytest(request):
    url = f"https://sentry.io/api/0/projects/{SENTRY_ORGANIZATION_SLUG}/{SENTRY_PROJECT_ID}/issues/"
    headers = {
            "Authorization": f"Bearer {SENTRY_BEARER_AUTH}"
    }
    response = requests.get(url, headers = headers)
    return HttpResponse(json.dumps(response.json()), content_type="application/json")
