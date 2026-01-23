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
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

export default function PaymentAndInvoices() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
          <View style={styles.card}>
        <Text style={styles.pageTitle}>Payment & Invoices</Text>
        <Text style={styles.pageSubtitle}>
          Manage your subscriptions, view past payments, and securely download invoices.
        </Text>

          <Text style={styles.cardHeader}>Current Plan Summary</Text>
          
          <Text style={styles.planName}>Premium</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Validity</Text>
            <Text style={styles.value}>3 Months</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Validity Till</Text>
            <Text style={styles.value}>12 Dec 2025</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>Active</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.primaryButton}
             onPress={() => router.push('/pages/settingsInnerPages/pricingPlans')}>
              <Text style={styles.buttonText}>Upgrade Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton}
             onPress={() => router.push('/pages/settingsInnerPages/pricingPlans')}>
              <Text style={styles.buttonText}>Renew Plan</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.linkRow} 
            onPress={() => router.push('/pages/settingsInnerPages/paymentHistory')}
          >
            <MaterialIcons name="history" size={20} color="#000" style={styles.icon} />
            <Text style={styles.linkText}>Payment History and Invoice</Text>
            <Ionicons name="chevron-forward" size={16} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkRow}
            onPress={() => router.push('/pages/settingsInnerPages/legalDisclaimer')}
          >
            <Feather name="file-text" size={20} color="#000" style={styles.icon} />
            <Text style={styles.linkText}>Legal Disclaimer</Text>
            <Ionicons name="chevron-forward" size={16} color="#000" />
          </TouchableOpacity>

          {/* Renewal Reminder Section */}
          <View style={styles.reminderSection}>
            <Text style={styles.reminderTitle}>Renewal Reminder</Text>
            <Text style={styles.reminderText}>
              <Ionicons name="warning-outline" size={14} color="#000" /> Your plan expires soon. Renew now to continue receiving Market Calls.
            </Text>
            <TouchableOpacity>
              <Text style={styles.renewLink}>[ Renew Plan ]</Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerRow: {
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  
  // Titles
  pageTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#000000', 
    lineHeight: 18,
    marginBottom: 24,
  },

  // Main Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D9D9D9', 
  },
  cardHeader: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
    marginBottom: 16,
  },
  
  // Details
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
  value: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },

  // Buttons
  buttonGroup: {
    marginTop: 12,
    marginBottom: 24,
    gap: 12, 
  },
  primaryButton: {
    backgroundColor: '#005BC1', 
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    width: 140, 
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },

  // Link Rows
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  icon: {
    marginRight: 12,
  },
  linkText: {
    flex: 1, 
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },

  // Renewal Section
  reminderSection: {
    marginTop: 24,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 13,
    color: '#1F2937', 
    lineHeight: 18,
    marginBottom: 8,
  },
  renewLink: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
});