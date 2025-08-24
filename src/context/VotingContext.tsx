import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { voteService, UserVote } from '../services/voteService';
import { useAuth } from './AuthContext';

interface VotingContextType {
  userVotes: Set<string>;
  isLoading: boolean;
  error: string | null;
  isItemVoted: (itemId: string) => boolean;
  toggleVote: (itemId: string, currentCount: number) => Promise<number>;
  refreshUserVotes: () => Promise<void>;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export const useVoting = (): VotingContextType => {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

interface VotingProviderProps {
  children: ReactNode;
}

export const VotingProvider: React.FC<VotingProviderProps> = ({ children }) => {
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch user votes when authenticated - ONLY ONCE PER AUTHENTICATION STATE CHANGE
  const refreshUserVotes = useCallback(async () => {
    if (!isAuthenticated) {
      setUserVotes(new Set());
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await voteService.getUserVotes();
      const votedItemIds = response.votes.map(vote => vote.roadmap_item_id);
      setUserVotes(new Set(votedItemIds));
    } catch (err) {
      console.error('Failed to fetch user votes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch votes');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load user votes ONLY when authentication state changes
  useEffect(() => {
    refreshUserVotes();
  }, [refreshUserVotes]);

  const isItemVoted = useCallback((itemId: string): boolean => {
    return userVotes.has(itemId);
  }, [userVotes]);

  const toggleVote = useCallback(async (itemId: string, currentCount: number): Promise<number> => {
    if (!isAuthenticated) {
      throw new Error('Authentication required. Please log in to vote.');
    }

    try {
      setError(null);
      const wasVoted = userVotes.has(itemId);
      
      // Optimistic update
      const newUserVotes = new Set(userVotes);
      if (wasVoted) {
        newUserVotes.delete(itemId);
      } else {
        newUserVotes.add(itemId);
      }
      setUserVotes(newUserVotes);
      
      // Make API call
      const response = await voteService.toggleVote(itemId, wasVoted);
      
      return response.new_count;
    } catch (err) {
      // Revert optimistic update on error
      setUserVotes(new Set(userVotes));
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to update vote';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isAuthenticated, userVotes]);

  const contextValue: VotingContextType = {
    userVotes,
    isLoading,
    error,
    isItemVoted,
    toggleVote,
    refreshUserVotes,
  };

  return (
    <VotingContext.Provider value={contextValue}>
      {children}
    </VotingContext.Provider>
  );
};