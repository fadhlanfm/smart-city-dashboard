import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface InfoTooltipProps {
  label: React.ReactNode;
  info: string;
}

export function InfoTooltip({ label, info }: InfoTooltipProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-1.5">
        {label}
        <Tooltip>
          <TooltipTrigger type="button" className="cursor-help" tabIndex={-1}>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-primary transition-colors" />
            <span className="sr-only">Information</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[250px] whitespace-normal break-words text-xs leading-relaxed">
            {info}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
