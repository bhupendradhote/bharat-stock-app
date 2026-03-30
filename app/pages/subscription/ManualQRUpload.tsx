// app/pages/subscription/ManualQRUpload.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ManualQRUpload() {
  const router = useRouter();
  
  // Retrieve parameters passed from the modal.
  // We extract them and ensure they are strings.
  const params = useLocalSearchParams();
  const planId = Array.isArray(params.plan_id) ? params.plan_id[0] : params.plan_id;
  const durationId = Array.isArray(params.duration_id) ? params.duration_id[0] : params.duration_id;
  const expectedAmount = Array.isArray(params.amount) ? params.amount[0] : params.amount || '0';
  
  // If you pass plan_name and duration_label from PricingPlans, they'll show here. 
  // Otherwise, it falls back to the static text you provided as an example.
  const planName = Array.isArray(params.plan_name) ? params.plan_name[0] : params.plan_name || 'Gold: F&O Pro';
  const durationLabel = Array.isArray(params.duration_label) ? params.duration_label[0] : params.duration_label || '1 Month';

  // Component State
  const [paidAmount, setPaidAmount] = useState<string>(expectedAmount);
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pick an image from the device gallery
  const pickImage = async () => {
    // Request permission (Expo handles this gracefully under the hood)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload your screenshot.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setScreenshotUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!paidAmount || isNaN(Number(paidAmount)) || Number(paidAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid paid amount.');
      return;
    }

    if (!screenshotUri) {
      Alert.alert('Screenshot Required', 'Please upload a screenshot of your payment proof to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      /* TODO: Implement your API call here.
        Typically, you would use FormData to upload the image along with the details:
        
        const formData = new FormData();
        formData.append('plan_id', planId);
        formData.append('duration_id', durationId);
        formData.append('amount', paidAmount);
        formData.append('screenshot', {
          uri: screenshotUri,
          name: 'payment_proof.jpg',
          type: 'image/jpeg',
        } as any);

        await subscriptionService.submitManualPayment(formData);
      */

      // Simulating network request
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Payment Submitted',
        'Your payment proof has been uploaded successfully. Our team will verify and activate your subscription shortly.',
        [
          { text: 'OK', onPress: () => router.back() } // Or navigate to a specific success screen
        ]
      );
    } catch (error) {
      Alert.alert('Submission Failed', 'There was an error submitting your payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Manual Payment Gateway', headerBackTitle: 'Back' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Title */}
        {/* <Text style={styles.pageMainTitle}>Manual Payment Gateway</Text> */}

        {/* STEP 1: SCAN & PAY */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
            <Text style={styles.stepTitle}>Scan & Pay</Text>
          </View>
          
          <Text style={styles.instructionText}>
            Scan this QR using any UPI app
          </Text>
          
          <View style={styles.qrContainer}>
            {/* Replace this placeholder icon with your actual QR code Image component */}
            {/* <Ionicons name="qr-code" size={120} color="#1F2937" /> */}
            Example of how to use a real image: 
                <Image source={require('@/assets/images/bsmrBarcode.png')} style={{width: 150, height: 150}} /> 
           
          </View>
        </View>

        {/* STEP 2: UPLOAD PROOF */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
            <Text style={styles.stepTitle}>Upload Proof</Text>
          </View>

          {/* Plan Details */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{planName}</Text>
              <Text style={styles.detailValue}>{durationLabel}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.amountValue}>₹{expectedAmount}</Text>
            </View>
          </View>

          {/* Paid Amount Input */}
          <Text style={styles.inputLabel}>Paid Amount (Editable)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={paidAmount}
              onChangeText={setPaidAmount}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Image Selection */}
          <TouchableOpacity 
            style={[styles.uploadBtn, screenshotUri && styles.uploadBtnSuccess]} 
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={screenshotUri ? "checkmark-circle" : "image-outline"} 
              size={20} 
              color={screenshotUri ? "#059669" : "#005BC1"} 
              style={{ marginRight: 8 }} 
            />
            <Text style={[styles.uploadBtnText, screenshotUri && styles.uploadBtnTextSuccess]}>
              {screenshotUri ? 'Screenshot Selected (Tap to change)' : 'Select Screenshot'}
            </Text>
          </TouchableOpacity>

          {/* Image Preview */}
          {screenshotUri && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: screenshotUri }} style={styles.previewImage} resizeMode="cover" />
            </View>
          )}

        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
          </Text>
        </TouchableOpacity>

        {/* FOOTER TEXT */}
        <Text style={styles.footerText}>
          Your subscription will be activated after{'\n'}successful verification by our team.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 10,
    paddingBottom: 40,
    backgroundColor: '#F3F4F6',
    flexGrow: 1,
  },
//   pageMainTitle: {
//     fontSize: 22,
//     fontWeight: '800',
//     color: '#1F2937',
//     textAlign: 'center',
//     marginBottom: 20,
//     marginTop: 10,
//   },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 2,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    backgroundColor: '#1F2937',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  instructionText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  detailsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  detailValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#005BC1',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20,
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '500',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#005BC1',
    borderRadius: 8,
    backgroundColor: '#F0F5FA',
    marginBottom: 16,
  },
  uploadBtnSuccess: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  uploadBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#005BC1',
  },
  uploadBtnTextSuccess: {
    color: '#059669',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  submitBtn: {
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 16,
  },
  submitBtnDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});