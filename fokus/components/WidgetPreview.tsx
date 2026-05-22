import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CATEGORY_META, FocusCategory, FocusItem } from "@/context/FocusContext";
import { useColors } from "@/hooks/useColors";

export type WidgetSize = "small" | "medium" | "large";

const DIMENSIONS: Record<WidgetSize, { width: number; height: number }> = {
  small: { width: 170, height: 170 },
  medium: { width: 360, height: 170 },
  large: { width: 360, height: 360 },
};

const CORNER_RADIUS = 32;

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
  const padding = isSmall ? 14 : 18;

  return (
    <View
      style={[
        styles.outer,
        {
          width,
          height,
          borderRadius: CORNER_RADIUS,
        },
      ]}
    >
      <LinearGradient
        colors={colors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: CORNER_RADIUS }]}
      />
      <LinearGradient
        colors={["rgba(255,255,255,0.22)", "transparent"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={[styles.sheen, { borderRadius: CORNER_RADIUS }]}
      />
      <View style={[styles.rim, { borderRadius: CORNER_RADIUS }]} pointerEvents="none" />

      <View style={[styles.content, { padding }]}>
        <View style={styles.header}>
          <View style={styles.iconPillWrap}>
            <BlurView intensity={30} tint="light" style={styles.iconPillBlur} />
            <View style={styles.iconPillTint} />
            <View style={styles.iconPillRim} />
            <Ionicons name={meta.icon} size={isSmall ? 14 : 16} color="#FFFFFF" />
          </View>
          {!isSmall ? (
            <View style={styles.labelPillWrap}>
              <BlurView intensity={28} tint="light" style={styles.labelPillBlur} />
              <View style={styles.labelPillTint} />
              <View style={styles.labelPillRim} />
              <Text style={styles.headerLabel} numberOfLines={1}>
                {meta.label.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          style={[styles.body, isSmall ? styles.bodySmall : isLarge ? styles.bodyLarge : styles.bodyMedium]}
          numberOfLines={isSmall ? 4 : isLarge ? 8 : 4}
        >
          {text}
        </Text>

        <View style={styles.footer}>
          {isLarge ? (
            <View style={{ gap: 6 }}>
              <Text style={styles.footerLabel}>Last updated · {formatTime(createdAt)}</Text>
              <View style={styles.accentBar} />
            </View>
          ) : (
            <Text style={styles.footerDate}>{formatDate(createdAt)}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
    shadowColor: "#1F1B4B",
    shadowOpacity: 0.25,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  sheen: {
    ...StyleSheet.absoluteFillObject,
  },
  rim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.35)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconPillWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconPillBlur: { ...StyleSheet.absoluteFillObject },
  iconPillTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  iconPillRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.55)",
  },
  labelPillWrap: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  labelPillBlur: { ...StyleSheet.absoluteFillObject },
  labelPillTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  labelPillRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.45)",
  },
  headerLabel: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  body: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  bodySmall: { fontSize: 15, lineHeight: 19 },
  bodyMedium: { fontSize: 18, lineHeight: 23 },
  bodyLarge: { fontSize: 22, lineHeight: 28 },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  footerLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "500",
  },
  footerDate: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "600",
  },
  accentBar: {
    height: 2,
    width: 56,
    borderRadius: 1,
    backgroundColor: "rgba(245, 158, 11, 0.95)",
  },
});

export default WidgetPreview;
