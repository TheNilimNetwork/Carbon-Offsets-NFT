import React from "react";
import WalletButton from "@/components/WalletButton";
import RoleCard from "@/components/RoleCard";
import { useWeb3 } from "@/hooks/useWeb3";

export default function Home() {
  const { isConnected } = useWeb3();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Carbon Offset NFTs</h1>
              </div>
            </div>
            <div className="flex items-center">
              <WalletButton className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Carbon Offset Certificates</span>
              <span className="block text-indigo-600">as NFTs on Ethereum</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Trade carbon offset certificates as NFTs on the blockchain. Connect
              your wallet to continue as a producer, buyer, or administrator.
            </p>
          </div>

          {/* Role Selection */}
          <div className="mt-10">
            <h2 className="text-center text-2xl font-bold mb-8">
              Choose your role
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Producer Card */}
              <RoleCard
                title="Carbon Producer"
                description="Submit carbon offset claims and receive NFT certificates for your environmental initiatives."
                href="/producer/dashboard"
                role="producer"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                }
              />

              {/* Buyer Card */}
              <RoleCard
                title="Carbon Offset Buyer"
                description="Browse and purchase carbon offset NFTs to support environmental sustainability."
                href="/buyer/marketplace"
                role="buyer"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
              />

              {/* Admin Card */}
              <RoleCard
                title="Administrator"
                description="Review and approve offset claims, manage the NFT platform, and ensure platform integrity."
                href="/admin/pending-claims"
                role="admin"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                }
              />
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-16">
            <h2 className="text-center text-2xl font-bold mb-8">How It Works</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                      <span className="text-xl font-bold">1</span>
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">
                      Connect Wallet
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Use MetaMask to authenticate and interact with the
                      blockchain.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                      <span className="text-xl font-bold">2</span>
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">
                      Select Role
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Participate as a Producer, Buyer, or Administrator.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600">
                      <span className="text-xl font-bold">3</span>
                    </div>
                    <h3 className="mt-3 text-lg font-medium text-gray-900">
                      Trade Carbon Offsets
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Submit, approve, or purchase carbon offset certificates as
                      NFTs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
