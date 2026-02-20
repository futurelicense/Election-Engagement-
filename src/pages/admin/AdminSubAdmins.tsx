import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { authService, SubAdminUser } from '../../services/authService';
import { UserCogIcon, PlusIcon } from 'lucide-react';

export function AdminSubAdmins() {
  const { user } = useAuth();
  const [list, setList] = useState<SubAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    authService
      .getSubAdmins()
      .then(setList)
      .catch((e) => setError(e?.message || 'Failed to load sub-admins'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!name.trim() || !email.trim() || !pin.trim()) {
      setError('Name, email, and PIN are required.');
      return;
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 characters.');
      return;
    }
    setCreating(true);
    try {
      await authService.createSubAdmin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        pin,
      });
      setSuccess(`Sub-admin ${email} created. They can sign in with this email and PIN.`);
      setName('');
      setEmail('');
      setPhone('');
      setPin('');
      load();
    } catch (err: any) {
      setError(err?.message || 'Failed to create sub-admin');
    } finally {
      setCreating(false);
    }
  };

  if (!user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Sub-admins</h1>
          <p className="text-gray-600">
            Create sub-admins who can post news, manage comments, and view analytics. They cannot manage countries, candidates, or settings.
          </p>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Create sub-admin
          </h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-african-green focus:border-african-green"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-african-green focus:border-african-green"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-african-green focus:border-african-green"
                placeholder="+234..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PIN (they will use this to sign in)</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-african-green focus:border-african-green"
                placeholder="At least 4 characters"
                minLength={4}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create sub-admin'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserCogIcon className="w-5 h-5" />
            Existing sub-admins
          </h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : list.length === 0 ? (
            <p className="text-gray-500">No sub-admins yet. Create one above.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {list.map((u) => (
                <li key={u.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
