import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { useAuth } from '../context/AuthContext';
interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
}
export function CommentForm({
  onSubmit,
  placeholder = 'Share your thoughts...',
  buttonText = 'Post Comment'
}: CommentFormProps) {
  const {
    user
  } = useAuth();
  const [content, setContent] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };
  return <Card className="p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Avatar src={user?.avatar} alt={user?.name || 'User'} fallback={user?.name?.charAt(0) || 'U'} size="md" />

          <div className="flex-1">
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder={placeholder} rows={3} className="mb-3" />

            <div className="flex justify-end">
              <Button type="submit" disabled={!content.trim()} size="sm">
                {buttonText}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>;
}