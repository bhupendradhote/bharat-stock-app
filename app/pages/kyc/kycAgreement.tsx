// app/KycAgreementPage.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import customerProfileServices from '@/services/api/methods/profileService';
import kycService from '@/services/api/methods/kycService'; // adjust if your filename is kycService.ts

export default function KycAgreementPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [userName, setUserName] = useState('');
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'verified' | 'rejected' | string>('pending');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  const mountedRef = useRef(true);

  // ---------- Helpers ----------
  const isApproved = (s: string) => {
    if (!s) return false;
    const v = s.toLowerCase();
    return v === 'approved' || v === 'verified';
  };

  const extractSignatureFromKyc = (kyc: any) => {
    if (!kyc) return null;
    const actions = kyc.raw_response?.actions;
    if (!Array.isArray(actions)) return null;

    const sigAction = actions.find((a: any) =>
      a?.type === 'signature' ||
      a?.action_ref?.includes?.('signature') ||
      (a?.type === 'image' && a?.rules_data?.strict_validation_types?.includes?.('signature'))
    );

    let rawImage: any = null;
    if (sigAction) {
      rawImage = sigAction.file ?? sigAction.details?.image ?? sigAction.output_image ?? null;
    }

    if (!rawImage) {
      const digilocker = actions.find((a: any) => a?.type === 'digilocker');
      rawImage = digilocker?.details?.aadhaar?.image ?? null;
    }

    if (!rawImage) return null;
    return typeof rawImage === 'string' && rawImage.startsWith('http') ? rawImage : `data:image/jpeg;base64,${rawImage}`;
  };

  const extractKycUrlFromProfile = (userObj: any): string | null => {
    const kyc = userObj?.kyc ?? userObj?.kyc_details ?? null;
    if (!kyc) return null;

    if (typeof kyc.kyc_url === 'string' && kyc.kyc_url) return kyc.kyc_url;
    if (typeof kyc.url === 'string' && kyc.url) return kyc.url;
    if (typeof kyc.document_id === 'string' && kyc.document_id) {
      return `https://app.digio.in/#/gateway/login/${kyc.document_id}`;
    }

    const raw = kyc.raw_response ?? null;
    if (raw) {
      if (typeof raw.kyc_url === 'string' && raw.kyc_url) return raw.kyc_url;
      if (typeof raw.redirect_url === 'string' && raw.redirect_url) return raw.redirect_url;
      const candidate = raw?.data?.document_id ?? raw?.data?.documentId ?? raw?.document_id;
      if (candidate) return `https://app.digio.in/#/gateway/login/${candidate}`;
    }

    return null;
  };

  // ---------- Profile fetch ----------
  const fetchProfile = useCallback(async () => {
    try {
      if (!mountedRef.current) return;
      setLoading(true);

      const response: any = await customerProfileServices.getAllProfiles();
      if (!mountedRef.current) return;

      const user = response?.user ?? response?.data?.user ?? response ?? {};
      setUserName(user?.name ?? user?.full_name ?? 'User');

      const kyc = user?.kyc ?? user?.kyc_details ?? {};
      setKycStatus((kyc?.status ?? 'pending').toString());

      // Signature extraction
      const sig = extractSignatureFromKyc(kyc);
      setSignatureImage(sig);
    } catch (err) {
      console.warn('KYC fetch error:', err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchProfile();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  const openKycInWebViewOrExternal = async (url: string) => {
    if (!url) return false;
    try {
      const encoded = encodeURIComponent(url);
      router.push(`/pages/kyc/KycWebView?url=${encoded}`);
      return true;
    } catch (err) {
      console.warn('router push failed, trying Linking.openURL', err);
      try {
        await Linking.openURL(url);
        return true;
      } catch (linkErr) {
        console.warn('Linking.openURL failed', linkErr);
        return false;
      }
    }
  };

  const findKycUrlFromFallbacks = async (): Promise<string | null> => {
    try {
      const resp: any = await customerProfileServices.getAllProfiles();
      const user = resp?.user ?? resp?.data?.user ?? resp ?? {};
      const fromProfile = extractKycUrlFromProfile(user);
      if (fromProfile) return fromProfile;
    } catch (e) {
      console.warn('fallback profile fetch failed', e);
    }

    try {
      const statusResp: any = await kycService.getKycStatus();
      if (statusResp?.kyc_url) return statusResp.kyc_url;
      if (statusResp?.document_id) return `https://app.digio.in/#/gateway/login/${statusResp.document_id}`;
      if (statusResp?.data?.kyc_url) return statusResp.data.kyc_url;
      if (statusResp?.data?.document_id) return `https://app.digio.in/#/gateway/login/${statusResp.data.document_id}`;
    } catch (e) {
      console.warn('/kyc/status fallback failed', e);
    }

    return null;
  };

  const handleStartKyc = async () => {
    if (isApproved(kycStatus)) {
      Alert.alert('KYC', 'Your KYC is already approved.');
      return;
    }

    if (starting) return;
    setStarting(true);

    try {
      const res: any = await kycService.startKyc();

      if (res?.kyc_url) {
        console.log('startKyc returned URL -> opening WebView:', res.kyc_url);
        const opened = await openKycInWebViewOrExternal(res.kyc_url);
        if (!opened) Alert.alert('KYC', 'Unable to open KYC url. Please try again.');
        return;
      }

      if (res?.success) {
        const fallback = await findKycUrlFromFallbacks();
        if (fallback) {
          await openKycInWebViewOrExternal(fallback);
          return;
        }
        Alert.alert('KYC', res?.message ?? 'KYC started — please check status.');
        return;
      }

      const fallback = await findKycUrlFromFallbacks();
      if (fallback) {
        await openKycInWebViewOrExternal(fallback);
        return;
      }

      Alert.alert('KYC', res?.message ?? 'Unable to start KYC. Please try again.');
    } catch (rawErr: any) {
      console.warn('startKyc error:', rawErr);

      const axiosResp = rawErr?.response;
      if (axiosResp?.status === 422) {
        const errData = axiosResp.data ?? {};
        console.warn('422 payload:', errData);

        const errUrl = errData?.kyc_url ?? errData?.data?.kyc_url ?? extractKycUrlFromProfile(errData);
        if (errUrl) {
          await openKycInWebViewOrExternal(errUrl);
          setStarting(false);
          return;
        }

        const fallbackUrl = await findKycUrlFromFallbacks();
        if (fallbackUrl) {
          await openKycInWebViewOrExternal(fallbackUrl);
          setStarting(false);
          return;
        }

        Alert.alert('KYC', errData?.message ?? 'KYC already in progress. Please complete the verification.');
        setStarting(false);
        return;
      }

      const fallbackUrl = await findKycUrlFromFallbacks();
      if (fallbackUrl) {
        await openKycInWebViewOrExternal(fallbackUrl);
        setStarting(false);
        return;
      }

      Alert.alert('Error', rawErr?.message ?? 'Failed to start KYC. Try again later.');
    } finally {
      setStarting(false);
    }
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#005BC1" />
      </SafeAreaView>
    );
  }

  const isComplete = isApproved(kycStatus);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Back Button */}
        <TouchableOpacity style={styles.backWrap} activeOpacity={0.8} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>KYC & Agreement</Text>

          <Text style={styles.subtitle}>
            Complete the verification process to activate your account and access all platform features.
          </Text>

          {/* KYC Status */}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>KYC Status:</Text>
            <Text style={[styles.statusValue, { color: isComplete ? '#00A884' : '#EAB308' }]}>
              {' '}
              {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.reviewBtn, isComplete && styles.reviewBtnDisabled]}
            onPress={handleStartKyc}
            activeOpacity={0.85}
            disabled={isComplete || starting}
          >
            {starting ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.reviewBtnText}>{isComplete ? 'Verification Complete' : 'Review / Complete KYC'}</Text>}
          </TouchableOpacity>

          {/* Agreement */}
          <Text style={styles.sectionTitle}>Agreement & Consent Section</Text>

          <View style={styles.agreementBox}>
            <ScrollView showsVerticalScrollIndicator nestedScrollEnabled>
              <Text style={styles.agreementText}>
                <Text style={{ fontWeight: '700' }}>USER AGREEMENT</Text>
                {'\n\n'}
                This Agreement is entered into by and between <Text style={{ fontWeight: '700' }}>{userName}</Text> (&quot;User&quot;) and Bharat Stock Market Research (&quot;Company&quot;).{'\n\n'}
                1. <Text style={{ fontWeight: '700' }}>Platform Usage:</Text> By accessing the platform, the User agrees to comply with all applicable laws and regulations.{'\n\n'}
                2. <Text style={{ fontWeight: '700' }}>KYC Mandate:</Text> The User confirms that all KYC documents submitted (PAN, Aadhaar, etc.) are authentic and belong to them.{'\n\n'}
                3. <Text style={{ fontWeight: '700' }}>Data Privacy:</Text> The Company agrees to protect User data in accordance with the Privacy Policy.{'\n\n'}
                4. <Text style={{ fontWeight: '700' }}>Risk Disclosure:</Text> Stock market investments are subject to market risks. The Company is not liable for trading losses.{'\n\n'}
                (This document is electronically generated based on your account status: {kycStatus})
              </Text>
            </ScrollView>
          </View>

          <Text style={styles.sectionTitle}>Signature</Text>

          <View style={styles.signatureBox}>
            {signatureImage ? (
              <Image source={{ uri: signatureImage }} style={styles.signatureImage} resizeMode="contain" />
            ) : (
              <View style={styles.signaturePlaceholder}>
                <Text style={styles.signatureHint}>{isComplete ? 'Digital Signature Verified' : 'Signature Pending'}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={[styles.downloadBtn, !isComplete && { opacity: 0.6 }]} activeOpacity={0.85} onPress={() => Alert.alert('Download', 'Downloading Agreement PDF...')} disabled={!isComplete}>
            <Text style={styles.downloadBtnText}>{isComplete ? 'Download Signed Agreement' : 'Download Preview'}</Text>
          </TouchableOpacity>

          <View style={{ height: 28 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 14,
    marginBottom: 20,
    backgroundColor: '#fff',
  },

  backWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    alignSelf: 'flex-start',
  },

  title: {
    fontSize: 23,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 13,
    color: '#000000',
    lineHeight: 20,
    marginBottom: 18,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  reviewBtn: {
    backgroundColor: '#1100FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    marginBottom: 22,
  },
  reviewBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  reviewBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },

  agreementBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    height: 240,
    marginBottom: 22,
  },

  agreementText: {
    fontSize: 13,
    color: '#000000',
    lineHeight: 20,
  },

  signatureBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    padding: 10,
  },

  signaturePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderStyle: 'dashed',
  },

  signatureImage: {
    width: '100%',
    height: '100%',
  },

  signatureHint: {
    color: '#999',
    fontSize: 12,
  },

  downloadBtn: {
    backgroundColor: '#1100FF',
    paddingVertical: 14,
    borderRadius: 26,
    alignItems: 'center',
    alignSelf: 'center',
    width: 220,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
