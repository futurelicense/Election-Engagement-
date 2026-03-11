import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Country, Election, Candidate, VoteStats, Vote } from '../utils/types';
import { countryService } from '../services/countryService';
import { electionService } from '../services/electionService';
import { candidateService } from '../services/candidateService';
import { voteService } from '../services/voteService';
import { useAuth } from './AuthContext';
import { getOrCreateGuestId } from '../utils/guestId';

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
  getVoteStatus: (electionId: string) => Promise<{ hasVoted: boolean; vote: Vote | null }>;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export function ElectionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Phase 1: Load countries + elections only so the home page can show quickly
      let loadError: string | null = null;
      const [countriesData, electionsData] = await Promise.all([
        countryService.getAll().catch((err) => {
          const msg = err?.message || 'Failed to load countries';
          loadError = loadError || msg;
          return [];
        }),
        electionService.getAll().catch((err) => {
          const msg = err?.message || 'Failed to load elections';
          loadError = loadError || msg;
          return [];
        }),
      ]);

      const countriesList = Array.isArray(countriesData) ? countriesData : [];
      const electionsList = Array.isArray(electionsData) ? electionsData : [];
      setCountries(countriesList);
      setElections(electionsList);
      if (loadError && countriesList.length === 0) {
        setError(loadError);
      }
      setLoading(false);

      // Phase 2: Load candidates in background (banner and election pages will use when ready)
      candidateService
        .getAll()
        .then((candidatesData) => setCandidates(candidatesData || []))
        .catch((err) => {
          console.error('Failed to load candidates:', err);
        });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      console.error('Failed to load election data:', err);
      setError(message);
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
      if (user) {
        await voteService.castVote({ electionId, candidateId });
      } else {
        const guestId = getOrCreateGuestId();
        if (!guestId) throw new Error('Unable to store vote. Please try again.');
        await voteService.castVoteAsGuest(guestId, { electionId, candidateId });
      }
      await refresh();
    } catch (err: any) {
      console.error('Failed to cast vote:', err);
      throw err;
    }
  };

  const hasUserVoted = async (electionId: string): Promise<boolean> => {
    try {
      const res = await getVoteStatus(electionId);
      return res.hasVoted;
    } catch {
      return false;
    }
  };

  const getVoteStatus = useCallback(async (electionId: string): Promise<{ hasVoted: boolean; vote: Vote | null }> => {
    try {
      if (user) {
        const response = await voteService.checkVote(electionId);
        return { hasVoted: response.hasVoted, vote: response.vote };
      }
      const guestId = getOrCreateGuestId();
      if (!guestId) return { hasVoted: false, vote: null };
      const response = await voteService.checkGuestVote(guestId, electionId);
      return { hasVoted: response.hasVoted, vote: response.vote };
    } catch (err: any) {
      console.error('Failed to check vote status:', err);
      return { hasVoted: false, vote: null };
    }
  }, [user]);

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
        getVoteStatus,
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
