import { cn } from "../../lib/utils";
import { ScrollArea } from "./scroll-area";

interface TerminalProps {
  className?: string;
  children: React.ReactNode;
  tabs?: string[];
  activeTab?: number;
  onTabChange?: (index: number) => void;
}

export function Terminal({
  className,
  children,
  tabs = ["shell"],
  activeTab = 0,
  onTabChange,
}: TerminalProps) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Terminal Header */}
      <div className="border-b px-3 py-1 bg-muted flex items-center gap-2">
        {tabs.length > 1 && (
          <div className="inline-flex h-9 w-fit items-center justify-center rounded-none bg-transparent p-0">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange?.(index)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] h-7 border border-transparent pt-0.5",
                  activeTab === index
                    ? "text-foreground bg-accent border-input"
                    : "text-muted-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Terminal Content with Scroll */}
      <div className="bg-muted">
        <ScrollArea className="h-64 w-full">
          <div className="px-4 py-3.5 text-muted-foreground">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
