from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.contrib.auth import get_user_model
from .models import Course, Module, Lesson, Question, Choice, Enrollment
from .serializers import (
    CourseSerializer, CourseWriteSerializer,
    ModuleSerializer, ModuleWriteSerializer,
    LessonSerializer, LessonWriteSerializer,
    QuestionSerializer, QuestionWriteSerializer,
    ChoiceSerializer, ChoiceWriteSerializer,
    EnrollmentSerializer, RegisterSerializer, UserSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)

User = get_user_model()


class IsInstructor(BasePermission):
    """Allow access only to users with is_instructor=True."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_instructor)


class IsInstructorOwner(BasePermission):
    """Allow object-level access only to the course instructor."""
    def has_object_permission(self, request, view, obj):
        return obj.instructor == request.user


# ─── Auth ────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user


# ─── Public Course API ────────────────────────────────────────────────────────

class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """List/detail endpoint for students — only published courses."""
    queryset = Course.objects.filter(is_published=True)
    serializer_class = CourseSerializer


# ─── Enrollment API ───────────────────────────────────────────────────────────

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def enroll(self, request):
        course_id = request.data.get('course_id')
        if not course_id:
            return Response({'error': 'course_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            course = Course.objects.get(id=course_id, is_published=True)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
        if not created:
            return Response({'status': 'already enrolled'}, status=status.HTTP_200_OK)
        return Response({'status': 'enrolled', 'course_id': course_id}, status=status.HTTP_201_CREATED)


# ─── Instructor Course API ────────────────────────────────────────────────────

class InstructorCourseViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for an instructor's own courses.
    GET /api/instructor/courses/         → list instructor's courses
    POST /api/instructor/courses/        → create a new course
    PUT/PATCH /api/instructor/courses/1/ → update course
    DELETE /api/instructor/courses/1/   → delete course
    """
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return CourseSerializer
        return CourseWriteSerializer

    def get_queryset(self):
        return Course.objects.filter(instructor=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)


class InstructorModuleViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for modules belonging to instructor's courses.
    POST /api/instructor/modules/  → create a module (pass course id in body)
    DELETE /api/instructor/modules/1/ → delete a module
    """
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return ModuleSerializer
        return ModuleWriteSerializer

    def get_queryset(self):
        return Module.objects.filter(course__instructor=self.request.user)

    def perform_create(self, serializer):
        # Verify the course belongs to this instructor
        course = serializer.validated_data.get('course')
        if course.instructor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't own this course.")
        serializer.save()


class InstructorLessonViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for lessons belonging to instructor's modules.
    POST /api/instructor/lessons/  → create a lesson (pass module id in body)
    DELETE /api/instructor/lessons/1/ → delete a lesson
    """
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return LessonSerializer
        return LessonWriteSerializer

    def get_queryset(self):
        return Lesson.objects.filter(module__course__instructor=self.request.user)

    def perform_create(self, serializer):
        module = serializer.validated_data.get('module')
        if module.course.instructor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't own this module's course.")
        serializer.save()

class InstructorQuestionViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return QuestionSerializer
        return QuestionWriteSerializer

    def get_queryset(self):
        return Question.objects.filter(lesson__module__course__instructor=self.request.user)

    def perform_create(self, serializer):
        lesson = serializer.validated_data.get('lesson')
        if lesson.module.course.instructor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't own this lesson's course.")
        serializer.save()

class InstructorChoiceViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsInstructor)

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve'):
            return ChoiceSerializer
        return ChoiceWriteSerializer

    def get_queryset(self):
        return Choice.objects.filter(question__lesson__module__course__instructor=self.request.user)

    def perform_create(self, serializer):
        question = serializer.validated_data.get('question')
        if question.lesson.module.course.instructor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't own this question's course.")
        serializer.save()

class FileUploadView(APIView):
    """Endpoint for instructors to upload files (thumbnails, etc.)"""
    permission_classes = (IsAuthenticated, IsInstructor)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        file_name = default_storage.save(f"uploads/{file_obj.name}", file_obj)
        file_url = default_storage.url(file_name)
        
        absolute_url = request.build_absolute_uri(file_url)
        return Response({"url": absolute_url}, status=status.HTTP_201_CREATED)

# ─── Password Reset ──────────────────────────────────────────────────────────

from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.utils.http import urlsafe_base64_decode

class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()
        
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"http://localhost:5173/reset-password?uidb64={uid}&token={token}"
            send_mail(
                'Password Reset for ImraEdu',
                f'Click the link to reset your password: {reset_url}',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            
        return Response({"message": "If an account with this email exists, a reset link has been sent."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid = urlsafe_base64_decode(serializer.validated_data['uidb64']).decode()
        user = User.objects.get(pk=uid)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
