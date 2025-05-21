import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { useWeb3 } from "@/hooks/useWeb3";
import { useCarbonContract } from "@/hooks/useCarbonContract";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ExternalLinkIcon, Loader2, CheckIcon, XIcon, FileIcon, InfoIcon } from "lucide-react";

export default function PendingClaims() {
  const [, setLocation] = useLocation();
  const { account, isConnected, isAdmin } = useWeb3();
  const { pendingClaims, approveClaim, rejectClaim, isLoading } = useCarbonContract();
  const { toast } = useToast();
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processAction, setProcessAction] = useState<"approve" | "reject" | null>(null);

  // Redirect if not connected or not admin
  useEffect(() => {
    if (!isConnected) {
      setLocation("/");
    } else if (isConnected && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can access this page",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isConnected, isAdmin, setLocation, toast]);

  if (!account || !isAdmin) {
    return null;
  }

  const handleViewDetails = (claim: any) => {
    setSelectedClaim(claim);
    setIsDialogOpen(true);
  };

  const handleApproveClaim = async (claimId: string) => {
    try {
      setIsProcessing(true);
      setProcessAction("approve");
      await approveClaim(claimId);
      toast({
        title: "Claim approved",
        description: "The carbon offset claim has been approved and the NFT was minted",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error approving claim:", error);
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessAction(null);
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    try {
      setIsProcessing(true);
      setProcessAction("reject");
      await rejectClaim(claimId);
      toast({
        title: "Claim rejected",
        description: "The carbon offset claim has been rejected",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error rejecting claim:", error);
      toast({
        title: "Rejection failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessAction(null);
    }
  };

  return (
    <Layout
      title="Admin Control Panel"
      role="admin"
      navItems={[
        { name: "Pending Claims", href: "/admin/pending-claims", active: true },
        { name: "Approved Claims", href: "/admin/approved-claims" },
      ]}
    >
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Pending Claims Review
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve/reject carbon offset claims
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button variant="outline" className="inline-flex items-center" disabled>
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filter
          </Button>
        </div>
      </div>

      {/* Pending Claims Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              {isLoading ? (
                <div className="px-4 py-4 bg-white">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : pendingClaims.length === 0 ? (
                <div className="px-4 py-5 bg-white text-center text-gray-500">
                  No pending claims to review
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
                        Documentation
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingClaims.map((claim) => (
                      <tr key={claim.id.toString()}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
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
                          {new Date(claim.timestamp * 1000).toLocaleDateString()}
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button 
                            onClick={() => handleViewDetails(claim)} 
                            variant="outline" 
                            className="mr-2"
                          >
                            Details
                          </Button>
                          <Button
                            onClick={() => handleApproveClaim(claim.id.toString())}
                            className="mr-2 inline-flex items-center border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            disabled={isProcessing}
                          >
                            {isProcessing && processAction === "approve" ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CheckIcon className="mr-2 h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectClaim(claim.id.toString())}
                            className="inline-flex items-center border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                            disabled={isProcessing}
                          >
                            {isProcessing && processAction === "reject" ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <XIcon className="mr-2 h-4 w-4" />
                            )}
                            Reject
                          </Button>
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

      {/* Claim Detail Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Claim Details: {selectedClaim?.projectName}
            </DialogTitle>
            <DialogDescription>
              Review the details of this carbon offset claim before making a decision.
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="mt-5 sm:mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">PROJECT DESCRIPTION</h4>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedClaim.projectDescription}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">CO2 OFFSET CLAIM</h4>
                <p className="mt-1 text-sm text-gray-900">{selectedClaim.co2Offset.toString()} metric tons</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">PRODUCER</h4>
                <p className="mt-1 text-sm font-mono text-gray-900">{selectedClaim.producer}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">DOCUMENTATION</h4>
                <div className="mt-1 flex items-center">
                  <FileIcon className="flex-shrink-0 h-5 w-5 text-red-500" />
                  <a 
                    href={`https://ipfs.io/ipfs/${selectedClaim.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-sm text-blue-600 hover:text-blue-900"
                  >
                    {selectedClaim.projectName}_Documentation.pdf
                  </a>
                </div>
                <p className="mt-1 text-xs text-gray-500">IPFS Hash: {selectedClaim.ipfsHash}</p>
              </div>
              
              <div className="sm:grid sm:grid-cols-2 sm:gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">SUBMITTED ON</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedClaim.timestamp * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              onClick={() => selectedClaim && handleRejectClaim(selectedClaim.id.toString())}
              variant="destructive"
              disabled={isProcessing}
            >
              {isProcessing && processAction === "reject" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Claim"
              )}
            </Button>
            <Button
              onClick={() => selectedClaim && handleApproveClaim(selectedClaim.id.toString())}
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
            >
              {isProcessing && processAction === "approve" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Claim"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
