from rest_framework import serializers
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Course, Module, Lesson, Question, Choice, Enrollment, InstructorApplication, Review, DiscussionThread, DiscussionReply

class InstructorApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorApplication
        fields = ['id', 'expertise', 'experience', 'status', 'applied_at']
        read_only_fields = ['status', 'applied_at']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'is_instructor']

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'rating', 'text', 'created_at']
        read_only_fields = ['user', 'created_at']

    def get_user_name(self, obj):
        return obj.user.first_name or obj.user.username

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', '')
        )
        
        if user.email:
            try:
                send_mail(
                    subject='Welcome to ImraEdu!',
                    message=f'Hi {user.first_name or user.username},\n\nWelcome to ImraEdu! We are thrilled to have you join our learning community.\n\nStart exploring our free courses today: {settings.FRONTEND_URL if hasattr(settings, "FRONTEND_URL") else "https://imraedu.com"}\n\nHappy Learning,\nThe ImraEdu Team',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Failed to send welcome email: {e}")
                
        return user

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'text', 'is_correct']

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'choices']

class LessonSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'lesson_type', 'video_url', 'content_text', 'duration', 'order', 'questions']

class LessonWriteSerializer(serializers.ModelSerializer):
    """Used by instructors to create/update a lesson."""
    class Meta:
        model = Lesson
        fields = ['id', 'module', 'title', 'lesson_type', 'video_url', 'content_text', 'duration', 'order']

class QuestionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'lesson', 'text', 'order']

class ChoiceWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'question', 'text', 'is_correct']

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lessons']

class ModuleWriteSerializer(serializers.ModelSerializer):
    """Used by instructors to create/update a module."""
    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'order']

class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    instructor_name = serializers.SerializerMethodField()
    enrollment_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'provider', 'description', 'rating', 'reviews',
            'level', 'category', 'duration', 'image_color', 'thumbnail_url',
            'is_published', 'created_at', 'modules', 'instructor_name',
            'enrollment_count'
        ]

    def get_instructor_name(self, obj):
        if obj.instructor:
            return obj.instructor.get_full_name() or obj.instructor.username
        return ''

    def get_enrollment_count(self, obj):
        return obj.enrollments.count()

class CourseWriteSerializer(serializers.ModelSerializer):
    """Used by instructors to create/update a course."""
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'provider', 'description', 'level', 'category',
            'duration', 'image_color', 'thumbnail_url', 'is_published'
        ]

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    completed_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'progress_percentage', 'completed', 'enrolled_at', 'completed_lessons']

    def get_completed_lessons(self, obj):
        from .models import LessonCompletion
        completions = LessonCompletion.objects.filter(
            user=obj.user,
            lesson__module__course=obj.course
        ).values_list('lesson_id', flat=True)
        return list(completions)

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            uid = urlsafe_base64_decode(attrs['uidb64']).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uidb64": "Invalid uidb64"})
        
        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({"token": "Invalid or expired token"})
            
        return attrs


class DiscussionReplySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    is_instructor = serializers.SerializerMethodField()

    class Meta:
        model = DiscussionReply
        fields = ['id', 'user', 'user_name', 'is_instructor', 'content', 'created_at']
        read_only_fields = ['user']

    def get_user_name(self, obj):
        return obj.user.first_name or obj.user.username

    def get_is_instructor(self, obj):
        # Optional: highlight replies from the course instructor
        return obj.user == obj.thread.lesson.module.course.instructor


class DiscussionThreadSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    replies = DiscussionReplySerializer(many=True, read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = DiscussionThread
        fields = ['id', 'user', 'user_name', 'title', 'content', 'created_at', 'resolved', 'replies', 'reply_count']
        read_only_fields = ['user', 'resolved']

    def get_user_name(self, obj):
        return obj.user.first_name or obj.user.username

    def get_reply_count(self, obj):
        return obj.replies.count()
