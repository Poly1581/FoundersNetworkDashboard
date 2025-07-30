import json
import requests
from django.http import HttpResponse, HttpResponseBadRequest, JsonResponse

request_params = {
    # Sentry:
    "update_issue_status": ("status", "statusDetails", "assignedTo", "hasSeen", "isBookmarked", "isSubscribed", "isPublic"),

    # Mailgun:
    "get_account_metrics": ("start", "end", "resolution", "duration", "dimensions", "metrics", "filter"),
    "get_account_usage_metrics": ("start", "end", "resolution", "duration", "dimensions", "metrics", "filter"),
    "get_logs": ("start", "end", "events", "metric_events", "filter", "include_subaccounts", "include_totals", "pagination"),
    "get_stat_totals": ("start", "end", "resolution", "duration", "event"),
    "get_filtered_grouped_stats": ("start", "end", "resolution", "duration", "event", "filter", "group"),
    "get_mailing_list_members": ("address", "subscribed", "limit", "skip")
}

def filter_request_data(data, view):
    return {key: value for key, value in data.items() if key in request_params[view]}

def make_request(request):
    uri = request.get("uri")
    method = request.get("method")
    params = {key: value for key, value in request.items() if key not in ("method", "uri")}
    response = None
    error_message = None
    try:
        match method:
            case "get":
                response = requests.get(uri, **params)
            case "put":
                response = requests.put(uri, **params)
            case "post":
                response = requests.post(uri, **params)
            case _:
                raise Exception("Invalid request type (only \"get\", \"put\", and \"post\" are allowed)")
        response.raise_for_status()
        return JsonResponse(response.json(), safe=False)
    except requests.exceptions.RequestException as request_exception:
        error_message = f"Request error on {method} request to {uri} with {params}: {request_exception}"
    except Exception as exception:
        error_message = f"Unexpected error on {method} request to {uri} with {params}: {exception}"
    print(error_message)
    print(response)
    return HttpResponseBadRequest(error_message)
