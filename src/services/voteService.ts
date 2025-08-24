
const BASE_URL = import.meta.env.VITE_BACKEND_BASE_PATH || 'http://localhost:5000';

export interface VoteResponse {
  success: boolean;
  message: string;
  new_count: number;
  item_id: string;
}

export interface UserVote {
  roadmap_item_id: string;
  voted_at: string;
  item_title: string;
  item_description: string;
  item_category: string;
  item_status: string;
  current_vote_count: number;
}

export interface UserVotesResponse {
  success: boolean;
  votes: UserVote[];
  total_votes: number;
}

class VoteService {
  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const enhancedOptions: RequestInit = {
      ...options,
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, enhancedOptions);

    // Handle authentication errors
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in.');
    }

    return response;
  }

  async castVote(itemId: string): Promise<VoteResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${BASE_URL}/api/v1/roadmap/${itemId}/vote`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          throw new Error('You have already voted for this item');
        }
        if (response.status === 404) {
          throw new Error('Roadmap item not found');
        }
        throw new Error(errorData.message || 'Failed to cast vote');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async removeVote(itemId: string): Promise<VoteResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${BASE_URL}/api/v1/roadmap/${itemId}/vote`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('You have not voted for this item');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove vote');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getUserVotes(): Promise<UserVotesResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${BASE_URL}/api/v1/roadmap/my-votes`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user votes');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async toggleVote(itemId: string, currentlyVoted: boolean): Promise<VoteResponse> {
    if (currentlyVoted) {
      return await this.removeVote(itemId);
    } else {
      return await this.castVote(itemId);
    }
  }
}

export const voteService = new VoteService();