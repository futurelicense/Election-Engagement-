import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatsCard } from '../../components/admin/StatsCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useElection } from '../../context/ElectionContext';
import { adminService, ActivityItem } from '../../services/adminService';
import { VoteIcon, GlobeIcon, MessageSquareIcon, TrendingUpIcon, PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { countries, elections } = useElection();
  const [stats, setStats] = useState({ totalVotes: 0, totalComments: 0, pendingComments: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        adminService.getStats(),
        adminService.getRecentActivity(5),
      ]);
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  return <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Monitor your election platform at a glance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="animate-slide-up" style={{
          animationDelay: '0ms'
        }}>
            <StatsCard title="Total Votes" value={stats.totalVotes} icon={VoteIcon} color="#10B981" />
          </div>

          <div className="animate-slide-up" style={{
          animationDelay: '100ms'
        }}>
            <StatsCard title="Active Elections" value={elections.length} icon={GlobeIcon} color="#3B82F6" />
          </div>

          <div className="animate-slide-up" style={{
          animationDelay: '200ms'
        }}>
            <StatsCard title="Total Comments" value={stats.totalComments} icon={MessageSquareIcon} color="#F59E0B" />
          </div>

          <div className="animate-slide-up" style={{
          animationDelay: '300ms'
        }}>
            <StatsCard title="Countries" value={countries.length} icon={TrendingUpIcon} trend={{
            value: 8,
            isPositive: true
          }} color="#EF4444" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-display font-bold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button variant="primary" className="w-full justify-start" onClick={() => navigate('/admin/countries')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add New Country
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/admin/candidates')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add New Candidate
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => navigate('/admin/news')}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Publish News Article
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-display font-bold text-gray-900">
                Recent Activity
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDashboardData}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
            {loading && recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Loading activity...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const colorMap = {
                    vote: 'bg-african-green',
                    comment: 'bg-african-blue',
                    news: 'bg-african-yellow',
                  };
                  return (
                    <div
                      key={`${activity.type}-${activity.id}-${index}`}
                      className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <div className={`w-2 h-2 rounded-full ${colorMap[activity.type]} mt-2 flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.message}
                        </p>
                        {activity.content && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {activity.content}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>;
}