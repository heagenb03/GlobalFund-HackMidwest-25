'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MainPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-card shadow-lg' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">GlobalFund</span>
            </Link>

            {/* Auth Button */}
            <div>
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-block"
                >
                  Dashboard
                </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center mb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium mb-8 animate-float">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Zero fees • Instant transfers • Global reach
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </div>

          {/* Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-8 leading-tight">
            Support Global Causes
            <span className="block mt-2 gradient-text">
              Without Borders
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            The first international donation platform powered by <span className="font-semibold text-blue-600">SBC a stablecoin</span>. 
            Send funds to organizations worldwide avoiding any <span className="font-semibold text-pink-600">zero international fees</span>
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/search" className="btn-primary group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Start Donating
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            <Link href="#how-it-works" className="btn-secondary group">
              <span className="flex items-center gap-2">
                Learn More
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-3 gap-6 mb-32">
          <div className="feature-card group">
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Zero International Fees</h3>
            <p className="text-gray-600 leading-relaxed">
              Traditional payment processors charge 3-5% for international transfers. We use stablecoins to <span className="font-semibold text-blue-600">eliminate these fees entirely</span>.
            </p>
          </div>

          <div className="feature-card group">
            <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Crypto Knowledge Needed</h3>
            <p className="text-gray-600 leading-relaxed">
              We provide access to crypto donations in <span className="font-semibold text-purple-600">seconds</span>. Organizations can access funds no matter where they are in the world to make an impact.
            </p>
          </div>

          <div className="feature-card group">
            <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure & Transparent</h3>
            <p className="text-gray-600 leading-relaxed">
              Built on <span className="font-semibold text-green-600">blockchain technology</span> with smart wallets. Every transaction is traceable, immutable, and secure.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="glass-card rounded-[3rem] p-12 md:p-16 mb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full filter blur-3xl opacity-20"></div>
          <div className="relative z-10">
            <div className="text-center mb-16">
              <h2 className="section-title">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get started no set up required.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  {/* Connector Line */}
                  <div className="hidden md:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%+2rem)] h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 opacity-30"></div>
                </div>
                <h4 className="font-bold text-xl text-gray-900 mb-3">Find Organizations</h4>
                <p className="text-gray-600 leading-relaxed">Use our search tool to discover organizations that align with your values.</p>
              </div>
              
              <div className="text-center group">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  {/* Connector Line */}
                  <div className="hidden md:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%+2rem)] h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 opacity-30"></div>
                </div>
                <h4 className="font-bold text-xl text-gray-900 mb-3">Donate Directly</h4>
                <p className="text-gray-600 leading-relaxed">Use Apple Pay, Google Pay, or credit card to donate directly to organizations no matter your local currency.</p>
              </div>
              
              <div className="text-center group">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  {/* Connector Line */}
                  <div className="hidden md:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%+2rem)] h-0.5 bg-gradient-to-r from-pink-400 to-red-400 opacity-30"></div>
                </div>
                <h4 className="font-bold text-xl text-gray-900 mb-3">The Crypto</h4>
                <p className="text-gray-600 leading-relaxed">We turn your local currency into SBC avoiding international exchange fees.</p>
              </div>
              
              <div className="text-center group">
                <div className="relative mx-auto mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto text-white text-3xl font-bold shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    4
                  </div>
                </div>
                <h4 className="font-bold text-xl text-gray-900 mb-3">Impact</h4>
                <p className="text-gray-600 leading-relaxed">Organizations receive SBC that can be converted back to their local currency easily.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-gray-900 to-black text-gray-400 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-6 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                    <span className="text-white font-bold text-2xl">G</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                </div>
                <span className="text-2xl font-bold text-white">GlobalFund</span>
              </Link>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Making international giving accessible to everyone through the power of blockchain and stablecoins.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
