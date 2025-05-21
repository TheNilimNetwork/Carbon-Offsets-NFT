import { ethers } from "ethers";

export interface ClaimData {
  id: number | bigint;
  producer: string;
  projectName: string;
  projectDescription: string;
  co2Offset: bigint;
  ipfsHash: string;
  isApproved: boolean;
  isRejected: boolean;
  timestamp: number;
  approvalTimestamp: number;
  tokenId: bigint;
}

export interface NFTData {
  tokenId: bigint;
  owner: string;
  price: bigint;
  isListed: boolean;
  projectName: string;
  projectDescription: string;
  co2Offset: bigint;
  ipfsHash: string;
  purchaseTimestamp: number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export enum ClaimStatus {
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected"
}

export interface TokenListing {
  isListed: boolean;
  seller: string;
  price: bigint;
}