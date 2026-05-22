import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { GlassSurface } from "@/components/GlassSurface";
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
  const {
    current,
    history,
    activateHistoryItem,
    liveActivityPinned,
    pinToLockScreen,
    unpinFromLockScreen,
  } = useFocus();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [size, setSize] = useState<WidgetSize>("medium");

  const filteredHistory = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((it) => it.category === filter);
  }, [filter, history]);

  return (
    <View style={styles.root}>
      <AmbientBackdrop />
      <SafeAreaView edges={["top"]} style={styles.safe}>
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
                  <Text style={[styles.title, { color: colors.foreground }]}>Fokus</Text>
                </View>
                <Link href="/settings" asChild>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open settings"
                    hitSlop={8}
                  >
                    {({ pressed }) => (
                      <GlassSurface
                        radius={22}
                        intensity="regular"
                        style={[
                          styles.iconButton,
                          { opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <Ionicons
                          name="settings-outline"
                          size={20}
                          color={colors.foreground}
                        />
                      </GlassSurface>
                    )}
                  </Pressable>
                </Link>
              </View>

              {current ? (
                <GlassSurface radius={26} intensity="thick" tinted style={styles.currentCard}>
                  <View style={styles.currentHeader}>
                    <View
                      style={[
                        styles.categoryBubble,
                        {
                          backgroundColor:
                            colors.scheme === "dark"
                              ? "rgba(165,180,252,0.18)"
                              : "rgba(79,70,229,0.14)",
                        },
                      ]}
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
                  <View style={styles.cardActions}>
                    <Link href="/edit" asChild>
                      <Pressable accessibilityRole="button" hitSlop={6}>
                        {({ pressed }) => (
                          <GlassSurface
                            radius={14}
                            intensity="thin"
                            style={[
                              styles.editButton,
                              { opacity: pressed ? 0.7 : 1 },
                            ]}
                          >
                            <Ionicons
                              name="create-outline"
                              size={16}
                              color={colors.foreground}
                            />
                            <Text style={[styles.editLabel, { color: colors.foreground }]}>
                              Edit
                            </Text>
                          </GlassSurface>
                        )}
                      </Pressable>
                    </Link>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        liveActivityPinned
                          ? "Unpin from Lock Screen"
                          : "Pin to Lock Screen"
                      }
                      hitSlop={6}
                      onPress={() => {
                        Haptics.selectionAsync().catch(() => undefined);
                        if (liveActivityPinned) {
                          unpinFromLockScreen().catch(() => undefined);
                        } else {
                          pinToLockScreen().catch(() => undefined);
                        }
                      }}
                    >
                      {({ pressed }) =>
                        liveActivityPinned ? (
                          <LinearGradient
                            colors={colors.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                              styles.editButton,
                              styles.pinActive,
                              { opacity: pressed ? 0.9 : 1 },
                            ]}
                          >
                            <View style={styles.pinActiveRim} pointerEvents="none" />
                            <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
                            <Text style={[styles.editLabel, { color: "#FFFFFF" }]}>
                              Pinned
                            </Text>
                          </LinearGradient>
                        ) : (
                          <GlassSurface
                            radius={14}
                            intensity="thin"
                            style={[
                              styles.editButton,
                              { opacity: pressed ? 0.7 : 1 },
                            ]}
                          >
                            <Ionicons
                              name="lock-open-outline"
                              size={16}
                              color={colors.foreground}
                            />
                            <Text
                              style={[styles.editLabel, { color: colors.foreground }]}
                            >
                              Pin to Lock Screen
                            </Text>
                          </GlassSurface>
                        )
                      }
                    </Pressable>
                  </View>
                </GlassSurface>
              ) : (
                <GlassSurface radius={26} intensity="thick" tinted style={styles.emptyCard}>
                  <Ionicons name="sparkles" size={28} color={colors.primary} />
                  <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                    No focus yet today
                  </Text>
                  <Text style={[styles.emptyBody, { color: colors.muted }]}>
                    Pick one short anchor and we'll keep it on your home screen.
                  </Text>
                  <Link href="/edit" asChild>
                    <Pressable accessibilityRole="button" style={styles.primaryButtonWrap}>
                      {({ pressed }) => (
                        <LinearGradient
                          colors={colors.gradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={[
                            styles.primaryButton,
                            { opacity: pressed ? 0.9 : 1 },
                          ]}
                        >
                          <Text style={[styles.primaryButtonLabel, { color: "#FFFFFF" }]}>
                            Set today's focus
                          </Text>
                        </LinearGradient>
                      )}
                    </Pressable>
                  </Link>
                </GlassSurface>
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
                  contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
                >
                  {SIZES.map((s) => {
                    const active = s === size;
                    return (
                      <Pressable
                        key={s}
                        accessibilityRole="button"
                        onPress={() => setSize(s)}
                      >
                        {({ pressed }) =>
                          active ? (
                            <LinearGradient
                              colors={colors.gradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={[
                                styles.sizeChip,
                                styles.sizeChipActive,
                                { opacity: pressed ? 0.9 : 1 },
                              ]}
                            >
                              <Text style={[styles.sizeChipLabel, { color: "#FFFFFF" }]}>
                                {s[0].toUpperCase() + s.slice(1)}
                              </Text>
                            </LinearGradient>
                          ) : (
                            <GlassSurface
                              radius={999}
                              intensity="regular"
                              style={[styles.sizeChip, { opacity: pressed ? 0.85 : 1 }]}
                            >
                              <Text style={[styles.sizeChipLabel, { color: colors.foreground }]}>
                                {s[0].toUpperCase() + s.slice(1)}
                              </Text>
                            </GlassSurface>
                          )
                        }
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <View style={styles.previewWrap}>
                  <WidgetPreview size={size} item={current} />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  History
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterRow}
                  contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
                >
                  {FILTERS.map((f) => {
                    const active = f.value === filter;
                    return (
                      <Pressable
                        key={f.value}
                        accessibilityRole="button"
                        onPress={() => setFilter(f.value)}
                      >
                        {({ pressed }) =>
                          active ? (
                            <LinearGradient
                              colors={colors.gradient}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={[
                                styles.filterChip,
                                styles.filterChipActive,
                                { opacity: pressed ? 0.9 : 1 },
                              ]}
                            >
                              <Text style={[styles.filterChipLabel, { color: "#FFFFFF" }]}>
                                {f.label}
                              </Text>
                            </LinearGradient>
                          ) : (
                            <GlassSurface
                              radius={999}
                              intensity="regular"
                              style={[styles.filterChip, { opacity: pressed ? 0.85 : 1 }]}
                            >
                              <Text
                                style={[styles.filterChipLabel, { color: colors.foreground }]}
                              >
                                {f.label}
                              </Text>
                            </GlassSurface>
                          )
                        }
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
          style={styles.fabWrap}
        >
          {({ pressed }) => (
            <LinearGradient
              colors={colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.fab, { opacity: pressed ? 0.9 : 1 }]}
            >
              <View style={styles.fabRim} />
              <Ionicons name="add" size={28} color="#FFFFFF" />
            </LinearGradient>
          )}
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  list: { paddingBottom: 140 },
  headerWrap: { paddingTop: 8, gap: 18 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  greeting: { fontSize: 13, letterSpacing: 0.2 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.6 },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  currentCard: {
    marginHorizontal: 20,
    padding: 20,
    gap: 14,
  },
  currentHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  categoryBubble: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  currentText: { fontSize: 24, fontWeight: "700", lineHeight: 30, letterSpacing: -0.2 },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pinActive: {
    borderRadius: 14,
    overflow: "hidden",
  },
  pinActiveRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.5)",
  },
  editLabel: { fontSize: 13, fontWeight: "600" },
  emptyCard: {
    marginHorizontal: 20,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyBody: { textAlign: "center", fontSize: 14 },
  primaryButtonWrap: { marginTop: 8, borderRadius: 14, overflow: "hidden" },
  primaryButton: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
  },
  primaryButtonLabel: { fontSize: 15, fontWeight: "700" },
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", paddingHorizontal: 20, letterSpacing: -0.2 },
  sectionLink: { flexDirection: "row", alignItems: "center", gap: 2 },
  sectionLinkText: { fontSize: 13, fontWeight: "600" },
  sizeRow: {},
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeChipActive: { borderRadius: 999 },
  sizeChipLabel: { fontSize: 13, fontWeight: "600" },
  previewWrap: { alignItems: "center", paddingVertical: 8 },
  filterRow: {},
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: { borderRadius: 999 },
  filterChipLabel: { fontSize: 13, fontWeight: "600" },
  emptyHistory: { paddingHorizontal: 20, paddingVertical: 24, alignItems: "center" },
  emptyHistoryText: { fontSize: 13 },
  fabWrap: {
    position: "absolute",
    bottom: 30,
    right: 24,
    borderRadius: 32,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fabRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.6)",
  },
});
