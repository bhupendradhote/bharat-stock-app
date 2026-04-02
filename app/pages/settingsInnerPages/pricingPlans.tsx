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
  Modal,
  TouchableWithoutFeedback,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import pricingServices from '@/services/api/methods/pricingServices';
import subscriptionService, { ApplyCouponResponse } from '@/services/api/methods/subscriptionService';
import customerProfileServices from '@/services/api/methods/profileService'; 
import AgreementService from '@/services/api/methods/agreementService';
import OtherPagesInc from '@/components/includes/otherPagesInc';
import AgreementDocumentModal from '@/components/includes/AgreementDocumentModal';

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

interface SelectedPurchaseContext {
  planId: string;
  planName: string;
  durationIndex: number;
  durationId: number;
  durationLabel: string;
  originalPrice: number;
  features: string[];
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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Purchase State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedContext, setSelectedContext] = useState<SelectedPurchaseContext | null>(null);
  
  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'manual'>('online');

  // Agreement Flow State
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [isAgreementVisible, setIsAgreementVisible] = useState(false);
  const [isAgreementSigned, setIsAgreementSigned] = useState(false);
  const [isSigningAgreement, setIsSigningAgreement] = useState(false);
  
  // Digio WebView States
  const [esignWebViewVisible, setEsignWebViewVisible] = useState(false);
  const [activeEsignUrl, setActiveEsignUrl] = useState<string | null>(null);
  const [draftAgreementId, setDraftAgreementId] = useState<number | null>(null);

  // Coupon States
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountDetails, setDiscountDetails] = useState<ApplyCouponResponse | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);
  
  // Payment Processing State
  const [processingPayment, setProcessingPayment] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchInitialData();
  }, []);

  /* --- 1. Fetch Data --- */
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [plansResp, profileResp] = await Promise.all([
        pricingServices.getAllPricingPlans(),
        customerProfileServices.getProfile().catch((e) => {
          console.warn("Profile fetch API failed:", e);
          return null;
        })
      ]);

      const rawPlans = Array.isArray(plansResp) ? plansResp : (plansResp as any)?.data ?? [];
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
      
      if (profileResp) {
        const userObj = profileResp.user || profileResp.data?.user || profileResp;
        if (userObj) {
          setUserProfile(userObj); 
        }
      }
    } catch (err: any) {
      console.error("Fetch Error:", err);
      setError(err?.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  /* --- 2. Modal Setup (Instant Open) --- */
  const openCheckoutModal = async (plan: UIPricingPlan, durationIndex: number) => {
    const duration = plan.durations[durationIndex];
    if (!duration) return;

    // Reset States
    setCouponInput('');
    setAppliedCoupon(null);
    setDiscountDetails(null);
    setValidatingCoupon(false);
    setPaymentMethod('online');
    setIsAgreementSigned(false);
    setIsAgreementVisible(false);
    setDraftAgreementId(null);
    setActiveEsignUrl(null);

    const featureList = duration.features.map(f => f.text).filter(Boolean) as string[];

    setSelectedContext({
      planId: plan.id,
      planName: plan.title,
      durationIndex: durationIndex,
      durationId: duration.id,
      durationLabel: duration.label,
      originalPrice: duration.price,
      features: featureList,
    });
    
    setModalVisible(true);

    // Silent background check for existing draft to lock the coupon section if already signed
    try {
      const draftsResp = await AgreementService.getDrafts();
      if (draftsResp && draftsResp.success && draftsResp.data) {
        const validDraft = draftsResp.data.find((d: any) => 
          d.plan.id === Number(plan.id) && 
          d.duration.id === duration.id
        );

        if (validDraft && (validDraft.esign?.status === 'signed' || validDraft.esign?.is_signed)) {
          setIsAgreementSigned(true);
          setDraftAgreementId(validDraft.id);
          
          if (validDraft.pricing?.coupon_applied && validDraft.pricing?.coupon?.code) {
            setAppliedCoupon(validDraft.pricing.coupon.code);
            setDiscountDetails({
              success: true,
              discount: validDraft.pricing.amount ? (duration.price - validDraft.pricing.amount) : 0,
              final_price: validDraft.pricing.amount
            } as any);
          }
        }
      }
    } catch (err) {
      console.log("Silent draft check failed:", err);
    }
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

  /* --- 4. Calculation Helper --- */
  const getFinalPrice = (): number => {
    // Ensure original price is safely parsed
    const rawOriginal = String(selectedContext?.originalPrice ?? 0);
    const original = Number(rawOriginal.replace(/[^0-9.-]+/g, ""));
    const safeOriginal = isNaN(original) ? 0 : original;

    if (discountDetails) {
      // 1. Try to use the explicit final_price from the API if it exists
      if (discountDetails.final_price !== undefined && discountDetails.final_price !== null) {
        const parsedFinal = Number(String(discountDetails.final_price).replace(/[^0-9.-]+/g, ""));
        if (!isNaN(parsedFinal)) return parsedFinal;
      }
      
      // 2. Fallback: Manually calculate if final_price is missing but we have a discount
      const discountAmount = getDiscountAmount();
      return Math.max(0, safeOriginal - discountAmount);
    }
    
    return safeOriginal;
  };

  const getDiscountAmount = (): number => {
    if (discountDetails && discountDetails.discount !== undefined && discountDetails.discount !== null) {
      // Strips commas, currency symbols, and any non-numeric characters before parsing
      const parsedDiscount = Number(String(discountDetails.discount).replace(/[^0-9.-]+/g, ""));
      if (!isNaN(parsedDiscount)) return parsedDiscount;
    }
    return 0;
  };

  /* --- 5. Flow Navigation Logic (ON CLICK) --- */
  const handleProceedClick = async () => {
    if (!selectedContext) return;

    setCheckingExisting(true);
    
    try {
      // 1. Fetch Drafts to check existing agreement
      const draftsResp = await AgreementService.getDrafts();
      let validDraft = null;
      
      if (draftsResp.success && draftsResp.data) {
        validDraft = draftsResp.data.find((d: any) => 
          d.plan.id === Number(selectedContext.planId) && 
          d.duration.id === selectedContext.durationId
        );
      }

      if (validDraft) {
        setDraftAgreementId(validDraft.id);
        try {
          // 2. Verify exact status
          const statusResp = await AgreementService.checkStatus(validDraft.id);
          const status = statusResp.status;

          if (status === 'signed') {
            // ALREADY SIGNED -> Go straight to Payment
            setIsAgreementSigned(true);
            setModalVisible(false);
            setTimeout(() => executePaymentRouting(), 300);
          } else if (['pending', 'created', 'esign_pending'].includes(status)) {
            // PENDING SIGNATURE -> Open WebView immediately
            setIsAgreementSigned(false);
            setActiveEsignUrl((statusResp.data as any)?.esign_url || validDraft.esign?.esign_url);
            setModalVisible(false);
            setTimeout(() => setEsignWebViewVisible(true), 300);
          } else {
            // EXPIRED / ANY OTHER STATUS -> Create new
            setModalVisible(false);
            setTimeout(() => setIsAgreementVisible(true), 300);
          }
        } catch (statusErr: any) {
          // Backend controller throws 410, 422, or 404 for expired/missing drafts
          const errCode = statusErr?.response?.status;
          if (errCode === 410 || errCode === 404 || errCode === 422) {
             setModalVisible(false);
             setTimeout(() => setIsAgreementVisible(true), 300);
          } else {
             Alert.alert('Error', 'Failed to verify existing agreement status. Please try again.');
          }
        }
      } else {
        // NO DRAFT EXISTS -> Create new
        setModalVisible(false);
        setTimeout(() => setIsAgreementVisible(true), 300);
      }
    } catch (err: any) {
      console.log("Check existing draft failed:", err);
      // Let the creation API handle the KYC fallback if getDrafts fails
      Alert.alert('Notice', 'Proceeding to create a new agreement.');
      setModalVisible(false);
      setTimeout(() => setIsAgreementVisible(true), 300);
    } finally {
      setCheckingExisting(false);
    }
  };

  /* --- Create Draft & Open WebView --- */
  const handleSignAgreement = async () => {
    if (!selectedContext) return;
    setIsSigningAgreement(true);
    
    try {
      const payload: Record<string, any> = {
        plan_id: Number(selectedContext.planId),
        duration_id: Number(selectedContext.durationId),
        plan_name: selectedContext.planName,
        duration: selectedContext.durationLabel,
        features: selectedContext.features,
        current_url: 'https://bharatstockmarketresearch.com/subscribe/confirm',
      };

      if (appliedCoupon && appliedCoupon.trim() !== '') {
        payload.coupon_code = appliedCoupon.trim();
      }
      
      const resp: any = await AgreementService.createDraft(payload as any);
      
      if (resp && resp.success === false) {
        throw new Error(resp.message || 'Server rejected the agreement draft.');
      }

      setIsAgreementVisible(false);

      if (resp?.esign_url) {
        setActiveEsignUrl(resp.esign_url);
        // Save the newly created draft ID so verifyWebViewStatus works
        const newDraftData = resp?.data || resp;
        if (newDraftData?.id) {
            setDraftAgreementId(newDraftData.id);
        }
        setTimeout(() => setEsignWebViewVisible(true), 500);
      } else {
        setIsAgreementSigned(true);
        setTimeout(() => executePaymentRouting(), 500);
      }

    } catch (err: any) {
      let errorMessage = 'Failed to sign agreement. Please try again.';
      
      // Handle the strict KYC 403 error from Laravel
      if (err?.response?.status === 403 || err?.response?.data?.message?.toLowerCase().includes('kyc')) {
        errorMessage = 'Your KYC must be approved before you can subscribe to a plan. Please complete your KYC verification.';
        setIsAgreementVisible(false); // Close modal if KYC is missing
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Agreement Error', errorMessage);
    } finally {
      setIsSigningAgreement(false);
    }
  };

  /* --- Verifies the status when returning from the WebView --- */
  const verifyWebViewStatus = async () => {
    setEsignWebViewVisible(false);
    
    if (draftAgreementId) {
      try {
        setProcessingPayment(true);
        const statusResp = await AgreementService.checkStatus(draftAgreementId);
        
        if (statusResp.status === 'signed') { 
          setIsAgreementSigned(true);
          // Show Success Message before proceeding
          Alert.alert('Success', 'Agreement signed successfully!', [
            { text: 'Proceed to Payment', onPress: () => executePaymentRouting() }
          ]);
        } else {
          // Alert.alert('Notice', 'Agreement signing was not completed.');
          // setModalVisible(true);
        }
      } catch (err: any) {
        const errCode = err?.response?.status;
        if (errCode === 410) {
          Alert.alert('Notice', 'The signing link expired. Please generate a new agreement.');
        } else {
          Alert.alert('Error', 'Could not verify agreement status from Digio.');
        }
        setModalVisible(true);
      } finally {
        setProcessingPayment(false);
      }
    } else {
      // Fallback fetch if ID went missing
      try {
        setProcessingPayment(true);
        const draftsResp = await AgreementService.getDrafts();
        const validDraft = draftsResp?.data?.find((d: any) => 
          d.plan.id === Number(selectedContext?.planId) && 
          d.duration.id === selectedContext?.durationId
        );
        
        if (validDraft) {
          setDraftAgreementId(validDraft.id);
          const statusResp = await AgreementService.checkStatus(validDraft.id);
          if (statusResp.status === 'signed') {
            setIsAgreementSigned(true);
            // Show Success Message before proceeding
            Alert.alert('Success', 'Agreement signed successfully!', [
              { text: 'Proceed to Payment', onPress: () => executePaymentRouting() }
            ]);
          } else {
            Alert.alert('Notice', 'Agreement signing was not completed.');
            setModalVisible(true);
          }
        } else {
          setModalVisible(true);
        }
      } catch (e) {
        setModalVisible(true);
      } finally {
        setProcessingPayment(false);
      }
    }
  };

  /* --- Payment Routing --- */
  const executePaymentRouting = async (freshEsignUrl?: string) => {
    if (!selectedContext) return;

    const urlToUse = freshEsignUrl || activeEsignUrl;

    if (paymentMethod === 'online') {
      setProcessingPayment(true);
      try {
        const initResp: any = await subscriptionService.initiateRazorpay(
          Number(selectedContext.planId),
          Number(selectedContext.durationId),
          appliedCoupon
        );

        const { order_id, key, amount } = initResp || {};

        if (order_id && key) {
          const params = new URLSearchParams({
            order_id: String(order_id),
            key: String(key),
            amount: String(amount),
            plan_id: String(selectedContext.planId),
            duration_id: String(selectedContext.durationId),
            coupon_code: appliedCoupon || '',
            plan_name: String(selectedContext.planName),          
            duration_label: String(selectedContext.durationLabel),
            ...(urlToUse ? { esign_url: String(urlToUse) } : {})
          }).toString();

          router.push(`/pages/subscription/RazorpayWebView?${params}` as any);
        } else {
          Alert.alert('Error', 'Could not initialize payment gateway.');
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Failed to initiate purchase';
        Alert.alert('Payment Error', msg);
      } finally {
        setProcessingPayment(false);
      }
    } else {
      const params = new URLSearchParams({
        plan_id: String(selectedContext.planId),
        duration_id: String(selectedContext.durationId),
        amount: String(getFinalPrice()),
        coupon_code: appliedCoupon || '',
        plan_name: String(selectedContext.planName),
        duration_label: String(selectedContext.durationLabel),
        ...(urlToUse ? { esign_url: String(urlToUse) } : {})
      }).toString();

      router.push(`/pages/subscription/ManualQRUpload?${params}` as any);
    }
  };

  /* ============================================================== */
  /* --- STATE DATA EXTRACTION TO PASS TO MODAL ---                 */
  /* ============================================================== */
  
  let extractedSignatureUrl: string | null = null;
  let extractedAadhaar = 'Verified';
  let extractedName = 'Guest';
  let extractedEmail = 'N/A';
  let extractedPhone = 'N/A';

  if (userProfile) {
    extractedName = userProfile.name || 'Guest';
    extractedEmail = userProfile.email || 'N/A';
    extractedPhone = userProfile.phone || userProfile.mobile || 'N/A';
    
    if (userProfile.kyc) {
      extractedAadhaar = userProfile.kyc.kyc_details?.aadhaar?.id_number || 'Verified';
      
      if (Array.isArray(userProfile.kyc.media)) {
        const signatureObj = userProfile.kyc.media.find((m: any) => m.collection_name === 'kyc_signature');
        if (signatureObj && signatureObj.original_url) {
          extractedSignatureUrl = signatureObj.original_url;
        }
      }
    }
  }

  /* --- Render Helpers --- */
  const getButtonText = () => {
    if (isAgreementSigned) {
      return paymentMethod === 'online' ? 'Proceed to Pay' : 'Scan to Pay';
    }
    if (draftAgreementId && activeEsignUrl) {
      return 'Resume Signing';
    }
    return 'Proceed to Agreement';
  };

  /* --- Render --- */

  return (
    <OtherPagesInc>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Order Summary</Text>
                <TouchableOpacity onPress={closeCheckoutModal}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {selectedContext && (
                  <>
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

                    {/* HIDE COUPON SECTION IF AGREEMENT IS ALREADY SIGNED */}
                    {!isAgreementSigned && (
                      <>
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
                      </>
                    )}

                    <View style={styles.paymentMethodSection}>
                      <Text style={styles.modalSectionTitle}>Payment Method</Text>
                      
                      <TouchableOpacity 
                        style={[styles.paymentMethodCard, paymentMethod === 'online' && styles.paymentMethodCardActive]}
                        onPress={() => setPaymentMethod('online')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.paymentMethodIconWrapper}>
                          <Ionicons name="card-outline" size={24} color={paymentMethod === 'online' ? '#005BC1' : '#6B7280'} />
                        </View>
                        <View style={styles.paymentMethodTextWrapper}>
                          <Text style={[styles.paymentMethodTitle, paymentMethod === 'online' && styles.paymentMethodTitleActive]}>Online Payment</Text>
                          <Text style={styles.paymentMethodSub}>Razorpay Gateway (UPI, Card)</Text>
                        </View>
                        <View style={styles.radioCircle}>
                          {paymentMethod === 'online' && <View style={styles.radioInnerCircle} />}
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.paymentMethodCard, paymentMethod === 'manual' && styles.paymentMethodCardActive]}
                        onPress={() => setPaymentMethod('manual')}
                        activeOpacity={0.7}
                      >
                        <View style={styles.paymentMethodIconWrapper}>
                          <Ionicons name="qr-code-outline" size={24} color={paymentMethod === 'manual' ? '#005BC1' : '#6B7280'} />
                        </View>
                        <View style={styles.paymentMethodTextWrapper}>
                          <Text style={[styles.paymentMethodTitle, paymentMethod === 'manual' && styles.paymentMethodTitleActive]}>Manual QR Scan</Text>
                          <Text style={styles.paymentMethodSub}>Pay via QR & Upload Proof</Text>
                        </View>
                        <View style={styles.radioCircle}>
                          {paymentMethod === 'manual' && <View style={styles.radioInnerCircle} />}
                        </View>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Payable</Text>
                      <Text style={styles.totalAmount}>₹{getFinalPrice()}</Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.payNowBtn, checkingExisting && { opacity: 0.7 }]}
                      onPress={handleProceedClick}
                      disabled={processingPayment || checkingExisting}
                      activeOpacity={0.8}
                    >
                      {checkingExisting ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.payNowBtnText}>{getButtonText()}</Text>
                      )}
                    </TouchableOpacity>

                    {paymentMethod === 'online' && (
                      <View style={styles.secureBadge}>
                        <Ionicons name="lock-closed-outline" size={12} color="#6B7280" />
                        <Text style={styles.secureText}> Secured by Razorpay</Text>
                      </View>
                    )}
                  </>
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ---------------- LEGAL AGREEMENT PREVIEW MODAL ---------------- */}
      <AgreementDocumentModal 
        visible={isAgreementVisible}
        onClose={() => setIsAgreementVisible(false)}
        onSignAndProceed={handleSignAgreement}
        isSigning={isSigningAgreement}
        
        planName={selectedContext?.planName || ''}
        durationName={selectedContext?.durationLabel || ''}
        amount={getFinalPrice()}
        
        userName={extractedName} 
        userEmail={extractedEmail}
        userPhone={extractedPhone}
        aadhaarNumber={extractedAadhaar}
        signatureUrl={extractedSignatureUrl}
      />

      {/* ---------------- ESIGN WEBVIEW MODAL ---------------- */}
      <Modal
        visible={esignWebViewVisible}
        animationType="slide"
        onRequestClose={verifyWebViewStatus}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.webviewHeader}>
            <Text style={styles.webviewTitle}>Digital Signature (Digio)</Text>
            <TouchableOpacity onPress={verifyWebViewStatus}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {activeEsignUrl && (
            <WebView
              source={{ uri: activeEsignUrl }}
              style={{ flex: 1 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              onNavigationStateChange={(navState) => {
                if (navState.url.includes('subscribe/confirm')) {
                  verifyWebViewStatus();
                }
              }}
            />
          )}
        </SafeAreaView>
      </Modal>

    </OtherPagesInc>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16 },
  errorText: { color: '#DC2626', textAlign: 'center', marginTop: 20 },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  summaryBox: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  modalCouponContainer: { marginBottom: 20 },
  modalSectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10, color: '#374151' },
  couponRow: { flexDirection: 'row' },
  couponInput: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, height: 44, marginRight: 10, backgroundColor: '#fff' },
  applyBtn: { backgroundColor: '#005BC1', paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700' },
  couponSuccessMsg: { color: '#059669', fontSize: 12, marginTop: 4, fontWeight: '600' },
  paymentMethodSection: { marginBottom: 10 },
  paymentMethodCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, marginBottom: 10, backgroundColor: '#fff' },
  paymentMethodCardActive: { borderColor: '#005BC1', backgroundColor: '#F0F5FA' },
  paymentMethodIconWrapper: { marginRight: 12 },
  paymentMethodTextWrapper: { flex: 1 },
  paymentMethodTitle: { fontSize: 15, fontWeight: '600', color: '#374151' },
  paymentMethodTitleActive: { color: '#005BC1' },
  paymentMethodSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  radioInnerCircle: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#005BC1' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#111827' },
  totalAmount: { fontSize: 24, fontWeight: '800', color: '#005BC1' },
  payNowBtn: { backgroundColor: '#059669', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: "#059669", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  payNowBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secureBadge: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, alignItems: 'center' },
  secureText: { fontSize: 11, color: '#6B7280' },
  webviewHeader: { flexDirection: 'row', padding: 16, backgroundColor: '#f8fafc', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  webviewTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' }
});