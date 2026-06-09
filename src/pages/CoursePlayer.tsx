import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ChevronLeft, PlayCircle, FileText, HelpCircle, CheckCircle2, XCircle, Check, Star } from 'lucide-react';
import api from '../api';

const fetchEnrollments = async () => {
  const { data } = await api.get('/enrollments/');
  return data;
};

const fetchCourse = async (id: string) => {
  const { data } = await api.get(`/courses/${id}/`);
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
      <iframe src={embedUrl} style={{ width: '100%', height: '100%', border: 'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
    );
  }
  return <video src={url} controls style={{ width: '100%', height: '100%' }} autoPlay>Your browser does not support the video tag.</video>;
};

const CoursePlayer = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeLesson, setActiveLesson] = useState<any>(null);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Review State
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submitReviewMutation = useMutation({
    mutationFn: () => api.post(`/courses/${id}/reviews/`, { rating, text: reviewText }),
    onMutate: () => setReviewStatus('loading'),
    onSuccess: () => {
      setReviewStatus('success');
      setReviewText('');
    },
    onError: () => setReviewStatus('error')
  });

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', id],
    queryFn: () => fetchCourse(id as string),
    enabled: !!id,
  });

  const { data: enrollments = [], refetch: refetchEnrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: fetchEnrollments,
  });

  const enrollment = enrollments.find((e: any) => String(e.course?.id) === id);
  const progressPercentage = enrollment?.progress_percentage ?? 0;
  const completedLessons = enrollment?.completed_lessons || [];

  const completeLessonMutation = useMutation({
    mutationFn: (lessonId: number) => api.post(`/courses/${id}/complete-lesson/`, { lesson_id: lessonId }),
    onSuccess: () => {
      refetchEnrollments();
    }
  });

  useEffect(() => {
    if (course && course.modules && course.modules.length > 0 && !activeLesson) {
      const firstModule = course.modules[0];
      if (firstModule.lessons && firstModule.lessons.length > 0) {
        setActiveLesson(firstModule.lessons[0]);
      }
    }
  }, [course, activeLesson]);

  // Reset quiz state when lesson changes
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  }, [activeLesson?.id]);

  if (isLoading) return <div className="p-3xl text-center">Loading course player...</div>;
  if (isError || !course) return <div className="p-3xl text-center text-accent-red">Error loading course.</div>;

  const calculateQuizScore = () => {
    if (!activeLesson || !activeLesson.questions) return 0;
    let correct = 0;
    activeLesson.questions.forEach((q: any) => {
      const selectedId = quizAnswers[q.id];
      const selectedChoice = q.choices.find((c: any) => c.id === selectedId);
      if (selectedChoice && selectedChoice.is_correct) {
        correct++;
      }
    });
    return Math.round((correct / activeLesson.questions.length) * 100);
  };

  return (
    <div className="player-layout">
      {/* Sidebar Curriculum */}
      <div className="player-sidebar">
        <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-light)' }}>
          <Link to={`/course/${id}`} className="flex items-center gap-xs text-small text-secondary hover-scale" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
            <ChevronLeft size={16} /> Back to Course
          </Link>
          <h2 className="font-semibold">{course.title}</h2>
          <div className="mt-sm" style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px' }}>
            <div style={{ width: `${progressPercentage}%`, height: '100%', backgroundColor: 'var(--accent-green)', borderRadius: '3px', transition: 'width 0.4s ease' }}></div>
          </div>
          <p className="text-small text-tertiary mt-xs">{progressPercentage}% completed</p>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {course.modules.length > 0 ? (
            course.modules.map((module: any) => (
              <div key={module.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ padding: 'var(--spacing-md)' }}>
                  <h3 className="text-small font-semibold mb-sm text-tertiary uppercase" style={{ letterSpacing: '0.05em' }}>{module.title}</h3>
                  <ul className="flex-col gap-xs">
                    {module.lessons.map((lesson: any) => {
                      const isActive = activeLesson?.id === lesson.id;
                      return (
                        <li 
                          key={lesson.id} 
                          onClick={() => setActiveLesson(lesson)}
                          className="flex items-start gap-sm p-sm hover-scale" 
                          style={{ 
                            borderRadius: 'var(--radius-md)', 
                            backgroundColor: isActive ? 'var(--brand-blue-light)' : 'transparent', 
                            cursor: 'pointer' 
                          }}
                        >
                          <div className="mt-xs">
                            {lesson.lesson_type === 'video' ? (
                              <PlayCircle size={16} className={isActive ? "text-brand" : "text-secondary"} />
                            ) : lesson.lesson_type === 'quiz' ? (
                              <HelpCircle size={16} className={isActive ? "text-brand" : "text-secondary"} />
                            ) : (
                              <FileText size={16} className={isActive ? "text-brand" : "text-secondary"} />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className={`text-small ${isActive ? 'font-semibold text-brand' : 'text-primary'}`}>{lesson.title}</div>
                            <div className="text-xs text-tertiary" style={{ fontSize: '0.75rem' }}>{lesson.lesson_type.charAt(0).toUpperCase() + lesson.lesson_type.slice(1)} • {lesson.duration}</div>
                          </div>
                          {completedLessons.includes(lesson.id) && (
                            <div className="mt-xs">
                              <CheckCircle2 size={16} className="text-accent-green" />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <div className="p-md text-tertiary text-small">No modules found for this course yet.</div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="player-content">
        
        {/* Video Player */}
        {activeLesson && activeLesson.lesson_type === 'video' ? (
          <div style={{ backgroundColor: 'black', width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
            {activeLesson.video_url ? (
              renderVideoPlayer(activeLesson.video_url)
            ) : (
              <div className="text-center" style={{ margin: 'auto' }}>
                <PlayCircle size={64} className="text-inverse mb-md mx-auto" style={{ opacity: 0.8 }} />
                <p className="text-inverse font-medium">Video content coming soon</p>
                <p className="text-small text-tertiary mt-xs">No video link provided for this lesson.</p>
              </div>
            )}
          </div>
        ) : activeLesson && activeLesson.lesson_type === 'reading' ? (
          /* Reading Content */
          <div style={{ backgroundColor: 'white', width: '100%', padding: '3rem', borderBottom: '1px solid var(--border-light)' }}>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-h2 mb-xl">{activeLesson.title}</h1>
              {activeLesson.content_text ? (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
                  {activeLesson.content_text}
                </div>
              ) : (
                <p className="text-body-large text-tertiary italic">Reading content not provided.</p>
              )}
              
              <div className="mt-2xl flex justify-center border-t pt-xl" style={{ borderTop: '1px solid var(--border-light)' }}>
                {completedLessons.includes(activeLesson.id) ? (
                  <button className="btn btn-secondary flex items-center gap-sm" disabled>
                    <Check size={18} /> Completed
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary flex items-center gap-sm"
                    onClick={() => completeLessonMutation.mutate(activeLesson.id)}
                    disabled={completeLessonMutation.isPending}
                  >
                    <Check size={18} /> Mark as Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : activeLesson && activeLesson.lesson_type === 'quiz' ? (
          /* Quiz Content */
          <div style={{ backgroundColor: 'white', width: '100%', padding: '3rem', borderBottom: '1px solid var(--border-light)', minHeight: '500px' }}>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-h2 mb-xl">{activeLesson.title}</h1>
              
              {!activeLesson.questions || activeLesson.questions.length === 0 ? (
                <p className="text-body-large text-tertiary italic">No questions have been added to this quiz yet.</p>
              ) : (
                <div className="flex-col gap-2xl">
                  {activeLesson.questions.map((q: any, i: number) => {
                    const selectedChoice = q.choices.find((c: any) => c.id === quizAnswers[q.id]);
                    const isCorrect = selectedChoice?.is_correct;

                    return (
                      <div key={q.id} style={{ 
                        border: '1px solid var(--border-light)', 
                        borderRadius: 'var(--radius-xl)', 
                        padding: '2rem',
                        backgroundColor: quizSubmitted ? (isCorrect ? '#F0FDF4' : '#FEF2F2') : 'var(--bg-primary)'
                      }}>
                        <h3 className="font-semibold text-lg mb-lg">
                          <span className="text-tertiary mr-sm">{i + 1}.</span> 
                          {q.text}
                        </h3>
                        
                        <div className="flex-col gap-sm">
                          {(q.choices || []).map((c: any) => {
                            const isSelected = quizAnswers[q.id] === c.id;
                            return (
                              <label key={c.id} style={{ 
                                display: 'flex', alignItems: 'center', gap: '0.75rem', 
                                padding: '1rem', border: '1px solid',
                                borderColor: isSelected ? 'var(--brand-blue)' : 'var(--border-light)',
                                backgroundColor: isSelected ? 'var(--brand-blue-light)' : 'transparent',
                                borderRadius: 'var(--radius-md)',
                                cursor: quizSubmitted ? 'default' : 'pointer',
                                transition: 'all 0.2s'
                              }}>
                                <input 
                                  type="radio" 
                                  name={`question_${q.id}`} 
                                  checked={isSelected}
                                  onChange={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [q.id]: c.id }))}
                                  disabled={quizSubmitted}
                                  style={{ transform: 'scale(1.2)' }}
                                />
                                <span style={{ flex: 1, fontWeight: isSelected ? 600 : 400 }}>{c.text}</span>
                                
                                {quizSubmitted && c.is_correct && (
                                  <CheckCircle2 size={20} style={{ color: 'var(--accent-green)' }} />
                                )}
                                {quizSubmitted && isSelected && !c.is_correct && (
                                  <XCircle size={20} style={{ color: 'var(--accent-red)' }} />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {!quizSubmitted ? (
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '1rem 2rem', fontSize: '1.1rem', marginTop: '1rem' }}
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length < activeLesson.questions.length}
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', textAlign: 'center', marginTop: '1rem' }}>
                      <h2 className="text-h2 mb-sm">Quiz Results</h2>
                      <p className="text-body-large text-secondary mb-lg">
                        You scored <span className="font-bold text-brand">{calculateQuizScore()}%</span>
                      </p>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }}
                      >
                        Retake Quiz
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-2xl flex justify-center border-t pt-xl" style={{ borderTop: '1px solid var(--border-light)' }}>
                    {completedLessons.includes(activeLesson.id) ? (
                      <button className="btn btn-secondary flex items-center gap-sm" disabled>
                        <Check size={18} /> Completed
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary flex items-center gap-sm"
                        onClick={() => completeLessonMutation.mutate(activeLesson.id)}
                        disabled={completeLessonMutation.isPending}
                      >
                        <Check size={18} /> Mark as Complete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'black', width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="text-center">
              <p className="text-inverse font-medium">Select a lesson to begin</p>
            </div>
          </div>
        )}

        {/* Content Tabs */}
        {activeLesson && activeLesson.lesson_type === 'video' && (
          <div style={{ padding: 'var(--spacing-xl)', backgroundColor: 'var(--bg-primary)', flex: 1 }}>
            <div className="flex gap-lg border-b mb-xl" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <button 
                className={`pb-sm font-medium ${activeTab === 'overview' ? 'text-brand' : 'text-secondary'}`}
                style={{ borderBottom: activeTab === 'overview' ? '2px solid var(--brand-blue)' : '2px solid transparent' }}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`pb-sm font-medium ${activeTab === 'notes' ? 'text-brand' : 'text-secondary'}`}
                style={{ borderBottom: activeTab === 'notes' ? '2px solid var(--brand-blue)' : '2px solid transparent' }}
                onClick={() => setActiveTab('notes')}
              >
                Notes
              </button>
            </div>

            <div className="max-w-3xl">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-h2 mb-md">{activeLesson.title}</h2>
                  <p className="text-body text-secondary mb-lg">
                    This is the overview for the current lesson. You can learn key concepts here.
                  </p>
                </div>
              )}
              {activeTab === 'notes' && (
                <p className="text-secondary">Take notes here while you watch the video...</p>
              )}
              
              <div className="mt-2xl flex justify-between items-center border-t pt-xl" style={{ borderTop: '1px solid var(--border-light)' }}>
                <div></div>
                {completedLessons.includes(activeLesson.id) ? (
                  <button className="btn btn-secondary flex items-center gap-sm" disabled>
                    <Check size={18} /> Completed
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary flex items-center gap-sm"
                    onClick={() => completeLessonMutation.mutate(activeLesson.id)}
                    disabled={completeLessonMutation.isPending}
                  >
                    <Check size={18} /> Mark as Complete
                  </button>
                )}
              </div>

              {progressPercentage === 100 && (
                <div className="mt-3xl p-xl" style={{ backgroundColor: 'var(--brand-blue-light)', borderRadius: 'var(--radius-xl)' }}>
                  <h3 className="text-h3 mb-md text-brand">Congratulations on finishing the course! 🎉</h3>
                  <p className="text-secondary mb-lg">Please take a moment to leave a review and help other students.</p>
                  
                  {reviewStatus === 'success' ? (
                    <div className="text-brand font-semibold flex items-center gap-sm">
                      <CheckCircle2 size={20} /> Thank you for your review!
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-sm mb-md text-brand">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                            <Star size={28} fill={star <= rating ? 'currentColor' : 'none'} color={star <= rating ? '#FACC15' : 'var(--text-tertiary)'} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="How was the course?"
                        rows={3}
                        className="w-full mb-md"
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', outline: 'none', resize: 'vertical' }}
                      />
                      <button
                        onClick={() => submitReviewMutation.mutate()}
                        disabled={reviewStatus === 'loading'}
                        className="btn btn-primary"
                      >
                        {reviewStatus === 'loading' ? 'Submitting...' : 'Submit Review'}
                      </button>
                      {reviewStatus === 'error' && <p className="text-accent-red mt-sm text-small">Failed to submit review.</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
