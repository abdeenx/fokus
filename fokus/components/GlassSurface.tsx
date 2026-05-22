import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

type GlassIntensity = "thin" | "regular" | "thick";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: GlassIntensity;
  radius?: number;
  tinted?: boolean;
}

const NUMERIC_INTENSITY: Record<GlassIntensity, number> = {
  thin: 28,
  regular: 50,
  thick: 80,
};

/**
 * GlassSurface — Liquid-Glass style container.
 *
 * Uses `expo-blur`'s native backdrop blur on iOS, falls back to a translucent
 * tinted layer elsewhere. Adds a soft white edge highlight (1px border with
 * low-opacity white) which is what gives Liquid Glass its luminous rim.
 */
export function GlassSurface({
  children,
  style,
  intensity = "regular",
  radius = 22,
  tinted = false,
}: Props) {
  const colors = useColors();
  const isDark = colors.scheme === "dark";

  const tintColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.45)";
  const edgeColor = isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.70)";
  const tintOverlay = tinted
    ? (isDark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.06)")
    : "transparent";

  // expo-blur supports a `tint` prop with semantic values. We blend that with
  // an additional overlay so dark mode reads as glass rather than gray.
  const blurTint: "default" | "light" | "dark" | "systemThinMaterial" =
    Platform.OS === "ios" ? "systemThinMaterial" : isDark ? "dark" : "light";

  return (
    <View
      style={[
        styles.wrap,
        {
          borderRadius: radius,
          shadowColor: isDark ? "#000" : "#1F1B4B",
        },
        style,
      ]}
    >
      <BlurView
        intensity={NUMERIC_INTENSITY[intensity]}
        tint={blurTint}
        style={[styles.blur, { borderRadius: radius }]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.tint,
          { backgroundColor: tintColor, borderRadius: radius },
        ]}
      />
      {tinted ? (
        <View
          pointerEvents="none"
          style={[
            styles.tint,
            { backgroundColor: tintOverlay, borderRadius: radius },
          ]}
        />
      ) : null}
      <View
        pointerEvents="none"
        style={[
          styles.edge,
          {
            borderRadius: radius,
            borderColor: edgeColor,
          },
        ]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  blur: { ...StyleSheet.absoluteFillObject },
  tint: { ...StyleSheet.absoluteFillObject },
  edge: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
  },
  content: { position: "relative" },
});

export default GlassSurface;
