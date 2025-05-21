import React from "react";
import { Link } from "wouter";
import { useWeb3 } from "@/hooks/useWeb3";

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  role: "producer" | "buyer" | "admin";
}

export default function RoleCard({
  title,
  description,
  icon,
  href,
  role,
}: RoleCardProps) {
  const { connect, isConnected, isConnecting } = useWeb3();

  const roleClasses = {
    producer: {
      border: "border-producer",
      bg: "producer-bg",
      bgLight: "producer-bg-light",
      text: "producer-text",
      hoverBg: "producer-bg-dark",
    },
    buyer: {
      border: "border-buyer",
      bg: "buyer-bg",
      bgLight: "buyer-bg-light",
      text: "buyer-text",
      hoverBg: "buyer-bg-dark",
    },
    admin: {
      border: "border-admin",
      bg: "admin-bg",
      bgLight: "admin-bg-light",
      text: "admin-text",
      hoverBg: "admin-bg-dark",
    },
  };

  const classes = roleClasses[role];

  const handleClick = async (e: React.MouseEvent) => {
    if (!isConnected) {
      e.preventDefault();
      await connect();
      // Only navigate after connected
      window.location.href = href;
    }
  };

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg border-l-4 ${classes.border}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${classes.bgLight} rounded-md p-3`}>
            <div className={classes.text}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-lg font-medium text-gray-900">{title}</dt>
            <dd className="mt-2 text-sm text-gray-500">{description}</dd>
          </div>
        </div>
        <div className="mt-5">
          {isConnected ? (
            <Link href={href}>
              <button
                className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${classes.bg} hover:${classes.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${role}`}
              >
                {`Continue as ${title}`}
              </button>
            </Link>
          ) : (
            <button
              onClick={handleClick}
              className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${classes.bg} hover:${classes.hoverBg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${role}`}
            >
              {isConnecting ? "Connecting..." : `Connect to continue as ${title}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
