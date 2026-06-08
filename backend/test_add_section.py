import os
import django
import json

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')

from django.test import Client
from django.contrib.auth import get_user_model
from courses.models import Course
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
client = Client()

def run():
    user = User.objects.get(username='imra')
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    course = Course.objects.filter(instructor=user).first()
    if not course:
        print("No course found for instructor 'imra'")
        return

    print(f"Testing against Course ID: {course.id}")
    
    response = client.post('/api/instructor/modules/', {
        'course': course.id,
        'title': 'Test Add Section API',
        'order': 0
    }, content_type='application/json', HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    print("Add Module Status:", response.status_code)
    try:
        print("Add Module Response:", json.dumps(response.json(), indent=2))
    except:
        import re
        content = response.content.decode()
        match = re.search(r'<title>(.*?)</title>', content)
        if match:
            print("Error Title:", match.group(1))
        match2 = re.search(r'<th>Exception Value:</th>\s*<td><pre>(.*?)</pre></td>', content, re.DOTALL)
        if match2:
            print("Exception Value:", match2.group(1))

if __name__ == '__main__':
    run()
