"""
URL configuration for dashboardAPI project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based vi ews
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import re_path

from . import views

urlpatterns = [
    re_path(r"^admin/?", admin.site.urls, name="urls"),
    re_path(r"issues/<int:issue_id>/events/?", views.get_issue_events, name="get_issue_events"),
    re_path(r"issues/<int:issue_id>/?", views.update_issue_status, name="update_issue_status"),
    re_path(r"issues/?", views.get_issues, name="get_issues"),
    re_path(r"events/?", views.get_events, name="get_events"),
]
