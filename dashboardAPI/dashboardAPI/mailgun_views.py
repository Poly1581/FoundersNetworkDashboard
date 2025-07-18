import os
import json
import requests
from django.http import HttpResponse, HttpResponseBadRequest
from rest_framework.decorators import api_view


API_NAME = os.environ.get("MAILGUN_API_NAME")
API_KEY = os.environ.get("MAILGUN_API_KEY")
BASE_URI = "https://api.mailgun.net"
AUTH = ('api', f"{API_KEY}")

@api_view(["GET"])
def get_mailgun_queue_status(request, **kwargs):
    URI = f"{BASE_URI}/v3/domains/{API_NAME}/sending_queues"
    try:
        response = requests.get(URI, auth = AUTH)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except requests.exceptions.RequestException as e:
        error_message = f"Error fetching mailgun queue status: {e}"
        print(error_message)
        return HttpResponseBadRequest(error_message)
    except Exception as error:
        error_message = f"An unexpected error occurred in get_mailgun_whitelist: {error}"
        print(error_message)
        return HttpResponseBadRequest(error_message)

@api_view(["PUT"])
def get_mailgun_account_metrics(request, **kwargs):
    URI = f"{BASE_URI}/v1/analytics/metrics"
    try:
        response = requests.get(URI, auth = AUTH)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except requests.exceptions.RequestException as e:
        error_message = f"Error fetching mailgun account metrics: {e}"
        print(error_message)
        return HttpResponseBadRequest(error_message)
    except Exception as error:
        error_message = f"An unexpected error occurred in get_mailgun_account_metrics: {error}"
        print(error_message)
        return HttpResponseBadRequest(error_message)

@api_view(["PUT"])
def get_mailgun_account_usage_metrics(request, **kwargs):
    URI = f"{BASE_URI}/v1/analytics/usage/metrics"
    try:
        response = requests.get(URI, auth = AUTH)
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        return HttpResponse(json.dumps(response.json()), content_type="application/json")
    except requests.exceptions.RequestException as e:
        error_message = f"Error fetching mailgun account usage metrics: {e}"
        print(error_message)
        return HttpResponseBadRequest(error_message)
    except Exception as error:
        error_message = f"An unexpected error occurred in get_mailgun_account_usage_metrics: {error}"
        print(error_message)
        return HttpResponseBadRequest(error_message)
