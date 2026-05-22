import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CATEGORY_META, FocusCategory, FocusItem } from "@/context/FocusContext";
import { useColors } from "@/hooks/useColors";

export type WidgetSize = "small" | "medium" | "large";

const DIMENSIONS: Record<WidgetSize, { width: number; height: number }> = {
  small: { width: 155, height: 155 },
  medium: { width: 329, height: 155 },
  large: { width: 329, height: 345 },
};

interface Props {
  size: WidgetSize;
  item?: FocusItem | null;
  previewText?: string;
  previewCategory?: FocusCategory;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function formatTime(iso: string | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function WidgetPreview({ size, item, previewText, previewCategory }: Props) {
  const colors = useColors();
  const { width, height } = DIMENSIONS[size];

  const text = (previewText ?? item?.text ?? "Set today's focus").trim();
  const category: FocusCategory = previewCategory ?? item?.category ?? "focus";
  const createdAt = item?.createdAt ?? new Date().toISOString();
  const meta = CATEGORY_META[category];

  const isSmall = size === "small";
  const isLarge = size === "large";

  return (
    <View
      style={[
        styles.outer,
        {
          width,
          height,
          borderRadius: 22,
          shadowColor: colors.scheme === "dark" ? "#000" : "#1F1B4B",
        },
      ]}
    >
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: 22 }]}
      >
        <View style={styles.header}>
          <View style={styles.iconBubble}>
            <Ionicons name={meta.icon} size={isSmall ? 14 : 16} color="#FFFFFF" />
          </View>
          {!isSmall ? (
            <Text style={styles.headerLabel} numberOfLines={1}>
              {meta.label}
            </Text>
          ) : null}
        </View>

        <Text
          style={[
            styles.body,
            isSmall ? styles.bodySmall : styles.bodyLarge,
          ]}
          numberOfLines={isSmall ? 4 : isLarge ? 8 : 4}
        >
          {text}
        </Text>

        <View style={styles.footer}>
          {isLarge ? (
            <Text style={styles.footerLabel}>Last updated · {formatTime(createdAt)}</Text>
          ) : null}
          <Text style={styles.footerDate}>{formatDate(createdAt)}</Text>
        </View>

        {isLarge ? <View style={styles.accentBar} /> : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  gradient: {
    flex: 1,
    padding: 14,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  body: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 18,
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 24,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
  },
  footerDate: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "600",
  },
  accentBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: "rgba(245, 158, 11, 0.85)",
  },
});

export default WidgetPreview;
