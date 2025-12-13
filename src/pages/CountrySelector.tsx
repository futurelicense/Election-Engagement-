import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CountryCard } from '../components/CountryCard';
import { FeaturedElectionBanner } from '../components/FeaturedElectionBanner';
import { SEO } from '../components/SEO';
import { useElection } from '../context/ElectionContext';
import { GlobeIcon } from 'lucide-react';

export function CountrySelector() {
  const navigate = useNavigate();
  const { countries, loading, error, getElectionByCountry } = useElection();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'African Elections',
    description: 'Engage with democracy across Africa. Vote, comment, and stay informed about upcoming elections.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-african-green mb-4"></div>
          <p className="text-gray-600">Loading elections...</p>
        </div>
      </div>
    );
  }

  // Show error state but still render the page
  if (error) {
    console.warn('Election data error:', error);
  }

  return (
    <>
      <SEO
        title="Home"
        description="Engage with democracy across Africa. Vote, comment, and stay informed about upcoming elections in Nigeria, Kenya, South Africa, Ghana, and more."
        keywords={['African elections', 'democracy', 'voting', 'political engagement', 'Africa politics']}
        structuredData={structuredData}
      />

      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-3 mb-4">
              <GlobeIcon className="w-12 h-12 text-african-green" />
              <h1 className="text-5xl font-display font-bold text-gray-900">
                African Elections
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Engage with democracy across Africa. Vote, comment, and stay
              informed about upcoming elections.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ {error}. Some features may not work. Please check your connection.
              </p>
            </div>
          )}

          <FeaturedElectionBanner />

          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900">
              All Elections
            </h2>
            <p className="text-gray-600">
              Browse all upcoming elections across Africa
            </p>
          </div>

          {countries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                No countries available. {error ? 'Please check your connection and try again.' : 'Please wait while data loads...'}
              </p>
              {error && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-african-green text-white rounded-lg hover:bg-emerald-600"
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {countries.map((country) => {
                const election = getElectionByCountry(country.id);
                return (
                  <CountryCard
                    key={country.id}
                    country={country}
                    election={election}
                    onClick={() => navigate(`/election/${country.id}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
