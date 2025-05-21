import React, { createContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

// Declare the window.ethereum global for TypeScript
declare global {
  interface Window {
    ethereum: any;
  }
}

interface Web3ContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  isAdmin: boolean;
  network: ethers.Network | null;
  switchToSepolia: () => Promise<void>;
}

export const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  chainId: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  isConnected: false,
  isAdmin: false,
  network: null,
  switchToSepolia: async () => {},
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [network, setNetwork] = useState<ethers.Network | null>(null);
  
  const { toast } = useToast();

  // The Sepolia testnet chain ID
  const SEPOLIA_CHAIN_ID = 11155111;
  
  // Admin address from environment variable
  const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || "0xAd64703C63FA940c909D0BD54a76025fD89DEb4B";

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask browser extension to connect",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);
      
      // Request accounts from MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      
      const signer = await browserProvider.getSigner();
      const account = await signer.getAddress();
      const network = await browserProvider.getNetwork();
      
      setProvider(browserProvider);
      setSigner(signer);
      setAccount(account);
      setChainId(Number(network.chainId));
      setNetwork(network);
      setIsConnected(true);
      // Debug logs for admin check
      console.log("Admin ENV:", ADMIN_ADDRESS, "Connected:", account);
      console.log("isAdmin:", account?.toLowerCase() === ADMIN_ADDRESS?.toLowerCase());
      setIsAdmin(account.toLowerCase() === ADMIN_ADDRESS?.toLowerCase());
      
      localStorage.setItem("walletConnected", "true");
      
      // Check if we're on Sepolia
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Sepolia testnet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting to MetaMask", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setNetwork(null);
    setIsConnected(false);
    setIsAdmin(false);
    localStorage.removeItem("walletConnected");
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    
    try {
      // Convert the decimal chain ID to hexadecimal with '0x' prefix
      const sepoliaChainIdHex = `0x${SEPOLIA_CHAIN_ID.toString(16)}`;
      
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: sepoliaChainIdHex }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          // Convert the decimal chain ID to hexadecimal with '0x' prefix
          const sepoliaChainIdHex = `0x${SEPOLIA_CHAIN_ID.toString(16)}`;
          
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: sepoliaChainIdHex,
                chainName: "Sepolia Testnet",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "SEP",
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Sepolia network", addError);
        }
      }
    }
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem("walletConnected") === "true";
    if (wasConnected) {
      connect();
    }
  }, [connect]);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        // Debug logs for admin check
        console.log("Admin ENV:", ADMIN_ADDRESS, "Connected:", accounts[0]);
        console.log("isAdmin:", accounts[0]?.toLowerCase() === ADMIN_ADDRESS?.toLowerCase());
        setIsAdmin(accounts[0].toLowerCase() === ADMIN_ADDRESS?.toLowerCase());
      }
    };

    const handleChainChanged = async (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      setChainId(newChainId);
      
      // Refresh provider and network info
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);
        
        try {
          const network = await browserProvider.getNetwork();
          setNetwork(network);
          
          const signer = await browserProvider.getSigner();
          setSigner(signer);
          
          // Check if we're on Sepolia
          if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
            toast({
              title: "Wrong Network",
              description: "Please switch to Sepolia testnet",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error refreshing provider after chain change", error);
        }
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account, disconnect, toast]);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        connect,
        disconnect,
        isConnecting,
        isConnected,
        isAdmin,
        network,
        switchToSepolia,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
