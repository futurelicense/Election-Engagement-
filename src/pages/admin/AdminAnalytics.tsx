import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { useElection } from '../../context/ElectionContext';
import { voteService } from '../../services/voteService';
import { electionService } from '../../services/electionService';
import { apiClient } from '../../services/apiClient';
import { BarChart3Icon, DownloadIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface VoteLog {
  id: string;
  userId: string;
  electionId: string;
  candidateId: string;
  timestamp: string;
}

export function AdminAnalytics() {
  const { elections, candidates } = useElection();
  const [votes, setVotes] = useState<VoteLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteStats, setVoteStats] = useState<Record<string, any[]>>({});

  useEffect(() => {
    loadVotingData();
    // Refresh every 30 seconds
    const interval = setInterval(loadVotingData, 30000);
    return () => clearInterval(interval);
  }, [elections]);

  const loadVotingData = async () => {
    try {
      setLoading(true);
      
      // Load vote stats for each election
      const statsPromises = elections.map(async (election) => {
        try {
          const stats = await electionService.getStats(election.id);
          return { electionId: election.id, stats };
        } catch (error) {
          console.error(`Failed to load stats for election ${election.id}:`, error);
          return { electionId: election.id, stats: [] };
        }
      });
      
      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, any[]> = {};
      statsResults.forEach(({ electionId, stats }) => {
        statsMap[electionId] = stats;
      });
      setVoteStats(statsMap);

      // Load all votes for admin
      try {
        const allVotesData = await apiClient.get<VoteLog[]>('/votes/admin/all');
        setVotes(allVotesData);
      } catch (error) {
        console.error('Failed to load vote logs:', error);
        setVotes([]);
      }
    } catch (error) {
      console.error('Failed to load voting data:', error);
    } finally {
      setLoading(false);
    }
  };
  const votesByElection = elections.map(election => {
    const electionCandidates = candidates.filter(c => c.electionId === election.id);
    const stats = voteStats[election.id] || [];
    const totalVotes = stats.reduce((sum, stat) => sum + (stat.votes || 0), 0);
    
    return {
      election,
      totalVotes,
      candidates: electionCandidates.map(candidate => {
        const candidateStat = stats.find((s: any) => s.candidateId === candidate.id);
        const votes = candidateStat?.votes || 0;
        const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0.0';
        return {
          name: candidate.name,
          votes,
          percentage,
          color: candidate.color
        };
      })
    };
  });
  const voteLogColumns = [{
    key: 'timestamp',
    header: 'Time',
    width: '180px',
    render: (vote: any) => new Date(vote.timestamp).toLocaleString()
  }, {
    key: 'userId',
    header: 'User ID',
    width: '150px'
  }, {
    key: 'candidate',
    header: 'Candidate',
    render: (vote: any) => {
      const candidate = candidates.find(c => c.id === vote.candidateId);
      return candidate?.name || '-';
    }
  }, {
    key: 'election',
    header: 'Election',
    render: (vote: any) => {
      const election = elections.find(e => e.id === vote.electionId);
      return election ? <Badge variant="info">{election.description}</Badge> : '-';
    }
  }];
  return <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Voting Analytics
            </h1>
            <p className="text-gray-600">Monitor voting patterns and trends</p>
          </div>
          <Button variant="secondary">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading voting analytics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {votesByElection.map(({
            election,
            totalVotes,
            candidates: candidateStats
          }) => <Card key={election.id} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3Icon className="w-6 h-6 text-african-blue" />
                  <div>
                    <h3 className="text-xl font-display font-bold text-gray-900">
                      {election.description}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Total Votes: {totalVotes}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {candidateStats.map(stat => <div key={stat.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">
                          {stat.name}
                        </span>
                        <span className="text-gray-600">
                          {stat.votes} votes ({stat.percentage}%)
                        </span>
                      </div>
                      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-500" style={{
                  width: `${stat.percentage}%`,
                  backgroundColor: stat.color
                }} />
                      </div>
                    </div>)}
                </div>
              </Card>)}
          </div>
        )}

        {votes.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-display font-bold text-gray-900 mb-4">
              Voting Logs
            </h3>
            <Table data={votes} columns={voteLogColumns} />
          </Card>
        )}
      </div>
    </AdminLayout>;
}