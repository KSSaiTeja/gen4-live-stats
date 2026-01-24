"use client";

import { formatNumber } from "../utils/formatNumber";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon?: React.ReactNode;
  delay?: number;
  showFullNumber?: boolean;
  showPrevious?: boolean;
}

/**
 * StatCard component built on shadcn Card, applying ALL UI/UX laws:
 *
 * Hick's Law: Minimal choices per card - only essential info (value, change)
 * Fitts's Law: Large, easily clickable areas with generous padding
 * Miller's Law: Grouped into 3 chunks (title, value, change) - optimal chunk size
 * Gestalt Principles: Visual grouping with proximity, similarity, common region
 * Doherty Threshold: Instant visual feedback on hover (<400ms)
 * Jakob's Law: Familiar card patterns users expect
 * Zeigarnik Effect: Incomplete hover states encourage exploration
 * Aesthetic-Usability Effect: Beautiful design perceived as more usable
 * Pareto Principle: 80% of value from 20% of features (focus on key metrics)
 * Serial Position Effect: Most important (value) in middle, memorable at ends
 * Tesler's Law: Simplified complexity - hide calculations, show results
 * Postel's Law: Forgiving design - graceful fallbacks if no previous value
 * Parkinson's Law: Content fills available space appropriately
 * Von Restorff Effect: Large gradient numbers stand out (isolation effect)
 * Law of Proximity: Related elements (value + change) grouped together
 * Law of Similarity: Consistent styling across all cards
 * Law of Common Region: All content within card border (visual container)
 * Law of Prägnanz: Simple, clean, organized layout (simplicity)
 * Law of Continuity: Smooth transitions and flows (eye follows gradient)
 * Law of Closure: Complete visual patterns even with negative space
 */
export default function StatCard({
  title,
  value,
  previousValue,
  icon,
  delay = 0,
  showFullNumber = false,
  showPrevious = false,
}: StatCardProps) {
  const formattedValue = showFullNumber ? value.toLocaleString() : formatNumber(value);
  const formattedPreviousValue = previousValue && showFullNumber ? previousValue.toLocaleString() : (previousValue ? formatNumber(previousValue) : null);

  return (
    <Card
      className={cn(
        // Base card styles with proper padding control
        "group relative rounded-2xl bg-linear-to-br from-gray-900 via-gray-950 to-black",
        "border border-gray-800/50",
        "flex flex-col",
        "transition-all duration-300 ease-out",
        "hover:border-[#76c6ff]/60 hover:shadow-[0_0_50px_rgba(118,198,255,0.25)]",
        "hover:scale-[1.02] hover:-translate-y-1",
        "cursor-default overflow-visible",
        "min-h-[240px] h-full",
        // CRITICAL: Override ALL default Card padding (shadcn has py-6, gap-6 by default)
        "p-0! py-0! gap-0!",
        // Doherty Threshold: Instant visual feedback
      )}
      style={{
        animationDelay: `${delay}ms`,
        animation: "fadeInUp 0.6s ease-out forwards",
        opacity: 0,
      }}
    >
      {/* Animated background gradient on hover - Law of Continuity */}
      <div className="absolute inset-0 bg-linear-to-br from-[#76c6ff]/0 via-[#76c6ff]/0 to-[#76c6ff]/0 group-hover:from-[#76c6ff]/5 group-hover:via-[#76c6ff]/3 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      {/* Subtle corner accent - Von Restorff Effect */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#76c6ff]/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Main content container with proper padding - Fitts's Law */}
      {/* Proper padding: 24px (p-6) on all sides */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Header Section - Serial Position Effect: First (Title) */}
        {/* CRITICAL: Override CardHeader default px-6 padding */}
        {/* Proper spacing: mb-6 (24px) creates clear separation from value */}
        <CardHeader className="p-4! px-4! mb-6">
          <div className="flex items-start justify-between gap-4">
            {/* Title - Law of Similarity: Consistent styling */}
            <CardTitle className="text-gray-300 text-xs font-semibold uppercase tracking-widest leading-relaxed flex-1 group-hover:text-[#76c6ff] transition-colors duration-300 wrap-break-word">
              {title}
            </CardTitle>
            {/* Icon - Law of Proximity: Close to title with proper gap */}
            {icon && (
              <div className="text-[#76c6ff] opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 shrink-0">
                {icon}
              </div>
            )}
          </div>
        </CardHeader>

        {/* Value Section - Serial Position Effect: Middle (Most Important) - Von Restorff Effect */}
        {/* CRITICAL: Override CardContent default px-6 padding */}
        {/* Proper spacing: flex-1 with justify-center centers content vertically */}
        <CardContent className="flex-1 flex flex-col justify-center p-8! px-8!">
          {/* Main Value - Isolated and prominent - Single line, no wrapping */}
          <div className="text-center w-full overflow-visible">
            <span className="block text-2xl md:text-3xl lg:text-4xl font-black tabular-nums leading-tight text-white whitespace-nowrap overflow-visible">
              {formattedValue}
            </span>
            {/* Previous Value - Only show for PlayStore and AppStore */}
            {previousValue && showPrevious && (
              <span className="block text-sm text-gray-400 mt-6 font-medium">
                Previous: {formattedPreviousValue}
              </span>
            )}
          </div>
        </CardContent>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
}
