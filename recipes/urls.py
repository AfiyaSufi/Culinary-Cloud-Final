from django.urls import path
from .views import *

urlpatterns = [
    path('', index, name='index'),
    path('account', account, name='account'),
    path('signup/', signup, name='signup'),
    path('login/', user_login, name='login'),
    path('home/', home, name='home'),
    path('logout/', user_logout, name='logout'),
    path('editprofile/', editprofile, name='editprofile'),
    path('profileform/', profileform, name='profileform'),
    path('recipeform/', recipeform, name='recipeform'),
    path('chatbot/', chatbot, name='chatbot'),
    path('chatbot/api/', chatbot_api, name='chatbot_api'),
    path('recipe/<int:recipe_id>/', recipe, name='recipe'),
    path('recipe/rate/', rate_recipe, name='rate_recipe'),
    path('recipe/comment/', comment_recipe, name='comment_recipe'),
    path('search/', search, name='search'),
    path('search/api/', search_api, name='search_api'),
    path('mealplan/', mealplan, name='mealplan'),
]