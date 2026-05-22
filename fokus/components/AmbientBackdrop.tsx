import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

/**
 * AmbientBackdrop — soft colored "auroras" behind glass surfaces.
 *
 * Liquid Glass leans on color showing through translucent materials. This
 * paints three large, low-opacity gradients across the screen so any glass
 * surface above it picks up a subtle chromatic shift.
 */
export function AmbientBackdrop() {
  const colors = useColors();
  const [a, b, c] = colors.ambient;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
      <LinearGradient
        colors={[a, "transparent"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.6 }}
        style={[styles.blob, { top: -120, left: -60, width: 360, height: 360 }]}
      />
      <LinearGradient
        colors={[b, "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.blob, { top: 180, right: -80, width: 320, height: 320 }]}
      />
      <LinearGradient
        colors={[c, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.blob, { bottom: -100, left: 40, width: 340, height: 340 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    borderRadius: 9999,
    opacity: 0.55,
  },
});

export default AmbientBackdrop;
