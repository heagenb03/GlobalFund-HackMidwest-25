'use client';

import { CoinflowWithdraw } from '@coinflowlabs/react';
import { useWallets } from '@privy-io/react-auth';
import { useMemo } from 'react';

interface CoinflowWithdrawWrapperProps {
  walletAddress: string;
  balance: string | null;
  onClose: () => void;
  onSuccess: () => void;
  onFailure: (error: any) => void;
}

export function CoinflowWithdrawWrapper({
  walletAddress,
  balance,
  onClose,
  onSuccess,
  onFailure,
}: CoinflowWithdrawWrapperProps) {
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(w => w.connectorType === 'embedded');

  // Create wallet adapter for Coinflow
  const coinflowWallet = useMemo(() => {
    if (!embeddedWallet) return null;

    return {
      address: walletAddress,
      sendTransaction: async (transaction: any) => {
        const provider = await embeddedWallet.getEthereumProvider();
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });
        return txHash as string;
      },
      signMessage: async (message: string) => {
        const provider = await embeddedWallet.getEthereumProvider();
        const signature = await provider.request({
          method: 'personal_sign',
          params: [message, walletAddress],
        });
        return signature as string;
      },
    };
  }, [embeddedWallet, walletAddress]);

  if (!coinflowWallet) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6">
          <p className="text-gray-900">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full relative"
        style={{
          maxWidth: '600px',
          maxHeight: '90vh',
          minHeight: '500px',
        }}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cash Out to Venmo</h2>
            <p className="text-sm text-gray-600 mt-1">Powered by Coinflow</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Coinflow iframe container */}
        <div 
          className="overflow-auto"
          style={{
            height: 'calc(90vh - 100px)',
            minHeight: '400px',
          }}
        >
          <CoinflowWithdraw
            wallet={coinflowWallet as any}
            blockchain="base"
            tokens={['usdc']}
            amount={parseFloat(balance || '0')}
            merchantId={process.env.NEXT_PUBLIC_COINFLOW_MERCHANT_ID || ''}
            env={process.env.NODE_ENV === 'production' ? 'prod' : 'sandbox'}
            onSuccess={onSuccess}
          />
        </div>
      </div>
    </div>
  );
}
