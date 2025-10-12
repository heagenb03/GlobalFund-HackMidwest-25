/**
 * Custom hooks for donation flow
 */

import { useState } from 'react';
import { apiClient } from './api';

export interface DonationData {
  organizationId: number;
  amount: string;
  donorWallet: string;
  donorName?: string;
  donorEmail?: string;
  message?: string;
}

export function useDonation() {
  const [donationId, setDonationId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDonation = async (data: DonationData) => {
    setIsCreating(true);
    setError(null);

    try {
      const donation = await apiClient.createDonation({
        organization: data.organizationId,
        donor_wallet: data.donorWallet,
        amount: data.amount,
        donor_name: data.donorName,
        donor_email: data.donorEmail,
        message: data.message,
      });

      setDonationId(donation.id);
      return donation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create donation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const completeDonation = async (transactionHash: string) => {
    if (!donationId) {
      throw new Error('No donation to complete');
    }

    setIsCompleting(true);
    setError(null);

    try {
      const donation = await apiClient.completeDonation(donationId, transactionHash);
      return donation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete donation';
      setError(errorMessage);
      throw err;
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    donationId,
    isCreating,
    isCompleting,
    error,
    createDonation,
    completeDonation,
  };
}
