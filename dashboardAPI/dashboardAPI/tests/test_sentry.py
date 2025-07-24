from django.test import Client, TestCase

class SentryTest(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)

    # def test_get_issue_events(self):
        # api/sentry/issues/<int:issue_id>/events/

    # def update_issue_status(self):
        # api/sentry/issues/<int:issue_id>/

    def test_get_issues(self):
        response = self.client.get("/api/sentry/issues/")
        self.assertEqual(response.status_code, 200)

    def test_get_events(self):
        response = self.client.get("/api/sentry/events/")
        self.assertEqual(response.status_code, 200)
    
    def test_get_sentry_alerts(self):
        response = self.client.get("/api/sentry/alerts/")
        self.assertEqual(response.status_code, 200)

