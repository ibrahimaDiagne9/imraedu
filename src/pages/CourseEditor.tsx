import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Trash2, Video, FileText,
  HelpCircle, GripVertical, Save, ArrowLeft, Edit2
} from 'lucide-react';
import api from '../api';

const fetchCourse = async (id: string) => {
  const { data } = await api.get(`/instructor/courses/${id}/`);
  return data;
};

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(?:.*#|.*\/videos\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
};

const renderVideoPlayer = (url: string) => {
  if (!url) return null;
  const embedUrl = getEmbedUrl(url);
  if (embedUrl.includes('youtube.com/embed') || embedUrl.includes('player.vimeo.com')) {
    return (
      <iframe src={embedUrl} style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: 'var(--radius-md)' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    );
  }
  return <video src={url} controls style={{ width: '100%', maxHeight: '400px', backgroundColor: '#000', borderRadius: 'var(--radius-md)' }} />;
};

const CourseEditor = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingModuleLesson, setAddingModuleLesson] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '', lesson_type: 'video', video_url: '', duration: '', order: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [courseForm, setCourseForm] = useState<Record<string, any>>({});
  
  // Lesson Editor State
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['instructor-course', id],
    queryFn: () => fetchCourse(id!),
  });

  useEffect(() => {
    if (course && Object.keys(courseForm).length === 0) {
      setCourseForm(course as Record<string, any>);
    }
  }, [course]);

  // Mutations
  const addModule = useMutation({
    mutationFn: (title: string) => api.post('/instructor/modules/', {
      course: Number(id), title, order: (course?.modules?.length || 0)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course', id] });
      setNewModuleTitle('');
    },
    onError: (err: any) => {
      alert('Failed to add section: ' + (err.response?.data?.detail || err.message));
    }
  });

  const deleteModule = useMutation({
    mutationFn: (moduleId: number) => api.delete(`/instructor/modules/${moduleId}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructor-course', id] }),
    onError: (err: any) => alert('Failed to delete section: ' + (err.message))
  });

  const addLesson = useMutation({
    mutationFn: (moduleId: number) => api.post('/instructor/lessons/', {
      module: moduleId,
      title: lessonForm.title,
      lesson_type: lessonForm.lesson_type,
      video_url: lessonForm.video_url || null,
      duration: lessonForm.duration || '—',
      order: 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-course', id] });
      setAddingModuleLesson(null);
      setLessonForm({ title: '', lesson_type: 'video', video_url: '', duration: '', order: 0 });
    },
    onError: (err: any) => {
      alert('Failed to add lesson: ' + (err.response?.data?.detail || err.message));
    }
  });

  const deleteLesson = useMutation({
    mutationFn: (lessonId: number) => api.delete(`/instructor/lessons/${lessonId}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructor-course', id] }),
    onError: (err: any) => alert('Failed to delete lesson: ' + (err.message))
  });

  const saveCourse = async () => {
    if (!courseForm) return;
    setIsSaving(true);
    try {
      await api.patch(`/instructor/courses/${id}/`, {
        title: courseForm.title,
        description: courseForm.description,
        level: courseForm.level,
        duration: courseForm.duration,
        image_color: courseForm.image_color,
        thumbnail_url: courseForm.thumbnail_url,
        is_published: courseForm.is_published,
      });
      queryClient.invalidateQueries({ queryKey: ['instructor-course', id] });
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    } finally {
      setIsSaving(false);
    }
  };

  const saveLessonDetails = async () => {
    if (!editingLesson) return;
    setIsSaving(true);
    try {
      await api.patch(`/instructor/lessons/${editingLesson.id}/`, {
        video_url: editingLesson.video_url,
        content_text: editingLesson.content_text,
      });
      queryClient.invalidateQueries({ queryKey: ['instructor-course', id] });
      setEditingLesson(null);
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = async () => {
    if (!editingLesson) return;
    const { data } = await api.post('/instructor/questions/', {
      lesson: editingLesson.id,
      text: 'New Question',
      order: editingLesson.questions?.length || 0
    });
    setEditingLesson({
      ...editingLesson,
      questions: [...(editingLesson.questions || []), data]
    });
  };

  const deleteQuestion = async (qId: number) => {
    await api.delete(`/instructor/questions/${qId}/`);
    setEditingLesson({
      ...editingLesson,
      questions: editingLesson.questions.filter((q: any) => q.id !== qId)
    });
  };

  const updateQuestion = async (qId: number, text: string) => {
    await api.patch(`/instructor/questions/${qId}/`, { text });
    setEditingLesson({
      ...editingLesson,
      questions: editingLesson.questions.map((q: any) => q.id === qId ? { ...q, text } : q)
    });
  };

  const addChoice = async (qId: number) => {
    const { data } = await api.post('/instructor/choices/', {
      question: qId,
      text: 'New Choice',
      is_correct: false
    });
    setEditingLesson({
      ...editingLesson,
      questions: editingLesson.questions.map((q: any) => 
        q.id === qId ? { ...q, choices: [...(q.choices || []), data] } : q
      )
    });
  };

  const deleteChoice = async (qId: number, cId: number) => {
    await api.delete(`/instructor/choices/${cId}/`);
    setEditingLesson({
      ...editingLesson,
      questions: editingLesson.questions.map((q: any) => 
        q.id === qId ? { ...q, choices: q.choices.filter((c: any) => c.id !== cId) } : q
      )
    });
  };

  const updateChoice = async (qId: number, cId: number, updates: any) => {
    await api.patch(`/instructor/choices/${cId}/`, updates);
    setEditingLesson({
      ...editingLesson,
      questions: editingLesson.questions.map((q: any) => 
        q.id === qId ? { ...q, choices: q.choices.map((c: any) => c.id === cId ? { ...c, ...updates } : c) } : q
      )
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-strong)',
    fontFamily: 'inherit', fontSize: '0.9rem',
    backgroundColor: 'var(--bg-primary)', outline: 'none',
  };

  const [isUploading, setIsUploading] = useState(false);
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploading(true);
    try {
      const { data } = await api.post('/instructor/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setCourseForm((f: any) => ({ ...f, thumbnail_url: data.url }));
    } catch (err) {
      alert("Failed to upload thumbnail.");
    } finally {
      setIsUploading(false);
    }
  };

  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setIsVideoUploading(true);
    try {
      const { data } = await api.post('/instructor/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditingLesson((f: any) => ({ ...f, video_url: data.url }));
    } catch (err) {
      alert("Failed to upload video.");
    } finally {
      setIsVideoUploading(false);
    }
  };

  const handleAddSection = () => {
    if (!newModuleTitle.trim()) {
      alert("Please enter a section title first.");
      return;
    }
    addModule.mutate(newModuleTitle.trim());
  };

  const handleAddLesson = (modId: number) => {
    if (!lessonForm.title.trim()) {
      alert("Please enter a lesson title first.");
      return;
    }
    addLesson.mutate(modId);
  };

  const lessonTypeIcon = (type: string) => {
    if (type === 'video') return <Video size={14} />;
    if (type === 'reading') return <FileText size={14} />;
    return <HelpCircle size={14} />;
  };

  if (isLoading) return <div className="p-3xl text-center">Loading editor...</div>;
  if (!course) return <div className="p-3xl text-center text-red-500">Course not found.</div>;

  const cf = courseForm || course;

  if (editingLesson) {
    return (
      <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)', padding: '1rem 0', position: 'sticky', top: '80px', zIndex: 10 }}>
          <div className="container flex items-center justify-between">
            <div className="flex items-center gap-md">
              <button onClick={() => setEditingLesson(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <ArrowLeft size={16} /> Back to Curriculum
              </button>
              <span style={{ color: 'var(--border-strong)' }}>|</span>
              <h1 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>Editing Lesson: {editingLesson.title}</h1>
            </div>
            <button onClick={saveLessonDetails} disabled={isSaving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Done Editing'}
            </button>
          </div>
        </div>

        <div className="container py-xl max-w-3xl">
          <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            
            {/* Video Lesson */}
            {editingLesson.lesson_type === 'video' && (
              <div>
                <h3 className="text-h3 mb-md flex items-center gap-sm"><Video size={20} className="text-brand" /> Video Content</h3>
                <p className="text-secondary mb-lg">Provide a link to your video or upload it directly.</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <input style={{ ...inputStyle, flex: 1 }} type="url" placeholder="https://..." value={editingLesson.video_url || ''} onChange={e => setEditingLesson({...editingLesson, video_url: e.target.value})} />
                  <span className="text-tertiary text-small">OR</span>
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.65rem 1rem', fontSize: '0.9rem' }}>
                    {isVideoUploading ? 'Uploading...' : 'Upload Video'}
                    <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoUpload} disabled={isVideoUploading} />
                  </label>
                </div>
                {editingLesson.video_url && renderVideoPlayer(editingLesson.video_url)}
              </div>
            )}

            {/* Reading Lesson */}
            {editingLesson.lesson_type === 'reading' && (
              <div>
                <h3 className="text-h3 mb-md flex items-center gap-sm"><FileText size={20} className="text-brand" /> Reading Content</h3>
                <p className="text-secondary mb-lg">Write your article or reading material here (Markdown supported).</p>
                <textarea style={{ ...inputStyle, minHeight: '300px', resize: 'vertical' }} placeholder="Start writing here..." value={editingLesson.content_text || ''} onChange={e => setEditingLesson({...editingLesson, content_text: e.target.value})} />
              </div>
            )}

            {/* Quiz Lesson */}
            {editingLesson.lesson_type === 'quiz' && (
              <div>
                <h3 className="text-h3 mb-md flex items-center gap-sm"><HelpCircle size={20} className="text-brand" /> Quiz Questions</h3>
                <p className="text-secondary mb-xl">Add multiple-choice questions to test your learners.</p>
                
                <div className="flex-col gap-xl">
                  {(editingLesson.questions || []).map((q: any, i: number) => (
                    <div key={q.id} style={{ border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', position: 'relative' }}>
                      <button onClick={() => { if(confirm('Delete question?')) deleteQuestion(q.id); }} style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                      <h4 className="font-semibold mb-xs">Question {i + 1}</h4>
                      <textarea style={{ ...inputStyle, minHeight: '60px', marginBottom: '1rem' }} value={q.text} onChange={e => updateQuestion(q.id, e.target.value)} onBlur={e => updateQuestion(q.id, e.target.value)} />
                      
                      <div className="flex-col gap-sm mb-md">
                        {(q.choices || []).map((c: any) => (
                          <div key={c.id} className="flex items-center gap-md">
                            <input type="radio" name={`correct_${q.id}`} checked={c.is_correct} onChange={() => updateChoice(q.id, c.id, { is_correct: true })} />
                            <input style={{ ...inputStyle, padding: '0.4rem 0.8rem' }} value={c.text} onChange={e => updateChoice(q.id, c.id, { text: e.target.value })} onBlur={e => updateChoice(q.id, c.id, { text: e.target.value })} />
                            <button onClick={() => deleteChoice(q.id, c.id)} style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        ))}
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => addChoice(q.id)} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>+ Add Choice</button>
                    </div>
                  ))}
                </div>
                
                <button className="btn btn-primary mt-xl w-full" onClick={addQuestion} style={{ padding: '0.8rem' }}>+ Add Question</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Top Bar */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-light)',
        padding: '1rem 0',
        position: 'sticky', top: '80px', zIndex: 10
      }}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-md">
            <Link to="/instructor" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <span style={{ color: 'var(--border-strong)' }}>|</span>
            <h1 style={{ fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{course.title}</h1>
            <span style={{
              padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: 700,
              backgroundColor: course.is_published ? '#DCFCE7' : '#FEF3C7',
              color: course.is_published ? '#15803D' : '#92400E'
            }}>
              {course.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
          <button onClick={saveCourse} disabled={isSaving} className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="container py-xl">
        <div className="editor-grid">

          {/* LEFT: Curriculum Builder */}
          <div>
            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.15rem', margin: 0 }}>Course Curriculum</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                  Add modules (sections) and lessons (videos, readings, quizzes).
                </p>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Modules */}
                {(course.modules || []).map((mod: any, i: number) => (
                  <div key={mod.id} style={{
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden'
                  }}>
                    {/* Module Header */}
                    <div style={{
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '0.85rem 1.25rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <GripVertical size={16} style={{ color: 'var(--text-tertiary)', cursor: 'grab' }} />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          Section {i + 1}: {mod.title}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                          {mod.lessons?.length || 0} lessons
                        </span>
                      </div>
                      <button onClick={() => { if (confirm('Delete this entire section?')) deleteModule.mutate(mod.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', display: 'flex' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Lessons */}
                    <div style={{ padding: '0.5rem 0' }}>
                      {(mod.lessons || []).map((lesson: any) => (
                        <div key={lesson.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.7rem 1.25rem',
                          borderBottom: '1px solid var(--border-light)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              backgroundColor: 'var(--brand-blue-light)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--brand-blue)'
                            }}>
                              {lessonTypeIcon(lesson.lesson_type)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{lesson.title}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                {lesson.lesson_type} • {lesson.duration}
                                {(lesson.video_url || lesson.content_text || (lesson.questions && lesson.questions.length > 0)) && (
                                  <span style={{ marginLeft: '0.5rem', color: 'var(--accent-green)' }}>✓ Content added</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button onClick={() => setEditingLesson(lesson)}
                              className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Edit2 size={12} /> Edit Content
                            </button>
                            <button onClick={() => { if (confirm('Delete this lesson?')) deleteLesson.mutate(lesson.id); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', display: 'flex', padding: '0.4rem' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Lesson Form */}
                      {addingModuleLesson === mod.id ? (
                        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#F0FDF4', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <input style={inputStyle} placeholder="Lesson title *" required
                            value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} />
                          <div className="split-grid">
                            <select style={inputStyle} value={lessonForm.lesson_type}
                              onChange={e => setLessonForm(f => ({ ...f, lesson_type: e.target.value }))}>
                              <option value="video">Video</option>
                              <option value="reading">Reading</option>
                              <option value="quiz">Quiz</option>
                            </select>
                            <input style={inputStyle} placeholder="Duration (e.g. 12 min)"
                              value={lessonForm.duration} onChange={e => setLessonForm(f => ({ ...f, duration: e.target.value }))} />
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" style={{ fontSize: '0.85rem' }} onClick={() => setAddingModuleLesson(null)}>Cancel</button>
                            <button className="btn btn-primary" style={{ fontSize: '0.85rem' }}
                              onClick={() => handleAddLesson(mod.id)}>
                              {addLesson.isPending ? 'Adding...' : 'Add Lesson'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAddingModuleLesson(mod.id); setLessonForm({ title: '', lesson_type: 'video', video_url: '', duration: '', order: 0 }); }}
                          style={{
                            width: '100%', padding: '0.65rem', border: 'none', background: 'none',
                            cursor: 'pointer', color: 'var(--brand-blue)', fontSize: '0.85rem',
                            fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                          }}
                        >
                          <Plus size={15} /> Add Lesson
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Module */}
                <div style={{
                  border: '2px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="New section title (e.g. Week 1: Fundamentals)"
                      value={newModuleTitle}
                      onChange={e => setNewModuleTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && newModuleTitle.trim()) addModule.mutate(newModuleTitle.trim()); }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleAddSection}
                      style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={16} /> {addModule.isPending ? 'Adding...' : 'Add Section'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Course Details Editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Course Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Title</label>
                  <input style={inputStyle} value={cf.title || ''}
                    onChange={e => setCourseForm((f: any) => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Description</label>
                  <textarea style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                    value={cf.description || ''}
                    onChange={e => setCourseForm((f: any) => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="split-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Level</label>
                    <select style={inputStyle} value={cf.level || 'Beginner'}
                      onChange={e => setCourseForm((f: any) => ({ ...f, level: e.target.value }))}>
                      {['Beginner', 'Intermediate', 'Advanced', 'Mixed'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Duration</label>
                    <input style={inputStyle} placeholder="e.g. 4 weeks" value={cf.duration || ''}
                      onChange={e => setCourseForm((f: any) => ({ ...f, duration: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Thumbnail</label>
                  {cf.thumbnail_url && (
                    <div style={{ marginBottom: '0.5rem', width: '100%', height: '150px', backgroundImage: `url(${cf.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 'var(--radius-md)' }} />
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input style={{ ...inputStyle, flex: 1 }} type="url" placeholder="https://..." value={cf.thumbnail_url || ''}
                      onChange={e => setCourseForm((f: any) => ({ ...f, thumbnail_url: e.target.value }))} />
                    <span className="text-tertiary text-small">OR</span>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.65rem 1rem', fontSize: '0.9rem' }}>
                      {isUploading ? 'Uploading...' : 'Upload Image'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleThumbnailUpload} disabled={isUploading} />
                    </label>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Card Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <input type="color" value={cf.image_color || '#EBF3FF'}
                      onChange={e => setCourseForm((f: any) => ({ ...f, image_color: e.target.value }))}
                      style={{ width: '44px', height: '34px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{cf.image_color}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Publish Panel */}
            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Publishing</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                <div style={{ position: 'relative' }}>
                  <input type="checkbox" checked={cf.is_published || false}
                    onChange={e => setCourseForm((f: any) => ({ ...f, is_published: e.target.checked }))}
                    style={{ display: 'none' }} />
                  <div style={{
                    width: '44px', height: '24px',
                    backgroundColor: cf.is_published ? 'var(--accent-green)' : 'var(--border-strong)',
                    borderRadius: '12px', position: 'relative', transition: 'background-color 0.2s'
                  }}>
                    <div style={{
                      position: 'absolute', top: '2px',
                      left: cf.is_published ? '22px' : '2px',
                      width: '20px', height: '20px',
                      backgroundColor: 'white', borderRadius: '50%',
                      transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
                <span style={{ fontWeight: 600 }}>
                  {cf.is_published ? '🟢 Published' : '🔴 Draft (hidden from students)'}
                </span>
              </label>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                {cf.is_published
                  ? 'This course is live and visible to all learners.'
                  : 'Toggle on when ready to make this course public.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;
