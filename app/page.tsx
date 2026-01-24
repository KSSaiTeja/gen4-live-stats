"use client";

import StatCard from "./components/StatCard";
import { useState, useEffect } from "react";
import Image from "next/image";
import { IndianRupee } from "lucide-react";
import {
  fetchSubscriptions,
  fetchWaitlistFilled,
  fetchPlayStoreDownloads,
  fetchAppStoreDownloads,
  fetchRevenue,
} from "./utils/api";
import { getTodaySubscriptionCount } from "./utils/subscriptionDailyCounter";

// Icons using Unicode symbols (you can replace with SVG icons later)
const PlayStoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
  </svg>
);

const AppStoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
  </svg>
);

const SubscriptionIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.46,13.97L5.82,21L12,17.27Z" />
  </svg>
);

const RevenueIcon = () => <IndianRupee size={24} />;

/**
 * Main Dashboard Page
 *
 * UI/UX Principles Applied:
 * - Miller's Law: Grouped into 5 items (optimal chunk size)
 * - Law of Proximity: Cards grouped together
 * - Law of Common Region: All stats in same container
 * - Law of Similarity: Consistent card design
 * - Law of Prägnanz: Simple, clean layout
 * - Serial Position Effect: Most important stats at top
 * - Gestalt Principles: Visual grouping and hierarchy
 * - Doherty Threshold: Instant visual feedback
 * - Hick's Law: Limited choices, clear navigation
 * - Aesthetic-Usability Effect: Beautiful design
 */
export default function Dashboard() {
  // Stats state with current and previous values for comparison
  const [stats, setStats] = useState({
    playstoreDownloads: { current: 100000, previous: 100000 },
    appstoreDownloads: { current: 8900, previous: 8900 },
    subscriptions: { current: 3400, previous: 3400 },
    revenue: { current: 45000, previous: 45000 },
  });

  // Fix hydration: start with null, set in useEffect (client-side only)
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fetch all stats (used for initial load)
  const fetchAllStats = async () => {
    try {
      // Fetch all stats in parallel
      const [
        subscriptionsCount,
        playstoreDownloads,
        appstoreDownloads,
        revenue,
      ] = await Promise.all([
        fetchSubscriptions(),
        fetchPlayStoreDownloads(),
        fetchAppStoreDownloads(),
        fetchRevenue(),
      ]);

      const todaySubscriptions = getTodaySubscriptionCount(subscriptionsCount);

      // Update stats with new values, preserving previous for comparison
      setStats((prev) => ({
        ...prev,
        playstoreDownloads: {
          current: playstoreDownloads,
          previous: prev.playstoreDownloads.current,
        },
        appstoreDownloads: {
          current: appstoreDownloads,
          previous: prev.appstoreDownloads.current,
        },
        subscriptions: {
          current: todaySubscriptions,
          previous: prev.subscriptions.current,
        },
        revenue: {
          current: revenue,
          previous: prev.revenue.current,
        },
      }));
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Keep existing values on error (graceful degradation)
    }
  };

  // Fetch all stats every 30 seconds (subscriptions, PlayStore, AppStore, revenue)
  const fetchAllStatsPeriodic = async () => {
    try {
      const [
        subscriptionsCount,
        playstoreDownloads,
        appstoreDownloads,
        revenue,
      ] = await Promise.all([
        fetchSubscriptions(),
        fetchPlayStoreDownloads(),
        fetchAppStoreDownloads(),
        fetchRevenue(),
      ]);

      const todaySubscriptions = getTodaySubscriptionCount(subscriptionsCount);

      setStats((prev) => ({
        ...prev,
        playstoreDownloads: {
          current: playstoreDownloads,
          previous: prev.playstoreDownloads.current,
        },
        appstoreDownloads: {
          current: appstoreDownloads,
          previous: prev.appstoreDownloads.current,
        },
        subscriptions: {
          current: todaySubscriptions,
          previous: prev.subscriptions.current,
        },
        revenue: {
          current: revenue,
          previous: prev.revenue.current,
        },
      }));
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch (client-side only)
    setMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());

    // Fetch initial data after mount completes (all stats at once)
    const initialFetch = setTimeout(() => {
      fetchAllStats();
    }, 0);

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Fetch all stats every 30 seconds (including spin wheel and waitlist)
    const statsInterval = setInterval(() => {
      fetchAllStatsPeriodic();
    }, 30000); // 30 seconds

    return () => {
      clearTimeout(initialFetch);
      clearInterval(timeInterval);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden">
      {/* Banner Image - At the very top */}
      <div className="w-full flex justify-center pt-4 pb-2">
        <Image
          src="/banner-image.svg"
          alt="Banner"
          width={1200}
          height={200}
          priority
          className="w-full max-w-7xl h-auto object-contain"
        />
      </div>
      {/* Main Content - Proper grid layout with vertical centering */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-12">
        <div className="max-w-7xl mx-auto w-full px-4 flex flex-col items-center">
          {/* Header Section - Logo, Title, Live Badge, Time - Just above cards with proper spacing */}
          <div className="mb-24 md:mb-24 lg:mb-28 flex flex-col items-center relative w-full header-section">
            {/* Live Badge & Time - Top right */}
            {(mounted || currentTime) && (
              <div className="absolute top-0 right-0 flex items-center gap-4">
                {mounted && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-[#76c6ff] rounded-full animate-pulse" />
                    <span className="text-gray-400 text-sm font-medium">
                      Live
                    </span>
                  </div>
                )}
                {mounted && currentTime && (
                  <span className="text-gray-500 text-sm font-mono">
                    {currentTime}
                  </span>
                )}
              </div>
            )}

            {/* Logo - Centered */}
            <div className="flex justify-center mb-6">
              <Image
                src="/logo.svg"
                alt="Gen4 Logo"
                width={135}
                height={42}
                priority
                className="h-10 w-auto"
              />
            </div>

            {/* Title - Below logo */}
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#76c6ff] via-[#0ca4ff] to-[#76c6ff] bg-clip-text text-transparent tracking-tight text-center">
              Gen4 Live Stats
            </h1>
          </div>
          {/* Stats Grid - 2 big cards side by side */}
          <div className="w-full">
            {/* Two big cards side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12">
              {/* Revenue - First */}
              <StatCard
                title="Revenue (INR)"
                value={stats.revenue.current}
                previousValue={stats.revenue.previous}
                icon={<RevenueIcon />}
                delay={0}
                showFullNumber={true}
              />

              {/* Subscriptions - Second */}
              <StatCard
                title="Subscriptions"
                value={stats.subscriptions.current}
                previousValue={stats.subscriptions.previous}
                icon={<SubscriptionIcon />}
                delay={100}
              />
            </div>

            {/* COMMENTED OUT - PlayStore and AppStore Downloads */}
            {/*
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
              <StatCard
                title="PlayStore Downloads"
                value={stats.playstoreDownloads.current}
                previousValue={100000}
                icon={<PlayStoreIcon />}
                delay={0}
                showFullNumber={true}
                showPrevious={true}
              />

              <StatCard
                title="AppStore Downloads"
                value={stats.appstoreDownloads.current}
                previousValue={8900}
                icon={<AppStoreIcon />}
                delay={100}
                showFullNumber={true}
                showPrevious={true}
              />
            </div>
            */}
          </div>
        </div>
      </main>
    </div>
  );
}
