import React, { useEffect } from "react";
import { useLocation, Link } from "wouter";
import Layout from "@/components/Layout";
import { useWeb3 } from "@/hooks/useWeb3";
import { useCarbonContract } from "@/hooks/useCarbonContract";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ExternalLinkIcon, ChevronRightIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyCertificates() {
  const [, setLocation] = useLocation();
  const { account, isConnected } = useWeb3();
  const { myNFTs, isLoading } = useCarbonContract();

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      setLocation("/");
    }
  }, [isConnected, setLocation]);

  if (!account) {
    return null;
  }

  return (
    <Layout
      title="Carbon Offset Marketplace"
      role="buyer"
      navItems={[
        { name: "Marketplace", href: "/buyer/marketplace" },
        { name: "My Certificates", href: "/buyer/certificates", active: true },
      ]}
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Carbon Offset Certificates
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            View your owned carbon offset NFT certificates
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link href="/buyer/marketplace">
            <Button className="buyer-bg hover:buyer-bg-dark">
              Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* Certificates List */}
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : myNFTs.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">No certificates yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You don't own any carbon offset certificates yet. Visit the marketplace to purchase your first one.
                </p>
                <div className="mt-6">
                  <Link href="/buyer/marketplace">
                    <Button className="buyer-bg hover:buyer-bg-dark">
                      Browse Marketplace
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {myNFTs.map((nft) => (
                <li key={nft.tokenId.toString()}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <div className="flex text-sm">
                          <p className="font-medium buyer-text truncate">{nft.projectName}</p>
                          <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                            ({nft.co2Offset.toString()} Tons CO2)
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            <p>
                              Purchased on {new Date(nft.purchaseTimestamp * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                        <div className="flex -space-x-1 overflow-hidden">
                          <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src={`https://source.unsplash.com/100x100/?profile,${Math.floor(Math.random() * 100)}`} alt="Verification authority" />
                          <img className="inline-block h-6 w-6 rounded-full ring-2 ring-white" src={`https://source.unsplash.com/100x100/?profile,${Math.floor(Math.random() * 100) + 100}`} alt="Project manager" />
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <a 
                        href={`https://ipfs.io/ipfs/${nft.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-buyer"
                      >
                        <span className="sr-only">View details</span>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
