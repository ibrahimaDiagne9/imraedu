import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, User } from 'lucide-react';
import api from '../api';

export default function LessonDiscussions({ lessonId }: { lessonId: number }) {
  const queryClient = useQueryClient();
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<number, string>>({});
  const [expandedThread, setExpandedThread] = useState<number | null>(null);

  const { data: threads = [], isLoading } = useQuery({
    queryKey: ['discussions', lessonId],
    queryFn: async () => {
      const { data } = await api.get(`/lessons/${lessonId}/discussions/`);
      return data;
    }
  });

  const createThread = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/lessons/${lessonId}/discussions/`, {
        title: newThreadTitle,
        content: newThreadContent
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', lessonId] });
      setNewThreadTitle('');
      setNewThreadContent('');
    }
  });

  const createReply = useMutation({
    mutationFn: async ({ threadId, content }: { threadId: number, content: string }) => {
      const { data } = await api.post(`/discussions/${threadId}/reply/`, { content });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', lessonId] });
      setReplyContent({});
    }
  });

  if (isLoading) return <div className="p-xl text-center">Loading discussions...</div>;

  return (
    <div className="flex flex-col gap-xl">
      {/* Ask a Question Box */}
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
        <h3 className="text-h3 mb-md flex items-center gap-sm">
          <MessageSquare size={20} className="text-brand" /> Ask a Question
        </h3>
        <div className="flex flex-col gap-sm">
          <input 
            type="text" 
            placeholder="Question title" 
            className="input w-full"
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
          />
          <textarea 
            placeholder="Describe what you are stuck on..." 
            className="input w-full"
            rows={3}
            value={newThreadContent}
            onChange={(e) => setNewThreadContent(e.target.value)}
          />
          <div className="flex justify-end mt-sm">
            <button 
              className="btn btn-primary flex items-center gap-sm"
              onClick={() => createThread.mutate()}
              disabled={!newThreadTitle.trim() || !newThreadContent.trim() || createThread.isPending}
            >
              <Send size={16} /> Post Question
            </button>
          </div>
        </div>
      </div>

      {/* Discussion Threads */}
      <div className="flex flex-col gap-lg">
        {threads.map((thread: any) => (
          <div key={thread.id} style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
            {/* Thread Header */}
            <div 
              className="p-lg cursor-pointer" 
              style={{ backgroundColor: expandedThread === thread.id ? 'var(--bg-secondary)' : 'white' }}
              onClick={() => setExpandedThread(expandedThread === thread.id ? null : thread.id)}
            >
              <div className="flex justify-between items-start mb-sm">
                <h4 className="text-h4 font-semibold">{thread.title}</h4>
                <div className="text-small text-tertiary flex items-center gap-xs">
                  <MessageSquare size={14} /> {thread.reply_count} replies
                </div>
              </div>
              <div className="flex items-center gap-sm text-small text-secondary">
                <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: 'var(--brand-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} className="text-brand" />
                </div>
                <span className="font-medium text-primary">{thread.user_name}</span>
                <span>•</span>
                <span>{new Date(thread.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedThread === thread.id && (
              <div className="p-lg border-t" style={{ borderTop: '1px solid var(--border-light)' }}>
                <p className="text-body mb-xl">{thread.content}</p>

                {/* Replies */}
                <div className="flex flex-col gap-md ml-xl pl-lg border-l-2" style={{ borderLeftColor: 'var(--border-strong)' }}>
                  {thread.replies.map((reply: any) => (
                    <div key={reply.id} style={{ backgroundColor: reply.is_instructor ? 'var(--brand-blue-light)' : 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <div className="flex justify-between items-center mb-xs">
                        <span className="font-medium text-small flex items-center gap-xs">
                          {reply.user_name}
                          {reply.is_instructor && <span style={{ backgroundColor: 'var(--brand-blue)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>Instructor</span>}
                        </span>
                        <span className="text-small text-tertiary">{new Date(reply.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-small">{reply.content}</p>
                    </div>
                  ))}

                  {/* Reply Input */}
                  <div className="mt-sm flex gap-sm">
                    <input 
                      type="text" 
                      placeholder="Add a reply..." 
                      className="input flex-1"
                      value={replyContent[thread.id] || ''}
                      onChange={(e) => setReplyContent({ ...replyContent, [thread.id]: e.target.value })}
                    />
                    <button 
                      className="btn btn-secondary"
                      onClick={() => createReply.mutate({ threadId: thread.id, content: replyContent[thread.id] })}
                      disabled={!replyContent[thread.id]?.trim() || createReply.isPending}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {threads.length === 0 && (
          <div className="text-center p-2xl text-secondary border border-dashed rounded-lg" style={{ borderColor: 'var(--border-strong)' }}>
            No questions asked yet. Be the first to start a discussion!
          </div>
        )}
      </div>
    </div>
  );
}
