from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db.models import Avg, Q
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import requests
import json
import logging
from .models import *

logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'recipes/index.html')

def account(request):
    return render(request, 'recipes/account.html')

def signup(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return redirect('account')

        # Create new user
        user = User.objects.create_user(email=email, name=name, password=password)
        return redirect('account')

    return redirect('account')

def user_login(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, 'Logged in successfully!')
            return redirect('home')
        else:
            messages.error(request, 'Invalid email or password.')
            return redirect('account')

    return redirect('account')

@login_required
def home(request):
    return render(request, 'recipes/home.html')

def user_logout(request):
    logout(request)
    messages.success(request, 'Logged out successfully!')
    return redirect('index')

@login_required
def editprofile(request):
    # Chunk recipes into groups of 4 for carousels
    recipes = request.user.recipes.all()
    recipes_chunked = [recipes[i:i + 4] for i in range(0, len(recipes), 4)]
    return render(request, 'recipes/editprofile.html', {'recipes_chunked': recipes_chunked})

@login_required
def profileform(request):
    if request.method == 'POST':
        user = request.user
        user.name = request.POST.get('name')
        user.occupation = request.POST.get('occupation', '')
        user.hobby = request.POST.get('hobby', '')
        user.location = request.POST.get('location', '')
        user.categories = request.POST.get('categories', '')
        user.bio = request.POST.get('bio', '')
        
        if 'profile_picture' in request.FILES:
            user.profile_picture = request.FILES['profile_picture']
        
        user.save()
        return redirect('editprofile')
    
    return render(request, 'recipes/profileform.html')

@login_required
def recipeform(request):
    if request.method == 'POST':
        recipe = Recipe(
            user=request.user,
            recipe_name=request.POST.get('recipe_name'),
            meal_category=request.POST.get('meal_category', ''),
            prep_time=request.POST.get('prep_time', ''),
            cook_time=request.POST.get('cook_time', ''),
            total_time=request.POST.get('total_time', ''),
            servings=request.POST.get('servings', ''),
            description=request.POST.get('description', ''),
            ingredients=request.POST.get('ingredients', ''),
            instructions=request.POST.get('instructions', ''),
            additional_notes=request.POST.get('additional_notes', '')
        )
        if 'recipe_image' in request.FILES:
            recipe.recipe_image = request.FILES['recipe_image']
        recipe.save()
        return redirect('editprofile')
    
    return render(request, 'recipes/recipeform.html')

@login_required
def recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    ratings = recipe.ratings.all()
    average_rating = ratings.aggregate(Avg('rating'))['rating__avg'] if ratings.exists() else 0
    comments = recipe.comments.all()
    return render(request, 'recipes/recipe.html', {
        'recipe': recipe,
        'average_rating': average_rating,
        'ratings_count': ratings.count(),
        'comments': comments
    })

@login_required
@csrf_exempt
def rate_recipe(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            logger.debug(f"Received rating data: {data}")
            recipe_id = data.get('recipe_id')
            rating = float(data.get('rating'))
            logger.debug(f"Parsed recipe_id: {recipe_id}, rating: {rating}")

            if not 0 <= rating <= 5:
                logger.warning("Rating out of range")
                return JsonResponse({'error': 'Rating must be between 0 and 5'}, status=400)

            recipe = get_object_or_404(Recipe, id=recipe_id)
            logger.debug(f"Found recipe: {recipe}")

            rating_obj, created = Ratings.objects.update_or_create(
                recipe=recipe,
                user=request.user,
                defaults={'rating': rating}
            )
            logger.debug(f"Rating object {'created' if created else 'updated'}: {rating_obj}")

            return JsonResponse({'message': 'Rating submitted successfully'})
        except Exception as e:
            logger.error(f"Error in rate_recipe: {str(e)}", exc_info=True)
            return JsonResponse({'error': str(e)}, status=500)
    logger.warning("Invalid request method for rate_recipe")
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@login_required
@csrf_exempt
def comment_recipe(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            logger.debug(f"Received comment data: {data}")
            recipe_id = data.get('recipe_id')
            comment_text = data.get('comment')
            logger.debug(f"Parsed recipe_id: {recipe_id}, comment: {comment_text}")

            if not comment_text:
                logger.warning("Comment is empty")
                return JsonResponse({'error': 'Comment cannot be empty'}, status=400)

            recipe = get_object_or_404(Recipe, id=recipe_id)
            logger.debug(f"Found recipe: {recipe}")

            comment_obj = Comments.objects.create(recipe=recipe, user=request.user, comment=comment_text)
            logger.debug(f"Created comment: {comment_obj}")

            return JsonResponse({'message': 'Comment submitted successfully'})
        except Exception as e:
            logger.error(f"Error in comment_recipe: {str(e)}", exc_info=True)
            return JsonResponse({'error': str(e)}, status=500)
    logger.warning("Invalid request method for comment_recipe")
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@login_required
def chatbot(request):
    return render(request, 'recipes/chatbot.html')

@login_required
@csrf_exempt
def chatbot_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            user_message = data.get('message', '')
            if not user_message:
                return JsonResponse({'response': 'Please provide a message.'}, status=400)

            # System prompt to restrict to food-related topics
            system_prompt = (
                "You are Culinary Cloud, a friendly AI assistant specialized in food, recipes, calories, ingredients, diets, and nutrition. "
                "Answer all questions related to these topics in a helpful and accurate manner. "
                "If a user asks about unrelated topics, politely redirect them to discuss food, recipes, or nutrition. "
                "Example: 'I'm happy to help with food-related questions! Could you tell me about a recipe or diet you're interested in?'"
            )
            prompt = f"{system_prompt}\n\nUser: {user_message}\nAssistant: "

            # Use Mistral-7B-Instruct-v0.3
            api_url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
            headers = {
                "Authorization": f"Bearer {settings.HUGGINGFACE_API_TOKEN}",
                "Content-Type": "application/json",
            }
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 200,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "do_sample": True,
                },
            }
            response = requests.post(api_url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()

            # Check if the response has the expected structure
            if not isinstance(result, list) or not result or "generated_text" not in result[0]:
                raise ValueError("Unexpected response format from Hugging Face API")

            ai_response = result[0]["generated_text"].replace(prompt, "").strip()
            return JsonResponse({'response': ai_response})
        except Exception as e:
            return JsonResponse({'response': f'Sorry, something went wrong: {str(e)}'}, status=500)
    return JsonResponse({'response': 'Invalid request method.'}, status=400)

@login_required
def search(request):
    # Fetch popular recipes (top 4 by average rating)
    popular_recipes = Recipe.objects.annotate(
        avg_rating=Avg('ratings__rating')
    ).order_by('-avg_rating')[:4]
    
    # Calculate average rating and ratings count for each recipe
    for recipe in popular_recipes:
        ratings = recipe.ratings.all()
        recipe.average_rating = ratings.aggregate(Avg('rating'))['rating__avg'] if ratings.exists() else 0
        recipe.ratings_count = ratings.count()

    # Chunk popular recipes into groups of 4 (though we only have 4, so 1 row)
    popular_recipes_chunked = [popular_recipes[i:i + 4] for i in range(0, len(popular_recipes), 4)]

    # Fetch latest recipes (most recent 4 by creation date)
    latest_recipes = Recipe.objects.order_by('-id')[:4]
    
    # Calculate average rating and ratings count for each recipe
    for recipe in latest_recipes:
        ratings = recipe.ratings.all()
        recipe.average_rating = ratings.aggregate(Avg('rating'))['rating__avg'] if ratings.exists() else 0
        recipe.ratings_count = ratings.count()

    # Chunk latest recipes into groups of 4
    latest_recipes_chunked = [latest_recipes[i:i + 4] for i in range(0, len(latest_recipes), 4)]

    return render(request, 'recipes/search.html', {
        'popular_recipes': popular_recipes_chunked,
        'latest_recipes': latest_recipes_chunked,
    })

@login_required
@csrf_exempt
def search_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            query = data.get('query', '').strip()
            logger.debug(f"Search query received: {query}")

            if not query:
                return JsonResponse({'error': 'Search query cannot be empty'}, status=400)

            # Search recipes by name, ingredients, or description
            recipes = Recipe.objects.filter(
                Q(recipe_name__icontains=query) |
                Q(ingredients__icontains=query) |
                Q(description__icontains=query)
            )

            # Calculate average rating and ratings count for each recipe
            results = []
            for recipe in recipes:
                ratings = recipe.ratings.all()
                avg_rating = ratings.aggregate(Avg('rating'))['rating__avg'] if ratings.exists() else 0
                results.append({
                    'id': recipe.id,
                    'recipe_name': recipe.recipe_name,
                    'recipe_image': recipe.recipe_image.url if recipe.recipe_image else None,
                    'average_rating': float(avg_rating) if avg_rating else 0,
                    'ratings_count': ratings.count(),
                })

            # Chunk results into groups of 4 for carousels
            chunked_results = [results[i:i + 4] for i in range(0, len(results), 4)]
            return JsonResponse({'results': chunked_results})
        except Exception as e:
            logger.error(f"Error in search_api: {str(e)}", exc_info=True)
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@login_required
def mealplan(request):
    return render(request, 'recipes/mealplan.html')