import React from "react";
import { cn } from "@/lib/utils";

interface ComputerWindowProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  title?: string;
  showTitle?: boolean;
}

export function ComputerWindow({
  children,
  className,
  size = "lg",
  title = "ImageHorse",
  showTitle = false,
}: ComputerWindowProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className={cn("w-full rounded-xl p-1 text-sm bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black", sizeClasses[size], className)}>
      {/* Window Controls */}
      <div className="flex gap-2 p-2">
        <span className="size-3 rounded-full bg-red-500"></span>
        <span className="size-3 rounded-full bg-yellow-500"></span>
        <span className="size-3 rounded-full bg-green-500"></span>
        {showTitle && (
          <div className="flex-1 text-center">
            <span className="text-gray-300 text-xs font-medium">{title}</span>
          </div>
        )}
      </div>
      
      {/* Window Content */}
      <div className="bg-slate-900 dark:bg-black rounded-lg p-8">
        {children}
      </div>
    </div>
  );
}

interface ComputerWindowHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ComputerWindowHeader({ children, className }: ComputerWindowHeaderProps) {
  return (
    <div className={cn("flex flex-col items-center p-7 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 mb-8", className)}>
      {children}
    </div>
  );
}

interface ComputerWindowTerminalProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export function ComputerWindowTerminal({ 
  children, 
  className,
  maxHeight = "max-h-64"
}: ComputerWindowTerminalProps) {
  return (
    <div className={cn("bg-black rounded-lg p-4 font-mono text-sm space-y-1 overflow-y-auto", maxHeight, className)}>
      {children}
    </div>
  );
}

interface ComputerWindowLogoProps {
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ComputerWindowLogo({ 
  src, 
  alt = "Logo", 
  size = "lg",
  className 
}: ComputerWindowLogoProps) {
  const sizeClasses = {
    sm: "size-24",
    md: "size-32",
    lg: "size-32",
  };

  return (
    <div>
      <img
        className={cn("shadow-xl rounded-md", sizeClasses[size], className)}
        alt={alt}
        src={src}
      />
    </div>
  );
}

interface ComputerWindowTitleProps {
  title: string;
  subtitle?: string;
  version?: string;
  year?: string;
  className?: string;
}

export function ComputerWindowTitle({ 
  title, 
  subtitle, 
  version = "v2.0", 
  year = "2025",
  className 
}: ComputerWindowTitleProps) {
  return (
    <div className={cn("flex flex-col items-center mt-4", className)}>
      <span className="text-2xl font-medium text-white">
        {title}
      </span>
      {subtitle && (
        <span className="font-medium text-sky-400">
          {subtitle}
        </span>
      )}
      <span className="flex gap-2 font-medium text-gray-400 mt-2">
        <span>{version}</span>
        <span>·</span>
        <span>{year}</span>
      </span>
    </div>
  );
}

interface ComputerWindowProgressProps {
  progress: number;
  className?: string;
}

export function ComputerWindowProgress({ progress, className }: ComputerWindowProgressProps) {
  return (
    <div className={cn("w-full bg-gray-700 rounded-full h-3 mb-6", className)}>
      <div
        className="bg-sky-400 h-3 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// Terminal text components for easy styling
export const TerminalCommand = ({ children }: { children: React.ReactNode }) => (
  <div className="text-green-400">{children}</div>
);

export const TerminalInfo = ({ children }: { children: React.ReactNode }) => (
  <div className="text-gray-400">{children}</div>
);

export const TerminalSuccess = ({ children }: { children: React.ReactNode }) => (
  <div className="text-green-400">{children}</div>
);

export const TerminalWarning = ({ children }: { children: React.ReactNode }) => (
  <div className="text-yellow-400">{children}</div>
);

export const TerminalError = ({ children }: { children: React.ReactNode }) => (
  <div className="text-red-400">{children}</div>
);

export const TerminalHighlight = ({ children }: { children: React.ReactNode }) => (
  <span className="text-sky-400">{children}</span>
);