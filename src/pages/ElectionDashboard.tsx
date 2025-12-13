import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useElection } from '../context/ElectionContext';
import { useAuth } from '../context/AuthContext';
import { useComments } from '../context/CommentContext';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { CountdownTimer } from '../components/CountdownTimer';
import { CandidateCard } from '../components/CandidateCard';
import { VoteConfirmationModal } from '../components/VoteConfirmationModal';
import { VoteBadge } from '../components/VoteBadge';
import { VoteChart } from '../components/VoteChart';
import { CommentItem } from '../components/CommentItem';
import { CommentForm } from '../components/CommentForm';
import { NewsCard } from '../components/NewsCard';
import { NewsTicker } from '../components/NewsTicker';
import { NewsDetailModal } from '../components/NewsDetailModal';
import { ShareBanner } from '../components/ShareBanner';
import { ShareButton } from '../components/ShareButton';
import { newsService } from '../services/newsService';
import { Candidate, News } from '../utils/types';
import { generateShareText, generateShareUrl } from '../utils/shareHelpers';
import { ArrowLeftIcon, UsersIcon, VoteIcon, MessageSquareIcon, NewspaperIcon, ShareIcon } from 'lucide-react';
import { SEO } from '../components/SEO';

export function ElectionDashboard() {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    countries,
    elections,
    candidates,
    loading: electionLoading,
    getElectionByCountry,
    getCandidatesByElection,
    getVoteStats,
    castVote,
    hasUserVoted,
  } = useElection();
  const {
    comments,
    loading: commentsLoading,
    getComments,
    addComment,
    addReply,
    likeComment,
    reactToComment,
  } = useComments();

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showVoteBadge, setShowVoteBadge] = useState(false);
  const [commentSort, setCommentSort] = useState('recent');
  const [newsFilter, setNewsFilter] = useState('all');
  const [hasVoted, setHasVoted] = useState(false);
  const [voteStats, setVoteStats] = useState<any[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);

  const country = countries.find((c) => c.id === countryId);
  const election = getElectionByCountry(countryId!);
  const electionCandidates = election ? getCandidatesByElection(election.id) : [];

  // Load vote status and stats
  useEffect(() => {
    if (election && user) {
      const loadVoteData = async () => {
        try {
          const [voted, stats] = await Promise.all([
            hasUserVoted(election.id),
            getVoteStats(election.id),
          ]);
          setHasVoted(voted);
          setVoteStats(stats);
        } catch (error) {
          console.error('Failed to load vote data:', error);
        }
      };
      loadVoteData();
    }
  }, [election, user, hasUserVoted, getVoteStats]);

  // Load comments
  useEffect(() => {
    if (election) {
      getComments(election.id).catch(error => {
        console.error('Failed to load comments:', error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [election]);

  // Load news
  useEffect(() => {
    if (election) {
      const loadNews = async () => {
        try {
          setLoadingNews(true);
          const newsData = await newsService.getAll({
            countryId: country?.id,
          });
          setNews(newsData);
        } catch (error) {
          console.error('Failed to load news:', error);
        } finally {
          setLoadingNews(false);
        }
      };
      loadNews();
    }
  }, [election, country]);

  const filteredNews = newsFilter === 'all' ? news : news.filter((n) => n.priority === newsFilter);

  if (electionLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-african-green mb-4"></div>
          <p className="text-gray-600">Loading election data...</p>
        </div>
      </div>
    );
  }

  if (!country || !election) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
            Election Not Found
          </h2>
          <Button onClick={() => navigate('/')}>Back to Countries</Button>
        </div>
      </div>
    );
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: election.description,
    description: `${election.type} election in ${country.name}`,
    startDate: election.date,
    location: {
      '@type': 'Place',
      name: country.name,
    },
    organizer: {
      '@type': 'Organization',
      name: 'African Elections Platform',
    },
  };

  const handleVoteClick = (candidate: Candidate) => {
    if (!user) {
      const currentPath = `/election/${countryId}`;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    setSelectedCandidate(candidate);
    setShowConfirmation(true);
  };

  const handleConfirmVote = async () => {
    if (user && selectedCandidate && election) {
      try {
        await castVote(election.id, selectedCandidate.id);
        setShowConfirmation(false);
        setShowVoteBadge(true);
        setTimeout(() => setShowVoteBadge(false), 3000);
        // Refresh vote data
        const [voted, stats] = await Promise.all([
          hasUserVoted(election.id),
          getVoteStats(election.id),
        ]);
        setHasVoted(voted);
        setVoteStats(stats);
      } catch (error: any) {
        console.error('Failed to cast vote:', error);
        alert(error.message || 'Failed to cast vote');
      }
    }
  };

  const handleAddComment = async (content: string) => {
    if (user && election) {
      try {
        await addComment(election.id, content);
        // Refresh comments after adding
        await getComments(election.id);
      } catch (error: any) {
        console.error('Failed to add comment:', error);
        alert(error.message || 'Failed to add comment');
      }
    }
  };

  const handleReply = async (commentId: string, content: string) => {
    if (user && election) {
      try {
        await addReply(commentId, content);
        // Refresh comments after replying
        await getComments(election.id);
      } catch (error: any) {
        console.error('Failed to add reply:', error);
        alert(error.message || 'Failed to add reply');
      }
    }
  };

  const votedCandidate = hasVoted
    ? electionCandidates.find((c) => {
        const userVote = voteStats.find((s) => s.candidateId === c.id && s.votes > 0);
        return userVote;
      })
    : null;

  const tabs = [
    { id: 'candidates', label: 'Candidates', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'vote', label: 'Vote Now', icon: <VoteIcon className="w-4 h-4" /> },
    { id: 'comments', label: 'Comments', icon: <MessageSquareIcon className="w-4 h-4" /> },
    { id: 'news', label: 'News', icon: <NewspaperIcon className="w-4 h-4" /> },
    { id: 'share', label: 'Share', icon: <ShareIcon className="w-4 h-4" /> },
  ];

  return (
    <>
      <SEO
        title={`${country.name} ${election.type} Election 2025`}
        description={`Vote, discuss, and stay informed about the ${country.name} ${election.type} Election 2025. View candidates, cast your vote, and engage with the community.`}
        keywords={[
          `${country.name} election`,
          `${election.type} election`,
          'African politics',
          'voting',
          'democracy',
          ...electionCandidates.map((c) => c.name),
        ]}
        image={electionCandidates[0]?.image}
        type="article"
        structuredData={structuredData}
      />

      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
        <NewsTicker news={news} />

        <div className="glass border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="mb-4">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Countries
            </Button>

            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">{country.flag}</div>
              <div>
                <h1 className="text-4xl font-display font-bold text-gray-900">
                  {country.name}
                </h1>
                <p className="text-lg text-gray-600">{election.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="mb-8">
            <CountdownTimer targetDate={election.date} />
          </div>

          {showVoteBadge && (
            <div className="mb-8">
              <VoteBadge />
            </div>
          )}

          <Tabs tabs={tabs} defaultTab="candidates">
            {(activeTab) => (
              <>
                {activeTab === 'candidates' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-display font-bold text-gray-900">
                      Meet the Candidates
                    </h2>
                    {electionCandidates.length === 0 ? (
                      <p className="text-gray-600">No candidates available yet.</p>
                    ) : (
                      electionCandidates.map((candidate, index) => (
                        <div
                          key={candidate.id}
                          className="animate-slide-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CandidateCard
                            candidate={candidate}
                            onVote={() => handleVoteClick(candidate)}
                            hasVoted={hasVoted}
                            isVotedFor={votedCandidate?.id === candidate.id}
                          />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'vote' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-display font-bold text-gray-900">
                      Cast Your Vote
                    </h2>
                    {hasVoted ? (
                      <>
                        <VoteBadge />
                        <VoteChart stats={voteStats} />
                      </>
                    ) : (
                      <div className="space-y-6">
                        {electionCandidates.length === 0 ? (
                          <p className="text-gray-600">No candidates available yet.</p>
                        ) : (
                          electionCandidates.map((candidate, index) => (
                            <div
                              key={candidate.id}
                              className="animate-slide-up"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <CandidateCard
                                candidate={candidate}
                                onVote={() => handleVoteClick(candidate)}
                                hasVoted={hasVoted}
                                isVotedFor={false}
                              />
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-display font-bold text-gray-900">
                        Community Discussion
                      </h2>
                      <Select
                        value={commentSort}
                        onChange={(e) => setCommentSort(e.target.value)}
                        options={[
                          { value: 'recent', label: 'Most Recent' },
                          { value: 'top', label: 'Top Comments' },
                        ]}
                        className="w-48"
                      />
                    </div>

                    {user ? (
                      <CommentForm onSubmit={handleAddComment} />
                    ) : (
                      <p className="text-gray-600">Please log in to comment.</p>
                    )}

                    {commentsLoading ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Loading comments...</p>
                      </div>
                    ) : comments.length === 0 ? (
                      <p className="text-gray-600">No comments yet. Be the first to comment!</p>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <CommentItem
                            key={comment.id}
                            comment={comment}
                            onLike={async (commentId) => {
                              try {
                                await likeComment(commentId);
                                if (election) {
                                  await getComments(election.id);
                                }
                              } catch (error: any) {
                                console.error('Failed to like comment:', error);
                              }
                            }}
                            onReact={async (commentId, emoji) => {
                              try {
                                await reactToComment(commentId, emoji);
                                if (election) {
                                  await getComments(election.id);
                                }
                              } catch (error: any) {
                                console.error('Failed to react to comment:', error);
                              }
                            }}
                            onReply={handleReply}
                            userId={user?.id || ''}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'news' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-display font-bold text-gray-900">
                        Election News
                      </h2>
                      <Select
                        value={newsFilter}
                        onChange={(e) => setNewsFilter(e.target.value)}
                        options={[
                          { value: 'all', label: 'All News' },
                          { value: 'breaking', label: 'Breaking' },
                          { value: 'important', label: 'Important' },
                          { value: 'general', label: 'General' },
                        ]}
                        className="w-48"
                      />
                    </div>

                    {loadingNews ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">Loading news...</p>
                      </div>
                    ) : filteredNews.length === 0 ? (
                      <p className="text-gray-600">No news available yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredNews.map((newsItem, index) => (
                          <NewsCard
                            key={newsItem.id}
                            news={newsItem}
                            index={index}
                            onClick={() => {
                              setSelectedNews(newsItem);
                              setIsNewsModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'share' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-display font-bold text-gray-900">
                      Share Your Voice
                    </h2>

                    {hasVoted && votedCandidate ? (
                      <>
                        <ShareBanner candidate={votedCandidate} country={country} />

                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Share on Social Media
                          </h3>
                          <ShareButton
                            text={generateShareText(votedCandidate, country)}
                            url={generateShareUrl(countryId!)}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="glass p-12 rounded-2xl text-center">
                        <ShareIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                          Vote First to Share
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Cast your vote to generate a personalized share banner
                        </p>
                        <Button onClick={() => navigate(`/election/${countryId}`)}>
                          Go to Vote
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Tabs>
        </div>

        <VoteConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmVote}
          candidate={selectedCandidate}
        />

        <NewsDetailModal
          isOpen={isNewsModalOpen}
          onClose={() => {
            setIsNewsModalOpen(false);
            setSelectedNews(null);
          }}
          news={selectedNews}
        />
      </div>
    </>
  );
}
