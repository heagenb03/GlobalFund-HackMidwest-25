'use client';

import { PrivyProvider } from "@privy-io/react-auth";
// import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets"; // Disabled due to timeout
import { WagmiProvider, createConfig} from "@privy-io/wagmi";
import { base } from "viem/chains";
import { http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Providers({children}: {children: React.ReactNode}) {
    return (
        <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
            config={{
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'all-users',
                    },
                },
                defaultChain: base,
                supportedChains: [base],
                fundingMethodConfig: {
                    moonpay: {
                        useSandbox: false,
                        paymentMethod: 'credit_debit_card',
                    },
                },
            }}
        >
            {/* SmartWalletsProvider temporarily disabled due to timeout issues */}
            {/* Will use embedded wallet for transfers - user pays gas */}
            <QueryClientProvider client={queryClient}>
                <WagmiProvider 
                    config={createConfig({
                    chains: [base],
                    transports: { [base.id]: http() },
                })}>
                    {children}
                </WagmiProvider>
                </QueryClientProvider>
        </PrivyProvider>
    );
}