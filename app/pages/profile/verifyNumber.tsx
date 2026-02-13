import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

// Make sure this path is correct for your project structure
import customerProfileServices from '@/services/api/methods/profileService'; 
import OtherPagesInc from '@/components/includes/otherPagesInc';

const VerifyNumberPage = () => {
  const router = useRouter();
  
  // State to manage the step: 'number' or 'otp'
  const [step, setStep] = useState<'number' | 'otp'>('number');
  
  // State for Phone Number
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // State for OTP (Array of 6 strings)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // State to hold any session/reference token returned by the backend
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Refs for OTP inputs
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Handle OTP Input Change
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-focus previous input if cleared
    if (text.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Helper to clear message after 3 seconds
  const showTemporaryMessage = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // --- API Integrations ---

  const handleSendOtp = async () => {
    // Strip spaces in case the user types "+91 98765 43210"
    const cleanPhone = phoneNumber.replace(/\s+/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      Alert.alert('Invalid Input', 'Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      const response: any = await customerProfileServices.sendUpdateOtp({ 
        type: 'phone', 
        value: cleanPhone 
      });
      
      // DEBUG: Check terminal to see if backend returns a session_id or token
      console.log('SEND OTP RESPONSE:', response);

      // Save token if the backend provides one to track the OTP session
      if (response?.session_id || response?.token) {
          setSessionToken(response.session_id || response.token);
      }
      
      setSuccessMessage(`OTP sent to ${cleanPhone}`);
      setStep('otp');
    } catch (error: any) {
      console.error('Send OTP Error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    const otpCode = otp.join('');
    
    if (otpCode.length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      // Build base payload
      const verifyPayload: any = { 
        type: 'phone', 
        value: cleanPhone, 
        otp: otpCode 
      };

      // Append token if we received one in the previous step
      if (sessionToken) {
          // Change 'session_id' to whatever key your backend expects (e.g., 'token', 'reference_id')
          verifyPayload.session_id = sessionToken; 
      }

      await customerProfileServices.verifyAndUpdate(verifyPayload);
      
      showTemporaryMessage("Phone number verified successfully!");
      
      // Delay navigation slightly so user sees the success message
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error: any) {
      console.error('Verify OTP Error Details:', error.response?.data || error.message);
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OtherPagesInc>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            
            <Text style={styles.title}>Verify Phone Number</Text>

            {/* --- Success Message Display --- */}
            {successMessage && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#00A884" />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* --- STEP 1: ENTER PHONE NUMBER --- */}
            {step === 'number' && (
              <View style={styles.formContainer}>
                <Text style={styles.label}>Enter Phone Number</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#A0A0A0"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  editable={!loading}
                />

                <TouchableOpacity 
                  style={[styles.primaryBtn, loading && styles.disabledBtn]}
                  activeOpacity={0.8}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Continue</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* --- STEP 2: ENTER OTP --- */}
            {step === 'otp' && (
              <View style={styles.formContainer}>
                <Text style={styles.label}>Enter OTP to Verify</Text>
                
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => { inputRefs.current[index] = ref }} 
                        style={styles.otpInput}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        placeholder="0"
                        placeholderTextColor="#C0C0C0"
                        editable={!loading}
                        />
                  ))}
                </View>

                <TouchableOpacity 
                  style={[styles.primaryBtn, loading && styles.disabledBtn]}
                  activeOpacity={0.8}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Verify Number</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.resendBtn}
                    onPress={() => {
                        setStep('number');
                        setOtp(['', '', '', '', '', '']); // Clear OTP on go back
                    }}
                    disabled={loading}
                >
                    <Text style={styles.resendText}>Change Number</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </OtherPagesInc>
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    color: '#00A884',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  formContainer: {
    flex: 1,
    marginTop: 80, 
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 48,  
    height: 48,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#005BC1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.7,
  },
  resendBtn: {
      marginTop: 20,
      alignItems: 'center',
  },
  resendText: {
      color: '#005BC1',
      fontSize: 14,
      fontWeight: '500',
  }
});

export default VerifyNumberPage;