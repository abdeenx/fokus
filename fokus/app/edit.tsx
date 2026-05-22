import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { GlassSurface } from "@/components/GlassSurface";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { WidgetPreview } from "@/components/WidgetPreview";
import {
  CATEGORY_META,
  FocusCategory,
  useFocus,
} from "@/context/FocusContext";
import { useColors } from "@/hooks/useColors";

const MAX_LENGTH = 140;
const CATEGORIES: FocusCategory[] = ["focus", "goal", "quote", "reminder"];

export default function EditScreen() {
  const colors = useColors();
  const { current, setFocus } = useFocus();
  const [text, setText] = useState<string>(current?.text ?? "");
  const [category, setCategory] = useState<FocusCategory>(current?.category ?? "focus");
  const [isSaving, setIsSaving] = useState(false);

  const trimmed = text.trim();
  const canSave = trimmed.length > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await setFocus(trimmed, category);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <AmbientBackdrop />
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content}>
          <View style={styles.previewWrap}>
            <WidgetPreview
              size="medium"
              previewText={trimmed || "Set today's focus"}
              previewCategory={category}
            />
          </View>

          <GlassSurface radius={22} intensity="thick" tinted style={styles.card}>
            <Text style={[styles.label, { color: colors.muted }]}>YOUR FOCUS</Text>
            <TextInput
              value={text}
              onChangeText={(value) => setText(value.slice(0, MAX_LENGTH))}
              placeholder="What are you focusing on today?"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={MAX_LENGTH}
              style={[styles.input, { color: colors.foreground }]}
              autoFocus
            />
            <Text style={[styles.counter, { color: colors.muted }]}>
              {trimmed.length}/{MAX_LENGTH}
            </Text>
          </GlassSurface>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Category</Text>
          <View style={styles.grid}>
            {CATEGORIES.map((c) => {
              const meta = CATEGORY_META[c];
              const active = c === category;
              return (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => undefined);
                    setCategory(c);
                  }}
                  style={styles.tileWrap}
                >
                  {({ pressed }) =>
                    active ? (
                      <LinearGradient
                        colors={colors.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.tile,
                          styles.tileActive,
                          { opacity: pressed ? 0.9 : 1 },
                        ]}
                      >
                        <View style={styles.tileRim} pointerEvents="none" />
                        <Ionicons name={meta.icon} size={22} color="#FFFFFF" />
                        <Text style={[styles.tileLabel, { color: "#FFFFFF" }]}>
                          {meta.label}
                        </Text>
                        <Text style={[styles.tileDesc, { color: "rgba(255,255,255,0.8)" }]}>
                          {meta.description}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <GlassSurface
                        radius={18}
                        intensity="regular"
                        style={[styles.tile, { opacity: pressed ? 0.85 : 1 }]}
                      >
                        <Ionicons name={meta.icon} size={22} color={colors.primary} />
                        <Text style={[styles.tileLabel, { color: colors.foreground }]}>
                          {meta.label}
                        </Text>
                        <Text style={[styles.tileDesc, { color: colors.muted }]}>
                          {meta.description}
                        </Text>
                      </GlassSurface>
                    )
                  }
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={handleSave}
            style={styles.saveWrap}
          >
            {({ pressed }) =>
              canSave ? (
                <LinearGradient
                  colors={colors.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.saveButton, { opacity: pressed ? 0.9 : 1 }]}
                >
                  <View style={styles.saveRim} pointerEvents="none" />
                  <Text style={[styles.saveLabel, { color: "#FFFFFF" }]}>
                    {isSaving ? "Saving…" : "Save focus"}
                  </Text>
                </LinearGradient>
              ) : (
                <GlassSurface radius={16} intensity="thin" style={styles.saveButton}>
                  <Text style={[styles.saveLabel, { color: colors.muted }]}>
                    Save focus
                  </Text>
                </GlassSurface>
              )
            }
          </Pressable>
        </KeyboardAwareScrollViewCompat>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: 20, gap: 18 },
  previewWrap: { alignItems: "center", paddingVertical: 4 },
  card: {
    padding: 18,
    gap: 8,
  },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  input: {
    minHeight: 100,
    fontSize: 19,
    fontWeight: "600",
    textAlignVertical: "top",
    letterSpacing: -0.1,
  },
  counter: { fontSize: 12, alignSelf: "flex-end" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 4, letterSpacing: -0.2 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tileWrap: {
    width: "48%",
    flexGrow: 1,
    minWidth: 140,
  },
  tile: {
    padding: 16,
    borderRadius: 18,
    gap: 6,
  },
  tileActive: {
    overflow: "hidden",
  },
  tileRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.5)",
  },
  tileLabel: { fontSize: 15, fontWeight: "700" },
  tileDesc: { fontSize: 12 },
  saveWrap: {
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#4F46E5",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  saveRim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.5)",
  },
  saveLabel: { fontSize: 16, fontWeight: "700" },
});
