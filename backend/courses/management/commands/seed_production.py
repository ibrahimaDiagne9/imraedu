"""
Management command to seed the production database with an admin user
and a rich set of starter courses.

Usage:
    python manage.py seed_production --admin-password YOUR_SECURE_PASSWORD
"""
import os
from django.core.management.base import BaseCommand
from courses.models import User, Course, Module, Lesson, Question, Choice


COURSES_DATA = [
    {
        "title": "Python for Everybody",
        "provider": "University of Michigan",
        "description": "Learn to Program and Analyze Data with Python. Develop programs to gather, clean, analyze, and visualize data. This specialization is designed for beginners with no previous programming experience.",
        "thumbnail_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600",
        "rating": 4.8,
        "reviews": 1250,
        "level": "Beginner",
        "duration": "8 weeks",
        "image_color": "#306998",
        "modules": [
            {
                "title": "Getting Started with Python",
                "lessons": [
                    {"title": "Why Program?", "lesson_type": "video", "duration": "12 min"},
                    {"title": "Installing Python", "lesson_type": "reading", "content_text": "Follow these steps to install Python on your machine...\n\n1. Go to python.org\n2. Download the latest version\n3. Run the installer\n4. Verify installation by opening a terminal and typing `python --version`"},
                    {"title": "Your First Program", "lesson_type": "video", "duration": "15 min"},
                    {"title": "Variables and Expressions", "lesson_type": "video", "duration": "18 min"},
                    {"title": "Quiz: Python Basics", "lesson_type": "quiz"},
                ],
            },
            {
                "title": "Data Structures",
                "lessons": [
                    {"title": "Strings", "lesson_type": "video", "duration": "20 min"},
                    {"title": "Lists", "lesson_type": "video", "duration": "22 min"},
                    {"title": "Dictionaries", "lesson_type": "video", "duration": "18 min"},
                    {"title": "Tuples", "lesson_type": "reading", "content_text": "Tuples are immutable sequences in Python. Unlike lists, once a tuple is created, its elements cannot be changed.\n\n```python\nmy_tuple = (1, 2, 3)\nprint(my_tuple[0])  # Output: 1\n```"},
                    {"title": "Quiz: Data Structures", "lesson_type": "quiz"},
                ],
            },
            {
                "title": "Loops and Iterations",
                "lessons": [
                    {"title": "Definite Loops (for)", "lesson_type": "video", "duration": "15 min"},
                    {"title": "Indefinite Loops (while)", "lesson_type": "video", "duration": "14 min"},
                    {"title": "Loop Patterns", "lesson_type": "video", "duration": "20 min"},
                ],
            },
        ],
    },
    {
        "title": "Web Development Bootcamp",
        "provider": "IMRAEDU",
        "description": "A comprehensive introduction to modern web development. Learn HTML, CSS, JavaScript, and React from scratch. Build real projects and deploy them to the cloud.",
        "thumbnail_url": "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600",
        "rating": 4.9,
        "reviews": 870,
        "level": "Beginner",
        "duration": "12 weeks",
        "image_color": "#E44D26",
        "modules": [
            {
                "title": "HTML Fundamentals",
                "lessons": [
                    {"title": "What is HTML?", "lesson_type": "video", "duration": "10 min"},
                    {"title": "HTML Document Structure", "lesson_type": "video", "duration": "15 min"},
                    {"title": "Links, Images, and Tables", "lesson_type": "video", "duration": "20 min"},
                    {"title": "Semantic HTML", "lesson_type": "reading", "content_text": "Semantic HTML uses elements like `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>` to give meaning to the structure of your content."},
                ],
            },
            {
                "title": "CSS Mastery",
                "lessons": [
                    {"title": "CSS Selectors and Properties", "lesson_type": "video", "duration": "18 min"},
                    {"title": "Flexbox Layout", "lesson_type": "video", "duration": "25 min"},
                    {"title": "CSS Grid", "lesson_type": "video", "duration": "22 min"},
                    {"title": "Responsive Design", "lesson_type": "video", "duration": "20 min"},
                ],
            },
            {
                "title": "JavaScript Essentials",
                "lessons": [
                    {"title": "Variables and Data Types", "lesson_type": "video", "duration": "14 min"},
                    {"title": "Functions and Scope", "lesson_type": "video", "duration": "18 min"},
                    {"title": "DOM Manipulation", "lesson_type": "video", "duration": "25 min"},
                    {"title": "Quiz: JavaScript", "lesson_type": "quiz"},
                ],
            },
        ],
    },
    {
        "title": "Machine Learning Foundations",
        "provider": "Stanford Online",
        "description": "Gain a broad understanding of modern machine learning, including supervised learning, unsupervised learning, and best practices used in Silicon Valley for AI and ML innovation.",
        "thumbnail_url": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600",
        "rating": 4.7,
        "reviews": 2100,
        "level": "Intermediate",
        "duration": "10 weeks",
        "image_color": "#7C3AED",
        "modules": [
            {
                "title": "Introduction to Machine Learning",
                "lessons": [
                    {"title": "What is Machine Learning?", "lesson_type": "video", "duration": "20 min"},
                    {"title": "Supervised vs Unsupervised Learning", "lesson_type": "video", "duration": "18 min"},
                    {"title": "Setting Up Your Environment", "lesson_type": "reading", "content_text": "We will use Python with NumPy, Pandas, and Scikit-learn.\n\nInstall with:\n```\npip install numpy pandas scikit-learn matplotlib jupyter\n```"},
                ],
            },
            {
                "title": "Linear Regression",
                "lessons": [
                    {"title": "Cost Function", "lesson_type": "video", "duration": "22 min"},
                    {"title": "Gradient Descent", "lesson_type": "video", "duration": "25 min"},
                    {"title": "Feature Scaling", "lesson_type": "video", "duration": "15 min"},
                    {"title": "Quiz: Linear Regression", "lesson_type": "quiz"},
                ],
            },
        ],
    },
    {
        "title": "Digital Marketing Strategy",
        "provider": "IMRAEDU",
        "description": "Master the art of digital marketing. Learn SEO, social media marketing, content strategy, email campaigns, and analytics to grow any business online.",
        "thumbnail_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
        "rating": 4.6,
        "reviews": 540,
        "level": "Beginner",
        "duration": "6 weeks",
        "image_color": "#059669",
        "modules": [
            {
                "title": "SEO Fundamentals",
                "lessons": [
                    {"title": "How Search Engines Work", "lesson_type": "video", "duration": "15 min"},
                    {"title": "Keyword Research", "lesson_type": "video", "duration": "20 min"},
                    {"title": "On-Page SEO", "lesson_type": "video", "duration": "18 min"},
                ],
            },
            {
                "title": "Social Media Marketing",
                "lessons": [
                    {"title": "Choosing the Right Platforms", "lesson_type": "video", "duration": "12 min"},
                    {"title": "Content Calendar Planning", "lesson_type": "reading", "content_text": "A content calendar helps you plan and organize your social media posts in advance. Use tools like Notion, Trello, or Google Sheets to map out your weekly posting schedule."},
                    {"title": "Analytics and Measurement", "lesson_type": "video", "duration": "16 min"},
                ],
            },
        ],
    },
    {
        "title": "Introduction to Data Science",
        "provider": "IBM",
        "description": "Explore the fundamentals of data science. Learn about data analysis, visualization, and storytelling with data using Python and popular data science libraries.",
        "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
        "rating": 4.5,
        "reviews": 980,
        "level": "Beginner",
        "duration": "8 weeks",
        "image_color": "#0284C7",
        "modules": [
            {
                "title": "What is Data Science?",
                "lessons": [
                    {"title": "The Data Science Process", "lesson_type": "video", "duration": "14 min"},
                    {"title": "Tools of the Trade", "lesson_type": "video", "duration": "18 min"},
                    {"title": "Data Ethics", "lesson_type": "reading", "content_text": "As data scientists, we have a responsibility to handle data ethically. This includes respecting privacy, avoiding bias in algorithms, and being transparent about how data is collected and used."},
                ],
            },
            {
                "title": "Data Analysis with Pandas",
                "lessons": [
                    {"title": "DataFrames and Series", "lesson_type": "video", "duration": "20 min"},
                    {"title": "Cleaning and Transforming Data", "lesson_type": "video", "duration": "25 min"},
                    {"title": "Data Visualization with Matplotlib", "lesson_type": "video", "duration": "22 min"},
                ],
            },
        ],
    },
    {
        "title": "UX/UI Design Masterclass",
        "provider": "Google",
        "description": "Learn the full UX design process from research and wireframing to prototyping and user testing. Create beautiful, intuitive interfaces that users love.",
        "thumbnail_url": "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600",
        "rating": 4.8,
        "reviews": 720,
        "level": "Intermediate",
        "duration": "10 weeks",
        "image_color": "#F59E0B",
        "modules": [
            {
                "title": "UX Research",
                "lessons": [
                    {"title": "Understanding Users", "lesson_type": "video", "duration": "16 min"},
                    {"title": "User Personas", "lesson_type": "video", "duration": "14 min"},
                    {"title": "Competitive Analysis", "lesson_type": "reading", "content_text": "A competitive analysis helps you understand what other products in your space are doing well and where there are opportunities to innovate."},
                ],
            },
            {
                "title": "UI Design Principles",
                "lessons": [
                    {"title": "Color Theory", "lesson_type": "video", "duration": "18 min"},
                    {"title": "Typography", "lesson_type": "video", "duration": "15 min"},
                    {"title": "Design Systems", "lesson_type": "video", "duration": "22 min"},
                    {"title": "Quiz: Design Principles", "lesson_type": "quiz"},
                ],
            },
        ],
    },
]

QUIZ_DATA = {
    "Quiz: Python Basics": [
        {"text": "What is the correct file extension for Python files?", "choices": [(".py", True), (".python", False), (".pt", False), (".pyt", False)]},
        {"text": "Which function is used to output text in Python?", "choices": [("echo()", False), ("print()", True), ("write()", False), ("output()", False)]},
    ],
    "Quiz: Data Structures": [
        {"text": "Which data structure uses key-value pairs?", "choices": [("List", False), ("Tuple", False), ("Dictionary", True), ("Set", False)]},
        {"text": "Which of the following is immutable?", "choices": [("List", False), ("Dictionary", False), ("Set", False), ("Tuple", True)]},
    ],
    "Quiz: JavaScript": [
        {"text": "Which keyword declares a block-scoped variable?", "choices": [("var", False), ("let", True), ("dim", False), ("define", False)]},
        {"text": "What does DOM stand for?", "choices": [("Document Object Model", True), ("Data Object Model", False), ("Document Order Model", False), ("Digital Object Map", False)]},
    ],
    "Quiz: Linear Regression": [
        {"text": "What does gradient descent minimize?", "choices": [("Accuracy", False), ("Features", False), ("Cost function", True), ("Training data", False)]},
        {"text": "Why do we scale features?", "choices": [("To reduce data", False), ("To speed up convergence", True), ("To add features", False), ("To improve accuracy only", False)]},
    ],
    "Quiz: Design Principles": [
        {"text": "What are complementary colors?", "choices": [("Colors next to each other on the color wheel", False), ("Colors opposite each other on the color wheel", True), ("Shades of the same color", False), ("Black and white", False)]},
        {"text": "What is the purpose of a design system?", "choices": [("To replace designers", False), ("To ensure consistency across products", True), ("To slow down development", False), ("To add complexity", False)]},
    ],
}


class Command(BaseCommand):
    help = 'Seed the production database with an admin account and starter courses'

    def add_arguments(self, parser):
        parser.add_argument(
            '--admin-password',
            type=str,
            default=os.getenv('ADMIN_PASSWORD', 'imraedu2026!'),
            help='Password for the admin/instructor account',
        )

    def handle(self, *args, **options):
        admin_password = options['admin_password']

        # 1. Create admin / instructor account
        self.stdout.write(self.style.MIGRATE_HEADING('\n[*] Creating admin account...'))
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@imraedu.com',
                'first_name': 'Admin',
                'is_staff': True,
                'is_superuser': True,
                'is_instructor': True,
            }
        )
        if created:
            admin.set_password(admin_password)
            admin.save()
            self.stdout.write(self.style.SUCCESS(f'  [OK] Admin created (username: admin, password: {admin_password})'))
        else:
            self.stdout.write(self.style.WARNING('  [SKIP] Admin already exists.'))

        # 2. Create instructor account
        self.stdout.write(self.style.MIGRATE_HEADING('\n[*] Creating instructor account...'))
        instructor, created = User.objects.get_or_create(
            username='instructor',
            defaults={
                'email': 'instructor@imraedu.com',
                'first_name': 'Prof. Ibrahima',
                'is_staff': False,
                'is_instructor': True,
                'bio': 'Passionate educator with 10+ years of experience in technology and business.',
            }
        )
        if created:
            instructor.set_password(admin_password)
            instructor.save()
            self.stdout.write(self.style.SUCCESS('  [OK] Instructor created'))
        else:
            self.stdout.write(self.style.WARNING('  [SKIP] Instructor already exists.'))

        # 3. Seed courses
        self.stdout.write(self.style.MIGRATE_HEADING('\n[*] Seeding courses...'))
        for course_data in COURSES_DATA:
            modules_data = course_data.pop('modules')
            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults={
                    **course_data,
                    'instructor': instructor,
                    'is_published': True,
                }
            )

            if not created:
                self.stdout.write(f'  [SKIP] "{course.title}" already exists.')
                continue

            self.stdout.write(self.style.SUCCESS(f'  [OK] Created course: "{course.title}"'))

            for mod_idx, mod_data in enumerate(modules_data):
                module = Module.objects.create(
                    course=course,
                    title=mod_data['title'],
                    order=mod_idx,
                )

                for les_idx, les_data in enumerate(mod_data['lessons']):
                    lesson = Lesson.objects.create(
                        module=module,
                        title=les_data['title'],
                        lesson_type=les_data.get('lesson_type', 'video'),
                        content_text=les_data.get('content_text', ''),
                        duration=les_data.get('duration', ''),
                        order=les_idx,
                    )

                    # Add quiz questions if applicable
                    if les_data['title'] in QUIZ_DATA:
                        for q_idx, q_data in enumerate(QUIZ_DATA[les_data['title']]):
                            question = Question.objects.create(
                                lesson=lesson,
                                text=q_data['text'],
                                order=q_idx,
                            )
                            for choice_text, is_correct in q_data['choices']:
                                Choice.objects.create(
                                    question=question,
                                    text=choice_text,
                                    is_correct=is_correct,
                                )

        total_courses = Course.objects.count()
        total_modules = Module.objects.count()
        total_lessons = Lesson.objects.count()
        total_questions = Question.objects.count()

        self.stdout.write(self.style.SUCCESS(
            f'\n=== Database Seeded Successfully ===\n'
            f'  Courses:   {total_courses}\n'
            f'  Modules:   {total_modules}\n'
            f'  Lessons:   {total_lessons}\n'
            f'  Questions: {total_questions}\n'
        ))

