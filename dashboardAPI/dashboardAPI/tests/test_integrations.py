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
