// app/PricingPlans.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Keyboard,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import pricingServices from '@/services/api/methods/pricingServices';
import subscriptionService, { ApplyCouponResponse } from '@/services/api/methods/subscriptionService';
import OtherPagesInc from '@/components/includes/otherPagesInc';

/* ---------------- Types ---------------- */

interface ApiFeature {
  id?: number | string;
  svg_icon?: string | null;
  text?: string | null;
}

interface ApiDuration {
  id: number;
  duration: string;
  price: number;
  features?: ApiFeature[];
}

interface UIPricingDuration {
  id: number;
  label: string;
  price: number;
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

/* ---------------- PlanCard ---------------- */

const PlanCard = ({
  plan,
  onPurchase,
  loadingPlanId,
  discountData,
}: {
  plan: UIPricingPlan;
  onPurchase: (planId: string, durationIndex: number) => void;
  loadingPlanId: string | null;
  discountData: ApplyCouponResponse | null;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const durations = plan.durations ?? [];
  const activeDuration = durations[selectedIndex] ?? durations[0] ?? null;

  // Check if the currently applied coupon applies to THIS specific duration
  // Note: Backend might return final_price as string "99.00"
  const showDiscount = discountData && activeDuration && String(discountData.original_price).includes(String(activeDuration.price));

  return (
    <View style={styles.cardContainer}>
      {plan.isRecommended && (
        <View style={styles.recommendedBanner}>
          <Text style={styles.recommendedText}>Recommended Plan</Text>
        </View>
      )}

      <View style={[styles.card, plan.isRecommended && styles.cardRecommended]}>
        <Text style={styles.planTitle}>{plan.title}</Text>

        <View>
          {showDiscount ? (
            <View>
              <Text style={[styles.priceText, { color: '#059669' }]}>₹{discountData?.final_price}</Text>
              <Text style={[styles.priceSubText, { textDecorationLine: 'line-through', color: '#6B7280' }]}>
                {activeDuration.priceText}
              </Text>
            </View>
          ) : (
            <Text style={styles.priceText}>{activeDuration ? activeDuration.priceText : '—'}</Text>
          )}
          <Text style={styles.priceSubText}>({plan.subtitle ?? ''})</Text>
        </View>

        <View style={styles.durationContainer}>
          {durations.map((d, idx) => {
            const isActive = selectedIndex === idx;
            return (
              <TouchableOpacity
                key={`${plan.id}-dur-${idx}`}
                activeOpacity={0.8}
                onPress={() => setSelectedIndex(idx)}
                style={[styles.durationBtn, isActive ? styles.durationBtnActive : styles.durationBtnInactive]}
              >
                <Text style={[styles.durationText, isActive ? styles.durationTextActive : styles.durationTextInactive]}>
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
                <Text style={styles.featureValueText}>{feat.svg_icon ?? '—'}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.purchaseBtn}
          activeOpacity={0.8}
          onPress={() => onPurchase(plan.id, selectedIndex)}
          disabled={loadingPlanId !== null}
        >
          {loadingPlanId === plan.id ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.purchaseBtnText}>
              {showDiscount ? `Buy for ₹${discountData?.final_price}` : (plan.buttonText ?? 'Purchase Plan')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ---------------- Screen ---------------- */

export default function PricingPlans() {
  const [plans, setPlans] = useState<UIPricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  
  // Coupon States
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountDetails, setDiscountDetails] = useState<ApplyCouponResponse | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response: any = await pricingServices.getAllPricingPlans();
      const rawPlans = Array.isArray(response) ? response : (response?.data ?? []);

      const uiPlans: UIPricingPlan[] = rawPlans.map((p: any) => ({
        id: String(p.id),
        title: p.name ?? 'Untitled Plan',
        subtitle: p.tagline ?? '',
        isRecommended: Boolean(p.featured),
        buttonText: p.button_text ?? 'Subscribe Now',
        durations: (p.durations ?? []).map((d: any) => ({
          id: d.id,
          label: d.duration ?? '—',
          price: d.price ?? 0,
          priceText: `₹${d.price}`,
          features: d.features ?? [],
        })),
      }));

      setPlans(uiPlans);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Coupon', 'Please enter a coupon code.');
      return;
    }

    // To validate a coupon via your backend, we need at least ONE duration ID.
    // We'll use the first duration of the first plan as a probe, or ideally, 
    // the user should select a plan first. For simplicity, we'll validate against 
    // the first available duration in the list.
    const firstDurationId = plans[0]?.durations[0]?.id;
    if (!firstDurationId) {
      Alert.alert('Error', 'No plans available to apply coupon against.');
      return;
    }

    setValidatingCoupon(true);
    try {
      const resp = await subscriptionService.applyCoupon(code, Number(firstDurationId));
      if (resp.success) {
        setAppliedCoupon(code);
        setDiscountDetails(resp);
        Keyboard.dismiss();
        Alert.alert('Success', resp.message || 'Coupon applied successfully!');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid coupon code';
      Alert.alert('Coupon Error', msg);
      removeCoupon();
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountDetails(null);
    setCouponInput('');
  };

  const handlePurchase = async (planId: string, durationIndex: number) => {
    if (loadingPlanId) return;
    
    const plan = plans.find((p) => p.id === planId);
    const duration = plan?.durations?.[durationIndex];

    if (!duration?.id) {
      Alert.alert('Error', 'Invalid duration selected.');
      return;
    }

    setLoadingPlanId(planId);

    try {
      // 1. Initiate Razorpay with Coupon
      const initResp: any = await subscriptionService.initiateRazorpay(
        Number(planId),
        Number(duration.id),
        appliedCoupon
      );

      // 2. Extract identifiers for the WebView
      const order_id = initResp?.order_id;
      const key = initResp?.key;
      const amount = initResp?.amount; // paise from backend

      if (order_id && key) {
        const params = new URLSearchParams({
          order_id: String(order_id),
          key: String(key),
          amount: String(amount),
          plan_id: String(planId),
          duration_id: String(duration.id),
          coupon_code: appliedCoupon || '',
        }).toString();

        router.push(`/pages/subscription/RazorpayWebView?${params}`);
      } else {
        Alert.alert('Error', 'Could not initialize payment gateway.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to initiate purchase';
      Alert.alert('Payment Error', msg);
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <OtherPagesInc>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Coupon Section */}
        <View style={styles.couponBox}>
          <Text style={styles.couponTitle}>Discount Coupon</Text>
          <View style={styles.couponRow}>
            <TextInput
              placeholder="PROMO2024"
              value={couponInput}
              onChangeText={setCouponInput}
              autoCapitalize="characters"
              style={styles.couponInput}
              editable={!validatingCoupon && !appliedCoupon}
            />
            <TouchableOpacity
              style={[styles.applyBtn, appliedCoupon ? { backgroundColor: '#DC2626' } : undefined]}
              onPress={appliedCoupon ? removeCoupon : handleApplyCoupon}
              disabled={validatingCoupon}
            >
              {validatingCoupon ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.applyBtnText}>{appliedCoupon ? 'Remove' : 'Apply'}</Text>
              )}
            </TouchableOpacity>
          </View>
          {appliedCoupon && (
            <Text style={styles.couponAppliedText}>
              ✓ {appliedCoupon} applied! {discountDetails?.coupon?.type === 'percent' ? `${discountDetails.coupon.value}% off` : `₹${discountDetails?.discount} off`}
            </Text>
          )}
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 50 }} color="#005BC1" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          plans.map((plan) => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              onPurchase={handlePurchase} 
              loadingPlanId={loadingPlanId}
              discountData={discountDetails}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </OtherPagesInc>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16 },
  couponBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  couponTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10, color: '#374151' },
  couponRow: { flexDirection: 'row' },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 10,
    backgroundColor: '#F9FAFB',
  },
  applyBtn: { backgroundColor: '#005BC1', paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700' },
  couponAppliedText: { marginTop: 8, fontSize: 13, color: '#059669', fontWeight: '600' },
  errorText: { color: '#DC2626', textAlign: 'center', marginTop: 20 },
  
  // Reuse existing card styles from your snippet...
  cardContainer: { marginBottom: 24 },
  recommendedBanner: { backgroundColor: '#005BC1', paddingVertical: 6, borderTopLeftRadius: 16, borderTopRightRadius: 16, alignItems: 'center' },
  recommendedText: { color: '#fff', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  cardRecommended: { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderColor: '#005BC1' },
  planTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  priceText: { fontSize: 28, fontWeight: '800' },
  priceSubText: { fontSize: 14, color: '#6B7280' },
  durationContainer: { flexDirection: 'row', marginVertical: 16, flexWrap: 'wrap', gap: 8 },
  durationBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  durationBtnActive: { backgroundColor: '#005BC1', borderColor: '#005BC1' },
  durationBtnInactive: { backgroundColor: '#fff', borderColor: '#D1D5DB' },
  durationText: { fontSize: 12, fontWeight: '600' },
  durationTextActive: { color: '#fff' },
  durationTextInactive: { color: '#374151' },
  featuresHeader: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 10 },
  featuresList: { marginBottom: 20 },
  featureRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  featureLabel: { fontSize: 14, color: '#4B5563' },
  featureValueContainer: { alignItems: 'flex-end' },
  featureValueText: { fontSize: 14, fontWeight: '600' },
  purchaseBtn: { backgroundColor: '#005BC1', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  purchaseBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});