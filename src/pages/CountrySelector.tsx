import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeNewsSlider } from '../components/HomeNewsSlider';
import { HomeDiscussion } from '../components/HomeDiscussion';
import { SEO } from '../components/SEO';
import { useElection } from '../context/ElectionContext';
import { settingsService } from '../services/settingsService';
import { Button } from '../components/ui/Button';
import { VoteStats } from '../utils/types';
import {
  MessageCircleIcon,
  GlobeIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
} from 'lucide-react';

export function CountrySelector() {
  const navigate = useNavigate();
  const {
    countries,
    elections,
    loading,
    error,
    getVoteStats,
    getCandidatesByElection,
  } = useElection();
  const [totalVotes, setTotalVotes] = useState(0);
  const [voteStats, setVoteStats] = useState<VoteStats[]>([]);
  const [featuredCountryId, setFeaturedCountryId] = useState<string | null>(null);
  const [featuredElectionId, setFeaturedElectionId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const dbSettings = await settingsService.getAll();
        const id = dbSettings.featured_election_id;
        setFeaturedElectionId(id && id.trim() ? id : null);
      } catch {
        setFeaturedElectionId(null);
      }
    };
    load();
  }, []);

  const featuredElection =
    featuredElectionId && elections.find((e) => e.id === featuredElectionId)
      ? elections.find((e) => e.id === featuredElectionId)
      : elections.filter((e) => e.status === 'upcoming').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || elections[0];
  const featuredCountry = featuredElection ? countries.find((c) => c.id === featuredElection.countryId) : countries[0];
  const pollCandidates = featuredElection ? getCandidatesByElection(featuredElection.id) : [];

  useEffect(() => {
    if (featuredElection) {
      setFeaturedCountryId(featuredCountry?.id ?? null);
      getVoteStats(featuredElection.id)
        .then((stats) => {
          setVoteStats(stats);
          setTotalVotes(stats.reduce((s, x) => s + x.votes, 0));
        })
        .catch(() => {
          setVoteStats([]);
          setTotalVotes(0);
        });
    } else {
      setFeaturedCountryId(countries[0]?.id ?? null);
      setVoteStats([]);
      setTotalVotes(0);
    }
  }, [featuredElection, featuredCountry?.id, countries, getVoteStats]);

  const voteNowUrl = featuredCountryId ? `/election/${featuredCountryId}` : (countries[0] ? `/election/${countries[0].id}` : '#');
  const canVote = !!featuredCountryId || countries.length > 0;

  const daysUntilElection = featuredElection
    ? Math.max(0, Math.ceil((new Date(featuredElection.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 356;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Nigeria Election',
    description: 'Nigeria Presidential Opinion Poll 2027. Vote, track real-time results, follow breaking news, and join the national debate.',
    url: typeof window !== 'undefined' ? window.location.origin : '',
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="inline-block w-14 h-14 rounded-2xl bg-african-green/20 flex items-center justify-center mb-4 animate-pulse">
            <GlobeIcon className="w-7 h-7 text-african-green" />
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
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
        title="Nigeria Presidential Opinion Poll 2027 | Vote Now"
        description="The power to decide Nigeria's future is yours. Vote your preferred candidate, track real-time national momentum, follow breaking political intelligence, and engage in the conversation shaping 2027."
        keywords={[
          'Nigeria election 2027',
          'Nigeria Presidential Opinion Poll',
          'vote Nigeria',
          'Nigeria voting',
          '2027 election Nigeria',
          'democracy Nigeria',
          'political engagement',
        ]}
        url="/"
        structuredData={structuredData}
      />

      <div className="min-h-screen w-full bg-white">
        {/* Hero – exact match to design */}
        <section className="relative overflow-hidden px-4 pt-8 pb-10 sm:pt-10 sm:pb-14 md:pt-12 md:pb-18">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-display font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-tight">
              The Power to Decide Nigeria's Future Is Yours.
            </h1>
            <p className="mt-5 text-lg text-gray-600 max-w-2xl mx-auto sm:text-xl">
              Vote your preferred candidate, track real-time national momentum, follow breaking political intelligence, and engage in the conversation shaping 2027.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-african-green/10 text-african-green px-5 py-2.5 text-sm font-semibold">
              <span className="text-2xl" aria-hidden>🇳🇬</span>
              <span>+ {totalVotes.toLocaleString()} Nigerians have voted today</span>
            </div>
          </div>
        </section>

        {error && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-amber-800 text-sm font-medium">⚠️ {error}. Some features may not work.</p>
            </div>
          </div>
        )}

        {/* News – flex row */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-12" id="news">
          <HomeNewsSlider countryId={featuredElection?.countryId ?? elections[0]?.countryId ?? null} />
        </section>

        {/* Nigeria Election 2027 – fetched candidates in grid (3x2) */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16" aria-labelledby="poll-heading">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Live</span>
            </div>
            <header className="p-6 md:p-8 border-b border-gray-100">
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <span className="text-2xl" aria-hidden>🇳🇬</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                      <TrendingUpIcon className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {featuredElection?.type ?? 'Presidential'}
                    </span>
                  </div>
                  <h2 id="poll-heading" className="text-2xl md:text-3xl font-display font-bold text-gray-900">
                    Nigeria Election 2027
                  </h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  {daysUntilElection} days until election
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                  <UsersIcon className="w-4 h-4 text-gray-500" />
                  {totalVotes.toLocaleString()} votes
                </span>
              </div>
            </header>

            {pollCandidates.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 md:p-8">
                  {pollCandidates.map((candidate) => {
                    const stat = voteStats.find((s) => s.candidateId === candidate.id);
                    const votes = stat?.votes ?? 0;
                    const pct = stat?.percentage ?? 0;
                    return (
                      <div
                        key={candidate.id}
                        className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 hover:shadow-md transition-shadow flex flex-col"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={candidate.image || '/placeholder.png'}
                            alt=""
                            className="w-14 h-14 rounded-full object-cover flex-shrink-0 bg-gray-200"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-display font-bold text-gray-900 truncate">{candidate.name}</p>
                            <p className="text-sm text-gray-700 mt-1">{votes.toLocaleString()} votes</p>
                            <div className="mt-2 flex items-end justify-between gap-2">
                              <div className="flex-1 min-w-0 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, pct)}%`, backgroundColor: candidate.color }}
                                />
                              </div>
                              <span
                                className="font-bold text-lg flex-shrink-0 tabular-nums"
                                style={{ color: candidate.color }}
                              >
                                {pct.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          className="mt-4 w-full"
                          onClick={() => canVote && navigate(voteNowUrl, { state: { highlightCandidateId: candidate.id } })}
                          disabled={!canVote}
                        >
                          Vote
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <p className="mb-4">No candidates in this poll yet. Check back soon or go to the election page.</p>
                <Button
                  variant="primary"
                  size="lg"
                  className="min-h-[48px]"
                  onClick={() => canVote && navigate(voteNowUrl)}
                  disabled={!canVote}
                >
                  View Full Results & Cast Your Vote
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* National Debate – green section with button */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16">
          <div className="rounded-2xl border border-african-green/20 bg-african-green/5 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-african-green/10 flex items-center justify-center text-african-green flex-shrink-0">
                <MessageCircleIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display font-bold text-gray-900 text-xl md:text-2xl mb-1">National Debate Room</h2>
                <p className="text-gray-600">Engage Nigerians across all 36 states. Join the conversation shaping 2027.</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto sm:min-w-[180px] justify-center"
              onClick={() => canVote && navigate(voteNowUrl, { state: { openSection: 'comments' } })}
              disabled={!canVote}
            >
              Join the Debate
            </Button>
          </div>
        </section>

        {/* Discussion */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-16">
          <HomeDiscussion elections={elections} countries={countries} />
        </section>

        {/* Footer – exact copy */}
        <footer className="border-t border-gray-200 py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
            <span className="text-lg" aria-hidden>🇳🇬</span>
            <span>© 2027 Nigeria Election. All rights reserved. Made for the future of Nigeria.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
