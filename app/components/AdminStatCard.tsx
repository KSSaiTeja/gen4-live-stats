"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminStatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export default function AdminStatCard({ icon, label, value }: AdminStatCardProps) {
  return (
    <Card className="overflow-hidden border-gray-700/50 bg-gray-800/30">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#76c6ff]/10 text-[#76c6ff]">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-gray-400">
              {label}
            </p>
            <p className="text-2xl font-bold text-white">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}