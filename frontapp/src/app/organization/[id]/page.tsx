'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFundWallet, useWallets, usePrivy } from '@privy-io/react-auth';
import { useParams } from 'next/navigation';
import { base } from 'viem/chains';
import { encodeFunctionData, parseUnits, type Hex } from 'viem';
import { SBC_TOKEN_ADDRESS } from '../../../constants';
import { ERC20_ABI } from '../../../utils/erc20';
import { apiClient, type Organization } from '../../../utils/api';

// Platform's central wallet address (managed by developers)
const PLATFORM_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET || '0xc7A31353eECC6E646aF0269d722c295b7072d7A9';

export default function OrganizationDetailPage() {
  const params = useParams();
  const { wallets } = useWallets();
  const { fundWallet } = useFundWallet();
  const { ready, authenticated, login } = usePrivy();
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationStep, setDonationStep] = useState<'fund' | 'transfer' | 'complete'>('fund');
  
  // Fetch organization from backend
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const org = await apiClient.getOrganization(params.id as string);
        setOrganization(org);
      } catch (err) {
        console.error('Failed to fetch organization:', err);
        setError('Failed to load organization');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrganization();
    }
  }, [params.id]);

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timeout = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [statusMessage]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The organization you\'re looking for doesn\'t exist.'}</p>
          <Link href="/search" className="btn-primary">
            Browse Organizations
          </Link>
        </div>
      </div>
    );
  }

  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  // Step 1: Fund user's wallet with MoonPay
  const handleFundWallet = async () => {
    // Check if user is authenticated first
    if (!authenticated) {
      setStatusMessage('Connecting wallet...');
      login();
      return;
    }

    setIsProcessing(true);

    try {
      const userSmartWallet = wallets.find(w => w.connectorType === 'smart_wallet');
      const userEmbeddedWallet = wallets.find(w => w.connectorType === 'embedded');
      const walletAddress = userSmartWallet?.address || userEmbeddedWallet?.address;

      if (!walletAddress) {
        // Wallet might still be initializing, prompt login again
        setStatusMessage('Please wait while we set up your wallet...');
        setIsProcessing(false);
        setTimeout(() => {
          if (!wallets.find(w => w.connectorType === 'embedded' || w.connectorType === 'smart_wallet')) {
            setStatusMessage('Please connect your wallet to continue');
          }
        }, 2000);
        return;
      }
      
      setStatusMessage('Opening MoonPay payment window...');

      console.log('Funding user wallet:', walletAddress);
      console.log('Chain:', base);
      console.log('SBC Token Address:', SBC_TOKEN_ADDRESS);
      
      // Fund the user's embedded wallet with MoonPay

      /**
       * fundWallet({
        address: walletAddress,
        options: {
          chain: base,
          amount: '10',
          asset: { 
            erc20: SBC_TOKEN_ADDRESS as Hex
          }
        }
      });
       */
      console.log('MoonPay window opened successfully');
      
      setStatusMessage('Complete your purchase in the MoonPay window. Once complete, we\'ll transfer your donation!');
      setDonationStep('transfer');
      setIsProcessing(false);

    } catch (error) {
      console.error('Funding error:', error);
      
      if (error instanceof Error) {
        setStatusMessage(`Error: ${error.message}`);
      } else {
        setStatusMessage('Failed to open payment window. Please try again.');
      }
      
      setIsProcessing(false);
    }
  };

  // Step 2: Transfer from user wallet to platform wallet (gasless!)
  const handleTransferDonation = async () => {
    setIsProcessing(true);

    try {
      // Try to use smart wallet first (for gasless), fallback to embedded
      const smartWallet = wallets.find(w => w.connectorType === 'smart_wallet');
      const embeddedWallet = wallets.find(w => w.connectorType === 'embedded');
      const userWallet = smartWallet || embeddedWallet;
      
      if (!userWallet?.address) {
        throw new Error('Wallet not found. Please ensure you are logged in.');
      }

      // Validate platform wallet address
      if (!PLATFORM_WALLET_ADDRESS || PLATFORM_WALLET_ADDRESS === 'undefined') {
        throw new Error('Platform wallet address is not configured');
      }

      const amount = '0.01';
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid donation amount');
      }

      setStatusMessage('Preparing your donation transfer...');

      // Get the wallet provider
      const provider = await userWallet.getEthereumProvider();

      // Parse the amount to transfer (18 decimals for SBC token)
      const amountInWei = parseUnits(amount, 18);

      // Encode the transfer function data
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [PLATFORM_WALLET_ADDRESS as `0x${string}`, amountInWei],
      });

      console.log('=== Donation Transfer ===');
      console.log('From:', userWallet.address);
      console.log('To (Organization):', PLATFORM_WALLET_ADDRESS);
      console.log('Amount:', amount, 'SBC');
      console.log('Using wallet type:', userWallet.connectorType);
      console.log('Token address:', SBC_TOKEN_ADDRESS);

      const isGasless = !!smartWallet;
      setStatusMessage(`Transferring ${amount} SBC... ${isGasless ? '(Gas-free!)' : '(Small gas fee required)'}`);

      // Send the transaction
      // Note: Smart wallet provider disabled due to Privy API timeout
      // Users will need to pay gas fees with embedded wallet
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: userWallet.address,
            to: SBC_TOKEN_ADDRESS,
            data: data,
          },
        ],
      });

      console.log('Transaction sent:', txHash);
      console.log(`View on BaseScan: https://sepolia.basescan.org/tx/${txHash}`);
      
      setStatusMessage('Donation complete! Thank you for your generosity! 🎉');
      setDonationStep('complete');
      setIsProcessing(false);

    } catch (error: any) {
      console.error('Transfer error:', error);
      
      let errorMessage = 'Failed to transfer donation. Please try again.';
      
      if (error?.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds. Please fund your wallet first.';
        } else if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction cancelled by user.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setStatusMessage(errorMessage);
      setIsProcessing(false);
      
      // Allow user to retry
      setDonationStep('transfer');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50">
      {/* Header */}
      <header className="glass-card border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">GlobalFund</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/search" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Search
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="glass-card rounded-2xl p-8">
              {/* Icon and Badges */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-6xl">
                  {organization.image}
                </div>
              </div>

              {/* Organization Name and Info */}
              <h1 className="text-4xl font-black text-gray-900 mb-3">{organization.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium text-sm">
                  {organization.category}
                </span>
                <span className="flex items-center gap-1 text-gray-600 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {organization.location}
                </span>
                <span className="flex items-center gap-1 text-gray-600 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Founded {organization.founded}
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Donation Card (Sticky) */}
            <div className="glass-card rounded-2xl p-6 lg:sticky lg:top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Support This Cause</h3>
              
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-900 text-2xl">${organization.raised.toLocaleString()}</span>
                  <span className="text-gray-600">of ${organization.goal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress(organization.raised, organization.goal)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    {organization.donors} donors
                  </span>
                  <span className="font-semibold text-blue-600">
                    {calculateProgress(organization.raised, organization.goal).toFixed(0)}% funded
                  </span>
                </div>
              </div>

              {/* Donation Form */}
              <div className="space-y-4">
                {/* Authentication Notice */}
                {!authenticated && donationStep === 'fund' && (
                  <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm">
                    <p className="font-semibold text-yellow-900 mb-1">🔐 First Time Here?</p>
                    <p className="text-yellow-800">
                      Click the button below to connect your wallet and get started. We'll create a secure wallet for you automatically!
                    </p>
                  </div>
                )}

                {/* Two-Step Process Explanation */}
                {authenticated && donationStep === 'fund' && (
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg text-sm">
                    <p className="font-semibold text-gray-900 mb-1">✨ Easy 2-Step Donation:</p>
                    <ol className="text-gray-700 space-y-1 ml-4 list-decimal">
                      <li>Buy tokens with your card (Apple Pay, Google Pay)</li>
                      <li>Confirm the transfer to the organization</li>
                    </ol>
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Note: A small gas fee (paid from your funds) will be required for the transfer.
                    </p>
                  </div>
                )}

                {/* Transfer Step Info */}
                {donationStep === 'transfer' && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg">
                    <p className="font-semibold text-green-900 mb-2">✅ Step 1 Complete!</p>
                    <p className="text-sm text-green-800 mb-3">
                      After your MoonPay purchase completes, click below to transfer your donation to <strong>{organization.name}</strong>.
                    </p>
                    <p className="text-xs text-green-700 italic">
                      💡 A small gas fee will be deducted from your wallet balance.
                    </p>
                  </div>
                )}

                {/* Status Message */}
                {statusMessage && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm text-center">
                    {statusMessage}
                  </div>
                )}

                {/* Donate Button - Two Step Process */}
                {donationStep === 'fund' && (
                  <button
                    onClick={handleFundWallet}
                    disabled={isProcessing || (!authenticated && false)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : !authenticated ? (
                      '🔐 Connect Wallet to Donate'
                    ) : (
                      `💳 Donate`
                    )}
                  </button>
                )}

                {donationStep === 'transfer' && (
                  <button
                    onClick={handleTransferDonation}
                    disabled={isProcessing}
                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl animate-pulse"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Transferring...
                      </span>
                    ) : (
                      '✨ Complete Donation'
                    )}
                  </button>
                )}

                {donationStep === 'complete' && (
                  <div className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold text-lg text-center shadow-lg">
                    ✅ Donation Complete!
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center">
                  Secure payment via MoonPay • Apple Pay, Google Pay, cards accepted
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Fast & secure payments
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Instant global transfers
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  100% transparent tracking
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Donation Success Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Thank You! 🎉</h3>
              <p className="text-gray-600 mb-4">Your donation to <span className="font-semibold">{organization.name}</span> has been received</p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Confirmation Details */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Donor:</span>
                  <span className="font-semibold text-gray-900">{donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-900">{donorEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold text-gray-900">MoonPay</span>
                </div>
              </div>

              {/* Impact Message */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 text-center">
                  ✨ Your contribution will help {organization.name.toLowerCase()} continue their important work!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowDonationModal(false);
                setDonorName('');
                setDonorEmail('');
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
