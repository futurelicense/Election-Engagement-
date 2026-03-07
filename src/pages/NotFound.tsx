import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/SEO';
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved. Browse elections or sign in to nigeriaelection.com."
        noindex
      />
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-african-green opacity-20">404</h1>
          <div className="mt-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Page Not Found
            </h2>
            <p className="text-lg text-gray-600">
              The page you're looking for doesn't exist or has been moved.
            </p>
            {location.pathname && (
              <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-100 px-3 py-1 rounded inline-block">
                {location.pathname}
              </p>
            )}
          </div>
        </div>

        {/* Helpful Message */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <p className="text-gray-700 mb-6">
            Don't worry! Here are some helpful links to get you back on track:
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-5 h-5" />
              Go to Home
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Go Back
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="font-medium text-gray-900">Browse Elections</div>
              <div className="text-sm text-gray-600">View all countries and elections</div>
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <div className="font-medium text-gray-900">Sign In</div>
              <div className="text-sm text-gray-600">Access your account</div>
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            If you believe this is an error, please{' '}
            <a 
              href="mailto:support@election-platform.com" 
              className="text-african-green hover:underline font-medium"
            >
              contact support
            </a>
            {' '}or try searching for what you need.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

