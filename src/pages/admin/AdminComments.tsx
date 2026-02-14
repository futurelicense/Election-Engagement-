import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { CommentModerationTable } from '../../components/admin/CommentModerationTable';
import { commentService } from '../../services/commentService';
import { Comment } from '../../utils/types';

export function AdminComments() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'flagged'>('all');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [filter]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const commentsData = await commentService.getAllForModeration(
        filter === 'all' ? undefined : filter
      );
      setComments(commentsData);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId: string) => {
    try {
      await commentService.update(commentId, { approved: true });
      await loadComments();
    } catch (error: any) {
      console.error('Failed to approve comment:', error);
      alert(error.message || 'Failed to approve comment');
    }
  };

  const handleHide = async (commentId: string) => {
    try {
      await commentService.update(commentId, { approved: false });
      await loadComments();
    } catch (error: any) {
      console.error('Failed to hide comment:', error);
      alert(error.message || 'Failed to hide comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.delete(commentId);
      await loadComments();
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      alert(error.message || 'Failed to delete comment');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Comment Moderation
            </h1>
            <p className="text-gray-600">Review and moderate user comments</p>
          </div>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            options={[
              { value: 'all', label: 'All Comments' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
              { value: 'flagged', label: 'Flagged' },
            ]}
            className="w-48"
          />
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <CommentModerationTable
              comments={comments}
              onApprove={handleApprove}
              onHide={handleHide}
              onDelete={handleDelete}
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
