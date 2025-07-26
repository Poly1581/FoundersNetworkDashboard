import os
import json
from datetime import datetime, timedelta
from rest_framework.decorators import api_view
from django.http import HttpResponse, JsonResponse
from .helpers import make_request, filter_request_data

HUBSPOT_API_KEY = os.environ.get("HUBSPOT_API_KEY")
BASE_URI = "https://api.hubapi.com"
HEADERS = {"Authorization": f"Bearer {HUBSPOT_API_KEY}", "Content-Type": "application/json"}

# Mock data for HubSpot - Issues only
MOCK_HUBSPOT_ISSUES = [
    {
        "id": "hs-001",
        "title": "Contact sync rate limit exceeded",
        "level": "error",
        "status": "unresolved",
        "lastSeen": "2025-07-25T12:38:03Z",
        "category": "API Rate Limit",
        "timestamp": "2025-07-25T12:38:03Z",
        "message": "HubSpot API rate limit exceeded during contact sync operation",
        "issueCategory": "API Rate Limit",
        "count": 23
    },
    {
        "id": "hs-002", 
        "title": "Deal pipeline sync failed",
        "level": "warning",
        "status": "unresolved",
        "lastSeen": "2025-07-21T12:38:03Z",
        "category": "Pipeline Sync Error",
        "timestamp": "2025-07-21T12:38:03Z",
        "message": "Failed to sync deal pipeline data - authentication timeout",
        "issueCategory": "Pipeline Sync Error",
        "count": 15
    },
    {
        "id": "hs-003",
        "title": "Contact duplicate detection failed",
        "level": "error", 
        "status": "resolved",
        "lastSeen": "2025-07-17T12:38:03Z",
        "category": "Contact Sync Error",
        "timestamp": "2025-07-17T12:38:03Z",
        "message": "Contact duplicate detection algorithm failed during bulk import",
        "issueCategory": "Contact Sync Error",
        "count": 8
    },
    {
        "id": "hs-004",
        "title": "Webhook delivery timeout",
        "level": "warning",
        "status": "unresolved",
        "lastSeen": "2025-07-24T09:15:22Z",
        "category": "Webhook Error",
        "timestamp": "2025-07-24T09:15:22Z",
        "message": "Webhook endpoint timeout during contact update notification",
        "issueCategory": "Webhook Error",
        "count": 31
    },
    {
        "id": "hs-005",
        "title": "Company association failed",
        "level": "error",
        "status": "resolved",
        "lastSeen": "2025-07-23T14:32:17Z",
        "category": "Association Error",
        "timestamp": "2025-07-23T14:32:17Z",
        "message": "Failed to associate contact with company due to invalid company ID",
        "issueCategory": "Association Error",
        "count": 12
    },
    {
        "id": "hs-006",
        "title": "Email campaign sync delayed",
        "level": "info",
        "status": "resolved",
        "lastSeen": "2025-07-22T16:45:08Z",
        "category": "Campaign Error",
        "timestamp": "2025-07-22T16:45:08Z",
        "message": "Email campaign synchronization experienced delays due to high volume",
        "issueCategory": "Campaign Error",
        "count": 7
    },
    {
        "id": "hs-007",
        "title": "Property validation error",
        "level": "warning",
        "status": "unresolved",
        "lastSeen": "2025-07-20T11:28:41Z",
        "category": "Validation Error",
        "timestamp": "2025-07-20T11:28:41Z",
        "message": "Custom property validation failed for contact import batch",
        "issueCategory": "Validation Error",
        "count": 19
    },
    {
        "id": "hs-008",
        "title": "Deal stage transition blocked",
        "level": "error",
        "status": "unresolved",
        "lastSeen": "2025-07-19T08:52:33Z",
        "category": "Deal Error",
        "timestamp": "2025-07-19T08:52:33Z",
        "message": "Deal stage transition blocked due to missing required properties",
        "issueCategory": "Deal Error",
        "count": 6
    },
    {
        "id": "hs-009",
        "title": "OAuth token refresh failed",
        "level": "error",
        "status": "resolved",
        "lastSeen": "2025-07-18T13:17:55Z",
        "category": "Authentication Error",
        "timestamp": "2025-07-18T13:17:55Z",
        "message": "OAuth token refresh failed, requiring manual re-authentication",
        "issueCategory": "Authentication Error",
        "count": 3
    },
    {
        "id": "hs-010",
        "title": "Timeline event creation failed",
        "level": "warning",
        "status": "resolved",
        "lastSeen": "2025-07-16T10:43:29Z",
        "category": "Timeline Error",
        "timestamp": "2025-07-16T10:43:29Z",
        "message": "Failed to create timeline event for contact interaction",
        "issueCategory": "Timeline Error",
        "count": 14
    },
    {
        "id": "hs-011",
        "title": "Bulk import quota exceeded",
        "level": "error",
        "status": "unresolved",
        "lastSeen": "2025-07-15T15:21:12Z",
        "category": "Quota Error",
        "timestamp": "2025-07-15T15:21:12Z",
        "message": "Monthly bulk import quota exceeded, blocking additional imports",
        "issueCategory": "Quota Error",
        "count": 2
    },
    {
        "id": "hs-012",
        "title": "Form submission processing error",
        "level": "warning",
        "status": "resolved",
        "lastSeen": "2025-07-14T07:39:44Z",
        "category": "Form Error",
        "timestamp": "2025-07-14T07:39:44Z",
        "message": "Form submission failed to process due to invalid field mapping",
        "issueCategory": "Form Error",
        "count": 27
    },
    {
        "id": "hs-013",
        "title": "Contact merge operation failed",
        "level": "error",
        "status": "unresolved",
        "lastSeen": "2025-07-12T12:54:18Z",
        "category": "Merge Error",
        "timestamp": "2025-07-12T12:54:18Z",
        "message": "Contact merge operation failed due to conflicting property values",
        "issueCategory": "Merge Error",
        "count": 9
    },
    {
        "id": "hs-014",
        "title": "Email tracking pixel blocked",
        "level": "info",
        "status": "resolved",
        "lastSeen": "2025-07-11T18:26:37Z",
        "category": "Tracking Error",
        "timestamp": "2025-07-11T18:26:37Z",
        "message": "Email tracking pixels blocked by recipient's email client",
        "issueCategory": "Tracking Error",
        "count": 45
    },
    {
        "id": "hs-015",
        "title": "Workflow automation timeout",
        "level": "warning",
        "status": "unresolved",
        "lastSeen": "2025-07-10T20:08:51Z",
        "category": "Workflow Error",
        "timestamp": "2025-07-10T20:08:51Z",
        "message": "Workflow automation timed out during complex contact segmentation",
        "issueCategory": "Workflow Error",
        "count": 11
    },
    {
        "id": "hs-016",
        "title": "Report generation failed",
        "level": "error",
        "status": "resolved",
        "lastSeen": "2025-07-08T05:33:26Z",
        "category": "Report Error",
        "timestamp": "2025-07-08T05:33:26Z",
        "message": "Custom report generation failed due to memory limits",
        "issueCategory": "Report Error",
        "count": 4
    },
    {
        "id": "hs-017",
        "title": "CRM integration sync lag",
        "level": "warning",
        "status": "resolved",
        "lastSeen": "2025-07-06T22:15:03Z",
        "category": "Integration Error",
        "timestamp": "2025-07-06T22:15:03Z",
        "message": "Third-party CRM integration experiencing sync delays",
        "issueCategory": "Integration Error",
        "count": 18
    },
    {
        "id": "hs-018",
        "title": "Marketing email bounce rate spike",
        "level": "info",
        "status": "unresolved",
        "lastSeen": "2025-07-04T14:47:19Z",
        "category": "Email Error",
        "timestamp": "2025-07-04T14:47:19Z",
        "message": "Unusual increase in email bounce rates detected across campaigns",
        "issueCategory": "Email Error",
        "count": 33
    }
]

@api_view(["GET"])
def get_hubspot_issues(request, **kwargs):
    """
    Get HubSpot API issues/events - serving mock data for development
    Creates multiple event entries based on count for better chart visualization
    """
    try:
        # Expand issues based on their count to create multiple entries
        expanded_events = []
        import random
        from datetime import datetime, timedelta
        
        for issue in MOCK_HUBSPOT_ISSUES:
            count = issue.get('count', 1)
            base_timestamp = datetime.fromisoformat(issue['timestamp'].replace('Z', '+00:00'))
            
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
                
                event_entry = issue.copy()
                event_entry['id'] = f"{issue['id']}-{i+1}"
                event_entry['timestamp'] = event_time.isoformat() + 'Z'
                event_entry['lastSeen'] = event_time.isoformat() + 'Z'
                expanded_events.append(event_entry)
        
        return JsonResponse(expanded_events, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(["GET"])
def get_hubspot_integrations(request, **kwargs):
    """
    Get HubSpot integration status - serving mock data for development
    """
    try:
        # Mock integration status
        integrations = [
            {
                "name": "HubSpot CRM API",
                "category": "CRM",
                "status": "Healthy",
                "responseTime": "145ms",
                "lastSuccess": "Just now",
                "uptime": "99.95%",
                "issue": None
            }
        ]
        return JsonResponse(integrations, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

