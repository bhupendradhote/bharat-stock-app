import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import pricingServices from '@/services/api/methods/pricingServices'; // adjust alias/path if needed

interface ApiFeature {
  id?: number | string;
  svg_icon?: string | null;
  text?: string | null;
}

interface ApiDuration {
  id?: number | string;
  duration: string; // e.g. "3 Months"
  price: number | string;
  features?: ApiFeature[];
}

// Backend service plan
interface ApiServicePlan {
  id: number | string;
  name: string;
  tagline?: string | null;
  featured?: number | boolean;
  status?: number | boolean;
  sort_order?: number;
  button_text?: string | null;
  durations?: ApiDuration[];
}

interface UIPricingDuration {
  label: string;
  price: number | string;
  priceText: string;
  features: ApiFeature[];
}

interface UIPricingPlan {
  id: string;
  title: string;
  subtitle?: string;
  isRecommended?: boolean;
  buttonText?: string;
  durations: UIPricingDuration[];
}

const PlanCard = ({ plan }: { plan: UIPricingPlan }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const durations = plan.durations ?? [];
  const activeDuration = durations[selectedIndex] ?? (durations[0] ?? null);

  return (
    <View style={styles.cardContainer}>
      {plan.isRecommended && (
        <View style={styles.recommendedBanner}>
          <Text style={styles.recommendedText}>Recommended Plan</Text>
        </View>
      )}

      <View
        style={[
          styles.card,
          plan.isRecommended && styles.cardRecommended, // same look as before
        ]}
      >
        <Text style={styles.planTitle}>{plan.title}</Text>

        <Text style={styles.priceText}>
          {activeDuration ? activeDuration.priceText : '—'}{' '}
        </Text>
        <Text style={styles.priceSubText}>({plan.subtitle ?? ''})</Text>
        {/* Duration Toggles */}
        <View style={styles.durationContainer}>
          {durations.map((d, idx) => {
            const isActive = selectedIndex === idx;
            return (
              <TouchableOpacity
                key={`${plan.id}-dur-${idx}`}
                activeOpacity={0.8}
                onPress={() => setSelectedIndex(idx)}
                style={[
                  styles.durationBtn,
                  isActive ? styles.durationBtnActive : styles.durationBtnInactive,
                ]}
              >
                <Text
                  style={[
                    styles.durationText,
                    isActive ? styles.durationTextActive : styles.durationTextInactive,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.featuresHeader}>Features</Text>

        <View style={styles.featuresList}>
          {(activeDuration?.features ?? []).map((feat, idx) => (
            <View key={`${plan.id}-feat-${idx}`} style={styles.featureRow}>
              <Text style={styles.featureLabel}>{feat.text ?? '—'}</Text>

              <View style={styles.featureValueContainer}>
                {/* Note: Simply rendering svg_icon string here as per original code */}
                <Text style={styles.featureLabel}>{feat.svg_icon ?? '—'}</Text>
              </View>
            </View>
          ))}

          {(activeDuration?.features ?? []).length === 0 && (
            <Text style={{ color: '#6B7280', fontSize: 13 }}>No features listed</Text>
          )}
        </View>

        <TouchableOpacity style={styles.purchaseBtn} activeOpacity={0.8}>
          <Text style={styles.purchaseBtnText}>{plan.buttonText ?? 'Purchase Plan'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Main screen ---
export default function PricingPlans() {
  const router = useRouter();
  const [plans, setPlans] = useState<UIPricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await pricingServices.getAllPricingPlans();
        
        // --- FIX START: Cast to any to safely check .data property ---
        const resAny = response as any;
        
        let rawPlans: ApiServicePlan[] = [];

        if (Array.isArray(response)) {
          // It's a direct array
          rawPlans = response;
        } else if (resAny && resAny.data && Array.isArray(resAny.data)) {
          // It's wrapped in an object { data: [...] }
          rawPlans = resAny.data;
        } else {
          // Fallback
          rawPlans = [];
        }
        // --- FIX END ---

        const uiPlans: UIPricingPlan[] = rawPlans.map((p) => {
          const durations: UIPricingDuration[] =
            (p.durations ?? []).map((d) => {
              const priceRaw = d.price ?? '';
              const priceText =
                typeof priceRaw === 'number' ? `₹${priceRaw}` : `${priceRaw}`;

              return {
                label: d.duration ?? '—',
                price: d.price ?? '',
                priceText,
                features: d.features ?? [],
              };
            });

          const finalDurations = durations.length
            ? durations
            : [
                {
                  label: 'Default',
                  price: '',
                  priceText: '',
                  features: [],
                },
              ];

          return {
            id: String(p.id),
            title: p.name ?? 'Untitled Plan',
            subtitle: p.tagline ?? '',
            isRecommended: Boolean(p.featured),
            buttonText: p.button_text ?? 'Subscribe Now',
            durations: finalDurations,
          };
        });

        if (mounted) {
          setPlans(uiPlans);
        }
      } catch (err: any) {
        console.warn('Error fetching plans:', err);
        if (mounted) {
          setError(err?.message ?? 'Failed to load plans');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPlans();

    return () => {
      mounted = false;
    };
  }, []);

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" />
          </View>
        ) : error ? (
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#DC2626' }}>{error}</Text>
          </View>
        ) : plans.length === 0 ? (
          <View style={{ padding: 20 }}>
            <Text style={{ color: '#6B7280' }}>No plans available</Text>
          </View>
        ) : (
          plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)
        )}

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
    marginBottom: -2,
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
    borderColor: '#005BC1',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  priceSubText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#000',
    marginVertical: 3,
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
    flex: 1,
    paddingRight: 8,
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