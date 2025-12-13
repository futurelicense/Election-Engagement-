import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboardIcon, GlobeIcon, UsersIcon, BarChart3Icon, MessageSquareIcon, NewspaperIcon, SettingsIcon, MenuIcon, XIcon, MessagesSquareIcon } from 'lucide-react';
const navItems = [{
  path: '/admin',
  label: 'Dashboard',
  icon: LayoutDashboardIcon
}, {
  path: '/admin/countries',
  label: 'Countries',
  icon: GlobeIcon
}, {
  path: '/admin/candidates',
  label: 'Candidates',
  icon: UsersIcon
}, {
  path: '/admin/analytics',
  label: 'Analytics',
  icon: BarChart3Icon
}, {
  path: '/admin/comments',
  label: 'Comments',
  icon: MessageSquareIcon
}, {
  path: '/admin/chat',
  label: 'Group Chats',
  icon: MessagesSquareIcon
}, {
  path: '/admin/news',
  label: 'News',
  icon: NewspaperIcon
}, {
  path: '/admin/settings',
  label: 'Settings',
  icon: SettingsIcon
}];
export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  return <>
      {/* Mobile toggle */}
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg">
        {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <GlobeIcon className="w-8 h-8 text-african-green" />
            <div>
              <h1 className="text-xl font-display font-bold text-gray-900">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500">Election Platform</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => <NavLink key={item.path} to={item.path} end={item.path === '/admin'} onClick={() => setIsOpen(false)} className={({
          isActive
        }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-african-green text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>)}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <NavLink to="/" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
            <GlobeIcon className="w-5 h-5" />
            <span className="font-medium">View Site</span>
          </NavLink>
        </div>
      </aside>
    </>;
}