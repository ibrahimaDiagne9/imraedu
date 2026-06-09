from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Course, Module, Lesson, Question, Choice, Enrollment, InstructorApplication
from .serializers import (
    CourseSerializer, CourseWriteSerializer,
    ModuleSerializer, ModuleWriteSerializer,
    LessonSerializer, LessonWriteSerializer,
    QuestionSerializer, QuestionWriteSerializer,
    ChoiceSerializer, ChoiceWriteSerializer,
    EnrollmentSerializer, RegisterSerializer, UserSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    InstructorApplicationSerializer
)
import requests
import os

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
    """Register new user and send verification email (account inactive until verified)."""
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        user.is_active = False
        user.save()

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = (
            self.request.headers.get('origin')
            or os.getenv('FRONTEND_URL', 'http://localhost:5173')
        )
        verify_url = f"{frontend_url}/verify-email?uidb64={uid}&token={token}"

        send_mail(
            subject='Verify your ImraEdu account',
            message=(
                f"Hi {user.first_name or user.username},\n\n"
                f"Thanks for signing up for ImraEdu!\n"
                f"Please verify your email:\n{verify_url}\n\n"
                f"This link expires in 24 hours.\n"
                f"If you didn't create this account, ignore this email."
            ),
            html_message=(
                "<div style='font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;'>"
                "<h2 style='color:#0056D2;'>Welcome to ImraEdu!</h2>"
                f"<p>Hi <strong>{user.first_name or user.username}</strong>,</p>"
                "<p>Click the button below to verify your email and activate your account.</p>"
                f"<a href='{verify_url}' style='display:inline-block;margin:20px 0;padding:14px 28px;"
                "background:linear-gradient(135deg,#0056D2,#0ea5e9);color:white;"
                "border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;'>"
                "Verify Email Address</a>"
                f"<p style='color:#666;font-size:13px;'>Or paste: <a href='{verify_url}'>{verify_url}</a></p>"
                "<p style='color:#999;font-size:12px;'>Link expires in 24 hours.</p>"
                "</div>"
            ),
            from_email=os.getenv('DEFAULT_FROM_EMAIL', 'noreply@imraedu.com'),
            recipient_list=[user.email],
            fail_silently=False,
        )


class VerifyEmailView(APIView):
    """Activate account via uidb64 + token from verification email. Returns JWT on success."""
    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        uidb64 = request.query_params.get('uidb64')
        token = request.query_params.get('token')

        if not uidb64 or not token:
            return Response(
                {'error': 'Missing verification parameters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Invalid verification link.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.is_active:
            return Response(
                {'message': 'Account already verified. You can log in.'},
                status=status.HTTP_200_OK
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Verification link has expired or is invalid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = True
        user.save()

        # Auto-login: return JWT so user lands directly on dashboard
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Email verified! Welcome to ImraEdu.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'is_instructor': user.is_instructor,
            }
        }, status=status.HTTP_200_OK)


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
        
        # Cloudinary returns fully-qualified URLs; don't wrap them again
        if not file_url.startswith('http'):
            file_url = request.build_absolute_uri(file_url)
        return Response({"url": file_url}, status=status.HTTP_201_CREATED)

# ─── Password Reset ──────────────────────────────────────────────────────────

from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from django.utils.http import urlsafe_base64_decode

import os
import requests
from rest_framework_simplejwt.tokens import RefreshToken

class GoogleAuthView(APIView):
    """Verify Google token, find or create user, and return JWT tokens."""
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify token with Google API
        response = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={token}")
        if response.status_code != 200:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        
        id_info = response.json()
        
        # Verify client ID if set in environment
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        if client_id and id_info.get('aud') != client_id:
            return Response({"error": "Google Client ID mismatch"}, status=status.HTTP_400_BAD_REQUEST)

        email = id_info.get('email')
        if not email:
            return Response({"error": "Email not provided by Google account"}, status=status.HTTP_400_BAD_REQUEST)

        first_name = id_info.get('given_name', '')
        last_name = id_info.get('family_name', '')
        
        # Find or create user
        user = User.objects.filter(email=email).first()
        if not user:
            # Generate username from email prefix
            username = email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name
            )
            user.is_active = True
            user.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'is_instructor': user.is_instructor
            }
        }, status=status.HTTP_200_OK)


class AppleAuthView(APIView):
    """Verify Apple identity token, find or create user, return JWT tokens."""
    permission_classes = (AllowAny,)

    def _get_apple_public_key(self, kid, alg):
        """Fetch Apple JWKS and return the matching public key object."""
        from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers
        from cryptography.hazmat.backends import default_backend
        import base64

        resp = requests.get('https://appleid.apple.com/auth/keys', timeout=10)
        resp.raise_for_status()
        keys = resp.json().get('keys', [])

        def b64url_to_int(s):
            s += '=' * (-len(s) % 4)
            return int.from_bytes(base64.urlsafe_b64decode(s), 'big')

        for key in keys:
            if key.get('kid') == kid:
                pub_numbers = RSAPublicNumbers(
                    e=b64url_to_int(key['e']),
                    n=b64url_to_int(key['n']),
                )
                return pub_numbers.public_key(default_backend())
        return None

    def post(self, request, *args, **kwargs):
        import jwt as pyjwt

        identity_token = request.data.get('token')
        if not identity_token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Decode header without verification to get kid + alg
        try:
            header = pyjwt.get_unverified_header(identity_token)
        except Exception:
            return Response({'error': 'Invalid token format'}, status=status.HTTP_400_BAD_REQUEST)

        kid = header.get('kid')
        alg = header.get('alg', 'RS256')

        # Get matching Apple public key
        try:
            public_key = self._get_apple_public_key(kid, alg)
        except Exception:
            return Response({'error': 'Could not fetch Apple public keys'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        if not public_key:
            return Response({'error': 'Apple signing key not found'}, status=status.HTTP_400_BAD_REQUEST)

        # Audience = Apple Service ID (web client ID)
        client_id = os.getenv('APPLE_CLIENT_ID', 'com.imraedu.web')

        try:
            payload = pyjwt.decode(
                identity_token,
                public_key,
                algorithms=[alg],
                audience=client_id,
            )
        except pyjwt.ExpiredSignatureError:
            return Response({'error': 'Apple token has expired'}, status=status.HTTP_400_BAD_REQUEST)
        except pyjwt.InvalidAudienceError:
            return Response({'error': 'Apple Client ID mismatch — check APPLE_CLIENT_ID env var'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Token verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        email = payload.get('email')
        apple_sub = payload.get('sub')  # stable unique ID from Apple

        if not email and not apple_sub:
            return Response({'error': 'No user identifier provided by Apple'}, status=status.HTTP_400_BAD_REQUEST)

        # Find existing user by email first, then try apple_sub stored in username
        user = None
        if email:
            user = User.objects.filter(email=email).first()

        if not user:
            # Generate username from email prefix or apple sub
            if email:
                base_username = email.split('@')[0]
            else:
                base_username = f'apple_{apple_sub[:8]}'

            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f'{base_username}{counter}'
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email or '',
            )
            user.is_active = True
            user.save()

        # Return JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'is_instructor': user.is_instructor,
            }
        }, status=status.HTTP_200_OK)


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
            
            # Dynamically determine frontend url based on Origin header or FRONTEND_URL env var
            frontend_url = os.getenv('FRONTEND_URL')
            if not frontend_url:
                origin = request.headers.get('origin')
                referer = request.headers.get('referer')
                if origin:
                    frontend_url = origin
                elif referer:
                    from urllib.parse import urlparse
                    parsed = urlparse(referer)
                    frontend_url = f"{parsed.scheme}://{parsed.netloc}"
                else:
                    frontend_url = "http://localhost:5173"
            
            reset_url = f"{frontend_url.rstrip('/')}/reset-password?uidb64={uid}&token={token}"
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

class InstructorApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            application = InstructorApplication.objects.get(user=request.user)
            serializer = InstructorApplicationSerializer(application)
            return Response(serializer.data)
        except InstructorApplication.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        try:
            application = InstructorApplication.objects.get(user=request.user)
            return Response({"detail": "You have already applied."}, status=status.HTTP_400_BAD_REQUEST)
        except InstructorApplication.DoesNotExist:
            serializer = InstructorApplicationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
