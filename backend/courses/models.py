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

    CATEGORY_CHOICES = [
        ('Technology', 'Technology'),
        ('Business', 'Business'),
        ('Arts & Design', 'Arts & Design'),
        ('Health & Science', 'Health & Science'),
        ('Languages', 'Languages'),
        ('Other', 'Other')
    ]
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Other')
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

class Review(models.Model):
    course = models.ForeignKey(Course, related_name='course_reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='reviews', on_delete=models.CASCADE)
    rating = models.IntegerField(default=5)  # 1 to 5
    text = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('course', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.user.username} for {self.course.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_course_rating()

    def update_course_rating(self):
        reviews = Review.objects.filter(course=self.course)
        total_reviews = reviews.count()
        if total_reviews > 0:
            avg_rating = sum(r.rating for r in reviews) / total_reviews
            self.course.rating = round(avg_rating, 1)
            self.course.reviews = total_reviews
            self.course.save()


class LessonCompletion(models.Model):
    user = models.ForeignKey(User, related_name='completed_lessons', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name='completions', on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f"{self.user.username} completed {self.lesson.title}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.update_enrollment_progress()

    def update_enrollment_progress(self):
        try:
            enrollment = Enrollment.objects.get(user=self.user, course=self.lesson.module.course)
            total_lessons = Lesson.objects.filter(module__course=enrollment.course).count()
            completed_lessons = LessonCompletion.objects.filter(
                user=self.user, 
                lesson__module__course=enrollment.course
            ).count()
            
            if total_lessons > 0:
                enrollment.progress_percentage = min(100, int((completed_lessons / total_lessons) * 100))
                if enrollment.progress_percentage == 100:
                    enrollment.completed = True
                enrollment.save()
        except Enrollment.DoesNotExist:
            pass


class DiscussionThread(models.Model):
    lesson = models.ForeignKey(Lesson, related_name='discussion_threads', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='discussion_threads', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} on {self.lesson.title}: {self.title[:50]}"


class DiscussionReply(models.Model):
    thread = models.ForeignKey(DiscussionThread, related_name='replies', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='discussion_replies', on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Reply by {self.user.username} to {self.thread.title[:30]}"
