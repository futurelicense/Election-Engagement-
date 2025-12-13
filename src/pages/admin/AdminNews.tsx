import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { NewsForm } from '../../components/admin/NewsForm';
import { useElection } from '../../context/ElectionContext';
import { newsService } from '../../services/newsService';
import { News } from '../../utils/types';
import { PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AdminNews() {
  const { countries } = useElection();
  const [news, setNews] = useState<News[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsData = await newsService.getAll();
      setNews(newsData);
    } catch (error: any) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (newsItem: News) => {
    setSelectedNews(newsItem);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedNews(undefined);
    setShowForm(true);
  };

  const handleSubmit = async (newsItem: Partial<News>) => {
    try {
      setLoading(true);
      if (selectedNews) {
        await newsService.update(selectedNews.id, newsItem);
      } else {
        await newsService.create(newsItem as Omit<News, 'id' | 'timestamp'>);
      }
      await loadNews();
      setShowForm(false);
    } catch (error: any) {
      console.error('Failed to save news:', error);
      alert(error.message || 'Failed to save news');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (newsId: string) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;

    try {
      setLoading(true);
      await newsService.delete(newsId);
      await loadNews();
    } catch (error: any) {
      console.error('Failed to delete news:', error);
      alert(error.message || 'Failed to delete news');
    } finally {
      setLoading(false);
    }
  };

  const priorityVariants = {
    breaking: 'danger' as const,
    important: 'warning' as const,
    general: 'info' as const,
  };

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (newsItem: News) => (
        <div className="max-w-md">
          <p className="font-medium text-gray-900 line-clamp-1">{newsItem.title}</p>
          <p className="text-sm text-gray-500 line-clamp-1">{newsItem.content}</p>
        </div>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      width: '120px',
      render: (newsItem: News) => {
        const country = countries.find(c => c.id === newsItem.countryId);
        return country ? `${country.flag} ${country.name}` : '-';
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '120px',
      render: (newsItem: News) => (
        <Badge variant={priorityVariants[newsItem.priority]}>
          {newsItem.priority.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'timestamp',
      header: 'Published',
      width: '150px',
      render: (newsItem: News) => (
        <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(newsItem.timestamp), { addSuffix: true })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '150px',
      render: (newsItem: News) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEdit(newsItem)}
            disabled={loading}
          >
            <EditIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(newsItem.id)}
            disabled={loading}
          >
            <TrashIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              News Management
            </h1>
            <p className="text-gray-600">Create and manage election news articles</p>
          </div>
          <Button variant="primary" onClick={handleAdd} disabled={loading}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add News
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table data={news} columns={columns} />
          )}
        </Card>
      </div>

      <NewsForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        news={selectedNews}
        countries={countries}
      />
    </AdminLayout>
  );
}
