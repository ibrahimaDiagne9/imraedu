from django.contrib import admin
from .models import User, Course, Module, Lesson, Enrollment, Question, Choice, InstructorApplication

class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1

class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'is_staff')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'provider', 'level')
    inlines = [ModuleInline]

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    inlines = [LessonInline]

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'module', 'lesson_type')

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'progress_percentage', 'completed')

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 2

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'lesson', 'order')
    inlines = [ChoiceInline]

@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('text', 'question', 'is_correct')

from django.utils import timezone

@admin.register(InstructorApplication)
class InstructorApplicationAdmin(admin.ModelAdmin):
    list_display = ('user', 'status', 'applied_at')
    list_filter = ('status',)
    actions = ['approve_applications', 'reject_applications']

    def approve_applications(self, request, queryset):
        for application in queryset:
            application.status = 'Approved'
            application.reviewed_at = timezone.now()
            application.save()
            application.user.is_instructor = True
            application.user.save()
        self.message_user(request, f"Approved {queryset.count()} application(s). Users are now instructors.")
    approve_applications.short_description = "Approve selected applications"

    def reject_applications(self, request, queryset):
        queryset.update(status='Rejected', reviewed_at=timezone.now())
        self.message_user(request, f"Rejected {queryset.count()} application(s).")
    reject_applications.short_description = "Reject selected applications"

