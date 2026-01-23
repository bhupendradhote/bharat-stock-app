import React, { useState } from 'react';
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

// --- Types ---
interface PlanFeature {
  label: string;
  value: boolean | string; // true=check, false=cross, string=text value
}

interface PricingPlan {
  id: string;
  title: string;
  price: string;
  subtitle: string;
  isRecommended?: boolean;
  features: PlanFeature[];
}

// --- Mock Data ---
const plans: PricingPlan[] = [
  {
    id: 'basic',
    title: 'Basic / Intraday',
    price: '₹5000',
    subtitle: 'inclusive of GST',
    features: [
      { label: 'Intraday Recommendations', value: true },
      { label: 'Short-Term/Medium-Term', value: false },
      { label: 'Options & Futures', value: false },
      { label: 'Commodity Tips', value: false },
      { label: 'Customer Support Priority', value: 'Standard' },
    ],
  },
  {
    id: 'standard',
    title: 'Standard',
    price: '₹15000',
    subtitle: 'inclusive of GST',
    isRecommended: true,
    features: [
      { label: 'Intraday Recommendations', value: true },
      { label: 'Short-Term/Medium-Term', value: true },
      { label: 'Options & Futures', value: false },
      { label: 'Commodity Tips', value: 'Optional' },
      { label: 'Customer Support Priority', value: 'Priority' },
    ],
  },
  {
    id: 'premium',
    title: 'Premium',
    price: '₹25000',
    subtitle: 'inclusive of GST',
    features: [
      { label: 'Intraday Recommendations', value: true },
      { label: 'Short-Term/Medium-Term', value: true },
      { label: 'Options & Futures', value: true },
      { label: 'Commodity Tips', value: true },
      { label: 'Customer Support Priority', value: 'Premium' },
    ],
  },
];

const PlanCard = ({ plan }: { plan: PricingPlan }) => {
  const [selectedDuration, setSelectedDuration] = useState('3 Months');
  const durations = ['3 Months', '6 Months', '1 Year'];

  return (
    <View style={styles.cardContainer}>
      {/* Recommended Banner */}
      {plan.isRecommended && (
        <View style={styles.recommendedBanner}>
          <Text style={styles.recommendedText}>Recommended Plan</Text>
        </View>
      )}

      <View style={[
        styles.card, 
        plan.isRecommended && styles.cardRecommended // Adjust border radius if needed
      ]}>
        
        {/* Title */}
        <Text style={styles.planTitle}>{plan.title}</Text>
        
        {/* Price Section */}
        <Text style={styles.priceText}>
          {plan.price} <Text style={styles.priceSubText}>({plan.subtitle})</Text>
        </Text>
        <Text style={styles.subscriptionLabel}>Monthly Subscription based</Text>

        {/* Duration Toggles */}
        <View style={styles.durationContainer}>
          {durations.map((d) => {
            const isActive = selectedDuration === d;
            return (
              <TouchableOpacity
                key={d}
                activeOpacity={0.8}
                onPress={() => setSelectedDuration(d)}
                style={[
                  styles.durationBtn,
                  isActive ? styles.durationBtnActive : styles.durationBtnInactive
                ]}
              >
                <Text style={[
                  styles.durationText,
                  isActive ? styles.durationTextActive : styles.durationTextInactive
                ]}>
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Features Text Link */}
        <Text style={styles.featuresHeader}>Features</Text>

        {/* Feature List */}
        <View style={styles.featuresList}>
          {plan.features.map((feat, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Text style={styles.featureLabel}>{feat.label}</Text>
              
              {/* Render Check, Cross, or Text Value */}
              <View style={styles.featureValueContainer}>
                {feat.value === true ? (
                  <Ionicons name="checkmark-sharp" size={18} color="#000" />
                ) : feat.value === false ? (
                  <Ionicons name="close-sharp" size={18} color="#000" />
                ) : (
                  <Text style={styles.featureValueText}>{feat.value as string}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Purchase Button */}
        <TouchableOpacity style={styles.purchaseBtn} activeOpacity={0.8}>
          <Text style={styles.purchaseBtnText}>Purchase Plan</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default function PricingPlans() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose a Plan</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
        {/* Extra space at bottom */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB', // Match bg
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
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },

  // --- Card Styles ---
  cardContainer: {
    marginBottom: 20,
    // Add shadow to the container usually
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: 'transparent',
  },
  recommendedBanner: {
    backgroundColor: '#005BC1',
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
    marginBottom: -2, // Pull card up slightly to connect
    zIndex: 1,
  },
  recommendedText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardRecommended: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderColor: '#005BC1', // Optional: blue border for recommended
    borderTopWidth: 0,
  },
  
  // Content inside Card
  planTitle: {
    fontSize: 20, //
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  priceSubText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
  },
  subscriptionLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 16,
  },
  
  // Duration Toggles
  durationContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  durationBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  durationBtnActive: {
    backgroundColor: '#005BC1',
    borderColor: '#005BC1',
  },
  durationBtnInactive: {
    backgroundColor: '#fff',
    borderColor: '#333',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  durationTextActive: {
    color: '#fff',
  },
  durationTextInactive: {
    color: '#000',
  },

  // Features
  featuresHeader: {
    fontSize: 12,
    textDecorationLine: 'underline',
    marginBottom: 12,
    color: '#333',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureLabel: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  featureValueContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  featureValueText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
  },

  // Button
  purchaseBtn: {
    backgroundColor: '#005BC1', //
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});