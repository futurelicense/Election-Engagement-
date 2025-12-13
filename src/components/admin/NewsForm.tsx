import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { RichTextEditor } from '../ui/RichTextEditor';
import { Select } from '../ui/Select';
import { FileUpload } from '../ui/FileUpload';
import { Button } from '../ui/Button';
import { News, Country } from '../../utils/types';
import { NEWS_PRIORITIES } from '../../utils/constants';
interface NewsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (news: Partial<News>) => void;
  news?: News;
  countries: Country[];
}
export function NewsForm({
  isOpen,
  onClose,
  onSubmit,
  news,
  countries
}: NewsFormProps) {
  const [formData, setFormData] = useState({
    title: news?.title || '',
    content: news?.content || '',
    countryId: news?.countryId || countries[0]?.id || '',
    priority: news?.priority || 'general',
    tags: news?.tags?.join(', ') || '',
    hashtags: news?.hashtags?.join(', ') || '',
    image: news?.image || ''
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.countryId || !formData.countryId.trim()) {
      alert('Please select a country');
      return;
    }
    
    if (!formData.title || !formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    
    // Check if content has actual text (not just HTML tags)
    const textContent = formData.content.replace(/<[^>]*>/g, '').trim();
    if (!textContent) {
      alert('Please enter news content');
      return;
    }
    
    onSubmit({
      id: news?.id,
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      hashtags: formData.hashtags.split(',').map(h => h.trim().replace(/^#/, '')).filter(Boolean),
      timestamp: news?.timestamp || new Date().toISOString()
    });
    onClose();
  };
  const handleImageChange = (_file: File | null, preview: string | null) => {
    setFormData({
      ...formData,
      image: preview || ''
    });
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={news ? 'Edit News' : 'Add News'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Country" value={formData.countryId} onChange={e => setFormData({
        ...formData,
        countryId: e.target.value
      })} options={countries.map(c => ({
        value: c.id,
        label: c.name
      }))} />

        <Select label="Priority" value={formData.priority} onChange={e => setFormData({
        ...formData,
        priority: e.target.value
      })} options={NEWS_PRIORITIES.map(p => ({
        value: p,
        label: p.charAt(0).toUpperCase() + p.slice(1)
      }))} />

        <Input label="Title" value={formData.title} onChange={e => setFormData({
        ...formData,
        title: e.target.value
      })} placeholder="News headline..." required />

        <RichTextEditor label="Content (Rich Text)" value={formData.content} onChange={content => setFormData({
        ...formData,
        content
      })} placeholder="Write your news article with formatting..." />

        <Input label="Tags (comma-separated)" value={formData.tags} onChange={e => setFormData({
        ...formData,
        tags: e.target.value
      })} placeholder="e.g., debate, presidential, policy" />

        <Input label="Hashtags (comma-separated)" value={formData.hashtags} onChange={e => setFormData({
        ...formData,
        hashtags: e.target.value
      })} placeholder="e.g., #Election2025, #Democracy, #Vote" />

        <FileUpload label="Featured Image (optional)" value={formData.image} onChange={handleImageChange} />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {news ? 'Update' : 'Publish'}
          </Button>
        </div>
      </form>
    </Modal>;
}