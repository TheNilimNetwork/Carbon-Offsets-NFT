import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useWeb3 } from "@/hooks/useWeb3";
import { useCarbonContract } from "@/hooks/useCarbonContract";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CoinsIcon, Loader2 } from "lucide-react";
import { ethers } from "ethers";

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const { account, isConnected } = useWeb3();
  const { nftsForSale, buyNFT, isLoading } = useCarbonContract();
  const { toast } = useToast();
  const [buyingTokenId, setBuyingTokenId] = useState<string | null>(null);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      setLocation("/");
    }
  }, [isConnected, setLocation]);

  if (!account) {
    return null;
  }

  const handleBuyNFT = async (tokenId: string, price: string) => {
    try {
      setBuyingTokenId(tokenId);
      await buyNFT(tokenId, price);
      toast({
        title: "Purchase successful",
        description: "You've successfully purchased the NFT certificate",
      });
    } catch (error) {
      console.error("Error buying NFT:", error);
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setBuyingTokenId(null);
    }
  };

  return (
    <Layout
      title="Carbon Offset Marketplace"
      role="buyer"
      navItems={[
        { name: "Marketplace", href: "/buyer/marketplace", active: true },
        { name: "My Certificates", href: "/buyer/certificates" },
      ]}
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Available Carbon Offset Certificates
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Browse and purchase carbon offset certificates as NFTs
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button variant="outline" className="inline-flex items-center" disabled>
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filter
          </Button>
          <Button variant="outline" className="ml-3 inline-flex items-center" disabled>
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
            Sort
          </Button>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          // Loading skeletons
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-24 w-full" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : nftsForSale.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            No carbon offset certificates available for purchase at the moment.
          </div>
        ) : (
          // Display actual NFTs
          nftsForSale.map((nft) => (
            <Card key={nft.tokenId.toString()} className="overflow-hidden border border-gray-200">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{nft.projectName}</h3>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      {nft.co2Offset.toString()} Tons CO2
                    </Badge>
                  </div>
                  <div className="mt-4 aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                    {/* Use a generated placeholder image based on the project name */}
                    <img 
                      src={`https://source.unsplash.com/featured/?nature,${nft.projectName.replace(/\s+/g, ',')}`} 
                      alt={nft.projectName} 
                      className="w-full h-48 object-cover" 
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {nft.projectDescription}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <CoinsIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-base font-medium text-gray-900">
                        {ethers.utils.formatEther(nft.price)} ETH
                      </span>
                    </div>
                    <Button 
                      className="buyer-bg hover:buyer-bg-dark"
                      onClick={() => handleBuyNFT(nft.tokenId.toString(), nft.price.toString())}
                      disabled={buyingTokenId === nft.tokenId.toString()}
                    >
                      {buyingTokenId === nft.tokenId.toString() ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Buying...
                        </>
                      ) : (
                        "Purchase"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}
