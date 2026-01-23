import { Tabs } from "expo-router";
import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Modal, Platform, TouchableWithoutFeedback } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

import Chat from "@/components/includes/chat"; 

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = Colors[colorScheme ?? "light"].tint;

  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* 1. The Tab Navigation */}
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: activeColor,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="latest-news"
          options={{
            title: "Latest News",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="newspaper" size={size ?? 26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="announcements"
          options={{
            title: "Announcement",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="campaign" size={size ?? 26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="dashboard" size={size ?? 26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="market-calls"
          options={{
            title: "Market Calls",
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="show-chart" size={size ?? 26} color={color} />
            ),
          }}
        />
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

      {/* 2. Floating Chat Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: activeColor }]}
        onPress={() => setIsChatOpen(true)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="chat" size={28} color="white" />
      </TouchableOpacity>

      {/* 3. Bottom Sheet Modal */}
      <Modal
        animationType="slide"
        transparent={true} // REQUIRED for the half-height effect
        visible={isChatOpen}
        onRequestClose={() => setIsChatOpen(false)}
      >
        {/* Semi-transparent background overlay */}
        <View style={styles.modalOverlay}>
            
            {/* Invisible touch area to close modal when clicking outside */}
            <TouchableWithoutFeedback onPress={() => setIsChatOpen(false)}>
                <View style={styles.modalBackdrop} />
            </TouchableWithoutFeedback>

            {/* The Actual White Container (Half Height) */}
            <View style={styles.modalContainer}>
                {/* Drag Handle (Visual Indicator) */}
                <View >
                    <View  />
                </View>

                {/* Chat Component */}
                <Chat />

                {/* Close Button (Absolute inside the white box) */}
                <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => setIsChatOpen(false)}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="close" size={22} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 110, 
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dimmed background
    justifyContent: 'flex-end', // Pushes content to bottom
  },
  modalBackdrop: {
    flex: 1, // Takes up remaining space above the modalContainer
  },
  modalContainer: {
    backgroundColor: "#fff",
    height: '90%',
    width: '100%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    // overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  


  // --- Close Button ---
  closeButton: {
    position: 'absolute',
    top: -32, 
    right: 10,
    zIndex: 99999,
    width: 30,
    height: 30,
    borderRadius: 18,
    backgroundColor: '#f5f5f5', // Slightly gray to stand out on white
    justifyContent: 'center',
    alignItems: 'center',
  }
});