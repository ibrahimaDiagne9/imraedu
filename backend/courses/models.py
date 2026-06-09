from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    is_instructor = models.BooleanField(default=False)

    def __str__(self):
        return self.username

class InstructorApplication(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]
    user = models.OneToOneField(User, related_name='instructor_application', on_delete=models.CASCADE)
    expertise = models.CharField(max_length=255)
    experience = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.status}"


class Course(models.Model):
    instructor = models.ForeignKey(
        'User', related_name='courses_taught',
        on_delete=models.SET_NULL, null=True, blank=True
    )
    title = models.CharField(max_length=255)
    provider = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField(blank=True, null=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    rating = models.FloatField(default=0.0)
    reviews = models.IntegerField(default=0)
    is_published = models.BooleanField(default=False)

    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
        ('Mixed', 'Mixed'),
    ]
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES, default='Beginner')
    duration = models.CharField(max_length=100, blank=True, default='') # e.g. '2 months', '6 weeks'
    image_color = models.CharField(max_length=50, default='#EBF3FF') # fallback for styling
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title

class Module(models.Model):
    course = models.ForeignKey(Course, related_name='modules', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Lesson(models.Model):
    TYPE_CHOICES = [
        ('video', 'Video'),
        ('reading', 'Reading'),
        ('quiz', 'Quiz'),
    ]
    module = models.ForeignKey(Module, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    lesson_type = models.CharField(max_length=50, choices=TYPE_CHOICES, default='video')
    video_url = models.URLField(blank=True, null=True)
    content_text = models.TextField(blank=True, null=True)  # For reading lessons
    duration = models.CharField(max_length=50, blank=True, default='')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class Question(models.Model):
    lesson = models.ForeignKey(Lesson, related_name='questions', on_delete=models.CASCADE)
    text = models.TextField()
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.text[:80]

class Choice(models.Model):
    question = models.ForeignKey(Question, related_name='choices', on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.text[:80]

class Enrollment(models.Model):
    user = models.ForeignKey(User, related_name='enrollments', on_delete=models.CASCADE)
    course = models.ForeignKey(Course, related_name='enrollments', on_delete=models.CASCADE)
    progress_percentage = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"

