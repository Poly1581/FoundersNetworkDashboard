from django.test import Client, TestCase

class SentryTest(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)

    def test_get_issue_events(self):
        issues_response = self.client.get("/api/sentry/issues/")
        if issues_response.status_code == 200:
            json = issues_response.json()
            if json[0]["id"]:
                response = self.client.get(f"/api/sentry/issues/{json[0]["id"]}/events/")
                self.assertEqual(response.status_code, 200)

    def test_get_issues(self):
        response = self.client.get("/api/sentry/issues/")
        self.assertEqual(response.status_code, 200)

    def test_get_events(self):
        response = self.client.get("/api/sentry/events/")
        self.assertEqual(response.status_code, 200)
    
    def test_get_sentry_alerts(self):
        response = self.client.get("/api/sentry/alerts/")
        self.assertEqual(response.status_code, 200)
