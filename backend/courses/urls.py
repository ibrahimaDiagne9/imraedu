from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Public / student routes
router = DefaultRouter()
router.register(r'courses', views.CourseViewSet)
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollment')

# Instructor-only routes
instructor_router = DefaultRouter()
instructor_router.register(r'courses', views.InstructorCourseViewSet, basename='instructor-course')
instructor_router.register(r'modules', views.InstructorModuleViewSet, basename='instructor-module')
instructor_router.register(r'lessons', views.InstructorLessonViewSet, basename='instructor-lesson')
instructor_router.register(r'questions', views.InstructorQuestionViewSet, basename='instructor-question')
instructor_router.register(r'choices', views.InstructorChoiceViewSet, basename='instructor-choice')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('verify-email/', views.VerifyEmailView.as_view(), name='verify_email'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/google/', views.GoogleAuthView.as_view(), name='google_auth'),
    path('auth/apple/', views.AppleAuthView.as_view(), name='apple_auth'),
    path('instructor/upload/', views.FileUploadView.as_view(), name='instructor-upload'),
    path('', include(router.urls)),
    path('instructor/', include(instructor_router.urls)),
]
