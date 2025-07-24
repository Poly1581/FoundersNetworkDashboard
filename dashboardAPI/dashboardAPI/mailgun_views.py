from rest_framework.decorators import api_view
from .helpers import make_request, filter_request_data
from django.conf import settings

@api_view(["GET"])
def get_queue_status(request, **kwargs):
    '''
        Endpoint to access mailgun messages queue status.
        See https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/messages/get-v3-domains--name--sending-queues
    '''
    return make_request({
        "uri": f"{settings.MAILGUN_BASE_URI}/v3/domains/{settings.MAILGUN_API_NAME}/sending_queues",
        "method": "get",
        "auth": settings.MAILGUN_AUTH,
    })

@api_view(["PUT"])
def get_account_metrics(request, **kwargs):
    '''
        Endpoint to access mailgun account metrics.
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/metrics/post-v1-analytics-metrics
    '''
    return make_request({
        "uri": f"{settings.MAILGUN_BASE_URI}/v1/analytics/metrics",
        "method": "post",
        "auth": settings.MAILGUN_AUTH,
        "json": filter_request_data(request.data, "get_account_metrics"),
    })

@api_view(["PUT"])
def get_account_usage_metrics(request, **kwargs):
    '''
        Endpoint to access mailgun account usage metrics
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/metrics/post-v1-analytics-usage-metrics
    '''
    return make_request({
        "uri": f"{settings.MAILGUN_BASE_URI}/v1/analytics/usage/metrics",
        "method": "post",
        "auth": settings.MAILGUN_AUTH,
        "json": filter_request_data(request.data, "get_account_usage_metrics"),
    })

@api_view(["PUT"])
def get_logs(request, **kwargs):
    '''
        Endpoint to access mailgun logs
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/logs/post-v1-analytics-logs
    '''
    return make_request({
        "uri": f"{settings.MAILGUN_BASE_URI}/v1/analytics/logs",
        "method": "post",
        "auth": settings.MAILGUN_AUTH,
        "json": filter_request_data(request.data, "get_logs"),
    })

@api_view(["PUT"])
def get_stat_totals(request, **kwargs):
    '''
        Endpoint to access mailgun stats
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/stats/get-v3-stats-total
    '''
    return make_request({
        "uri": f"{settings.MAILGUN_BASE_URI}/v3/stats/total",
        "method": "get",
        "auth": settings.MAILGUN_AUTH,
        "params": filter_request_data(request.data, "get_stat_totals"),
    })

@api_view(["PUT"])
def get_filtered_grouped_stats(request, **kwargs):
    '''
        Endpoint to access mailgun filtered/grouped stats
        See https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/stats/get-v3-stats-filter
    '''
    return make_request({
        "uri": f"{settings.MAILGUN_BASE_URI}/v3/stats/filter",
        "method": "get",
        "auth": settings.MAILGUN_AUTH,
        "params": filter_request_data(request.data, "get_filtered_grouped_stats"),
    })

@api_view(["PUT"])
def get_mailing_lists(request, **kwargs):
    '''
        Endpoint to access mailgun mailing lists
        See https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/mailing-lists/get-v3-lists
    '''
    return make_request({
        "uri": f"{settings.MAILGUN_BASE_URI}/v3/lists/",
        "method": "get",
        "auth": settings.MAILGUN_AUTH,
        "params": filter_request_data(request.data, "get_mailing_lists"),
    })

@api_view(["PUT"])
def get_mailing_list_members(request, **kwargs):
    '''
        Endpoint to access mailgun mailing list members
        See https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/mailing-lists/get-lists-string:list_address-members
    '''
    return make_request({
        "uri": f"{settings.MAILGUN_BASE_URI}/v3/lists/{kwargs.get("list_address")}/members/",
        "method": "get",
        "auth": settings.MAILGUN_AUTH,
        "params": filter_request_data(request.data, "get_mailing_lists"),
    })
