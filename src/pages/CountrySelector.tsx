import React from 'react';
import { FeaturedElectionBanner } from '../components/FeaturedElectionBanner';
import { LiveNewsAndDiscussion } from '../components/LiveNewsAndDiscussion';
import { SEO } from '../components/SEO';
import { useElection } from '../context/ElectionContext';
import {
  VoteIcon,
  NewspaperIcon,
  MessageCircleIcon,
  SparklesIcon,
  ChevronRightIcon,
  GlobeIcon,
} from 'lucide-react';

const VALUE_ITEMS = [
  { icon: VoteIcon, label: 'Cast your vote', color: 'text-emerald-600' },
  { icon: NewspaperIcon, label: 'Live news', color: 'text-blue-600' },
  { icon: MessageCircleIcon, label: 'Join the chat', color: 'text-amber-600' },
  { icon: SparklesIcon, label: 'Join the nation', color: 'text-african-green' },
];

export function CountrySelector() {
  const { countries, elections, loading, error } = useElection();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nigeria Election',
    description: 'Engage with democracy in Nigeria. Vote, comment, and stay informed about upcoming elections.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-white via-emerald-50/30 to-gray-50 px-4">
        <div className="text-center">
          <div className="inline-block w-14 h-14 rounded-2xl bg-african-green/20 flex items-center justify-center mb-4 animate-pulse">
            <GlobeIcon className="w-7 h-7 text-african-green" />
          </div>
          <p className="text-gray-600 font-medium">Loading elections...</p>
          <p className="text-sm text-gray-500 mt-1">One moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('Election data error:', error);
  }

  return (
    <>
      <SEO
        title="Home"
        description="Nigeria election platform: cast your vote, follow live news, and join the conversation. Track elections across Nigeria and Africa. Vote, discuss, engage."
        keywords={[
          'Nigeria election',
          'Nigeria voting',
          'African elections',
          'election news Nigeria',
          'vote Nigeria',
          'democracy Nigeria',
          'political engagement',
          'Nigeria politics 2027',
        ]}
        url="/"
        structuredData={structuredData}
      />

      <div className="min-h-screen w-full bg-gradient-to-b from-white via-emerald-50/30 to-gray-50">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-6 pb-10 sm:pt-8 sm:pb-12 md:pt-10 md:pb-16">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#065f46_0%,transparent_50%),linear-gradient(225deg,#10B981_0%,transparent_40%)] opacity-[0.06]" />
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-african-green/10 text-african-green px-4 py-2 text-sm font-medium mb-4 sm:mb-6 animate-fade-in">
              <SparklesIcon className="w-4 h-4" />
              <span>Your voice matters</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-tight">
              Who decides for Nigeria?
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto sm:text-xl sm:mt-5">
              Pick an election below, cast your vote, follow live news, and join the conversation with the nation.
            </p>

            {/* Value strip - responsive */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-8">
              {VALUE_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    <span className={item.color}>
                      <Icon className="w-5 h-5 shrink-0" />
                    </span>
                    <span className="text-sm font-medium sm:text-base">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Error banner */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-4">
              <p className="text-amber-800 text-sm font-medium">
                ⚠️ {error}. Some features may not work. Check your connection.
              </p>
            </div>
          </div>
        )}

        {/* Featured election */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <FeaturedElectionBanner />
        </section>

        {/* News & discussion */}
        <LiveNewsAndDiscussion elections={elections} countries={countries} />
      </div>
    </>
  );
}
