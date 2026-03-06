from django.urls import path
from .views import ProjectListView , ProjectCreateView

urlpatterns = [
    path('' , ProjectListView.as_view() , name="list-projects"),
    path('create/' , ProjectCreateView.as_view() , name="create-projects"),
]