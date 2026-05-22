import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

interface Props extends ScrollViewProps {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function KeyboardAwareScrollViewCompat({
  children,
  containerStyle,
  contentContainerStyle,
  ...rest
}: Props) {
  return (
    <KeyboardAvoidingView
      style={[styles.flex, containerStyle]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, contentContainerStyle]}
        {...rest}
      >
        <View>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 32 },
});

export default KeyboardAwareScrollViewCompat;
