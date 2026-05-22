import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { GlassSurface } from "@/components/GlassSurface";
import { WidgetPreview } from "@/components/WidgetPreview";
import { useFocus, type IoniconName } from "@/context/FocusContext";
import { useColors } from "@/hooks/useColors";

const STEPS: { title: string; body: string; icon: IoniconName }[] = [
  {
    title: "Long-press your home screen",
    body: "Press and hold an empty spot until the icons start to jiggle.",
    icon: "finger-print",
  },
  {
    title: 'Tap the "+" button',
    body: 'The "+" appears in the top-left corner. Tap it to open the widget gallery.',
    icon: "add-circle",
  },
  {
    title: 'Search for "Fokus"',
    body: 'Type "Fokus" in the search bar or scroll down to find it in the list.',
    icon: "search",
  },
  {
    title: "Pick a size",
    body: "Swipe between Small, Medium, and Large. Pick whichever fits best on your screen.",
    icon: "resize",
  },
  {
    title: 'Tap "Add Widget"',
    body: "Drop it anywhere on your home screen. Your current focus will appear immediately.",
    icon: "checkmark-circle",
  },
];

export default function GuideScreen() {
  const colors = useColors();
  const { current } = useFocus();
  const iconTint =
    colors.scheme === "dark" ? "rgba(165,180,252,0.18)" : "rgba(79,70,229,0.12)";

  return (
    <View style={styles.root}>
      <AmbientBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.previewWrap}>
          <WidgetPreview size="medium" item={current} />
        </View>

        <Text style={[styles.intro, { color: colors.muted }]}>
          Add the Fokus widget to your home screen so your daily anchor is always one glance away.
        </Text>

        <View style={styles.steps}>
          {STEPS.map((step, idx) => (
            <GlassSurface key={step.title} radius={18} intensity="regular" style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: iconTint }]}>
                <Text style={[styles.stepNumberText, { color: colors.primary }]}>
                  {idx + 1}
                </Text>
              </View>
              <View style={styles.stepBody}>
                <View style={styles.stepTitleRow}>
                  <Ionicons name={step.icon} size={16} color={colors.primary} />
                  <Text style={[styles.stepTitle, { color: colors.foreground }]}>
                    {step.title}
                  </Text>
                </View>
                <Text style={[styles.stepText, { color: colors.muted }]}>{step.body}</Text>
              </View>
            </GlassSurface>
          ))}
        </View>

        <GlassSurface radius={18} intensity="thick" tinted style={styles.tip}>
          <Ionicons name="bulb" size={18} color={colors.accent} />
          <Text style={[styles.tipText, { color: colors.foreground }]}>
            The widget refreshes automatically whenever you save a new focus in the app.
          </Text>
        </GlassSurface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 48 },
  previewWrap: { alignItems: "center", paddingVertical: 8 },
  intro: { fontSize: 14, textAlign: "center" },
  steps: { gap: 10 },
  step: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { fontSize: 14, fontWeight: "800" },
  stepBody: { flex: 1, gap: 4 },
  stepTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepTitle: { fontSize: 15, fontWeight: "700" },
  stepText: { fontSize: 13, lineHeight: 18 },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  tipText: { flex: 1, fontSize: 13 },
});
