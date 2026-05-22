import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Link, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HistoryItem } from "@/components/HistoryItem";
import { WidgetPreview, WidgetSize } from "@/components/WidgetPreview";
import {
  CATEGORY_META,
  FocusCategory,
  useFocus,
} from "@/context/FocusContext";
import { useColors } from "@/hooks/useColors";

type FilterValue = "all" | FocusCategory;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "focus", label: "Focus" },
  { value: "goal", label: "Goal" },
  { value: "quote", label: "Quote" },
  { value: "reminder", label: "Reminder" },
];

const SIZES: WidgetSize[] = ["small", "medium", "large"];

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function HomeScreen() {
  const colors = useColors();
  const { current, history, activateHistoryItem } = useFocus();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [size, setSize] = useState<WidgetSize>("medium");

  const filteredHistory = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((it) => it.category === filter);
  }, [filter, history]);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={filteredHistory}
        keyExtractor={(it) => it.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.greeting, { color: colors.muted }]}>
                  {todayLabel()}
                </Text>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  Fokus
                </Text>
              </View>
              <Link href="/settings" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open settings"
                  style={({ pressed }) => [
                    styles.iconButton,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Ionicons name="settings-outline" size={20} color={colors.foreground} />
                </Pressable>
              </Link>
            </View>

            {current ? (
              <View
                style={[
                  styles.currentCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.currentHeader}>
                  <View
                    style={[styles.categoryBubble, { backgroundColor: colors.primary + "22" }]}
                  >
                    <Ionicons
                      name={CATEGORY_META[current.category].icon}
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.categoryLabel, { color: colors.primary }]}>
                    {CATEGORY_META[current.category].label.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.currentText, { color: colors.foreground }]}>
                  {current.text}
                </Text>
                <Link href="/edit" asChild>
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.editButton,
                      { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                    ]}
                  >
                    <Ionicons name="create-outline" size={16} color={colors.foreground} />
                    <Text style={[styles.editLabel, { color: colors.foreground }]}>Edit</Text>
                  </Pressable>
                </Link>
              </View>
            ) : (
              <View
                style={[
                  styles.emptyCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Ionicons name="sparkles" size={28} color={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  No focus yet today
                </Text>
                <Text style={[styles.emptyBody, { color: colors.muted }]}>
                  Pick one short anchor and we'll keep it on your home screen.
                </Text>
                <Link href="/edit" asChild>
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.primaryButton,
                      { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Text style={[styles.primaryButtonLabel, { color: colors.primaryFg }]}>
                      Set today's focus
                    </Text>
                  </Pressable>
                </Link>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Widget preview
                </Text>
                <Link href="/guide" asChild>
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.sectionLink, { opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text style={[styles.sectionLinkText, { color: colors.primary }]}>
                      Add to home screen
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                  </Pressable>
                </Link>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sizeRow}
                contentContainerStyle={{ gap: 8 }}
              >
                {SIZES.map((s) => {
                  const active = s === size;
                  return (
                    <Pressable
                      key={s}
                      accessibilityRole="button"
                      onPress={() => setSize(s)}
                      style={({ pressed }) => [
                        styles.sizeChip,
                        {
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeChipLabel,
                          { color: active ? colors.primaryFg : colors.foreground },
                        ]}
                      >
                        {s[0].toUpperCase() + s.slice(1)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={styles.previewWrap}>
                <WidgetPreview size={size} item={current} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>History</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterRow}
                contentContainerStyle={{ gap: 8 }}
              >
                {FILTERS.map((f) => {
                  const active = f.value === filter;
                  return (
                    <Pressable
                      key={f.value}
                      accessibilityRole="button"
                      onPress={() => setFilter(f.value)}
                      style={({ pressed }) => [
                        styles.filterChip,
                        {
                          backgroundColor: active ? colors.primary : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                          opacity: pressed ? 0.85 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipLabel,
                          { color: active ? colors.primaryFg : colors.foreground },
                        ]}
                      >
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
            <HistoryItem item={item} onActivate={activateHistoryItem} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyHistory}>
            <Text style={[styles.emptyHistoryText, { color: colors.muted }]}>
              {history.length === 0
                ? "Saved focuses will appear here."
                : "Nothing in this category yet."}
            </Text>
          </View>
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Set a new focus"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
          router.push("/edit");
        }}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Ionicons name="add" size={28} color={colors.primaryFg} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { paddingBottom: 120 },
  headerWrap: { paddingTop: 8, gap: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  greeting: { fontSize: 13 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.4 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  currentCard: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  currentHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  categoryBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  currentText: { fontSize: 22, fontWeight: "700", lineHeight: 28 },
  editButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  editLabel: { fontSize: 13, fontWeight: "600" },
  emptyCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyBody: { textAlign: "center", fontSize: 14 },
  primaryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonLabel: { fontSize: 15, fontWeight: "700" },
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", paddingHorizontal: 20 },
  sectionLink: { flexDirection: "row", alignItems: "center", gap: 2 },
  sectionLinkText: { fontSize: 13, fontWeight: "600" },
  sizeRow: { paddingHorizontal: 20 },
  sizeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sizeChipLabel: { fontSize: 13, fontWeight: "600" },
  previewWrap: { alignItems: "center", paddingVertical: 8 },
  filterRow: { paddingHorizontal: 20 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterChipLabel: { fontSize: 13, fontWeight: "600" },
  emptyHistory: { paddingHorizontal: 20, paddingVertical: 24, alignItems: "center" },
  emptyHistoryText: { fontSize: 13 },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
