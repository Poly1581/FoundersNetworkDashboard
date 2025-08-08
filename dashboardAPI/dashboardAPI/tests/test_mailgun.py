"""
Mailgun Integration Tests Module

This module contains Django test cases for validating Mailgun email service integration
within the dashboardAPI project. It tests various Mailgun API endpoints including
queue status, account metrics, usage statistics, logs, and mailing list functionality.

Usage:
    Run these tests using Django's test runner:
        python manage.py test dashboardAPI.tests.test_mailgun
    
    Or run specific test methods:
        python manage.py test dashboardAPI.tests.test_mailgun.MailgunTest.test_get_queue_status

Test Coverage:
    - Queue status monitoring
    - Account metrics retrieval
    - Usage metrics tracking
    - Log data access
    - Statistical totals and filtered stats
    - Mailing list member management (commented out - requires list_address parameter)
"""

from django.test import Client, TestCase

class MailgunTest(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)

    def test_get_queue_status(self):
        response = self.client.get("/api/mailgun/queue-status/")
        self.assertEqual(response.status_code, 200)

    def test_get_account_metrics(self):
        response = self.client.put("/api/mailgun/account-metrics/")
        self.assertEqual(response.status_code, 200)

    def test_get_account_usage_metrics(self):
        response = self.client.put("/api/mailgun/account-usage-metrics/")
        self.assertEqual(response.status_code, 200)

    def test_get_logs(self):
        response = self.client.put("/api/mailgun/logs/")
        self.assertEqual(response.status_code, 200)

    def test_get_stat_totals(self):
        response = self.client.put(
            "/api/mailgun/stats/totals/",
            content_type="application/json",
            data = {
                "event": "accepted"
            }
        )
        self.assertEqual(response.status_code, 200)

    def test_get_filtered_grouped_stats(self):
        response = self.client.put(
            "/api/mailgun/stats/filter/",
            content_type="application/json",
            data = {
                "event": "accepted"
            }
        )
        self.assertEqual(response.status_code, 200)

    # Need list_address to call properly
    # def test_get_mailing_list_members(self):
        # response = self.client.put("/api/mailgun/mailing-list-members/<str:list_address>/")
        # self.assertEqual(response.status_code, 200)
