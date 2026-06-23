import React from "react";
import { Text, View, type TextProps, type ViewProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function ThemedView({ style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return <View style={[{ backgroundColor: colors.background }, style]} {...rest} />;
}

export function ThemedSurface({ style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }, style]}
      {...rest}
    />
  );
}

export function ThemedText({
  style,
  muted,
  ...rest
}: TextProps & { muted?: boolean }) {
  const { colors } = useTheme();
  return <Text style={[{ color: muted ? colors.textMuted : colors.text }, style]} {...rest} />;
}
