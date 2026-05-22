import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CATEGORY_META, FocusItem } from "@/context/FocusContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  item: FocusItem;
  onActivate: (id: string) => void;
}

function relativeTime(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diff = Math.max(0, now - then);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function HistoryItem({ item, onActivate }: Props) {
  const colors = useColors();
  const meta = CATEGORY_META[item.category];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Activate ${meta.label}: ${item.text}`}
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onActivate(item.id);
      }}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconBubble,
          { backgroundColor: colors.primary + "22" },
        ]}
      >
        <Ionicons name={meta.icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.text, { color: colors.foreground }]} numberOfLines={2}>
          {item.text}
        </Text>
        <Text style={[styles.meta, { color: colors.muted }]}>
          {meta.label} · {relativeTime(item.createdAt)}
        </Text>
      </View>
      <Ionicons name="arrow-up-circle" size={22} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: 4,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    fontSize: 12,
  },
});

export default HistoryItem;
