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
BASE_URI = f"https://sentry.io/api/0/projects/{env("SENTRY_ORGANIZATION_SLUG")}/{env("SENTRY_PROJECT_ID")}/"
HEADERS = {
    "Authorization": f"Bearer {env("SENTRY_BEARER_AUTH")}"
}


def issues(request):
    return HttpResponse(json.dumps(requests.get(BASE_URI+"issues/", headers = HEADERS).json()), content_type="application/json")

def events(request):
    return HttpResponse(json.dumps(requests.get(BASE_URI+"events/", headers = HEADERS).json()), content_type="application/json")
