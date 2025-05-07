from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True)
    hobby = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    categories = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    date_joined = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.name
    
class Recipe(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes')
    recipe_name = models.CharField(max_length=100)
    meal_category = models.CharField(max_length=50, blank=True)
    prep_time = models.CharField(max_length=50, blank=True)
    cook_time = models.CharField(max_length=50, blank=True)
    total_time = models.CharField(max_length=50, blank=True)
    servings = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    ingredients = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    additional_notes = models.TextField(blank=True)
    recipe_image = models.ImageField(upload_to='recipe_images/', blank=True, null=True)

    def __str__(self):
        return self.recipe_name

class Ratings(models.Model):
    ratings_id = models.AutoField(primary_key=True)
    rating = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating {self.rating} for {self.recipe.recipe_name}"

class Comments(models.Model):
    comment_id = models.AutoField(primary_key=True)
    comment = models.TextField()
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.user.name} on {self.recipe.recipe_name}"