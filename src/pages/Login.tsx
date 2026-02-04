import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import {
  VoteIcon,
  NewspaperIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
  ChevronRightIcon,
  SparklesIcon,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: VoteIcon,
    title: 'Cast your vote',
    text: 'Make your voice count in real time.',
  },
  {
    icon: NewspaperIcon,
    title: 'Election news',
    text: 'Stay informed with trusted updates.',
  },
  {
    icon: MessageCircleIcon,
    title: 'Live chat',
    text: 'Join the nation in conversation.',
  },
  {
    icon: MessageSquareIcon,
    title: 'Share your view',
    text: 'Comment and react on the discussion.',
  },
];

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, pin);
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const redirectPath =
          new URLSearchParams(window.location.search).get('redirect') ||
          (window.history.state as { from?: { pathname?: string } } | null)?.from?.pathname;
        if (user.isAdmin) {
          navigate(redirectPath || '/admin');
        } else {
          navigate(redirectPath || '/');
        }
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Sign In"
        description="Sign in to Nigeria Election platform to vote, comment, and participate in democratic discussions."
        url="/login"
        noindex
      />

      <div className="min-h-screen w-full flex">
        {/* Left: Hero / value proposition (hidden on small, visible lg+) */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-10 xl:p-16 text-white relative overflow-hidden bg-[#065f46]">
          {/* Nigeria flag stripes - subtle */}
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            <div className="h-1/3 bg-[#008751]/90" />
            <div className="h-1/3 bg-white/5" />
            <div className="h-1/3 bg-[#008751]/90" />
          </div>

          <div className="relative z-10">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white font-display font-bold text-lg mb-16"
            >
              <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <VoteIcon className="w-5 h-5" />
              </span>
              nigeriaelection.com
            </a>

            <div className="max-w-md">
              <p className="inline-flex items-center gap-2 text-emerald-200/90 text-sm font-medium mb-4">
                <SparklesIcon className="w-4 h-4" />
                Your voice. Your vote.
              </p>
              <h1 className="text-4xl xl:text-5xl font-display font-bold leading-tight mb-4">
                Sign in to engage with the nation
              </h1>
              <p className="text-lg text-white/80 mb-10">
                Cast your vote, follow live news, and join millions in the conversation at nigeriaelection.com.
              </p>

              <ul className="space-y-4">
                {BENEFITS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-emerald-200" />
                      </span>
                      <div>
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="text-sm text-white/70">{item.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-300" />
              Secure
            </span>
            <span>•</span>
            <span>Transparent</span>
            <span>•</span>
            <span>Your data protected</span>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full lg:w-[480px] flex-shrink-0 flex items-center justify-center p-6 sm:p-10 bg-gray-50">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="lg:hidden text-center mb-8">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-gray-900 font-display font-bold text-xl"
              >
                <span className="w-10 h-10 rounded-xl bg-african-green/20 text-african-green flex items-center justify-center">
                  <VoteIcon className="w-5 h-5" />
                </span>
                nigeriaelection.com
              </a>
            </div>

            <Card className="w-full p-8 sm:p-10 shadow-xl border-0 animate-slide-up">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">
                  Welcome back
                </h2>
                <p className="text-gray-600">
                  Sign in to cast your vote and join the conversation
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  label="PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  maxLength={6}
                  required
                  disabled={isLoading}
                />

                {error && (
                  <p className="text-sm text-african-red bg-red-50 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3.5 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              {/* Primary CTA: Sign up */}
              <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-african-green/10 to-emerald-500/10 border border-african-green/20">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  New to nigeriaelection.com?
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Create an account in under a minute. Vote, comment, and engage with the nation.
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 text-african-green font-semibold hover:text-emerald-700 transition-colors group"
                >
                  Create account and cast your vote
                  <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
