import React from "react";
import { useWeb3 } from "@/hooks/useWeb3";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface WalletButtonProps {
  className?: string;
}

export default function WalletButton({ className }: WalletButtonProps) {
  const { isConnected, connect, disconnect, isConnecting, account } = useWeb3();

  return (
    <>
      {!isConnected ? (
        <Button 
          onClick={connect} 
          disabled={isConnecting}
          className={className || ""}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      ) : (
        <Button 
          onClick={disconnect}
          className={className || ""}
        >
          Disconnect
        </Button>
      )}
    </>
  );
}
