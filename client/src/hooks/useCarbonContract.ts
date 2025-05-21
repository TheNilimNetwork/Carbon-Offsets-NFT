import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./useWeb3";
import { ClaimData, NFTData } from "@/types/carbon";

// ABI imports
import CarbonOffsetNFT from "@/contracts/CarbonOffsetNFT.json";

// Contract address (this would ideally come from environment variables or a config file)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xA41c4de1cFB32B7BBbdF09894C0FeC92041a407c";

export function useCarbonContract() {
  const { account, signer, provider, isConnected } = useWeb3();

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [pendingClaims, setPendingClaims] = useState<ClaimData[]>([]);
  const [approvedClaims, setApprovedClaims] = useState<ClaimData[]>([]);
  const [nftsForSale, setNftsForSale] = useState<NFTData[]>([]);
  const [myNFTs, setMyNFTs] = useState<NFTData[]>([]);
  
  // Summary stats
  const [totalPendingClaims, setTotalPendingClaims] = useState<number>(0);
  const [totalApprovedClaims, setTotalApprovedClaims] = useState<number>(0);
  const [totalCO2Offset, setTotalCO2Offset] = useState<number>(0);

  // Initialize contract
  useEffect(() => {
    if (signer) {
      const carbonContract = new ethers.Contract(CONTRACT_ADDRESS, CarbonOffsetNFT.abi, signer);
      setContract(carbonContract);
    } else if (provider) {
      const carbonContract = new ethers.Contract(CONTRACT_ADDRESS, CarbonOffsetNFT.abi, provider);
      setContract(carbonContract);
    } else {
      setContract(null);
    }
  }, [signer, provider]);

  // Load data
  useEffect(() => {
    if (contract && isConnected) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          // If user is a producer or buyer
          if (account) {
            const userClaims = await fetchUserClaims();
            setClaims(userClaims);
            
            const pending = userClaims.filter(claim => !claim.isApproved && !claim.isRejected).length;
            const approved = userClaims.filter(claim => claim.isApproved).length;
            
            setTotalPendingClaims(pending);
            setTotalApprovedClaims(approved);
            
            // Get user's NFTs
            const ownedNFTs = await fetchMyNFTs();
            setMyNFTs(ownedNFTs);
          }
          
          // Get NFTs for sale
          const availableNFTs = await fetchNFTsForSale();
          setNftsForSale(availableNFTs);
          
          // For admin, get pending and approved claims
          await fetchPendingClaimsForAdmin();
          await fetchApprovedClaimsForAdmin();
          
          setIsLoading(false);
        } catch (error) {
          console.error("Error loading data:", error);
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [contract, account, isConnected]);

  // Fetch user claims made by the current user
  const fetchUserClaims = async (): Promise<ClaimData[]> => {
    if (!contract || !account) return [];

    try {
      const claimCount = await contract.getUserClaimCount(account);
      const claims: ClaimData[] = [];

      for (let i = 0; i < claimCount; i++) {
        const claimId = await contract.userClaimIds(account, i);
        const claim = await contract.claims(claimId);
        
        const formattedClaim: ClaimData = {
          id: claimId,
          producer: claim.claimant,
          projectName: claim.projectName,
          projectDescription: claim.description,
          co2Offset: claim.co2Offset,
          ipfsHash: claim.ipfsHash,
          isApproved: claim.status.toString() === "1" || claim.status === BigInt(1),
          isRejected: claim.status.toString() === "2" || claim.status === BigInt(2),
          timestamp: Number(claim.timestamp) || Date.now() / 1000,
          approvalTimestamp: Number(claim.approvalTimestamp) || 0,
          tokenId: claim.tokenId || BigInt(0),
        };

        claims.push(formattedClaim);
      }

      return claims.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Error fetching user claims:", error);
      return [];
    }
  };

  // Fetch NFTs available for sale
  const fetchNFTsForSale = async (): Promise<NFTData[]> => {
    if (!contract) return [];

    try {
      // Check if the function exists in the contract
      let nfts: NFTData[] = [];
      
      // For now, just return an empty array since the contract doesn't support this feature yet
      // In a production environment, you would implement proper marketplace functionality
      console.log("NFT marketplace functionality not fully implemented in contract");
      
      return nfts;
    } catch (error) {
      console.error("Error fetching NFTs for sale:", error);
      return [];
    }
  };

  // Fetch NFTs owned by the current user
  const fetchMyNFTs = async (): Promise<NFTData[]> => {
    if (!contract || !account) return [];

    try {
      const balance = await contract.balanceOf(account);
      const nfts: NFTData[] = [];

      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(account, i);
        const tokenURI = await contract.tokenURI(tokenId);
        const listing = await contract.tokenListings(tokenId);
        
        // If using IPFS, fetch metadata
        let metadata = {
          projectName: "Carbon Offset Certificate",
          projectDescription: "Description not available",
          co2Offset: BigInt(0),
          documentationHash: "",
        };
        
        try {
          // Try to fetch metadata from IPFS
          if (tokenURI.startsWith("ipfs://")) {
            const ipfsHash = tokenURI.replace("ipfs://", "");
            const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}?cacheBust=${Date.now()}`);
            if (response.ok) {
              metadata = await response.json();
            }
          }
        } catch (error) {
          console.error("Error fetching token metadata:", error);
        }

        nfts.push({
          tokenId,
          owner: account,
          price: listing.price,
          isListed: listing.isListed,
          projectName: metadata.projectName,
          projectDescription: metadata.projectDescription,
          co2Offset: metadata.co2Offset,
          ipfsHash: metadata.documentationHash,
          purchaseTimestamp: await getTokenPurchaseTimestamp(tokenId)
        });
      }

      return nfts;
    } catch (error) {
      console.error("Error fetching owned NFTs:", error);
      return [];
    }
  };

  // Get token purchase timestamp (for display purposes)
  const getTokenPurchaseTimestamp = async (tokenId: bigint): Promise<number> => {
    if (!contract) return 0;
    
    try {
      // This assumes your contract has a way to get this info
      // If not available in contract, we can use a default value
      // In a real implementation, you might track this in contract events
      return Math.floor(Date.now() / 1000) - 86400; // Mock: 1 day ago
    } catch (error) {
      return 0;
    }
  };

  // Fetch pending claims for admin
  const fetchPendingClaimsForAdmin = async () => {
    if (!contract) return;

    try {
      console.log("Fetching pending claims for admin...");
      // Get claim count from contract
      const claimCount = await contract.getClaimCount();
      console.log("Total claim count:", claimCount.toString());
      
      const pendingClaimsList: ClaimData[] = [];

      // Loop through all claims to find pending ones
      for (let i = 0; i < Number(claimCount); i++) {
        try {
          console.log(`Fetching claim ${i}...`);
          const claim = await contract.claims(i);
          console.log(`Claim ${i} status:`, claim.status);
          
          // Check if claim is pending (status = 0)
          // Compare with BigInt(0) or check if it's 0 as string
          if (claim.status.toString() === "0" || claim.status === BigInt(0)) {
            console.log(`Found pending claim ${i}:`, claim);
            
            const formattedClaim: ClaimData = {
              id: BigInt(i),
              producer: claim.claimant,
              projectName: claim.projectName || "Unnamed Project",
              projectDescription: claim.description || "No description available",
              co2Offset: claim.co2Offset || BigInt(0),
              ipfsHash: claim.ipfsHash || "",
              isApproved: false,
              isRejected: false,
              timestamp: Date.now() / 1000,
              approvalTimestamp: 0,
              tokenId: BigInt(0)
            };
            
            pendingClaimsList.push(formattedClaim);
          }
        } catch (claimError) {
          console.error(`Error processing claim ${i}:`, claimError);
        }
      }
      
      console.log("Pending claims found:", pendingClaimsList.length);
      setPendingClaims(pendingClaimsList);
    } catch (error) {
      console.error("Error fetching pending claims for admin:", error);
    }
  };

  // Fetch approved claims for admin
  const fetchApprovedClaimsForAdmin = async () => {
    if (!contract) return;

    try {
      const claimCount = await contract.getClaimCount();
      const approvedClaimsList: ClaimData[] = [];

      for (let i = 0; i < claimCount; i++) {
        const claim = await contract.claims(i);
        
        // Check if claim is approved
        // Compare with BigInt(1) or check if it's 1 as string
        if (claim.status.toString() === "1" || claim.status === BigInt(1)) {
          const formattedClaim: ClaimData = {
            id: BigInt(i),
            producer: claim.claimant,
            projectName: claim.projectName,
            projectDescription: claim.description,
            co2Offset: claim.co2Offset,
            ipfsHash: claim.ipfsHash,
            isApproved: true,
            isRejected: false,
            timestamp: Date.now() / 1000,
            approvalTimestamp: Date.now() / 1000,
            tokenId: BigInt(0)
          };
          
          approvedClaimsList.push(formattedClaim);
        }
      }
      
      setApprovedClaims(approvedClaimsList);
    } catch (error) {
      console.error("Error fetching approved claims for admin:", error);
    }
  };

  // Submit a new claim
  const submitClaim = useCallback(
    async (co2Offset: number, projectName: string, projectDescription: string, ipfsHash: string) => {
      if (!contract || !account) {
        throw new Error("Contract or account not initialized");
      }

      try {
        // Verify contract code exists
        const code = await provider?.getCode(CONTRACT_ADDRESS);
        if (!code || code === "0x") {
          throw new Error("Contract not deployed at specified address");
        }

        // Submit claim - ensure parameters match the contract's expected order
        const transaction = await contract.submitClaim(
          co2Offset,
          projectName,
          projectDescription,
          ipfsHash
        );

        console.log("Transaction:", transaction);
        
        // Wait for transaction confirmation
        const receipt = await transaction.wait();
        console.log("Transaction receipt:", receipt);

        // Refresh data after submission
        const userClaims = await fetchUserClaims();
        setClaims(userClaims);
        
        const pending = userClaims.filter(claim => !claim.isApproved && !claim.isRejected).length;
        setTotalPendingClaims(pending);

        return transaction;
      } catch (error: any) {
        console.error("Error in submitClaim:", error);
        if (error.reason) {
          throw new Error(`Transaction failed: ${error.reason}`);
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw new Error("Failed to submit claim. Please try again.");
        }
      }
    },
    [contract, account, provider]
  );

  // Approve a claim (admin only)
  const approveClaim = useCallback(
    async (claimId: string): Promise<void> => {
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      try {
        // Generate a tokenURI pointing to the IPFS hash of the claim
        // This will be used for the NFT metadata
        const claim = await contract.claims(claimId);
        const tokenURI = `ipfs://${claim.ipfsHash}`;
        
        console.log("Approving claim with ID:", claimId, "and tokenURI:", tokenURI);
        const tx = await contract.approveClaim(claimId, tokenURI);
        await tx.wait();
        
        // Refresh admin data
        await fetchPendingClaimsForAdmin();
        await fetchApprovedClaimsForAdmin();
      } catch (error: any) {
        console.error("Error approving claim:", error);
        if (error.reason) {
          throw new Error(`Transaction failed: ${error.reason}`);
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw new Error("Failed to approve claim. Please try again.");
        }
      }
    },
    [contract]
  );

  // Reject a claim (admin only)
  const rejectClaim = useCallback(
    async (claimId: string): Promise<void> => {
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      try {
        // Add a default reason for rejection
        const reason = "Claim rejected by administrator";
        console.log("Rejecting claim with ID:", claimId, "and reason:", reason);
        
        const tx = await contract.rejectClaim(claimId, reason);
        await tx.wait();
        
        // Refresh admin data
        await fetchPendingClaimsForAdmin();
      } catch (error: any) {
        console.error("Error rejecting claim:", error);
        if (error.reason) {
          throw new Error(`Transaction failed: ${error.reason}`);
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw new Error("Failed to reject claim. Please try again.");
        }
      }
    },
    [contract]
  );

  // List NFT for sale
  const listNFTForSale = useCallback(
    async (tokenId: string, price: string): Promise<void> => {
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      try {
        const priceInWei = ethers.parseEther(price);
        const tx = await contract.listNFTForSale(tokenId, priceInWei);
        await tx.wait();
        
        // Refresh NFT data
        const ownedNFTs = await fetchMyNFTs();
        setMyNFTs(ownedNFTs);
        
        const availableNFTs = await fetchNFTsForSale();
        setNftsForSale(availableNFTs);
      } catch (error: any) {
        console.error("Error listing NFT for sale:", error);
        if (error.reason) {
          throw new Error(`Transaction failed: ${error.reason}`);
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw new Error("Failed to list NFT for sale. Please try again.");
        }
      }
    },
    [contract]
  );

  // Buy NFT
  const buyNFT = useCallback(
    async (tokenId: string, price: string): Promise<void> => {
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      try {
        const tx = await contract.buyNFT(tokenId, { value: price });
        await tx.wait();
        
        // Refresh NFT data
        const ownedNFTs = await fetchMyNFTs();
        setMyNFTs(ownedNFTs);
        
        const availableNFTs = await fetchNFTsForSale();
        setNftsForSale(availableNFTs);
      } catch (error: any) {
        console.error("Error buying NFT:", error);
        if (error.reason) {
          throw new Error(`Transaction failed: ${error.reason}`);
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw new Error("Failed to buy NFT. Please try again.");
        }
      }
    },
    [contract]
  );

  return {
    isLoading,
    claims,
    pendingClaims,
    approvedClaims,
    nftsForSale,
    myNFTs,
    totalPendingClaims,
    totalApprovedClaims,
    totalCO2Offset,
    submitClaim,
    approveClaim,
    rejectClaim,
    listNFTForSale,
    buyNFT,
  };
}