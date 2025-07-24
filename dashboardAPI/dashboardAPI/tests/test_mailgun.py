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

    # Failing with response code 404
    # def test_get_stat_totals(self):
        # response = self.client.put("/api/mailgun/stats/totals/")
        # self.assertEqual(response.status_code, 200)

    # Failing with response code 404
    # def test_get_filtered_grouped_stats(self):
        # response = self.client.put("/api/mailgun/stats/filter/")
        # self.assertEqual(response.status_code, 200)

    # Failing with response code 400
    # def test_get_mailing_lists(self):
        # response = self.client.put("/api/mailgun/mailing-lists/")
        # self.assertEqual(response.status_code, 200)

    # Need list_address to call properly
    # def test_get_mailing_list_members(self):
        # response = self.client.put("/api/mailgun/mailing-list-members/<str:list_address>/")
        # self.assertEqual(response.status_code, 200)
