import React from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

const { width } = Dimensions.get('window');

export default function KycAgreementPage() {
  const router = useRouter();

  const handleReviewKyc = () => {
    router.push('/pages/kyc/kycAgreement');
  };

  const handleDownload = () => {
    console.log('Download Agreement pressed');
  };

  return (
    <>
      {/* 🔴 Disable Expo Router Header */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {/* Custom Back Button */}
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
            <Text style={styles.statusValueCompleted}> Completed</Text>
          </View>

          {/* Review KYC */}
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={handleReviewKyc}
            activeOpacity={0.85}
          >
            <Text style={styles.reviewBtnText}>Review KYC</Text>
          </TouchableOpacity>

          {/* Agreement */}
          <Text style={styles.sectionTitle}>Agreement & Consent Section</Text>

          <View style={styles.agreementBox}>
            <ScrollView showsVerticalScrollIndicator>
              <Text style={styles.agreementText}>
                Lorem ipsum mi id leo ipsum arcu montes phasellus dis interdum feugiat ipsum orci
                ullamcorper tempor ante mauris diam vulputate libero nisi tempor libero risus
                suscipit cras porttitor ornare sit tellus nullam sollicitudin venenatis eu cursus
                maecenas quis felis libero platea sed pharetra{'\n\n'}
                fringilla cursus facilisis viverra odio tellus libero tempor nulla vulputate et
                semper odio scelerisque sit mauris et gravida amet fermentum nec vel leo amet
                congue arcu at tortor aliquet eget est viverra{'\n\n'}
                cursus facilisis mi amet sit pellentesque scelerisque et penatibus posuere nam amet
                mauris lorem eros dolor morbi erat non ornare lorem vulputate tellus faucibus enim
                viverra mauris et viverra nulla scelerisque cursus massa massa dictum vitae posuere
                tortor nulla arcu tellus vitae
              </Text>
            </ScrollView>
          </View>

          {/* Signature */}
          <Text style={styles.sectionTitle}>Signature</Text>

          <View style={styles.signatureBox}>
            <View style={styles.signaturePlaceholder}>
              <Text style={styles.signatureHint}>Signature preview</Text>
            </View>
          </View>

          {/* Download */}
          <TouchableOpacity
            style={styles.downloadBtn}
            activeOpacity={0.85}
            onPress={handleDownload}
          >
            <Text style={styles.downloadBtnText}>Download Agreement</Text>
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
   paddingHorizontal: 10
  },
  content: {
    padding: 20,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 14
  },

  backWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EEF2F7',
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
  statusValueCompleted: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A884',
  },

  reviewBtn: {
    backgroundColor: '#1100FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    marginBottom: 22,
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
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },

  signaturePlaceholder: {
    width: width - 80,
    height: '85%',
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    elevation: 1,
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
