import React from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { ThemedText } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { CATEGORIES } from "@/constants/categories";
import type { CategorySlug } from "@/utils/types";

interface CategoryFilterProps {
  selected: CategorySlug | "all";
  onSelect: (category: CategorySlug | "all") => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { colors } = useTheme();
  const options: { slug: CategorySlug | "all"; label: string }[] = [
    { slug: "all", label: "Tümü" },
    ...CATEGORIES,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const isActive = option.slug === selected;
        return (
          <Pressable
            key={option.slug}
            onPress={() => onSelect(option.slug)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <ThemedText style={isActive ? styles.activeLabel : undefined}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8, paddingVertical: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  activeLabel: { color: "#FFFFFF", fontWeight: "700" },
});
