import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function AnnouncementDetails() {
  const router = useRouter();
  // We can retrieve dynamic params passed from the list page here
  const params = useLocalSearchParams();

  // Fallback data if no params are passed (Matches the provided image exactly)
  const data = {
    title: params.title || 'Planned maintenance window',
    date: params.date || '30 Nov 2025',
    tag: params.tag || 'Info update',
    bodyTitle: 'Maintenance window',
    bodyText: 'Scheduled between 11.30 PM and 12.30 PM on Sunday night. During the time:',
    bullets: [
      'Exist logged-in users may experience brief disconnects',
      'New logins and KYC documents uploads may be temporarily unavailable.',
    ],
    footer: 'If the update impact you and you have a question, you can raise a ticket from the Support & Complaints page.',
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Configure Screen Header to be hidden since we build a custom one */}
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Header Section */}
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.meta}>
            {data.date} • <Text style={styles.metaTag}>{data.tag}</Text>
          </Text>

          {/* Body Section */}
          <Text style={styles.sectionHeader}>{data.bodyTitle}</Text>
          <Text style={styles.bodyText}>{data.bodyText}</Text>

          {/* Bullet Points */}
          <View style={styles.bulletContainer}>
            {data.bullets.map((point, index) => (
              <View key={index} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{point}</Text>
              </View>
            ))}
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>{data.footer}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background matching the app theme
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    // Soft shadow for the button
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Card Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 500, // Gives it that long card feel
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  meta: {
    fontSize: 13,
    color: '#9CA3AF', // Gray-400
    fontWeight: '500',
    marginBottom: 24,
  },
  metaTag: {
    color: '#9CA3AF',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151', // Gray-700
    marginBottom: 16,
  },
  bulletContainer: {
    marginBottom: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletDot: {
    fontSize: 18,
    lineHeight: 24,
    color: '#374151',
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  footerNote: {
    fontSize: 13,
    lineHeight: 20,
    color: '#D1D5DB', // Light Gray (Gray-300) matching the faint text in image
    marginTop: 10,
  },
});