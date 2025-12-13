import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useElection } from '../context/ElectionContext';
import { settingsService } from '../services/settingsService';
import { TrendingUpIcon, UsersIcon, CalendarIcon } from 'lucide-react';

export function FeaturedElectionBanner() {
  const navigate = useNavigate();
  const { elections, countries, getCandidatesByElection, getVoteStats } = useElection();
  const [pulseKey, setPulseKey] = useState(0);
  const [voteStats, setVoteStats] = useState<any[]>([]);
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [featuredElectionId, setFeaturedElectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const dbSettings = await settingsService.getAll();
        
        // Check if banner is enabled
        const enabled = dbSettings.banner_enabled !== 'false';
        setBannerEnabled(enabled);
        
        // Get featured election ID
        const featuredId = dbSettings.featured_election_id;
        setFeaturedElectionId(featuredId || null);
      } catch (error) {
        console.error('Failed to load featured election settings:', error);
        // Default to enabled if error
        setBannerEnabled(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Get admin-selected featured election or default to nearest upcoming
  let featuredElection;
  
  if (featuredElectionId && featuredElectionId.trim()) {
    // Use admin-selected election
    featuredElection = elections.find((e) => e.id === featuredElectionId);
  }
  
  // If no featured election found or 'auto', use nearest upcoming
  if (!featuredElection) {
    featuredElection = elections
      .filter((e) => e.status === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }

  const country = featuredElection ? countries.find((c) => c.id === featuredElection.countryId) : null;
  const candidates = featuredElection ? getCandidatesByElection(featuredElection.id) : [];

  // Load vote stats
  useEffect(() => {
    if (featuredElection) {
      getVoteStats(featuredElection.id)
        .then(setVoteStats)
        .catch((err) => {
          console.error('Failed to load vote stats:', err);
          setVoteStats([]);
        });
    }
  }, [featuredElection, getVoteStats]);

  // Simulate live updates with pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey((prev) => prev + 1);
      // Refresh vote stats
      if (featuredElection) {
        getVoteStats(featuredElection.id)
          .then(setVoteStats)
          .catch(() => {
            // Silently fail
          });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [featuredElection, getVoteStats]);

  // Don't show banner if loading, disabled, or no election found
  if (loading || !bannerEnabled || !featuredElection || !country) return null;

  const totalVotes = voteStats.reduce((sum, stat) => sum + stat.votes, 0);
  const daysUntil = Math.ceil(
    (new Date(featuredElection.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="relative overflow-hidden p-0 mb-12 animate-slide-up">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-african-green/10 via-african-blue/10 to-african-yellow/10 animate-pulse" />

      {/* Live indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 glass px-3 py-2 rounded-full">
        <div className="w-2 h-2 rounded-full bg-african-red animate-pulse" />
        <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">
          Live Results
        </span>
      </div>

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{country.flag}</div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="danger" className="animate-pulse">
                  <TrendingUpIcon className="w-3 h-3 mr-1" />
                  FEATURED
                </Badge>
                <Badge variant="info">{featuredElection.type}</Badge>
              </div>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-1">
                {country.name} Election 2025
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{daysUntil} days until election</span>
                </div>
                <div className="flex items-center gap-1">
                  <UsersIcon className="w-4 h-4" />
                  <span className="font-semibold" key={pulseKey}>
                    {totalVotes.toLocaleString()} votes cast
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Grid */}
        {candidates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {candidates.slice(0, 3).map((candidate, index) => {
              const stats = voteStats.find((s) => s.candidateId === candidate.id);
              const votes = stats?.votes || 0;
              const percentage = stats?.percentage || 0;
              return (
                <div
                  key={candidate.id}
                  className="relative animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="glass rounded-2xl p-4 hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={candidate.image || '/placeholder.png'}
                        alt={candidate.name}
                        className="w-16 h-16 rounded-xl object-cover shadow-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-gray-900 truncate">
                          {candidate.name}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">{candidate.party}</p>
                      </div>
                    </div>

                    {/* Vote bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-900">
                          {votes.toLocaleString()} votes
                        </span>
                        <span className="font-bold text-lg" style={{ color: candidate.color }}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: candidate.color,
                          }}
                          key={pulseKey}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/election/${country.id}`)}
            className="shadow-xl"
          >
            View Full Results & Cast Your Vote
          </Button>
        </div>
      </div>
    </Card>
  );
}
