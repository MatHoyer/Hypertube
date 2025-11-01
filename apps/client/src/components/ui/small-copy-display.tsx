import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { LoadingButton } from "../LoadingButton";

export const SmallCopyDisplay: React.FC<
  {
    value: string;
    label: string;
  } & React.ComponentProps<"div">
> = ({ value, label, className, ...props }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    setCopied(false);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <label className="text-sm font-medium text-foreground mb-1.5 block">
        {label}
      </label>
      <div className="flex items-center gap-2 h-10 px-3 py-2 border border-input rounded-md bg-background w-full overflow-hidden">
        <code className="text-sm flex-1 font-mono text-foreground truncate block whitespace-nowrap">
          {value}
        </code>
        <LoadingButton
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-6 w-6 shrink-0 hover:bg-accent"
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          loading={false}
          success={copied}
        >
          <Copy />
        </LoadingButton>
      </div>
    </div>
  );
};
