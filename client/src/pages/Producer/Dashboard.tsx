import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useWeb3 } from "@/hooks/useWeb3";
import { useCarbonContract } from "@/hooks/useCarbonContract";
import { ClockIcon, CheckIcon, GlobeIcon, PlusIcon, ClipboardIcon, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProducerDashboard() {
  const [, setLocation] = useLocation();
  const { account, isConnected } = useWeb3();
  const { 
    claims, 
    totalApprovedClaims, 
    totalPendingClaims, 
    totalCO2Offset,
    isLoading
  } = useCarbonContract();
  
  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      setLocation("/");
    }
  }, [isConnected, setLocation]);

  if (!account) {
    return null;
  }

  const renderStats = () => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Pending Claims */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Claims</dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <div className="text-2xl font-semibold text-gray-900">{totalPendingClaims}</div>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Approved Claims */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Approved Claims</dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    <div className="text-2xl font-semibold text-gray-900">{totalApprovedClaims}</div>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Total CO2 Offset */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 producer-bg-light rounded-md p-3">
                <GlobeIcon className="h-6 w-6 producer-text" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total CO2 Offset</dt>
                <dd className="flex items-baseline">
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <div className="text-2xl font-semibold text-gray-900">{totalCO2Offset} tons</div>
                  )}
                </dd>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuickActions = () => (
    <div className="rounded-lg bg-white overflow-hidden shadow">
      <div className="bg-white p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex-1">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/producer/submit-claim">
            <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-producer cursor-pointer">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full producer-bg-light flex items-center justify-center">
                  <PlusIcon className="h-6 w-6 producer-text" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true"></span>
                <p className="text-sm font-medium text-gray-900">Submit New Claim</p>
                <p className="text-sm text-gray-500 truncate">Create a new carbon offset claim</p>
              </div>
            </div>
          </Link>

          <Link href="/producer/my-claims">
            <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-producer cursor-pointer">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full producer-bg-light flex items-center justify-center">
                  <ClipboardIcon className="h-6 w-6 producer-text" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true"></span>
                <p className="text-sm font-medium text-gray-900">View My Claims</p>
                <p className="text-sm text-gray-500 truncate">Check status of submitted claims</p>
              </div>
            </div>
          </Link>

          <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-producer cursor-pointer">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full producer-bg-light flex items-center justify-center">
                <ImageIcon className="h-6 w-6 producer-text" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true"></span>
              <p className="text-sm font-medium text-gray-900">View My Certificates</p>
              <p className="text-sm text-gray-500 truncate">See your minted NFT certificates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecentClaims = () => (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Claims</h3>
      </div>
      {isLoading ? (
        <div className="divide-y divide-gray-200">
          {[1, 2, 3].map((item) => (
            <div key={item} className="px-4 py-4 sm:px-6">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : claims.length === 0 ? (
        <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
          No claims submitted yet
        </div>
      ) : (
        <ul role="list" className="divide-y divide-gray-200">
          {claims.slice(0, 3).map((claim) => (
            <li key={claim.id.toString()}>
              <div className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium producer-text truncate">
                      {claim.projectName}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        claim.isApproved
                          ? "bg-green-100 text-green-800"
                          : claim.isRejected
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {claim.isApproved
                          ? "Approved"
                          : claim.isRejected
                          ? "Rejected"
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        Submitted on {new Date(claim.timestamp * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <GlobeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <p>
                        CO2 Offset: <span className="font-medium">{claim.co2Offset.toString()} tons</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Layout
      title="Carbon Producer Dashboard"
      role="producer"
      navItems={[
        { name: "Dashboard", href: "/producer/dashboard", active: true },
        { name: "Submit Claim", href: "/producer/submit-claim" },
        { name: "My Claims", href: "/producer/my-claims" },
      ]}
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome, Carbon Producer</h1>
          <p className="mt-1 text-sm text-gray-500">Submit carbon offset claims and track their status</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mt-6">
        {renderStats()}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        {renderQuickActions()}
      </div>
      
      {/* Recent Claims */}
      <div className="mt-8">
        {renderRecentClaims()}
      </div>
    </Layout>
  );
}
