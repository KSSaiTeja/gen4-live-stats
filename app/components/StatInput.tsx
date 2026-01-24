"use client";

import { ReactNode } from "react";

interface StatInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: ReactNode;
}

export default function StatInput({ 
  id, 
  label, 
  value, 
  onChange, 
  prefix 
}: StatInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value) || 0;
    onChange(numValue);
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id}
        className="block text-sm font-medium uppercase tracking-widest text-gray-400"
      >
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {prefix}
          </div>
        )}
        <input
          id={id}
          type="number"
          value={value}
          onChange={handleChange}
          className={`h-16 w-full rounded-xl border border-gray-700/50 bg-gray-800/30 text-center text-2xl font-bold text-white transition-all duration-200 hover:bg-gray-800/50 focus:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-[#76c6ff]/50 focus:border-[#76c6ff]/50 ${
            prefix ? 'pl-12' : ''
          }`}
          min="0"
          step="1"
        />
      </div>
    </div>
  );
}