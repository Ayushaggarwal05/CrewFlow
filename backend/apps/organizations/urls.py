from django.urls import path
from .views import OrganizationListCreateView , OrganizationDetailView

urlpatterns = [
    path("" , OrganizationListCreateView.as_view() , name="organizations-list"),
    path("<int:pk>/" , OrganizationDetailView.as_view() , name="organization-detail"),
]