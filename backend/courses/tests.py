from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from .models import Course, Module, Lesson

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword123',
            email='test@example.com'
        )
        self.login_url = reverse('token_obtain_pair')
        self.register_url = reverse('auth_register')

    def test_registration(self):
        data = {
            'username': 'newuser',
            'password': 'newpassword123',
            'email': 'new@example.com'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_login(self):
        data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

class PasswordResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword123',
            email='test@example.com'
        )
        self.reset_request_url = reverse('password_reset')

    def test_password_reset_request(self):
        data = {'email': 'test@example.com'}
        response = self.client.post(self.reset_request_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class CourseAPITests(APITestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='instructor',
            password='password123',
            is_instructor=True
        )
        self.student = User.objects.create_user(
            username='student',
            password='password123'
        )
        self.course = Course.objects.create(
            title="Test Course",
            instructor=self.instructor,
            is_published=True
        )

    def test_list_published_courses(self):
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Test Course")

    def test_instructor_can_create_course(self):
        self.client.force_authenticate(user=self.instructor)
        data = {
            "title": "New Instructor Course",
            "is_published": False
        }
        response = self.client.post('/api/instructor/courses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 2)

    def test_student_cannot_create_course(self):
        self.client.force_authenticate(user=self.student)
        data = {
            "title": "Student Course",
        }
        response = self.client.post('/api/instructor/courses/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
