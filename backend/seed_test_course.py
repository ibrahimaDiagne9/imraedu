import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from courses.models import Course, Module, Lesson, Question, Choice

User = get_user_model()

def run():
    print("Seeding test data...")
    
    # Ensure an instructor exists
    instructor, created = User.objects.get_or_create(username='imra')
    if created:
        instructor.set_password('admin123')
        instructor.is_instructor = True
        instructor.first_name = 'Imra'
        instructor.save()
    elif not instructor.is_instructor:
        instructor.is_instructor = True
        instructor.save()

    # Create a Test Course
    course, created = Course.objects.get_or_create(
        title="Full Stack Web Dev (Test Data)",
        defaults={
            'instructor': instructor,
            'description': "This course contains examples of Video, Reading, and Quiz lessons.",
            'level': 'Beginner',
            'is_published': True,
            'thumbnail_url': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'
        }
    )
    
    if not created:
        course.instructor = instructor
        course.is_published = True
        course.save()
        print("Course already existed, updated it.")

    # Create a Module
    module, created = Module.objects.get_or_create(
        course=course,
        title="Week 1: Introduction",
        defaults={'order': 0}
    )

    # Create a Video Lesson
    video_lesson, created = Lesson.objects.get_or_create(
        module=module,
        title="1. Introduction to Web Dev",
        defaults={
            'lesson_type': 'video',
            'video_url': 'https://www.w3schools.com/html/mov_bbb.mp4',
            'duration': '5 min',
            'order': 0
        }
    )

    # Create a Reading Lesson
    reading_lesson, created = Lesson.objects.get_or_create(
        module=module,
        title="2. History of the Internet",
        defaults={
            'lesson_type': 'reading',
            'content_text': "The history of the Internet begins with the development of electronic computers in the 1950s...\n\n### Key Milestones\n- ARPANET\n- TCP/IP\n- World Wide Web",
            'duration': '10 min',
            'order': 1
        }
    )

    # Create a Quiz Lesson
    quiz_lesson, created = Lesson.objects.get_or_create(
        module=module,
        title="3. Week 1 Knowledge Check",
        defaults={
            'lesson_type': 'quiz',
            'duration': '15 min',
            'order': 2
        }
    )
    
    if created or not quiz_lesson.questions.exists():
        q1 = Question.objects.create(lesson=quiz_lesson, text="What does HTML stand for?", order=0)
        Choice.objects.create(question=q1, text="Hyper Text Markup Language", is_correct=True)
        Choice.objects.create(question=q1, text="High Tech Modern Language", is_correct=False)
        Choice.objects.create(question=q1, text="Hyperlink and Text Markup Language", is_correct=False)

        q2 = Question.objects.create(lesson=quiz_lesson, text="Which language is used for styling web pages?", order=1)
        Choice.objects.create(question=q2, text="JavaScript", is_correct=False)
        Choice.objects.create(question=q2, text="Python", is_correct=False)
        Choice.objects.create(question=q2, text="CSS", is_correct=True)

    print(f"Successfully seeded! Test course ID is: {course.id}")

if __name__ == '__main__':
    run()
