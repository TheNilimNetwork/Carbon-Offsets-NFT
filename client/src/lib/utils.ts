import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format wallet address to display abbreviated form
export function formatAddress(address: string | null): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Format Ethereum value from wei to ETH
export function formatEth(weiValue: string | number | bigint): string {
  try {
    // Convert to string for consistent handling
    const value = weiValue.toString();
    
    // Convert to ETH (18 decimals)
    const valueInEth = parseFloat(value) / 1e18;
    
    return valueInEth.toFixed(4);
  } catch (error) {
    console.error('Error formatting ETH value:', error);
    return '0.0000';
  }
}

// Format timestamp to readable date
export function formatDate(timestamp: number): string {
  try {
    return new Date(timestamp * 1000).toLocaleDateString();
  } catch (error) {
    return 'Invalid date';
  }
}

// Generate a placeholder image URL for project
export function getProjectImageUrl(projectName: string): string {
  const normalizedName = projectName.toLowerCase().replace(/\s+/g, ',');
  return `https://source.unsplash.com/featured/?nature,${normalizedName}`;
}

// Determine status class based on claim status
export function getStatusClass(isApproved: boolean, isRejected: boolean): {
  bgColor: string,
  textColor: string,
  statusText: string
} {
  if (isApproved) {
    return {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      statusText: 'Approved'
    };
  } else if (isRejected) {
    return {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      statusText: 'Rejected'
    };
  } else {
    return {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      statusText: 'Pending'
    };
  }
}
