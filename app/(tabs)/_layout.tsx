import { Tabs } from "expo-router";
import React from "react";
import { MaterialIcons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="index" 
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      {/* Latest News */}
      <Tabs.Screen
        name="latest-news"
        options={{
          title: "Latest News",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="newspaper" size={size ?? 26} color={color} />
          ),
        }}
      />

      {/* Announcements */}
      <Tabs.Screen
        name="announcements"
        options={{
          title: "Announcement",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="campaign" size={size ?? 26} color={color} />
          ),
        }}
      />

      {/* Home (Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size ?? 26} color={color} />
          ),
        }}
      />

      {/* Market Calls */}
      <Tabs.Screen
        name="market-calls"
        options={{
          title: "Market Calls",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="show-chart" size={size ?? 26} color={color} />
          ),
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size ?? 26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}