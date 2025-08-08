"""
Integration Tests Module

This module contains Django test cases for validating third-party service integrations
within the dashboardAPI project. It tests the connectivity and status endpoints
for various external services, including Sentry and HubSpot.

Usage:
    Run these tests using Django's test runner:
        python manage.py test dashboardAPI.tests.test_integrations
    
    Or run specific test methods:
        python manage.py test dashboardAPI.tests.test_integrations.IntegrationsTest.test_get_sentry_integration_status

Test Coverage:
    - Sentry integration status endpoint validation
    - HubSpot integration status endpoint validation
"""

from django.test import Client, TestCase

class IntegrationsTest(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)

    def test_get_sentry_integration_status(self):
        response = self.client.get("/api/sentry/integration-status/")
        self.assertEqual(response.status_code, 200)
    
    def test_get_hubspot_integration_status(self):
        response = self.client.get("/api/hubspot/integration-status/")
        self.assertEqual(response.status_code, 200)
