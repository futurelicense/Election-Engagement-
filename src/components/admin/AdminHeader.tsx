import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { LogOutIcon } from 'lucide-react';
export function AdminHeader() {
  const {
    user,
    logout
  } = useAuth();
  return <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Welcome back, {user?.name}
          </h2>
          <p className="text-sm text-gray-600">Manage your election platform</p>
        </div>

        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar} alt={user?.name || 'Admin'} fallback={user?.name?.charAt(0) || 'A'} size="md" />
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOutIcon className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>;
}