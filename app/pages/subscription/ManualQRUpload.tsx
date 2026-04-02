// app/pages/subscription/ManualQRUpload.tsx
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Image, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AgreementService from '@/services/api/methods/agreementService';

export default function ManualQRUpload() {
  const router = useRouter();
  
  const params = useLocalSearchParams();
  const planId = Array.isArray(params.plan_id) ? params.plan_id[0] : params.plan_id;
  const durationId = Array.isArray(params.duration_id) ? params.duration_id[0] : params.duration_id;
  const expectedAmount = Array.isArray(params.amount) ? params.amount[0] : params.amount || '0';
  
  const planName = Array.isArray(params.plan_name) ? params.plan_name[0] : params.plan_name || 'Selected Plan';
  const durationLabel = Array.isArray(params.duration_label) ? params.duration_label[0] : params.duration_label || 'Duration';

  const [paidAmount, setPaidAmount] = useState<string>(expectedAmount);
  
  // FIX 1: Store the entire image asset object, not just the string URI
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5, 
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0]); // Store the full asset
    }
  };

  const handleSubmit = async () => {
    if (!planId || !durationId) {
      Alert.alert('Error', 'Missing plan or duration information.');
      return;
    }

    if (!paidAmount || isNaN(Number(paidAmount)) || Number(paidAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid paid amount.');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Screenshot Required', 'Please upload a screenshot of your payment proof to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      formData.append('plan_id', String(planId));
      formData.append('duration_id', String(durationId));
      formData.append('amount', String(paidAmount));

      // FIX 2: Safely extract precise file details
      const uri = selectedImage.uri;
      const name = selectedImage.fileName || uri.split('/').pop() || 'payment_proof.jpg';
      
      // Rely on OS mimeType first, fallback to regex
      let type = selectedImage.mimeType;
      if (!type) {
        const match = /\.(\w+)$/.exec(name);
        type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
      }
      if (type === 'image/jpg') type = 'image/jpeg';

      formData.append('screenshot', {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: name,
        type: type,
      } as any);

      const resp = await AgreementService.submitManualPayment(formData);

      if (resp && resp.success) {
        Alert.alert(
          'Payment Submitted',
          'Your payment proof has been uploaded successfully. Our team will verify and activate your subscription shortly.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        throw new Error(resp?.message || 'Server rejected the payment submission.');
      }
    } catch (error: any) {
      let errorMsg = 'There was an error submitting your payment. Please try again.';
      
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
        if (error?.response?.data?.errors) {
            const firstErrorKey = Object.keys(error.response.data.errors)[0];
            errorMsg = error.response.data.errors[firstErrorKey][0];
        }
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      Alert.alert('Submission Failed', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: 'Manual Payment Gateway', headerBackTitle: 'Back' }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* STEP 1: SCAN & PAY */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
            <Text style={styles.stepTitle}>Scan & Pay</Text>
          </View>
          <Text style={styles.instructionText}>Scan this QR using any UPI app</Text>
          <View style={styles.qrContainer}>
            <Ionicons name="qr-code" size={120} color="#1F2937" />
          </View>
        </View>

        {/* STEP 2: UPLOAD PROOF */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
            <Text style={styles.stepTitle}>Upload Proof</Text>
          </View>

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

          <TouchableOpacity 
            style={[styles.uploadBtn, selectedImage && styles.uploadBtnSuccess]} 
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={selectedImage ? "checkmark-circle" : "image-outline"} 
              size={20} 
              color={selectedImage ? "#059669" : "#005BC1"} 
              style={{ marginRight: 8 }} 
            />
            <Text style={[styles.uploadBtnText, selectedImage && styles.uploadBtnTextSuccess]}>
              {selectedImage ? 'Screenshot Selected (Tap to change)' : 'Select Screenshot'}
            </Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />
            </View>
          )}
        </View>

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

        <Text style={styles.footerText}>
          Your subscription will be activated after{'\n'}successful verification by our team.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 10, paddingBottom: 40, backgroundColor: '#F3F4F6', flexGrow: 1 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.01, shadowRadius: 4, elevation: 2 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepBadge: { backgroundColor: '#1F2937', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  stepBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  stepTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  instructionText: { fontSize: 14, color: '#4B5563', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  qrContainer: { alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  detailsBox: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  detailLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  detailValue: { fontSize: 14, color: '#6B7280' },
  amountValue: { fontSize: 16, fontWeight: '700', color: '#005BC1' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, backgroundColor: '#fff', marginBottom: 20, paddingHorizontal: 12, height: 48 },
  currencySymbol: { fontSize: 18, color: '#374151', fontWeight: '500', marginRight: 8 },
  textInput: { flex: 1, fontSize: 16, color: '#111827' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderWidth: 1, borderColor: '#005BC1', borderRadius: 8, backgroundColor: '#F0F5FA', marginBottom: 16 },
  uploadBtnSuccess: { borderColor: '#059669', backgroundColor: '#ECFDF5' },
  uploadBtnText: { fontSize: 15, fontWeight: '600', color: '#005BC1' },
  uploadBtnTextSuccess: { color: '#059669' },
  previewContainer: { alignItems: 'center', marginBottom: 10, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  previewImage: { width: '100%', height: 200 },
  submitBtn: { backgroundColor: '#059669', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: "#059669", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4, marginBottom: 16 },
  submitBtnDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0, elevation: 0 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerText: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18 },
});