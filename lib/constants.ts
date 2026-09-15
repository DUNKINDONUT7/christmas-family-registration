export const THEME_COLORS = [
  "christmas-red",
  "pine-green",
  "metallic-gold",
  "snow-white",
  "midnight-blue",
  "rose-gold",
] as const

export type ThemeColor = (typeof THEME_COLORS)[number]

export const THEME_COLOR_META: Record<ThemeColor, { label: string; emoji: string; gradient: string }> = {
  "christmas-red": {
    label: "Christmas Red",
    emoji: "🎀",
    gradient: "linear-gradient(135deg, #c41e3a 0%, #e8546a 100%)",
  },
  "pine-green": {
    label: "Pine Green",
    emoji: "🎄",
    gradient: "linear-gradient(135deg, #0f5c2e 0%, #1f9448 100%)",
  },
  "metallic-gold": {
    label: "Metallic Gold",
    emoji: "✨",
    gradient: "linear-gradient(135deg, #b8860b 0%, #e8c158 100%)",
  },
  "snow-white": {
    label: "Snow White",
    emoji: "❄️",
    gradient: "linear-gradient(135deg, #94a3b8 0%, #e2e8f0 100%)",
  },
  "midnight-blue": {
    label: "Midnight Blue",
    emoji: "🌙",
    gradient: "linear-gradient(135deg, #0f2557 0%, #2c4a8f 100%)",
  },
  "rose-gold": {
    label: "Rose Gold",
    emoji: "🌹",
    gradient: "linear-gradient(135deg, #b76e79 0%, #e8a3ad 100%)",
  },
}

export const EVENT_STATUSES = ["draft", "open", "closed"] as const
export type EventStatusValue = (typeof EVENT_STATUSES)[number]

export const EVENT_STATUS_META: Record<EventStatusValue, { label: string; description: string }> = {
  draft: { label: "Draft", description: "Only you can see this. Guests can't register yet." },
  open: { label: "Open", description: "Your registration link is live — anyone with it can sign up." },
  closed: { label: "Closed", description: "Registration is closed. The link shows a closed message." },
}

export const REGISTRATION_STATUSES = ["pending", "approved", "rejected"] as const
export type RegistrationStatusValue = (typeof REGISTRATION_STATUSES)[number]

export const CATERING_STYLES = [
  "buffet",
  "plated",
  "potluck",
  "snacks_only",
  "none",
] as const
export type CateringStyle = (typeof CATERING_STYLES)[number]

export const CATERING_STYLE_META: Record<CateringStyle, { label: string; description: string }> = {
  buffet: { label: "Buffet", description: "Guests serve themselves from a food spread." },
  plated: { label: "Plated / set menu", description: "A fixed menu served to each guest." },
  potluck: { label: "Potluck", description: "Guests bring a dish to share." },
  snacks_only: { label: "Snacks & drinks only", description: "Light refreshments, not a full meal." },
  none: { label: "No food provided", description: "Guests should eat beforehand." },
}
