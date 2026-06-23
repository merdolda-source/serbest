import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useTabAdCounter } from "@/hooks/useTabAdCounter";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { registerTabSwitch } = useTabAdCounter();

  const tabListeners = { tabPress: registerTabSwitch };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
        listeners={tabListeners}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Arama",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} />,
        }}
        listeners={tabListeners}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Bildirimler",
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications" color={color} size={size} />,
        }}
        listeners={tabListeners}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
        listeners={tabListeners}
      />
    </Tabs>
  );
}
