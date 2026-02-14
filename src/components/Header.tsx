import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { GlobeIcon, LogOutIcon, UserIcon, MenuIcon, XIcon } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const goTo = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-gray-200/80 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px] -ml-2 pl-2 flex-shrink-0"
            aria-label="Nigeria Election Home"
          >
            <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-african-green/10 text-african-green shrink-0">
              <GlobeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <span className="hidden min-[400px]:flex flex-col">
              <span className="text-lg sm:text-xl font-display font-bold text-gray-900 leading-tight">
                Nigeria Election
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-wide mt-0.5">
                Vote. Discuss. Engage.
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-700 mr-2">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium max-w-[120px] truncate" title={user?.name || user?.email}>
                    {user?.name || user?.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 min-h-[40px]"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="min-h-[40px] px-4"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="min-h-[40px] px-4"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="sm:hidden flex items-center justify-center w-11 h-11 rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-4 animate-fade-in">
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
                  <UserIcon className="w-5 h-5 text-gray-500 shrink-0" />
                  <span className="font-medium text-gray-900 truncate">
                    {user?.name || user?.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-gray-700 hover:bg-gray-100 active:bg-gray-100 min-h-[48px]"
                >
                  <LogOutIcon className="w-5 h-5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => goTo('/login')}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-900 font-medium hover:border-african-green hover:text-african-green min-h-[48px] transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => goTo('/signup')}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-african-green text-white font-medium hover:opacity-90 min-h-[48px] transition-opacity"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
