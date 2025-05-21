import React, { useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useWeb3 } from "@/hooks/useWeb3";
import { useCarbonContract } from "@/hooks/useCarbonContract";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon, CheckIcon, CalendarIcon } from "lucide-react";

export default function ApprovedClaims() {
  const [, setLocation] = useLocation();
  const { account, isConnected, isAdmin } = useWeb3();
  const { approvedClaims, isLoading } = useCarbonContract();
  
  // Redirect if not connected or not admin
  useEffect(() => {
    if (!isConnected) {
      setLocation("/");
    } else if (isConnected && !isAdmin) {
      setLocation("/");
    }
  }, [isConnected, isAdmin, setLocation]);

  if (!account || !isAdmin) {
    return null;
  }

  return (
    <Layout
      title="Admin Control Panel"
      role="admin"
      navItems={[
        { name: "Pending Claims", href: "/admin/pending-claims" },
        { name: "Approved Claims", href: "/admin/approved-claims", active: true },
      ]}
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Approved Claims
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View all approved carbon offset claims and minted NFTs
          </p>
        </div>
      </div>

      {/* Approved Claims Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {isLoading ? (
                <div className="px-4 py-5 bg-white">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : approvedClaims.length === 0 ? (
                <div className="px-4 py-5 bg-white text-center text-gray-500">
                  No approved claims yet
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CO2 (tons)
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Approved
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NFT Token
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documentation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {approvedClaims.map((claim) => (
                      <tr key={claim.id.toString()}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {claim.projectName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {claim.projectDescription.substring(0, 30)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {claim.producer.substring(0, 6)}...{claim.producer.substring(claim.producer.length - 4)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{claim.co2Offset.toString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-1.5 h-4 w-4 text-gray-400" />
                            {new Date(claim.timestamp * 1000).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-1.5 h-4 w-4 text-gray-400" />
                            {new Date(claim.approvalTimestamp * 1000).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                            #{claim.tokenId.toString()}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <a 
                            href={`https://ipfs.io/ipfs/${claim.ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            View PDF
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
