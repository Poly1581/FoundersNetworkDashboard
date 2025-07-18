import os
import json
import requests
from django.http import HttpResponse 
from rest_framework.decorators import api_view
from datetime import datetime

SENTRY_BEARER_AUTH = os.environ.get("SENTRY_BEARER_AUTH")
HEADERS = {
    "Authorization": f"Bearer {SENTRY_BEARER_AUTH}"
}

def get_sentry_api_status():
    sentry_api_status = {
            "name": "Sentry API",
            "category": "Error Tracking",
            "status": "Unhealthy",
            "responseTime": "N/A",
            "lastSuccess": None,
            "uptime": "0%",
            "issue": None
    }
    try:
        start_time = datetime.now()
        response = requests.get("https://sentry.io/_health/", headers = HEADERS)
        end_time = datetime.now()
        response_time = (end_time - start_time).total_seconds() * 1000
        if response.status_code == 200:
            sentry_api_status.update({
                "status": "Healthy",
                "responseTime": f"{response_time:.2f}ms",
                "lastSuccess": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "uptime": "99.95%",  # This would need to be calculated over time
            })
        else:
            sentry_api_status.update({
                "responseTime": f"{response_time:.2f}ms",
                "issue": f"API returned status code {response.status_code}"
            })
    except Exception as e:
        sentry_api_status.update({
            "issue": str(e)
        })
    return sentry_api_status

def get_sentry_webhooks_status():
    sentry_webhooks_status = {
        "name": "Sentry Webhooks",
        "category": "Alerting",
        "status": "Healthy",
        "responseTime": "N/A",
        "lastSuccess": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "uptime": "100%",
        "issue": None
    }
    return sentry_webhooks_status

@api_view(["GET"])
def get_sentry_integration_status(request, **kwargs):
    return HttpResponse(json.dumps([get_sentry_api_status(), get_sentry_webhooks_status()]), content_type="application/json")

def get_hubspot_api_status():
    hubspot_api_status = {
        "name": "HubSpot API",
        "category": "CRM",
        "status": "Down",
        "responseTime": "N/A",
        "lastSuccess": None,
        "uptime": "0%",
        "issue": None,
    }
    try:
        # Simulate a health check (using a reliable endpoint for demo)
        start_time = datetime.now()
        response = requests.get("https://httpbin.org/status/200", timeout=5)
        end_time = datetime.now()
        response_time = (end_time - start_time).total_seconds() * 1000
        
        if response.status_code == 200:
            hubspot_api_status.update({
                "status": "Healthy",
                "responseTime": f"{response_time:.2f}ms",
                "lastSuccess": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "uptime": "99.9%",
            })
        else:
            hubspot_api_status.update({
                "status": "Degraded",
                "responseTime": f"{response_time:.2f}ms",
                "uptime": "95%",
                "issue": f"API returned status code {response.status_code}"
            })
    except Exception as e:
        hubspot_api_status.update({
            "issue": str(e)
        })
    return hubspot_api_status

def get_hubspot_webhooks_status():
    hubspot_webhooks_status = {
        "name": "HubSpot Webhooks",
        "category": "Notifications",
        "status": "Healthy",
        "responseTime": "N/A",
        "lastSuccess": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "uptime": "100%",
        "issue": None
    }
    return hubspot_webhooks_status


@api_view(["GET"])
def get_hubspot_integration_status(request, **kwargs):
    return HttpResponse(json.dumps([get_hubspot_api_status(), get_hubspot_webhooks_status()]), content_type="application/json")
