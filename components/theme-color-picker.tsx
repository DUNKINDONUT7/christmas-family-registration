"use client"

import { Check } from "lucide-react"
import { THEME_COLORS, THEME_COLOR_META, type ThemeColor } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function ThemeColorPicker({ value, onChange }: { value: ThemeColor; onChange: (value: ThemeColor) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {THEME_COLORS.map((color) => {
        const meta = THEME_COLOR_META[color]
        const isSelected = value === color
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-pressed={isSelected}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 text-center transition-all",
              isSelected ? "border-primary" : "border-transparent hover:border-border"
            )}
          >
            <span
              className="flex size-9 items-center justify-center rounded-full text-white shadow-sm"
              style={{ background: meta.gradient }}
            >
              {isSelected && <Check className="size-4" />}
            </span>
            <span className="text-[11px] leading-tight text-muted-foreground">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
