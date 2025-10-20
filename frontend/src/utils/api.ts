const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Organization {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  longDescription?: string;
  image: string;
  verified: boolean;
  featured: boolean;
  raised: number;
  goal: number;
  donors: number;
  founded?: string;
  wallet_address: string;
  impact?: Array<{ id: number; metric: string; order: number }>;
  updates?: Array<{
    id: number;
    title: string;
    content: string;
    date: string;
    created_at: string;
  }>;
}

export interface Donation {
  id: number;
  organization: number;
  organization_name: string;
  donor_name: string;
  donor_email: string;
  donor_wallet: string;
  amount: string;
  amount_usd?: string;
  transaction_hash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  created_at: string;
  completed_at?: string;
}

export interface DonationStats {
  total_amount_sbc: number;
  total_amount_usd: number;
  total_donations: number;
  unique_donors: number;
  organizations_count: number;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async getOrganizations(params?: {
    category?: string;
    featured?: boolean;
    verified?: boolean;
    search?: string;
  }): Promise<{ results: Organization[]; count: number }> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured !== undefined) queryParams.append('featured', String(params.featured));
    if (params?.verified !== undefined) queryParams.append('verified', String(params.verified));
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request(`/organizations/${query ? `?${query}` : ''}`);
  }

  async getOrganization(id: string): Promise<Organization> {
    return this.request(`/organizations/${id}/`);
  }

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    return this.request('/organizations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    return this.request(`/organizations/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Donations
  async getDonations(params?: {
    organization?: string;
    donor_wallet?: string;
    status?: string;
  }): Promise<{ results: Donation[]; count: number }> {
    const queryParams = new URLSearchParams();
    if (params?.organization) queryParams.append('organization', params.organization);
    if (params?.donor_wallet) queryParams.append('donor_wallet', params.donor_wallet);
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    return this.request(`/donations/${query ? `?${query}` : ''}`);
  }

  async getDonation(id: number): Promise<Donation> {
    return this.request(`/donations/${id}/`);
  }

  async createDonation(data: {
    organization: number;
    donor_wallet: string;
    amount: string;
    donor_name?: string;
    donor_email?: string;
    amount_usd?: string;
    message?: string;
  }): Promise<Donation> {
    return this.request('/donations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeDonation(donationId: number, transactionHash: string): Promise<Donation> {
    return this.request('/donations/complete/', {
      method: 'POST',
      body: JSON.stringify({
        donation_id: donationId,
        transaction_hash: transactionHash,
      }),
    });
  }

  async validateWallet(address: string): Promise<{ valid: boolean; formatted: string | null }> {
    return this.request('/validate/wallet/', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  }

  async validateTransaction(transactionHash: string): Promise<{ valid: boolean; formatted: string | null }> {
    return this.request('/validate/transaction/', {
      method: 'POST',
      body: JSON.stringify({ transaction_hash: transactionHash }),
    });
  }

  async getStats(): Promise<DonationStats> {
    return this.request('/stats/');
  }

  async healthCheck(): Promise<{ status: string; database_connected: boolean; version: string }> {
    return this.request('/health/');
  }
}

export const apiClient = new APIClient();
