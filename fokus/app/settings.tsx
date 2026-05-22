import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Link } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocus } from "@/context/FocusContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const { clearHistory, history } = useFocus();

  const onClear = () => {
    if (history.length === 0) {
      Alert.alert("Nothing to clear", "Your history is already empty.");
      return;
    }
    Alert.alert(
      "Clear history?",
      "This removes every saved focus from your history. Your current focus stays.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearHistory().catch(() => undefined);
          },
        },
      ],
    );
  };

  const version = (Constants.expoConfig as { version?: string } | null)?.version ?? "1.0.0";

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: colors.muted }]}>DATA</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onClear}
          style={({ pressed }) => [
            styles.row,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="trash" size={20} color="#DC2626" />
          <Text style={[styles.rowLabel, { color: colors.foreground }]}>Clear history</Text>
          <Text style={[styles.rowMeta, { color: colors.muted }]}>{history.length} items</Text>
        </Pressable>
      </View>

      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: colors.muted }]}>WIDGET</Text>
        <Link href="/guide" asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="apps" size={20} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>
              Add widget to home screen
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </Link>
      </View>

      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: colors.muted }]}>ABOUT</Text>
        <View
          style={[
            styles.about,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.aboutTitle, { color: colors.foreground }]}>Fokus</Text>
          <Text style={[styles.aboutBody, { color: colors.muted }]}>
            One short anchor for your day, always visible on your iPhone home screen.
          </Text>
          <Text style={[styles.aboutVersion, { color: colors.muted }]}>Version {version}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 48 },
  group: { gap: 8 },
  groupLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  rowMeta: { fontSize: 13 },
  about: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  aboutTitle: { fontSize: 18, fontWeight: "800" },
  aboutBody: { fontSize: 13, lineHeight: 18 },
  aboutVersion: { fontSize: 12, marginTop: 4 },
});
