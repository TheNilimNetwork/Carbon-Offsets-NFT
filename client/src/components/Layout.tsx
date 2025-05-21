import React from "react";
import { Link, useLocation } from "wouter";
import WalletButton from "./WalletButton";
import { useWeb3 } from "@/hooks/useWeb3";

type LayoutProps = {
  children: React.ReactNode;
  title: string;
  role: "producer" | "buyer" | "admin";
  navItems?: {
    name: string;
    href: string;
    active?: boolean;
  }[];
};

export default function Layout({
  children,
  title,
  role,
  navItems = [],
}: LayoutProps) {
  const { account } = useWeb3();
  const [location] = useLocation();

  const roleColors = {
    producer: {
      navBg: "producer-bg-dark",
      activeBg: "producer-bg",
      hoverBg: "hover:producer-bg",
      inactiveText: "text-producer-light",
      hoverText: "hover:text-white",
      buttonText: "text-producer-dark",
    },
    buyer: {
      navBg: "buyer-bg-dark",
      activeBg: "buyer-bg",
      hoverBg: "hover:buyer-bg",
      inactiveText: "text-buyer-light",
      hoverText: "hover:text-white",
      buttonText: "text-buyer-dark",
    },
    admin: {
      navBg: "admin-bg-dark",
      activeBg: "admin-bg",
      hoverBg: "hover:admin-bg",
      inactiveText: "text-admin-light",
      hoverText: "hover:text-white",
      buttonText: "text-admin-dark",
    },
  };

  const colors = roleColors[role];
  
  // Process nav items to add active state based on current location
  const processedNavItems = navItems.map((item) => ({
    ...item,
    active: item.active !== undefined ? item.active : location === item.href,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className={`${colors.navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-white">{title}</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                {processedNavItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        item.active
                          ? `text-white ${colors.activeBg}`
                          : `${colors.inactiveText} ${colors.hoverText} ${colors.hoverBg}`
                      }`}
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {account && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                    <svg
                      className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 8 8"
                    >
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Connected
                  </span>
                )}
              </div>
              <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                <div className="ml-3 relative">
                  {account && (
                    <div className="text-sm text-white truncate max-w-[150px]">
                      {account.substring(0, 6)}...{account.substring(account.length - 4)}
                    </div>
                  )}
                </div>
              </div>
              <WalletButton className={`ml-4 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${colors.buttonText} bg-white hover:bg-gray-100`} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
