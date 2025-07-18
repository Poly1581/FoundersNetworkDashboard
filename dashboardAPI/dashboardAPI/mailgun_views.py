import os
import json
import requests
from django.http import HttpResponse, HttpResponseBadRequest
from rest_framework.decorators import api_view


API_NAME = os.environ.get("MAILGUN_API_NAME")
API_KEY = os.environ.get("MAILGUN_API_KEY")
BASE_URI = "https://api.mailgun.net"
AUTH = ('api', f"{API_KEY}")

request_params = {
    "get_account_metrics": ("start", "end", "resolution", "duration", "dimensions", "metrics", "filter"),
    "get_account_usage_metrics": ("start", "end", "resolution", "duration", "dimensions", "metrics", "filter"),
    "get_logs": ("start", "end", "events", "metric_events", "filter", "include_subaccounts", "include_totals", "pagination"),
    "get_stat_totals": ("start", "end", "resolution", "duration", "event")
}

def filter_data(data, view):
    return {key: value for key, value in data.items() if key in request_params[view]}


@api_view(["GET"])
def get_queue_status(request, **kwargs):
    '''
        Endpoint to access mailgun messages queue status.
        See https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/messages/get-v3-domains--name--sending-queues
    '''
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
def get_account_metrics(request, **kwargs):
    '''
        Endpoint to access mailgun account metrics.
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/metrics/post-v1-analytics-metrics
    '''
    URI = f"{BASE_URI}/v1/analytics/metrics"
    filtered_data = filter_data(request.data, "get_account_metrics")
    try:
        response = requests.post(URI, auth = AUTH, json = filtered_data, headers={"Content-Type": "application/json"})
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
def get_account_usage_metrics(request, **kwargs):
    '''
        Endpoint to access mailgun account usage metrics
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/metrics/post-v1-analytics-usage-metrics
    '''
    URI = f"{BASE_URI}/v1/analytics/usage/metrics"
    filtered_data = filter_data(request.data, "get_account_usage_metrics")
    try:
        response = requests.post(URI, auth = AUTH, json = filtered_data, headers={"Content-Type": "application/json"})
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

@api_view(["PUT"])
def get_logs(request, **kwargs):
    '''
        Endpoint to access mailgun logs
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/logs/post-v1-analytics-logs
    '''
    URI = f"{BASE_URI}/v1/analytics/logs"
    filtered_data = filter_data(request.data, "get_logs")
    try:
        response = requests.post(URI, auth = AUTH, json = filtered_data, headers={"Content-Type": "application/json"})
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

@api_view(["PUT"])
def get_stat_totals(request, **kwargs):
    '''
        Endpoint to access mailgun stats
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/stats/get-v3-stats-total
    '''
    URI = f"{BASE_URI}/v3/stats/total"
    filtered_data = filter_data(request.data, "get_stat_totals")
    try:
        response = requests.get(URI, auth = AUTH, params=filtered_data)
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

@api_view(["PUT"])
def get_filtered_grouped_stats(request, **kwargs):
    '''
        Endpoint to access mailgun filtered/grouped stats
        See https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/stats/get-v3-stats-filter
    '''
    URI = f"{BASE_URI}/v3/stats/filter"
    filtered_data = filter_data(request.data, "get_filtered_grouped_stats")
    try:
        response = requests.get(URI, auth = AUTH, params=filtered_data)
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
