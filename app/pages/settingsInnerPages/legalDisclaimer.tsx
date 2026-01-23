import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

export default function LegalDisclaimer() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Disclaimer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: 20 Sep 2025</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>1. General Information</Text>
          <Text style={styles.paragraph}>
            The information provided on Bharat Stock App is for educational and informational purposes only. It should not be considered as financial advice.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. Market Risks</Text>
          <Text style={styles.paragraph}>
            Stock trading and investments are subject to market risks. Please read all scheme-related documents carefully before investing. Past performance is not indicative of future results.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. No Guarantee</Text>
          <Text style={styles.paragraph}>
            While we strive to provide accurate data, we do not guarantee the accuracy, completeness, or timeliness of the information. Users are advised to verify information with certified financial advisors.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. User Responsibility</Text>
          <Text style={styles.paragraph}>
            You agree that any trading decisions you make are your own responsibility. Bharat Stock App and its owners will not be held liable for any losses incurred.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    textAlign: 'justify',
  },
});