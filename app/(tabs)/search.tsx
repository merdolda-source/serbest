import React, { useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { ThemedView } from "@/components/Themed";
import { ContentCard } from "@/components/ContentCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingView } from "@/components/LoadingView";
import { useTheme } from "@/hooks/useTheme";
import { searchContents } from "@/services/contentService";
import type { Content } from "@/utils/types";

export default function SearchScreen() {
  const { colors } = useTheme();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Content[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string) => {
    setTerm(value);
    if (!value.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    searchContents(value)
      .then(setResults)
      .finally(() => setLoading(false));
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={styles.searchBar}>
        <TextInput
          value={term}
          onChangeText={handleChange}
          placeholder="Haber, spor, ekonomi, magazin ara..."
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        />
      </View>

      {loading && <LoadingView />}
      {!loading && results !== null && results.length === 0 && (
        <EmptyState message="Sonuç bulunamadı." />
      )}
      {!loading && results === null && (
        <EmptyState message="Aramak için yukarıya bir şey yazın." />
      )}
      {!loading && results && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContentCard content={item} />}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  searchBar: { padding: 16 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
});
