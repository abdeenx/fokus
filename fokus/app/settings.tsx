import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Link } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { GlassSurface } from "@/components/GlassSurface";
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
    <View style={styles.root}>
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.muted }]}>DATA</Text>
          <Pressable accessibilityRole="button" onPress={onClear}>
            {({ pressed }) => (
              <GlassSurface
                radius={18}
                intensity="regular"
                style={[styles.row, { opacity: pressed ? 0.75 : 1 }]}
              >
                <View
                  style={[
                    styles.iconBubble,
                    { backgroundColor: "rgba(220,38,38,0.12)" },
                  ]}
                >
                  <Ionicons name="trash" size={18} color="#DC2626" />
                </View>
                <Text style={[styles.rowLabel, { color: colors.foreground }]}>
                  Clear history
                </Text>
                <Text style={[styles.rowMeta, { color: colors.muted }]}>
                  {history.length} items
                </Text>
              </GlassSurface>
            )}
          </Pressable>
        </View>

        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.muted }]}>WIDGET</Text>
          <Link href="/guide" asChild>
            <Pressable accessibilityRole="button">
              {({ pressed }) => (
                <GlassSurface
                  radius={18}
                  intensity="regular"
                  style={[styles.row, { opacity: pressed ? 0.75 : 1 }]}
                >
                  <View
                    style={[
                      styles.iconBubble,
                      {
                        backgroundColor:
                          colors.scheme === "dark"
                            ? "rgba(165,180,252,0.18)"
                            : "rgba(79,70,229,0.12)",
                      },
                    ]}
                  >
                    <Ionicons name="apps" size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.rowLabel, { color: colors.foreground }]}>
                    Add widget to home screen
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </GlassSurface>
              )}
            </Pressable>
          </Link>
        </View>

        <View style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.muted }]}>ABOUT</Text>
          <GlassSurface radius={22} intensity="thick" tinted style={styles.about}>
            <Text style={[styles.aboutTitle, { color: colors.foreground }]}>Fokus</Text>
            <Text style={[styles.aboutBody, { color: colors.muted }]}>
              One short anchor for your day, always visible on your iPhone home screen.
            </Text>
            <Text style={[styles.aboutVersion, { color: colors.muted }]}>
              Version {version}
            </Text>
          </GlassSurface>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 20, paddingBottom: 48 },
  group: { gap: 10 },
  groupLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  iconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  rowMeta: { fontSize: 13 },
  about: {
    padding: 18,
    gap: 6,
  },
  aboutTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  aboutBody: { fontSize: 14, lineHeight: 19 },
  aboutVersion: { fontSize: 12, marginTop: 4 },
});
