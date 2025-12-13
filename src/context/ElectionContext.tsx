import React, { useState, useEffect, createContext, useContext } from 'react';
import { Country, Election, Candidate, VoteStats } from '../utils/types';
import { countryService } from '../services/countryService';
import { electionService } from '../services/electionService';
import { candidateService } from '../services/candidateService';
import { voteService } from '../services/voteService';

interface ElectionContextType {
  countries: Country[];
  elections: Election[];
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getElectionByCountry: (countryId: string) => Election | undefined;
  getCandidatesByElection: (electionId: string) => Candidate[];
  getVoteStats: (electionId: string) => Promise<VoteStats[]>;
  castVote: (electionId: string, candidateId: string) => Promise<void>;
  hasUserVoted: (electionId: string) => Promise<boolean>;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export function ElectionProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [countriesData, electionsData, candidatesData] = await Promise.all([
        countryService.getAll().catch(err => {
          console.error('Failed to load countries:', err);
          return [];
        }),
        electionService.getAll().catch(err => {
          console.error('Failed to load elections:', err);
          return [];
        }),
        candidateService.getAll().catch(err => {
          console.error('Failed to load candidates:', err);
          return [];
        }),
      ]);

      setCountries(countriesData || []);
      setElections(electionsData || []);
      setCandidates(candidatesData || []);
    } catch (err: any) {
      console.error('Failed to load election data:', err);
      setError(err.message || 'Failed to load data');
      // Set empty arrays as fallback
      setCountries([]);
      setElections([]);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refresh = async () => {
    await loadData();
  };

  const getElectionByCountry = (countryId: string) => {
    return elections.find(e => e.countryId === countryId);
  };

  const getCandidatesByElection = (electionId: string) => {
    return candidates.filter(c => c.electionId === electionId);
  };

  const getVoteStats = async (electionId: string): Promise<VoteStats[]> => {
    try {
      return await electionService.getStats(electionId);
    } catch (err: any) {
      console.error('Failed to get vote stats:', err);
      return [];
    }
  };

  const castVote = async (electionId: string, candidateId: string) => {
    try {
      await voteService.castVote({ electionId, candidateId });
      // Refresh vote stats after voting
      await refresh();
    } catch (err: any) {
      console.error('Failed to cast vote:', err);
      throw err;
    }
  };

  const hasUserVoted = async (electionId: string): Promise<boolean> => {
    try {
      const response = await voteService.checkVote(electionId);
      return response.hasVoted;
    } catch (err: any) {
      console.error('Failed to check vote status:', err);
      return false;
    }
  };

  return (
    <ElectionContext.Provider
      value={{
        countries,
        elections,
        candidates,
        loading,
        error,
        refresh,
        getElectionByCountry,
        getCandidatesByElection,
        getVoteStats,
        castVote,
        hasUserVoted,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
}

export function useElection() {
  const context = useContext(ElectionContext);
  if (!context) throw new Error('useElection must be used within ElectionProvider');
  return context;
}
