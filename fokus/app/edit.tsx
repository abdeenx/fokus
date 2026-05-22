import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["bottom"]}>
      <KeyboardAwareScrollViewCompat contentContainerStyle={styles.content}>
        <View style={styles.previewWrap}>
          <WidgetPreview size="medium" previewText={trimmed || "Set today's focus"} previewCategory={category} />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
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
        </View>

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
                style={({ pressed }) => [
                  styles.tile,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={meta.icon}
                  size={22}
                  color={active ? colors.primaryFg : colors.primary}
                />
                <Text
                  style={[
                    styles.tileLabel,
                    { color: active ? colors.primaryFg : colors.foreground },
                  ]}
                >
                  {meta.label}
                </Text>
                <Text
                  style={[
                    styles.tileDesc,
                    {
                      color: active ? colors.primaryFg + "CC" : colors.muted,
                    },
                  ]}
                >
                  {meta.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: canSave ? colors.primary : colors.border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.saveLabel,
              { color: canSave ? colors.primaryFg : colors.muted },
            ]}
          >
            {isSaving ? "Saving…" : "Save focus"}
          </Text>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 20, gap: 16 },
  previewWrap: { alignItems: "center", paddingVertical: 4 },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.6 },
  input: {
    minHeight: 96,
    fontSize: 18,
    fontWeight: "600",
    textAlignVertical: "top",
  },
  counter: { fontSize: 12, alignSelf: "flex-end" },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    width: "48%",
    flexGrow: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    minWidth: 140,
  },
  tileLabel: { fontSize: 15, fontWeight: "700" },
  tileDesc: { fontSize: 12 },
  saveButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveLabel: { fontSize: 16, fontWeight: "700" },
});
