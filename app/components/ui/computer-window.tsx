import React from "react";
import { cn } from "@/lib/utils";

interface ComputerWindowProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  title?: string;
  showTitle?: boolean;
  rightElement?: React.ReactNode;
}

export function ComputerWindow({
  children,
  className,
  size = "lg",
  title = "ImageHorse",
  showTitle = false,
  rightElement,
}: ComputerWindowProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className={cn(
        // Apply a subtle gradient using the secondary and background colours from the palette.  Tailwind allows arbitrary values inside square
        // brackets so we can reference CSS variables directly.  This ensures the component adapts seamlessly to both light and dark modes.
        "w-full rounded-xl p-1 text-sm bg-gradient-to-br",
        "from-[var(--secondary)] to-[var(--background)]",
        className,
        sizeClasses[size]
      )}
    >
      {/* Window Controls */}
      <div className="flex items-center justify-between p-2">
        <div className="flex gap-2">
          {/* Colours for the faux window controls now derive from the chart palette for consistency */}
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: `var(--chart-1)` }}
          ></span>
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: `var(--chart-4)` }}
          ></span>
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: `var(--chart-2)` }}
          ></span>
        </div>
        {showTitle && (
          <div className="flex-1 text-center">
            <span
              className="text-xs font-medium"
              style={{ color: `var(--muted-foreground)` }}
            >
              {title}
            </span>
          </div>
        )}
        {rightElement && <div>{rightElement}</div>}
      </div>

      {/* Window Content */}
      <div
        className="rounded-lg p-8"
        style={{ backgroundColor: `var(--card)` }}
      >
        {children}
      </div>
    </div>
  );
}

interface ComputerWindowHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ComputerWindowHeader({
  children,
  className,
}: ComputerWindowHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center p-7 rounded-2xl bg-gradient-to-br",
        "from-[var(--secondary)] to-[var(--background)]",
        "mb-8",
        className
      )}
    >
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
  maxHeight = "max-h-64",
}: ComputerWindowTerminalProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-4 font-mono text-sm space-y-1 overflow-y-auto",
        maxHeight,
        className
      )}
      style={{
        backgroundColor: `hsl(var(--secondary))`,
        color: `hsl(var(--secondary-foreground))`,
      }}
    >
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
  className,
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
  className,
}: ComputerWindowTitleProps) {
  return (
    <div className={cn("flex flex-col items-center mt-4", className)}>
      <span className="text-2xl font-medium text-white">{title}</span>
      {subtitle && <span className="font-medium text-sky-400">{subtitle}</span>}
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

export function ComputerWindowProgress({
  progress,
  className,
}: ComputerWindowProgressProps) {
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
// Terminal text components for easy styling.  These leverage the chart palette
// defined in globals.css to provide consistent accent colours throughout the app.
export const TerminalCommand = ({
  children,
}: {
  children: React.ReactNode;
}) => <div style={{ color: `hsl(var(--chart-3))` }}>{children}</div>;

export const TerminalInfo = ({ children }: { children: React.ReactNode }) => (
  <div style={{ color: `hsl(var(--muted-foreground))` }}>{children}</div>
);

export const TerminalSuccess = ({
  children,
}: {
  children: React.ReactNode;
}) => <div style={{ color: `hsl(var(--chart-2))` }}>{children}</div>;

export const TerminalWarning = ({
  children,
}: {
  children: React.ReactNode;
}) => <div style={{ color: `hsl(var(--chart-4))` }}>{children}</div>;

export const TerminalError = ({ children }: { children: React.ReactNode }) => (
  <div style={{ color: `hsl(var(--destructive))` }}>{children}</div>
);

export const TerminalHighlight = ({
  children,
}: {
  children: React.ReactNode;
}) => <span style={{ color: `hsl(var(--accent))` }}>{children}</span>;
