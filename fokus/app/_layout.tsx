import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FocusProvider } from "@/context/FocusContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <FocusProvider>
          <StatusBar style="auto" />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="edit"
              options={{
                presentation: "modal",
                title: "Set focus",
                headerLargeTitle: false,
              }}
            />
            <Stack.Screen name="guide" options={{ title: "Add widget" }} />
            <Stack.Screen name="settings" options={{ title: "Settings" }} />
            <Stack.Screen name="+not-found" options={{ title: "Not found" }} />
          </Stack>
        </FocusProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
