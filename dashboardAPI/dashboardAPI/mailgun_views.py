import os
import json
from datetime import datetime, timedelta
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .helpers import make_request, filter_request_data

API_NAME = os.environ.get("MAILGUN_API_NAME")
API_KEY = os.environ.get("MAILGUN_API_KEY")
BASE_URI = "https://api.mailgun.net"
AUTH = ('api', f"{API_KEY}")

# Mock data for Mailgun - Issues only (formatted as events for chart compatibility)
MOCK_MAILGUN_EVENTS = [
    {
        "id": "mg-issue-001",
        "title": "High bounce rate detected",
        "level": "error",
        "status": "unresolved",
        "lastSeen": "2025-07-13T12:38:03Z",
        "category": "Delivery Issue",
        "timestamp": "2025-07-13T12:38:03Z",
        "message": "Unusual spike in email bounce rates detected across multiple campaigns",
        "issueCategory": "Delivery Issue",
        "event": "bounced",
        "recipient": "invalid@bounced-domain.com",
        "deliveryStatus": "bounced",
        "userVariables": {"campaign": "newsletter-july-2025"},
        "tags": ["bounce", "delivery-issue"],
        "count": 47
    },
    {
        "id": "mg-issue-002", 
        "title": "SMTP connection timeout",
        "level": "warning",
        "status": "unresolved",
        "lastSeen": "2025-07-09T12:38:03Z",
        "category": "Connection Error",
        "timestamp": "2025-07-09T12:38:03Z",
        "message": "SMTP connection timeouts affecting email delivery performance",
        "issueCategory": "Connection Error",
        "event": "failed",
        "recipient": "user@timeout-domain.com",
        "deliveryStatus": "failed",
        "userVariables": {"campaign": "welcome-series"},
        "tags": ["smtp", "timeout"],
        "count": 12
    },
    {
        "id": "mg-issue-003",
        "title": "Domain reputation warning",
        "level": "warning",
        "status": "resolved",
        "lastSeen": "2025-07-05T12:38:03Z",
        "category": "Reputation Issue",
        "timestamp": "2025-07-05T12:38:03Z",
        "message": "Domain reputation score decreased due to spam complaints",
        "issueCategory": "Reputation Issue",
        "event": "complained",
        "recipient": "complaints@example.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "promotional-offers"},
        "tags": ["reputation", "spam"],
        "count": 8
    },
    {
        "id": "mg-issue-004",
        "title": "API rate limit exceeded",
        "level": "error", 
        "status": "resolved",
        "lastSeen": "2025-07-01T12:38:03Z",
        "category": "API Rate Limit",
        "timestamp": "2025-07-01T12:38:03Z",
        "message": "Mailgun API rate limit exceeded during bulk email send operation",
        "issueCategory": "API Rate Limit",
        "event": "failed",
        "recipient": "bulk@ratelimit-test.com",
        "deliveryStatus": "failed",
        "userVariables": {"campaign": "bulk-newsletter", "batch": "rate-limited"},
        "tags": ["api", "rate-limit"],
        "count": 19
    },
    {
        "id": "mg-issue-005",
        "title": "Webhook validation failed",
        "level": "warning",
        "status": "unresolved",
        "lastSeen": "2025-07-25T16:22:14Z",
        "category": "Webhook Error",
        "timestamp": "2025-07-25T16:22:14Z",
        "message": "Webhook signature validation failed for delivery notification",
        "issueCategory": "Webhook Error",
        "event": "delivered",
        "recipient": "webhook@validation-fail.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "transactional-emails"},
        "tags": ["webhook", "validation"],
        "count": 6
    },
    {
        "id": "mg-issue-006",
        "title": "Suppression list sync error",
        "level": "error",
        "status": "resolved",
        "lastSeen": "2025-07-24T11:45:07Z",
        "category": "Suppression Error",
        "timestamp": "2025-07-24T11:45:07Z",
        "message": "Failed to sync suppression list updates across domain configurations",
        "issueCategory": "Suppression Error",
        "event": "failed",
        "recipient": "suppressed@blocked-domain.com",
        "deliveryStatus": "failed",
        "userVariables": {"campaign": "marketing-blast"},
        "tags": ["suppression", "sync-error"],
        "count": 24
    },
    {
        "id": "mg-issue-007",
        "title": "Template rendering timeout",
        "level": "warning",
        "status": "resolved",
        "lastSeen": "2025-07-23T08:17:33Z",
        "category": "Template Error",
        "timestamp": "2025-07-23T08:17:33Z",
        "message": "Email template rendering timed out due to complex dynamic content",
        "issueCategory": "Template Error",
        "event": "failed",
        "recipient": "template@timeout-test.com",
        "deliveryStatus": "failed",
        "userVariables": {"campaign": "personalized-newsletter"},
        "tags": ["template", "timeout"],
        "count": 15
    },
    {
        "id": "mg-issue-008",
        "title": "Attachment size limit exceeded",
        "level": "error",
        "status": "unresolved",
        "lastSeen": "2025-07-22T14:39:28Z",
        "category": "Attachment Error",
        "timestamp": "2025-07-22T14:39:28Z",
        "message": "Email attachment exceeds 25MB size limit and was rejected",
        "issueCategory": "Attachment Error",
        "event": "failed",
        "recipient": "largefile@attachment-test.com",
        "deliveryStatus": "failed",
        "userVariables": {"campaign": "document-sharing"},
        "tags": ["attachment", "size-limit"],
        "count": 3
    },
    {
        "id": "mg-issue-009",
        "title": "DNS configuration warning",
        "level": "info",
        "status": "resolved",
        "lastSeen": "2025-07-21T19:52:41Z",
        "category": "DNS Error",
        "timestamp": "2025-07-21T19:52:41Z",
        "message": "DNS records show potential SPF configuration issues affecting deliverability",
        "issueCategory": "DNS Error",
        "event": "delivered",
        "recipient": "dns@config-warning.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "system-notifications"},
        "tags": ["dns", "spf", "deliverability"],
        "count": 11
    },
    {
        "id": "mg-issue-010",
        "title": "Batch processing delay",
        "level": "warning",
        "status": "resolved",
        "lastSeen": "2025-07-20T13:26:15Z",
        "category": "Processing Error",
        "timestamp": "2025-07-20T13:26:15Z",
        "message": "Batch email processing experienced delays due to high queue volume",
        "issueCategory": "Processing Error",
        "event": "delivered",
        "recipient": "batch@processing-delay.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "weekly-digest", "batch": "delayed"},
        "tags": ["batch", "delay", "queue"],
        "count": 28
    },
    {
        "id": "mg-issue-011",
        "title": "Unsubscribe link malformed",
        "level": "error",
        "status": "unresolved",
        "lastSeen": "2025-07-19T10:14:52Z",
        "category": "Link Error",
        "timestamp": "2025-07-19T10:14:52Z",
        "message": "Unsubscribe link generation failed due to malformed recipient data",
        "issueCategory": "Link Error",
        "event": "delivered",
        "recipient": "malformed@unsubscribe-test.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "promotional-emails"},
        "tags": ["unsubscribe", "link-error"],
        "count": 35
    },
    {
        "id": "mg-issue-012",
        "title": "IP reputation degraded",
        "level": "warning",
        "status": "unresolved",
        "lastSeen": "2025-07-18T07:43:29Z",
        "category": "IP Reputation Error",
        "timestamp": "2025-07-18T07:43:29Z",
        "message": "Sending IP reputation score decreased, affecting delivery rates",
        "issueCategory": "IP Reputation Error",
        "event": "delivered",
        "recipient": "reputation@ip-test.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "bulk-marketing"},
        "tags": ["ip-reputation", "delivery-impact"],
        "count": 9
    },
    {
        "id": "mg-issue-013",
        "title": "Message size validation failed",
        "level": "error",
        "status": "resolved",
        "lastSeen": "2025-07-17T15:31:47Z",
        "category": "Validation Error",
        "timestamp": "2025-07-17T15:31:47Z",
        "message": "Email message size exceeds maximum allowed limit for recipient domain",
        "issueCategory": "Validation Error",
        "event": "failed",
        "recipient": "oversized@validation-test.com",
        "deliveryStatus": "failed",
        "userVariables": {"campaign": "rich-content-newsletter"},
        "tags": ["message-size", "validation"],
        "count": 17
    },
    {
        "id": "mg-issue-014",
        "title": "Tracking domain SSL expired",
        "level": "error",
        "status": "resolved",
        "lastSeen": "2025-07-16T12:58:36Z",
        "category": "SSL Error",
        "timestamp": "2025-07-16T12:58:36Z",
        "message": "SSL certificate for tracking domain expired, affecting click tracking",
        "issueCategory": "SSL Error",
        "event": "delivered",
        "recipient": "ssl@tracking-test.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "click-tracking-test"},
        "tags": ["ssl", "tracking", "certificate"],
        "count": 5
    },
    {
        "id": "mg-issue-015",
        "title": "Spam filter triggered",
        "level": "warning",
        "status": "unresolved",
        "lastSeen": "2025-07-15T09:20:13Z",
        "category": "Spam Filter Error",
        "timestamp": "2025-07-15T09:20:13Z",
        "message": "Email content triggered spam filters at recipient mail server",
        "issueCategory": "Spam Filter Error",
        "event": "delivered",
        "recipient": "spam@filter-test.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "promotional-sale"},
        "tags": ["spam-filter", "content-warning"],
        "count": 22
    },
    {
        "id": "mg-issue-016",
        "title": "Mailing list corruption detected",
        "level": "error",
        "status": "resolved",
        "lastSeen": "2025-07-14T18:35:24Z",
        "category": "List Error",
        "timestamp": "2025-07-14T18:35:24Z",
        "message": "Mailing list data corruption detected during bulk import operation",
        "issueCategory": "List Error",
        "event": "failed",
        "recipient": "corrupted@list-test.com",
        "deliveryStatus": "failed",
        "userVariables": {"campaign": "list-import", "list": "corrupted-batch"},
        "tags": ["mailing-list", "corruption"],
        "count": 14
    },
    {
        "id": "mg-issue-017",
        "title": "Custom header validation error",
        "level": "warning",
        "status": "resolved",
        "lastSeen": "2025-07-12T06:47:58Z",
        "category": "Header Error",
        "timestamp": "2025-07-12T06:47:58Z",
        "message": "Custom email headers failed validation and were stripped from message",
        "issueCategory": "Header Error",
        "event": "delivered",
        "recipient": "headers@validation-test.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "custom-headers-test"},
        "tags": ["headers", "validation", "custom"],
        "count": 7
    },
    {
        "id": "mg-issue-018",
        "title": "Sender authentication failed",
        "level": "error",
        "status": "unresolved",
        "lastSeen": "2025-07-11T21:12:05Z",
        "category": "Authentication Error",
        "timestamp": "2025-07-11T21:12:05Z",
        "message": "DKIM signature validation failed for outbound email authentication",
        "issueCategory": "Authentication Error",
        "event": "delivered",
        "recipient": "auth@dkim-test.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "authentication-test"},
        "tags": ["dkim", "authentication", "signature"],
        "count": 31
    },
    {
        "id": "mg-issue-019",
        "title": "Queue processing backlog",
        "level": "info",
        "status": "resolved",
        "lastSeen": "2025-07-10T04:28:42Z",
        "category": "Queue Error",
        "timestamp": "2025-07-10T04:28:42Z",
        "message": "Email queue processing backlog due to temporary system maintenance",
        "issueCategory": "Queue Error",
        "event": "delivered",
        "recipient": "queue@backlog-test.com",
        "deliveryStatus": "delivered",
        "userVariables": {"campaign": "system-maintenance"},
        "tags": ["queue", "backlog", "maintenance"],
        "count": 16
    }
]

@api_view(["GET"])
def get_queue_status(request, **kwargs):
    '''
        Endpoint to access mailgun messages queue status.
        See https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/messages/get-v3-domains--name--sending-queues
    '''
    return make_request({
        "uri": f"{BASE_URI}/v3/domains/{API_NAME}/sending_queues",
        "method": "get",
        "auth": AUTH,
    })

@api_view(["PUT"])
def get_account_metrics(request, **kwargs):
    '''
        Endpoint to access mailgun account metrics.
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/metrics/post-v1-analytics-metrics
    '''
    return make_request({
        "uri": f"{BASE_URI}/v1/analytics/metrics",
        "method": "post",
        "auth": AUTH,
        "json": filter_request_data(request.data, "get_account_metrics"),
    })

@api_view(["PUT"])
def get_account_usage_metrics(request, **kwargs):
    '''
        Endpoint to access mailgun account usage metrics
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/metrics/post-v1-analytics-usage-metrics
    '''
    return make_request({
        "uri": f"{BASE_URI}/v1/analytics/usage/metrics",
        "method": "post",
        "auth": AUTH,
        "json": filter_request_data(request.data, "get_account_usage_metrics"),
    })

@api_view(["PUT"])
def get_logs(request, **kwargs):
    '''
        Endpoint to access mailgun logs
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/logs/post-v1-analytics-logs
    '''
    return make_request({
        "uri": f"{BASE_URI}/v1/analytics/logs",
        "method": "post",
        "auth": AUTH,
        "json": filter_request_data(request.data, "get_logs"),
    })

@api_view(["PUT"])
def get_stat_totals(request, **kwargs):
    '''
        Endpoint to access mailgun stats
        See: https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/stats/get-v3-stats-total
    '''
    return make_request({
        "uri": f"{BASE_URI}/v3/stats/total",
        "method": "get",
        "auth": AUTH,
        "params": filter_request_data(request.data, "get_stat_totals"),
    })

@api_view(["PUT"])
def get_filtered_grouped_stats(request, **kwargs):
    '''
        Endpoint to access mailgun filtered/grouped stats
        See https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/stats/get-v3-stats-filter
    '''
    return make_request({
        "uri": f"{BASE_URI}/v3/stats/filter",
        "method": "get",
        "auth": AUTH,
        "params": filter_request_data(request.data, "get_filtered_grouped_stats"),
    })

@api_view(["PUT"])
def get_mailing_lists(request, **kwargs):
    '''
        Endpoint to access mailgun mailing lists
        See https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/mailing-lists/get-v3-lists
    '''
    return make_request({
        "uri": f"{BASE_URI}/v3/lists/",
        "method": "get",
        "auth": AUTH,
        "params": filter_request_data(request.data, "get_mailing_lists"),
    })

@api_view(["PUT"])
def get_mailing_list_members(request, **kwargs):
    '''
        Endpoint to access mailgun mailing list members
        See https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/mailing-lists/get-lists-string:list_address-members
    '''
    return make_request({
        "uri": f"{BASE_URI}/v3/lists/{kwargs.get("list_address")}/members/",
        "method": "get",
        "auth": AUTH,
        "params": filter_request_data(request.data, "get_mailing_lists"),
    })

@api_view(["GET"])
def get_mailgun_events(request, **kwargs):
    """
    Get Mailgun email events - serving mock data for development
    Creates multiple event entries based on count for better chart visualization
    """
    try:
        # Expand events based on their count to create multiple entries
        expanded_events = []
        import random
        from datetime import datetime, timedelta
        
        for event in MOCK_MAILGUN_EVENTS:
            count = event.get('count', 1)
            base_timestamp = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00'))
            
            # Create multiple entries spread across time
            for i in range(count):
                # Randomly distribute events within the last 30 days
                random_days_back = random.randint(0, 29)
                random_hours_back = random.randint(0, 23)
                random_minutes_back = random.randint(0, 59)
                
                event_time = datetime.now() - timedelta(
                    days=random_days_back, 
                    hours=random_hours_back, 
                    minutes=random_minutes_back
                )
                
                event_entry = event.copy()
                event_entry['id'] = f"{event['id']}-{i+1}"
                event_entry['timestamp'] = event_time.isoformat() + 'Z'
                event_entry['lastSeen'] = event_time.isoformat() + 'Z'
                expanded_events.append(event_entry)
        
        return JsonResponse(expanded_events, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
def get_mailgun_integrations(request, **kwargs):
    """
    Get Mailgun integration status - serving mock data for development
    """
    try:
        # Mock integration status
        integrations = [
            {
                "name": "Mailgun Email API",
                "category": "Email Service",
                "status": "Healthy",
                "responseTime": "120ms",
                "lastSuccess": "Just now",
                "uptime": "99.98%",
                "issue": None
            }
        ]
        return JsonResponse(integrations, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

