import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

const VerifyEmailPage = () => {
  const router = useRouter();
  
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  // State for showing success messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-focus previous input
    if (text.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => {
                  if (step === 'otp') {
                    setStep('email');
                    setSuccessMessage(null); // Clear message when going back
                  } else {
                    router.back();
                  }
                }}
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>Verify Email</Text>

            {/* --- Success Message Display --- */}
            {successMessage && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#00A884" />
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {step === 'email' && (
              <View style={styles.formContainer}>
                <Text style={styles.label}>Enter Email Address</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Enter Email Address"
                  placeholderTextColor="#A0A0A0"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <TouchableOpacity 
                  style={styles.primaryBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    console.log("Email submitted:", email);
                    // Show message and switch to OTP step
                    setSuccessMessage(`OTP sent to ${email || 'your email'}`);
                    setStep('otp');
                  }}
                >
                  <Text style={styles.primaryBtnText}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}

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
                        />
                  ))}
                </View>

                <TouchableOpacity 
                  style={styles.primaryBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    const otpCode = otp.join('');
                    console.log("Verifying OTP:", otpCode);
                    showTemporaryMessage("Email verified successfully!");
                    
                  }}
                >
                  <Text style={styles.primaryBtnText}>Verify Email</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  
  header: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 30, // Reduced slightly to make room for message
  },

  // --- Success Message Styles ---
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9', // Light green background
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  successText: {
    color: '#00A884', // Green text
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },

  formContainer: {
    flex: 1,
    marginTop: 100, 
  },
  label: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
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
});

export default VerifyEmailPage;