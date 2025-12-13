import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GlobeIcon } from 'lucide-react';
export function Login() {
  const navigate = useNavigate();
  const {
    login
  } = useAuth();
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, pin);
      // Get user from auth context to check admin status
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // Check if there's a redirect path in location state
        const redirectPath = new URLSearchParams(window.location.search).get('redirect') || 
                           (window.history.state?.from?.pathname);
        if (user.isAdmin) {
          navigate(redirectPath || '/admin');
        } else {
          navigate(redirectPath || '/');
        }
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return <>
      <SEO title="Sign In" description="Sign in to African Elections platform to vote, comment, and participate in democratic discussions across Africa." noindex={true} />

      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <GlobeIcon className="w-10 h-10 text-african-green" />
              <h1 className="text-3xl font-display font-bold text-gray-900">
                African Elections
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to participate</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required disabled={isLoading} />

            <Input type="password" label="PIN" value={pin} onChange={e => setPin(e.target.value)} placeholder="••••" maxLength={6} required disabled={isLoading} />

            {error && <p className="text-sm text-african-red">{error}</p>}

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-african-green font-medium hover:text-emerald-600 transition-colors">
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">
              Demo credentials:
            </p>
            <div className="space-y-1">
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                Admin: admin@election.com / PIN: 1234
              </p>
              <p className="font-mono text-xs bg-gray-100 p-2 rounded">
                User: user@example.com / PIN: 5678
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>;
}