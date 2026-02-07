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
import subscriptionService from '@/services/api/methods/subscriptionService';
import OtherPagesInc from '@/components/includes/otherPagesInc';

/* ---------------- Types ---------------- */

interface ApiFeature {
  id?: number | string;
  svg_icon?: string | null;
  text?: string | null;
}

interface ApiDuration {
  id?: number | string;
  duration: string;
  price: number | string;
  features?: ApiFeature[];
}

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
  id: number | string;
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

/* ---------------- PlanCard ---------------- */

const PlanCard = ({
  plan,
  onPurchase,
  loadingPlanId,
}: {
  plan: UIPricingPlan;
  onPurchase: (planId: string, durationIndex: number) => void;
  loadingPlanId: string | null;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const durations = plan.durations ?? [];
  const activeDuration = durations[selectedIndex] ?? durations[0] ?? null;

  return (
    <View style={styles.cardContainer}>
      {plan.isRecommended && (
        <View style={styles.recommendedBanner}>
          <Text style={styles.recommendedText}>Recommended Plan</Text>
        </View>
      )}

      <View style={[styles.card, plan.isRecommended && styles.cardRecommended]}>
        <Text style={styles.planTitle}>{plan.title}</Text>

        <Text style={styles.priceText}>{activeDuration ? activeDuration.priceText : '—'}</Text>
        <Text style={styles.priceSubText}>({plan.subtitle ?? ''})</Text>

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

          {(activeDuration?.features ?? []).length === 0 && (
            <Text style={{ color: '#6B7280', fontSize: 13 }}>No features listed</Text>
          )}
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
            <Text style={styles.purchaseBtnText}>{plan.buttonText ?? 'Purchase Plan'}</Text>
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
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const fetchPlans = async () => {
      setLoading(true);
      setError(null);

      try {
        const response: any = await pricingServices.getAllPricingPlans();
        const resAny = response as any;

        let rawPlans: ApiServicePlan[] = [];

        if (Array.isArray(response)) {
          rawPlans = response;
        } else if (resAny && resAny.data && Array.isArray(resAny.data)) {
          rawPlans = resAny.data;
        } else {
          rawPlans = [];
        }

        const uiPlans: UIPricingPlan[] = rawPlans.map((p) => {
          const durations: UIPricingDuration[] = (p.durations ?? []).map((d) => {
            const priceRaw = d.price ?? '';
            const priceText = typeof priceRaw === 'number' ? `₹${priceRaw}` : `${priceRaw ?? ''}`;

            return {
              id: d.id ?? '',
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
                  id: '',
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

  // Apply coupon (tries server-side validate if available, otherwise applies locally)
  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Coupon', 'Please enter a coupon code.');
      return;
    }

    setValidatingCoupon(true);
    try {
      // If subscriptionService.validateCoupon exists, call it (optional)
      const svcAny = subscriptionService as any;
      if (typeof svcAny.validateCoupon === 'function') {
        // Attempt server-side validation — you can change args if your API expects plan/duration
        const resp = await svcAny.validateCoupon({ coupon: code });
        // expect resp.success boolean or similar
        if (resp?.success) {
          setAppliedCoupon(code);
          Keyboard.dismiss();
          Alert.alert('Coupon Applied', `Coupon "${code}" applied.`);
        } else {
          const msg = resp?.message ?? 'Invalid coupon';
          Alert.alert('Coupon Invalid', msg);
        }
      } else {
        // No validate endpoint: just apply locally
        setAppliedCoupon(code);
        Keyboard.dismiss();
        Alert.alert('Coupon Applied', `Coupon "${code}" applied (client-side).`);
      }
    } catch (err: any) {
      console.warn('validateCoupon error', err);
      const msg = err?.response?.data?.message ?? err?.message ?? 'Coupon validation failed';
      Alert.alert('Coupon Error', String(msg));
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  // Handle purchase: initiate Razorpay and open WebView
  const handlePurchase = async (planId: string, durationIndex: number) => {
    if (loadingPlanId) return;
    setLoadingPlanId(planId);

    try {
      // Find plan and selected duration (we included duration.id from backend)
      const plan = plans.find((p) => p.id === planId);
      const duration = plan?.durations?.[durationIndex];

      if (!duration) {
        Alert.alert('Error', 'Please select a valid plan duration.');
        return;
      }

      if (!duration.id) {
        Alert.alert('Error', 'Invalid duration selected (missing id).');
        return;
      }

      // Call backend with plan_id + duration_id + coupon (coupon optional)
      // Use `as any` to avoid TypeScript mismatch if your subscriptionService hasn't been updated.
      const svcAny = subscriptionService as any;
      const initResp: any = await svcAny.initiateRazorpay(
        Number(planId),
        Number(duration.id),
        appliedCoupon ?? undefined
      );

      console.log('initResp', initResp);

      const finalCoupon = appliedCoupon ?? undefined;

      // Hosted checkout: append coupon param if present
      const checkoutUrl =
        initResp?.checkout_url ??
        initResp?.payment_url ??
        initResp?.redirect_url ??
        initResp?.url;

      if (checkoutUrl) {
        const urlWithCoupon =
          finalCoupon && !checkoutUrl.includes('coupon=')
            ? `${checkoutUrl}${checkoutUrl.includes('?') ? '&' : '?'}coupon=${encodeURIComponent(finalCoupon)}`
            : checkoutUrl;

        router.push(
          `/pages/subscription/RazorpayWebView?url=${encodeURIComponent(urlWithCoupon)}&coupon=${encodeURIComponent(finalCoupon ?? '')}`
        );
        return;
      }

      // Order-based checkout
      const order_id = initResp?.order_id ?? initResp?.razorpay_order_id;
      const key = initResp?.key ?? initResp?.razorpay_key ?? initResp?.key_id;
      const amount = initResp?.amount ?? initResp?.amount_in_paise ?? initResp?.value;
      const currency = initResp?.currency ?? 'INR';

      if (order_id && key) {
        const params = `order_id=${encodeURIComponent(String(order_id))}&key=${encodeURIComponent(String(key))}&amount=${encodeURIComponent(String(amount ?? ''))}&currency=${encodeURIComponent(String(currency ?? 'INR'))}${finalCoupon ? `&coupon=${encodeURIComponent(finalCoupon)}` : ''}`;
        router.push(`/pages/subscription/RazorpayWebView?${params}`);
        return;
      }

      Alert.alert('Payment', 'Unable to initiate payment. Try again later.');
    } catch (err: any) {
      console.warn('initiateRazorpay error', err);

      // Axios-style error handling
      const status = err?.response?.status;
      const data = err?.response?.data;

      if (status === 422) {
        const message = data?.message ?? 'Subscription already in progress or invalid request.';
        try {
          const current: any = await subscriptionService.getCurrentSubscription();
          console.log('Current Subscription:', current);
        } catch (fallbackErr) {
          console.warn('Failed to fetch current subscription fallback', fallbackErr);
        }
        Alert.alert('Subscription', String(message));
      } else {
        const message = data?.message ?? err?.message ?? 'Failed to initiate payment';
        Alert.alert('Payment Error', String(message));
      }
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <OtherPagesInc>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Coupon Input */}
        <View style={styles.couponBox}>
          <Text style={styles.couponTitle}>Have a coupon?</Text>

          <View style={styles.couponRow}>
            <TextInput
              placeholder="Enter coupon code"
              value={couponInput}
              onChangeText={setCouponInput}
              autoCapitalize="characters"
              style={styles.couponInput}
              editable={!validatingCoupon}
            />

            <TouchableOpacity
              style={[styles.applyBtn, appliedCoupon ? { backgroundColor: '#6B7280' } : undefined]}
              onPress={() => {
                if (appliedCoupon) {
                  removeCoupon();
                } else {
                  applyCoupon();
                }
              }}
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
            <Text style={styles.couponAppliedText}>Applied coupon: {appliedCoupon}</Text>
          )}
        </View>

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
          plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onPurchase={handlePurchase} loadingPlanId={loadingPlanId} />
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </OtherPagesInc>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  scrollContent: {
    padding: 10,
    paddingTop: 10,
  },
  couponBox: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  applyBtn: {
    backgroundColor: '#005BC1',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  couponAppliedText: {
    marginTop: 6,
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },

  cardContainer: {
    marginBottom: 20,
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
  planTitle: {
    fontSize: 20,
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
    backgroundColor: '#005BC1',
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
