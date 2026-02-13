// app/PricingPlans.tsx
import React, { useEffect, useState, useMemo } from 'react';
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
  Modal,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Assuming you are using Expo
import pricingServices from '@/services/api/methods/pricingServices';
import subscriptionService, { ApplyCouponResponse } from '@/services/api/methods/subscriptionService';
import OtherPagesInc from '@/components/includes/otherPagesInc';

/* ---------------- Types ---------------- */

interface ApiFeature {
  id?: number | string;
  svg_icon?: string | null;
  text?: string | null;
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

// Stores the details of the plan the user clicked on
interface SelectedPurchaseContext {
  planId: string;
  planName: string;
  durationIndex: number;
  durationId: number;
  durationLabel: string;
  originalPrice: number;
}

/* ---------------- PlanCard Component ---------------- */

const PlanCard = ({
  plan,
  onSelectPlan,
}: {
  plan: UIPricingPlan;
  onSelectPlan: (plan: UIPricingPlan, durationIndex: number) => void;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const durations = plan.durations ?? [];
  const activeDuration = durations[selectedIndex] ?? null;

  return (
    <View style={styles.cardContainer}>
      {plan.isRecommended && (
        <View style={styles.recommendedBanner}>
          <Text style={styles.recommendedText}>Recommended Plan</Text>
        </View>
      )}

      <View style={[styles.card, plan.isRecommended && styles.cardRecommended]}>
        <Text style={styles.planTitle}>{plan.title}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>
            {activeDuration ? activeDuration.priceText : '—'}
          </Text>
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
                {/* Assuming svg_icon is text/emoji for now, usually needs SvgRenderer */}
                <Text style={styles.featureValueText}>{feat.svg_icon ?? '✓'}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.purchaseBtn}
          activeOpacity={0.8}
          onPress={() => onSelectPlan(plan, selectedIndex)}
        >
          <Text style={styles.purchaseBtnText}>
            {plan.buttonText ?? 'Choose Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ---------------- Main Screen ---------------- */

export default function PricingPlans() {
  const [plans, setPlans] = useState<UIPricingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Purchase State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContext, setSelectedContext] = useState<SelectedPurchaseContext | null>(null);
  
  // Coupon States (Scoped to Modal)
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountDetails, setDiscountDetails] = useState<ApplyCouponResponse | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);
  
  // Payment Processing State
  const [processingPayment, setProcessingPayment] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  /* --- 1. Fetch Data --- */
  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response: any = await pricingServices.getAllPricingPlans();
      const rawPlans = Array.isArray(response) ? response : response?.data ?? [];

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

  /* --- 2. Modal Logic --- */

  const openCheckoutModal = (plan: UIPricingPlan, durationIndex: number) => {
    const duration = plan.durations[durationIndex];
    if (!duration) return;

    // Reset coupon state when opening modal
    setCouponInput('');
    setAppliedCoupon(null);
    setDiscountDetails(null);
    setValidatingCoupon(false);

    setSelectedContext({
      planId: plan.id,
      planName: plan.title,
      durationIndex: durationIndex,
      durationId: duration.id,
      durationLabel: duration.label,
      originalPrice: duration.price,
    });
    setModalVisible(true);
  };

  const closeCheckoutModal = () => {
    setModalVisible(false);
    setSelectedContext(null);
  };

  /* --- 3. Coupon Logic --- */

  const handleApplyCoupon = async () => {
    if (!selectedContext) return;
    
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      Alert.alert('Coupon', 'Please enter a coupon code.');
      return;
    }

    setValidatingCoupon(true);
    try {
      // API call requires code and duration ID
      const resp = await subscriptionService.applyCoupon(code, selectedContext.durationId);
      
      if (resp.success) {
        setAppliedCoupon(code);
        setDiscountDetails(resp);
        Keyboard.dismiss();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid coupon code';
      Alert.alert('Coupon Error', msg);
      setAppliedCoupon(null);
      setDiscountDetails(null);
      setCouponInput('');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountDetails(null);
    setCouponInput('');
  };

  /* --- 4. Payment Logic --- */

  const handlePayNow = async () => {
    if (!selectedContext) return;
    setProcessingPayment(true);

    try {
      // 1. Initiate Razorpay Order
      const initResp: any = await subscriptionService.initiateRazorpay(
        Number(selectedContext.planId),
        Number(selectedContext.durationId),
        appliedCoupon
      );

      const { order_id, key, amount } = initResp || {};

      if (order_id && key) {
        // 2. Prepare params for WebView or SDK
        const params = new URLSearchParams({
          order_id: String(order_id),
          key: String(key),
          amount: String(amount),
          plan_id: String(selectedContext.planId),
          duration_id: String(selectedContext.durationId),
          coupon_code: appliedCoupon || '',
        }).toString();

        // Close modal before navigating
        setModalVisible(false); 
        router.push(`/pages/subscription/RazorpayWebView?${params}`);
      } else {
        Alert.alert('Error', 'Could not initialize payment gateway.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to initiate purchase';
      Alert.alert('Payment Error', msg);
    } finally {
      setProcessingPayment(false);
    }
  };

  /* --- 5. Calculation Helper --- */
  const getFinalPrice = () => {
    if (discountDetails?.final_price) return discountDetails.final_price;
    return selectedContext?.originalPrice ?? 0;
  };
  
  const getDiscountAmount = () => {
     if(discountDetails?.discount) return discountDetails.discount;
     return 0;
  }

  /* --- Render --- */

  return (
    <OtherPagesInc>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Removed the top coupon box - logic is now inside the modal */}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 50 }} color="#005BC1" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelectPlan={openCheckoutModal}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ---------------- CHECKOUT MODAL ---------------- */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeCheckoutModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Order Summary</Text>
                <TouchableOpacity onPress={closeCheckoutModal}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              {selectedContext && (
                <>
                  {/* Plan Details */}
                  <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Plan Name</Text>
                      <Text style={styles.summaryValue}>{selectedContext.planName}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Duration</Text>
                      <Text style={styles.summaryValue}>{selectedContext.durationLabel}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Price</Text>
                      <Text style={styles.summaryValue}>₹{selectedContext.originalPrice}</Text>
                    </View>
                  </View>

                  {/* Coupon Section */}
                  <View style={styles.modalCouponContainer}>
                    <Text style={styles.modalSectionTitle}>Have a Coupon?</Text>
                    <View style={styles.couponRow}>
                      <TextInput
                        placeholder="Enter Code"
                        value={couponInput}
                        onChangeText={setCouponInput}
                        autoCapitalize="characters"
                        style={[styles.couponInput, appliedCoupon && { backgroundColor: '#ECFDF5', borderColor: '#059669' }]}
                        editable={!appliedCoupon && !validatingCoupon}
                      />
                      <TouchableOpacity
                        style={[
                            styles.applyBtn, 
                            appliedCoupon ? { backgroundColor: '#DC2626' } : {},
                            (!couponInput && !appliedCoupon) ? { backgroundColor: '#9CA3AF' } : {}
                        ]}
                        onPress={appliedCoupon ? removeCoupon : handleApplyCoupon}
                        disabled={validatingCoupon || (!couponInput && !appliedCoupon)}
                      >
                        {validatingCoupon ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.applyBtnText}>{appliedCoupon ? 'Remove' : 'Apply'}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                    {appliedCoupon && (
                      <Text style={styles.couponSuccessMsg}>
                         Coupon applied! You saved ₹{getDiscountAmount()}
                      </Text>
                    )}
                  </View>

                  <View style={styles.divider} />

                  {/* Final Total */}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Payable</Text>
                    <Text style={styles.totalAmount}>₹{getFinalPrice()}</Text>
                  </View>

                  {/* Pay Button */}
                  <TouchableOpacity
                    style={styles.payNowBtn}
                    onPress={handlePayNow}
                    disabled={processingPayment}
                  >
                    {processingPayment ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.payNowBtnText}>Pay Now</Text>
                    )}
                  </TouchableOpacity>

                  <View style={styles.secureBadge}>
                    <Ionicons name="lock-closed-outline" size={12} color="#6B7280" />
                    <Text style={styles.secureText}> Secured by Razorpay</Text>
                  </View>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

    </OtherPagesInc>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  scrollContent: { padding: 16 },
  errorText: { color: '#DC2626', textAlign: 'center', marginTop: 20 },
  
  // Card Styles
  cardContainer: { marginBottom: 24 },
  recommendedBanner: { backgroundColor: '#005BC1', paddingVertical: 6, borderTopLeftRadius: 16, borderTopRightRadius: 16, alignItems: 'center' },
  recommendedText: { color: '#fff', fontWeight: '700', fontSize: 12, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E5E7EB', elevation: 2 },
  cardRecommended: { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderColor: '#005BC1', borderWidth: 1.5 },
  planTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8, color: '#1F2937' },
  priceContainer: { marginBottom: 4 },
  priceText: { fontSize: 28, fontWeight: '800', color: '#005BC1' },
  priceSubText: { fontSize: 14, color: '#6B7280' },
  
  durationContainer: { flexDirection: 'row', marginVertical: 16, flexWrap: 'wrap', gap: 8 },
  durationBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  durationBtnActive: { backgroundColor: '#005BC1', borderColor: '#005BC1' },
  durationBtnInactive: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  durationText: { fontSize: 12, fontWeight: '600' },
  durationTextActive: { color: '#fff' },
  durationTextInactive: { color: '#374151' },
  
  featuresHeader: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 10 },
  featuresList: { marginBottom: 20 },
  featureRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  featureLabel: { fontSize: 14, color: '#4B5563' },
  featureValueContainer: { alignItems: 'flex-end' },
  featureValueText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  
  purchaseBtn: { backgroundColor: '#005BC1', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  purchaseBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: '45%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

  modalCouponContainer: { marginBottom: 20 },
  modalSectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151' },
  couponRow: { flexDirection: 'row' },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  applyBtn: { backgroundColor: '#005BC1', paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700' },
  couponSuccessMsg: { color: '#059669', fontSize: 12, marginTop: 4, fontWeight: '600' },

  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 16 },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#111827' },
  totalAmount: { fontSize: 24, fontWeight: '800', color: '#005BC1' },

  payNowBtn: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4
  },
  payNowBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  secureBadge: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, alignItems: 'center' },
  secureText: { fontSize: 11, color: '#6B7280' },
});