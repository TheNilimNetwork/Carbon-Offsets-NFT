import React, { useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useWeb3 } from "@/hooks/useWeb3";
import { useCarbonContract } from "@/hooks/useCarbonContract";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon, ClockIcon, GlobeIcon } from "lucide-react";

export default function MyClaims() {
  const [, setLocation] = useLocation();
  const { account, isConnected } = useWeb3();
  const { claims, isLoading } = useCarbonContract();

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      setLocation("/");
    }
  }, [isConnected, setLocation]);

  if (!account) {
    return null;
  }

  // Get status badge component based on claim status
  const getStatusBadge = (claim: any) => {
    if (claim.isApproved) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
          Approved
        </Badge>
      );
    } else if (claim.isRejected) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
          Rejected
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      );
    }
  };

  return (
    <Layout
      title="Carbon Producer Portal"
      role="producer"
      navItems={[
        { name: "Dashboard", href: "/producer/dashboard" },
        { name: "Submit Claim", href: "/producer/submit-claim" },
        { name: "My Claims", href: "/producer/my-claims", active: true },
      ]}
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Carbon Offset Claims
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all your submitted carbon offset claims
          </p>
        </div>
      </div>

      {/* Claims Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {isLoading ? (
                <div className="px-4 py-5 bg-white space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : claims.length === 0 ? (
                <div className="px-4 py-5 bg-white text-center text-gray-500">
                  No claims submitted yet
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Project
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        CO2 (tons)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Submitted
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Documentation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim) => (
                      <tr key={claim.id.toString()}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 producer-bg-light rounded-full flex items-center justify-center">
                              <GlobeIcon className="h-6 w-6 producer-text" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {claim.projectName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{claim.co2Offset.toString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {new Date(claim.timestamp * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(claim)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a
                            href={`https://gateway.pinata.cloud/ipfs/${claim.ipfsHash}?cacheBust=${Date.now()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            View 
                            <ExternalLinkIcon className="ml-1 h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
