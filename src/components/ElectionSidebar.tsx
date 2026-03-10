import React from 'react';
import { UsersIcon, VoteIcon, MessageSquareIcon, NewspaperIcon, ShareIcon, MenuIcon, XIcon } from 'lucide-react';

export type ElectionSectionId = 'candidates' | 'vote' | 'comments' | 'news' | 'share';

const SECTIONS: { id: ElectionSectionId; label: string; icon: React.ElementType }[] = [
  { id: 'candidates', label: 'Candidates', icon: UsersIcon },
  { id: 'vote', label: 'Vote Now', icon: VoteIcon },
  { id: 'comments', label: 'Comments', icon: MessageSquareIcon },
  { id: 'news', label: 'News', icon: NewspaperIcon },
  { id: 'share', label: 'Share', icon: ShareIcon },
];

interface ElectionSidebarProps {
  activeSection: ElectionSectionId;
  onSectionChange: (id: ElectionSectionId) => void;
  className?: string;
}

export function ElectionSidebar({ activeSection, onSectionChange, className = '' }: ElectionSidebarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {SECTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            onSectionChange(id);
            setMobileOpen(false);
          }}
          className={`
            flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left font-medium transition-colors
            min-h-[48px] touch-manipulation
            ${activeSection === id
              ? 'bg-african-green/10 text-african-green'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile: menu button */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 flex justify-center">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-gray-200 shadow-lg text-gray-700 font-medium"
          aria-label="Open menu"
        >
          <MenuIcon className="w-5 h-5" />
          {SECTIONS.find((s) => s.id === activeSection)?.label ?? 'Menu'}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar: drawer on mobile, fixed column on desktop */}
      <aside
        className={`
          lg:static lg:flex-shrink-0 lg:w-56 lg:mr-8
          fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white border-r border-gray-200 shadow-xl
          transform transition-transform duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${className}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:border-0 lg:pb-3">
          <span className="font-display font-semibold text-gray-900">Sections</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Close menu"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 lg:p-0 overflow-y-auto">
          {nav}
        </div>
      </aside>
    </>
  );
}
