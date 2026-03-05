from django.urls import path
from .views import OrganizationListView , OrganizationCreateView

urlpatterns = [
    path("" , OrganizationListView.as_view() , name="organizations"),
    path("create/" , OrganizationCreateView.as_view() , name="organization-create"),
]