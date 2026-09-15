"use client"

import { Check, Palette } from "lucide-react"
import { PRESET_THEME_COLORS, THEME_COLOR_META, DEFAULT_CUSTOM_COLOR_HEX, HEX_COLOR_REGEX, type ThemeColor } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ThemeColorPickerProps {
  value: ThemeColor
  customColorHex: string
  onChange: (value: ThemeColor) => void
  onCustomColorChange: (hex: string) => void
}

export function ThemeColorPicker({ value, customColorHex, onChange, onCustomColorChange }: ThemeColorPickerProps) {
  const isCustomSelected = value === "custom"
  const swatchHex = HEX_COLOR_REGEX.test(customColorHex) ? customColorHex : DEFAULT_CUSTOM_COLOR_HEX

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-7">
        {PRESET_THEME_COLORS.map((color) => {
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

        <button
          type="button"
          onClick={() => onChange("custom")}
          aria-pressed={isCustomSelected}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 text-center transition-all",
            isCustomSelected ? "border-primary" : "border-transparent hover:border-border"
          )}
        >
          <span
            className="flex size-9 items-center justify-center rounded-full text-white shadow-sm"
            style={{ background: isCustomSelected ? swatchHex : "linear-gradient(135deg, #94a3b8, #cbd5e1)" }}
          >
            {isCustomSelected ? <Check className="size-4" /> : <Palette className="size-4" />}
          </span>
          <span className="text-[11px] leading-tight text-muted-foreground">Custom</span>
        </button>
      </div>

      {isCustomSelected && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
          <input
            type="color"
            value={swatchHex}
            onChange={(e) => onCustomColorChange(e.target.value)}
            className="size-10 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0"
            aria-label="Pick a custom color"
          />
          <div className="min-w-0 flex-1">
            <Input
              value={customColorHex}
              onChange={(e) => onCustomColorChange(e.target.value)}
              placeholder={DEFAULT_CUSTOM_COLOR_HEX}
              className="font-mono uppercase"
              maxLength={7}
            />
            {customColorHex && !HEX_COLOR_REGEX.test(customColorHex) && (
              <p className="mt-1 text-xs text-destructive">Enter a valid hex color, e.g. {DEFAULT_CUSTOM_COLOR_HEX}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
