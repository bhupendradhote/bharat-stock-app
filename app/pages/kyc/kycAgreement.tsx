import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import customerProfileServices from '@/services/api/methods/profileService';

const { width } = Dimensions.get('window');

export default function KycAgreementPage() {
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [kycStatus, setKycStatus] = useState('Pending');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  // --- Fetch Data ---
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const response: any = await customerProfileServices.getAllProfiles();
        
        if (mounted) {
          const user = response?.user ?? response?.data?.user ?? {};
          setUserName(user.name || 'User');

          const kyc = user.kyc || {};
          const status = kyc.status || 'Pending';
          setKycStatus(status);

          // --- Robust Signature Extraction Logic ---
          if (kyc.raw_response?.actions && Array.isArray(kyc.raw_response.actions)) {
            const actions = kyc.raw_response.actions;

            // 1. Find the specific action corresponding to signature
            const sigAction = actions.find((a: any) => 
               a.type === 'signature' || 
               a.action_ref?.includes('signature') || 
               (a.type === 'image' && a.rules_data?.strict_validation_types?.includes('signature'))
            );

            // 2. Extract image data from various potential fields
            let rawImage = null;
            
            if (sigAction) {
              if (sigAction.file) rawImage = sigAction.file;
              else if (sigAction.details?.image) rawImage = sigAction.details.image;
              else if (sigAction.output_image) rawImage = sigAction.output_image;
            }

            // 3. Fallback: If no explicit signature found, try Digilocker image (sometimes used as proxy)
            if (!rawImage) {
               const digilocker = actions.find((a: any) => a.type === 'digilocker');
               if (digilocker?.details?.aadhaar?.image) {
                 rawImage = digilocker.details.aadhaar.image;
               }
            }

            // 4. Process and Set Image
            if (rawImage) {
              // If it's a URL, use as is. If it's Base64, add prefix.
              const finalImage = rawImage.startsWith('http') 
                ? rawImage 
                : `data:image/jpeg;base64,${rawImage}`;
              
              setSignatureImage(finalImage);
            }
          }
        }
      } catch (err) {
        console.warn('KYC fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  // --- Handlers ---
  const handleReviewKyc = () => {
    router.push('/pages/kyc/kycAgreement'); 
  };

  const handleDownload = () => {
    Alert.alert("Download", "Downloading Agreement PDF...");
  };

  const getStatusColor = () => {
    switch (kycStatus.toLowerCase()) {
      case 'approved':
      case 'verified':
        return '#00A884'; // Green
      case 'expired':
      case 'rejected':
        return '#EF4444'; // Red
      default:
        return '#EAB308'; // Yellow/Orange
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#005BC1" />
      </SafeAreaView>
    );
  }

  const isComplete = ['approved', 'verified'].includes(kycStatus.toLowerCase());

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backWrap}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#000" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>KYC & Agreement</Text>

          <Text style={styles.subtitle}>
            Complete the verification process to activate your account and access all platform features.
          </Text>

          {/* KYC Status */}
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>KYC Status:</Text>
            <Text style={[styles.statusValue, { color: getStatusColor() }]}>
              {' '}{kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
            </Text>
          </View>

          {/* Review KYC Button */}
          <TouchableOpacity
            style={[styles.reviewBtn, isComplete && styles.reviewBtnDisabled]}
            onPress={isComplete ? undefined : handleReviewKyc}
            activeOpacity={0.85}
            disabled={isComplete}
          >
            <Text style={styles.reviewBtnText}>
              {isComplete ? "Verification Complete" : "Review / Complete KYC"}
            </Text>
          </TouchableOpacity>

          {/* Agreement */}
          <Text style={styles.sectionTitle}>Agreement & Consent Section</Text>

          <View style={styles.agreementBox}>
            <ScrollView showsVerticalScrollIndicator nestedScrollEnabled>
              <Text style={styles.agreementText}>
                <Text style={{fontWeight: '700'}}>USER AGREEMENT</Text>{'\n\n'}
                This Agreement is entered into by and between <Text style={{fontWeight: '700'}}>{userName}</Text> (&quot;User&quot;) and Bharat Stock Market Research (&quot;Company&quot;).{'\n\n'}
                
                1. <Text style={{fontWeight: '700'}}>Platform Usage:</Text> By accessing the platform, the User agrees to comply with all applicable laws and regulations.{'\n\n'}
                2. <Text style={{fontWeight: '700'}}>KYC Mandate:</Text> The User confirms that all KYC documents submitted (PAN, Aadhaar, etc.) are authentic and belong to them.{'\n\n'}
                3. <Text style={{fontWeight: '700'}}>Data Privacy:</Text> The Company agrees to protect User data in accordance with the Privacy Policy.{'\n\n'}
                4. <Text style={{fontWeight: '700'}}>Risk Disclosure:</Text> Stock market investments are subject to market risks. The Company is not liable for trading losses.{'\n\n'}
                (This document is electronically generated based on your account status: {kycStatus})
              </Text>
            </ScrollView>
          </View>

          {/* Signature */}
          <Text style={styles.sectionTitle}>Signature</Text>

          <View style={styles.signatureBox}>
            {signatureImage ? (
               <Image 
                 source={{ uri: signatureImage }}
                 style={styles.signatureImage}
                 resizeMode="contain"
               />
            ) : (
               <View style={styles.signaturePlaceholder}>
                 <Text style={styles.signatureHint}>
                   {isComplete ? "Digital Signature Verified" : "Signature Pending"}
                 </Text>
               </View>
            )}
          </View>

          {/* Download */}
          <TouchableOpacity
            style={[styles.downloadBtn, !isComplete && { opacity: 0.6 }]}
            activeOpacity={0.85}
            onPress={handleDownload}
            disabled={!isComplete}
          >
            <Text style={styles.downloadBtnText}>
               {isComplete ? "Download Signed Agreement" : "Download Preview"}
            </Text>
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
    paddingHorizontal: 16
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