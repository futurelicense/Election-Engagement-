import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GlobeIcon, CheckCircleIcon } from 'lucide-react';

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

    // Name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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
      setErrors({ submit: 'Signup failed. Please try again.' });
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
        <SEO title="Account Created" description="Your African Elections account has been created successfully." noindex={true} />
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 text-center animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-br from-african-green to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
              <CheckCircleIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">
              Account Created!
            </h2>
            <p className="text-gray-600">
              Welcome to African Elections. Redirecting you now...
            </p>
          </Card>
        </div>
      </>
    );
  }

  // MAIN SIGNUP FORM
  return (
    <>
      <SEO title="Create Account" description="Create your African Elections account to vote, comment, and participate in democratic discussions across Africa." noindex={true} />

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
              Create Account
            </h2>
            <p className="text-gray-600">Join the democratic conversation</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME FIELD */}
            <Input
              type="text"
              label="Full Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
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
              <p className="text-sm text-african-red">{errors.submit}</p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-african-green font-medium hover:text-emerald-600 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to participate in democratic
              discussions and respect community guidelines.
            </p>
          </div>

        </Card>
      </div>
    </>
  );
}
