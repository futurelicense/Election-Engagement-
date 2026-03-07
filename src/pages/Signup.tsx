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
  CheckCircleIcon,
} from 'lucide-react';

const BENEFITS = [
  { icon: VoteIcon, title: 'Cast your vote', text: 'Make your voice count in real time.' },
  { icon: NewspaperIcon, title: 'Election news', text: 'Stay informed with trusted updates.' },
  { icon: MessageCircleIcon, title: 'Live chat', text: 'Join the nation in conversation.' },
  { icon: MessageSquareIcon, title: 'Share your view', text: 'Comment and react on the discussion.' },
];

export function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pin: '',
    confirmPin: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // VALIDATION
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Nickname
    if (!formData.name.trim()) {
      newErrors.name = 'Nickname is required';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone
    const phoneRegex = /^[0-9]{10,15}$/;
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = 'Phone must be 10-15 digits';
    }

    // PIN
    const pinRegex = /^[0-9]{4,6}$/;
    if (!formData.pin) {
      newErrors.pin = 'PIN is required';
    } else if (!pinRegex.test(formData.pin)) {
      newErrors.pin = 'PIN must be 4-6 digits';
    }

    // Confirm PIN
    if (!formData.confirmPin) {
      newErrors.confirmPin = 'Please confirm your PIN';
    } else if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await signup(formData.name, formData.email, formData.phone, formData.pin);
      setSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed. Please try again.';
      setErrors({ submit: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d\s\-\+\(\)]/g, '');
    setFormData({ ...formData, phone: value });
  };

  // SUCCESS SCREEN
  if (success) {
    return (
      <>
        <SEO title="Account Created" description="Your Nigeria Election account has been created successfully." noindex={true} />
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md p-10 text-center animate-scale-in shadow-xl border-0">
            <div className="w-20 h-20 bg-gradient-to-br from-african-green to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
              <CheckCircleIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
              Account created!
            </h2>
            <p className="text-gray-600 mb-2">
              Welcome to nigeriaelection.com. You can now cast your vote and join the nation.
            </p>
            <p className="text-sm text-gray-500">Redirecting you now...</p>
          </Card>
        </div>
      </>
    );
  }

  // MAIN SIGNUP FORM – same split layout as Login
  return (
    <>
      <SEO title="Create Account" description="Create your Nigeria Election account to vote, comment, and participate in democratic discussions." url="/signup" noindex />

      <div className="min-h-screen w-full flex">
        {/* Left: Hero (hidden on small) */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-10 xl:p-16 text-white relative overflow-hidden bg-[#065f46]">
          <div className="absolute inset-0 flex flex-col pointer-events-none">
            <div className="h-1/3 bg-[#008751]/90" />
            <div className="h-1/3 bg-white/5" />
            <div className="h-1/3 bg-[#008751]/90" />
          </div>
          <div className="relative z-10">
            <a href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white font-display font-bold text-lg mb-16">
              <span className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <VoteIcon className="w-5 h-5" />
              </span>
              nigeriaelection.com
            </a>
            <div className="max-w-md">
              <h1 className="text-4xl xl:text-5xl font-display font-bold leading-tight mb-4">
                Join the nation. Cast your vote.
              </h1>
              <p className="text-lg text-white/80 mb-10">
                Create your account in under a minute and start voting, following news, and chatting with Nigerians on nigeriaelection.com.
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
        <div className="w-full lg:w-[480px] flex-shrink-0 flex items-center justify-center p-6 sm:p-10 bg-gray-50 overflow-auto">
          <div className="w-full max-w-md py-4">
            <div className="lg:hidden text-center mb-6">
              <a href="/" className="inline-flex items-center gap-2 text-gray-900 font-display font-bold text-xl">
                <span className="w-10 h-10 rounded-xl bg-african-green/20 text-african-green flex items-center justify-center">
                  <VoteIcon className="w-5 h-5" />
                </span>
                nigeriaelection.com
              </a>
            </div>
            <Card className="w-full p-8 sm:p-10 shadow-xl border-0 animate-slide-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900 mb-1">Create account</h2>
                <p className="text-gray-600">Join nigeriaelection.com and cast your vote</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  label="Nickname"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Choose a nickname"
                  error={errors.name}
                  required
                  disabled={isLoading}
                />
                <Input
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  error={errors.email}
                  required
                  disabled={isLoading}
                />
                <Input
                  type="tel"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+234 812 345 6789"
                  error={errors.phone}
                  required
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  label="Create PIN (4-6 digits)"
                  value={formData.pin}
                  onChange={e => setFormData({ ...formData, pin: e.target.value })}
                  placeholder="••••"
                  error={errors.pin}
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  label="Confirm PIN"
                  value={formData.confirmPin}
                  onChange={e => setFormData({ ...formData, confirmPin: e.target.value })}
                  placeholder="••••"
                  error={errors.confirmPin}
                  maxLength={6}
                  required
                  disabled={isLoading}
                />
                {errors.submit && (
                  <p className="text-sm text-african-red bg-red-50 px-3 py-2 rounded-lg">{errors.submit}</p>
                )}
                <Button type="submit" variant="primary" className="w-full py-3.5 font-semibold" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account and cast your vote'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-african-green font-semibold hover:text-emerald-700 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  By creating an account, you agree to participate in democratic discussions and respect community guidelines.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
