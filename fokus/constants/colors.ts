export default {
  light: {
    primary: "#4F46E5",
    primaryFg: "#FFFFFF",
    accent: "#F59E0B",
    background: "#F2F1FA",
    surface: "#FFFFFF",
    foreground: "#0F0E17",
    muted: "#6B7280",
    border: "#E5E7EB",
    gradient: ["#6366F1", "#4F46E5", "#4338CA"] as const,
    // Soft colored auroras behind the glass — provides chromatic depth.
    ambient: ["#E0E7FF", "#FCE7F3", "#FEF3C7"] as const,
  },
  dark: {
    primary: "#A5B4FC",
    primaryFg: "#0F0E17",
    accent: "#FBBF24",
    background: "#0A0915",
    surface: "#161426",
    foreground: "#F5F4FB",
    muted: "#9CA3AF",
    border: "#2A2A3E",
    gradient: ["#4338CA", "#4F46E5", "#6366F1"] as const,
    ambient: ["#2A1E66", "#3B1F66", "#1A2B66"] as const,
  },
  radius: 22,
} as const;
