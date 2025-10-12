'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { ERC20_ABI } from '@/utils/erc20';
import { formatSbc } from '@/utils/format';
import { SBC_TOKEN_ADDRESS } from '@/constants';
import { CoinflowWithdrawWrapper } from '../../components/CoinflowWithdrawWrapper';

// User types
type UserRole = 'organization' | 'developer';

interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

// Mock users database
const MOCK_USERS: User[] = [
  {
    id: 'org-1',
    email: 'admin@globalwater.org',
    password: 'water123',
    role: 'organization',
    name: 'Global Water Initiative',
  },
  {
    id: 'dev',
    email: 'dev@dev.com',
    password: 'dev123',
    role: 'developer',
    name: 'Developer',
  }
];

export default function DashboardPage() {
  // For developer acct - setting up wallet
  const { ready, login, authenticated, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [embeddedBalance, setEmbeddedBalance] = useState<string | null>(null);
  const embeddedWallet = wallets.find(w => w.connectorType === 'embedded');
  const [showCoinflowWithdraw, setShowCoinflowWithdraw] = useState(false);

  // Local authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // View state
  const [showSignup, setShowSignup] = useState(false);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('organization');
  const [signupOrganization, setSignupOrganization] = useState('');
  const [signupError, setSignupError] = useState('');

  // Check if user is logged in from sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem('dashboardUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch token balances for both developer and organization accounts
  useEffect(() => {
    const fetchBalances = async () => {
      // Need to be authenticated and have a wallet address
      if (!authenticated || !embeddedWallet?.address || !currentUser) return;

      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      try {
        // Embedded wallet balance
        const balance = await publicClient.readContract({
          address: SBC_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [embeddedWallet.address as `0x${string}`],
        });
        setEmbeddedBalance(formatSbc(balance as bigint));
      } catch (error) {
        console.error('Failed to fetch balances:', error);
      }
    };

    fetchBalances();
  }, [authenticated, embeddedWallet?.address, currentUser]);

  // Handle local login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const user = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );

    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      sessionStorage.setItem('dashboardUser', JSON.stringify(user));
      setEmail('');
      setPassword('');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  // Handle signup
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    // Validation
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      setSignupError('Please fill in all fields');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }

    if (signupRole === 'organization' && !signupOrganization) {
      setSignupError('Organization name is required');
      return;
    }

    // Check if email already exists
    if (MOCK_USERS.find(u => u.email === signupEmail)) {
      setSignupError('Email already exists');
      return;
    }

    // Create new user (in a real app, this would be saved to a database)
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: signupEmail,
      password: signupPassword,
      role: signupRole,
      name: signupName
    };

    // Auto login after signup
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    sessionStorage.setItem('dashboardUser', JSON.stringify(newUser));

    // Clear form
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupOrganization('');
    setSignupRole('organization');
  };

  // Handle local logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    sessionStorage.removeItem('dashboardUser');
    if (authenticated) {
      logout();
    }
  };
  
  // Debug logs (only log when wallet is expected to be connected)
  useEffect(() => {
    if (authenticated && currentUser) {
      console.log("Embedded Wallet address:", embeddedWallet?.address || "Not yet loaded");
      console.log("Balance:", embeddedBalance || "Not yet loaded");
    }
  }, [authenticated, embeddedWallet?.address, embeddedBalance, currentUser]);

  // Login/Signup Screen
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 md:p-12 max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-xl">
              <span className="text-white font-bold text-3xl">G</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {showSignup ? 'Create Account' : 'Dashboard Login'}
            </h1>
            <p className="text-gray-600">
              {showSignup ? 'Join GlobalFund today' : 'Sign in to access your account'}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setShowSignup(false);
                setLoginError('');
                setSignupError('');
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !showSignup
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setShowSignup(true);
                setLoginError('');
                setSignupError('');
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                showSignup
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {!showSignup ? (
            <>
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              />
            </div>
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
              >
                <option value="">Select your role</option>
                <option value="developer">Developer</option>
                <option value="organization">Organization</option>
              </select>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-600 text-sm font-medium">{loginError}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full btn-primary py-4 text-lg"
            >
              Sign In
            </button>
          </form>
            </>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSignup} className="space-y-5">
              {/* Full Name */}
              <div>
                <label htmlFor="signupName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="signupName"
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="signupEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="signupEmail"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              {/* Organization Name (conditional) */}
              {signupRole === 'organization' && (
                <div>
                  <label htmlFor="signupOrganization" className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    id="signupOrganization"
                    type="text"
                    value={signupOrganization}
                    onChange={(e) => setSignupOrganization(e.target.value)}
                    placeholder="Your Organization"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="signupPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signupPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="signupConfirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="signupConfirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                />
              </div>

              {/* Error Message */}
              {signupError && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm font-medium">{signupError}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full btn-primary py-4 text-lg"
              >
                Create Account
              </button>
            </form>
          )}

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen (after login)
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

            <div className="flex items-center gap-4">
              <div className="text-right mr-4">
                <p className="font-semibold text-gray-900">{currentUser.name}</p>
                <p className="text-sm text-gray-600">
                  {currentUser.role === 'organization' ? '🏢 Organization' : '👨‍💻 Developer'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors rounded-lg border-2 border-red-200 hover:border-red-300"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            Welcome back, <span className="gradient-text">{currentUser.name.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-xl text-gray-600">
            {currentUser.role === 'organization' 
              ? 'Manage your donations and connect with supporters worldwide.'
              : 'Access the wallet controls and manage transactions for GlobalFund.'}
          </p>
        </div>

        {/* Role-Specific Content */}
        {currentUser.role === 'organization' ? (
          // Organization Dashboard
          <div className="space-y-8">
            {/* Wallet Connection Alert for Organizations */}
            {!authenticated && (
              <div className="glass-card rounded-2xl p-6 bg-blue-50 border-2 border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-900 mb-1">Connect Wallet to Cash Out</h3>
                    <p className="text-sm text-blue-700">Connect your wallet via Privy to receive donations and cash out to Venmo</p>
                  </div>
                  <button
                    onClick={() => login()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Connect Wallet
                  </button>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Raised</h3>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">$45,234</p>
                <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Donors</h3>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">234</p>
                <p className="text-sm text-blue-600 mt-2">↑ 8 new this week</p>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Goal Progress</h3>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">45%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>

            {/* Recent Donations */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Donations</h2>
              <div className="space-y-4">
                {[
                  { name: 'Anonymous', amount: 500, time: '2 hours ago', country: '🇺🇸' },
                  { name: 'Sarah Johnson', amount: 250, time: '5 hours ago', country: '🇨🇦' },
                  { name: 'Anonymous', amount: 1000, time: '1 day ago', country: '🇬🇧' },
                  { name: 'Michael Chen', amount: 150, time: '2 days ago', country: '🇸🇬' },
                ].map((donation, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-xl">
                        {donation.country}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{donation.name}</p>
                        <p className="text-sm text-gray-600">{donation.time}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-600">+${donation.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          
           {/* Cash Out with Coinflow - Only show if wallet is connected */}
            {authenticated && embeddedWallet?.address ? (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Cash Out to Venmo</h2>
                <p className="text-gray-600 mb-4">
                  Convert your SBC tokens to USD and receive payment directly to your Venmo account via Coinflow.
                </p>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available to Cash Out:</span>
                    <span className="font-bold text-purple-600">
                      {embeddedBalance || 'Loading...'} SBC (~${((parseFloat(embeddedBalance || '0') * 1).toFixed(2))})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-gray-500">Wallet Address:</span>
                    <span className="font-mono text-gray-700">
                      {embeddedWallet.address.slice(0, 6)}...{embeddedWallet.address.slice(-4)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowCoinflowWithdraw(true)}
                  disabled={!embeddedBalance || parseFloat(embeddedBalance) === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
                >
                  💸 Cash Out to Venmo
                </button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Powered by Coinflow • Instant payouts to your Venmo account
                </p>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 bg-gray-50 border-2 border-gray-200">
                <h2 className="text-xl font-semibold mb-2 text-gray-700">Cash Out to Venmo</h2>
                <p className="text-gray-500 mb-4">
                  Connect your wallet to enable cash out functionality
                </p>
                <button
                  onClick={() => login()}
                  className="w-full px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
                  disabled={!ready}
                >
                  Connect Wallet First
                </button>
              </div>
            )}

            {/* Coinflow Withdraw Modal */}
            {showCoinflowWithdraw && embeddedWallet?.address && (
              <CoinflowWithdrawWrapper
                walletAddress={embeddedWallet.address}
                balance={embeddedBalance}
                onClose={() => setShowCoinflowWithdraw(false)}
                onSuccess={() => {
                  setShowCoinflowWithdraw(false);
                  setTimeout(() => window.location.reload(), 2000);
                }}
                onFailure={(error: any) => {
                  console.error('Coinflow withdraw failed:', error);
                  setShowCoinflowWithdraw(false);
                }}
              />
            )}
          </div>
        ) : (
          // Developer Dashboard
          <div className="space-y-8">
            {/* Privy Wallet Connection */}
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Wallet Connection</h2>
              
              {!authenticated ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-600 mb-6">Connect via Privy to access wallet functions</p>
                  <button
                    onClick={() => login()}
                    className="btn-primary"
                  >
                    Connect Wallet with Privy
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Wallet Info */}
                  <div className="space-y-4 mb-6">
                    {/* Embedded Wallet */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <h3 className="text-lg font-bold text-green-900">Embedded Wallet</h3>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Regular Transactions</span>
                      </div>
                      {embeddedWallet?.address ? (
                        <>
                          <p className="text-sm text-green-700 font-mono break-all mb-2">
                            {embeddedWallet.address}
                          </p>
                          <p className="text-xl font-bold text-green-600">
                            Balance: {embeddedBalance !== null ? `${embeddedBalance} SBC` : 'Loading...'}
                          </p>
                        </>
                      ) : (
                        <p className="text-green-700 italic">Not connected</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
