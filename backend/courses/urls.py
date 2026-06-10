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
    path('apply-instructor/', views.InstructorApplicationView.as_view(), name='apply_instructor'),
    path('courses/<int:course_id>/reviews/', views.CourseReviewView.as_view(), name='course_reviews'),
    path('courses/<int:course_id>/complete-lesson/', views.CompleteLessonView.as_view(), name='complete_lesson'),
    path('lessons/<int:lesson_id>/discussions/', views.LessonDiscussionView.as_view(), name='lesson_discussions'),
    path('discussions/<int:thread_id>/reply/', views.DiscussionReplyView.as_view(), name='discussion_reply'),
    path('me/', views.CurrentUserView.as_view(), name='current_user'),
    path('password-change/', views.ChangePasswordView.as_view(), name='password_change'),
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/google/', views.GoogleAuthView.as_view(), name='google_auth'),
    path('auth/apple/', views.AppleAuthView.as_view(), name='apple_auth'),
    path('instructor/upload/', views.FileUploadView.as_view(), name='instructor-upload'),
    path('', include(router.urls)),
    path('instructor/', include(instructor_router.urls)),
]
