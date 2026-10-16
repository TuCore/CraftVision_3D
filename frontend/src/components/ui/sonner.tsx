"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { Check } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-400 text-white shadow-sm shadow-emerald-400/30 shrink-0 ring-2 ring-emerald-100 dark:ring-emerald-950/60">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-foreground group-[.toaster]:border-emerald-400/20 group-[.toaster]:shadow-xl group-[.toaster]:shadow-emerald-400/5 group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "!bg-gradient-to-r !from-emerald-400 !via-emerald-400 !to-teal-400 hover:!from-emerald-500 hover:!to-teal-500 !text-white !rounded-full !px-3.5 !py-1.5 !h-auto !text-xs !font-bold !shadow-md !shadow-emerald-400/25 hover:!shadow-lg hover:!shadow-emerald-400/35 hover:!scale-105 active:!scale-95 !transition-all !duration-300 !border !border-white/30 cursor-pointer !inline-flex !items-center !gap-1.5",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-full",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
