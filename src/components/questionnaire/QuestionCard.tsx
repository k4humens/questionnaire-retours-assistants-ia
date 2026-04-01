import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  children: ReactNode;
  className?: string;
}

export const QuestionCard = ({ children, className }: QuestionCardProps) => {
  return (
    <div className={cn("max-w-3xl mx-auto", className)}>
      <div className="glass rounded-2xl p-8 md:p-10">
        {children}
      </div>
    </div>
  );
};
