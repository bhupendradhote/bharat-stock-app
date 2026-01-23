/* eslint-disable react/no-unescaped-entities */
import React, { useState, useRef } from 'react';
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet,
  Platform, StatusBar, KeyboardAvoidingView, TouchableWithoutFeedback,
  Keyboard, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

import { authService } from '../../../services/api/methods/authService';
import { useAuth } from '../../context/AuthContext'; 

const LoginRegisterPage = () => {
  const router = useRouter();
  
  const { signIn } = useAuth(); 

  const [authMode, setAuthMode] = useState<'login' | 'register' | 'mobile' | 'otp'>('login');
  const [loading, setLoading] = useState(false);

  // Form Data
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [tempKey, setTempKey] = useState(''); 
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // --------------------------------------------------------------------------
  // 1. LOGIN HANDLER
  // --------------------------------------------------------------------------
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await authService.login({ login_identity: email, password });
      
      console.log("Login Success:", response);
      
      if (response.token) {
         await signIn(response.token, response.user);
      }
    } catch (error: any) {
      console.error("Login Failed:", error);
      const msg = error.response?.data?.message || "Login failed.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 2. REGISTER HANDLER
  // --------------------------------------------------------------------------
  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Missing Fields", "Please fill in all details.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Error", "Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        name: fullName,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
      });

      if (response.temp_key) {
        setTempKey(response.temp_key);
        setAuthMode('mobile'); 
      } else {
        Alert.alert("Error", "Unexpected response.");
      }
    } catch (error: any) {
      console.error("Register Failed:", error);
      if (error.response?.data?.errors) {
        const firstError = Object.values(error.response.data.errors)[0]; 
        Alert.alert("Validation Error", Array.isArray(firstError) ? String(firstError[0]) : "Invalid input");
      } else {
        Alert.alert("Error", error.response?.data?.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 3. SEND OTP
  // --------------------------------------------------------------------------
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert("Invalid Mobile", "Please enter a valid mobile number.");
      return;
    }

    setLoading(true);
    try {
      await authService.sendOtp(tempKey, phone);
      setAuthMode('otp');
      Alert.alert("OTP Sent", "Please check your mobile messages.");
    } catch (error: any) {
      console.error("Send OTP Failed:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 4. VERIFY OTP
  // --------------------------------------------------------------------------
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 4) {
      Alert.alert("Invalid OTP", "Please enter the complete OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.verifyOtp(tempKey, otpCode);
      
      if (response.token) {
        await signIn(response.token, response.user);
        
        Alert.alert("Verified!", "Account created. Logging in...");
      } else {
        setAuthMode('login');
        Alert.alert("Verified", "Please login with your new account.");
      }
    } catch (error: any) {
      console.error("Verify Failed:", error);
      Alert.alert("Error", error.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text.length === 1 && index < 5) inputRefs.current[index + 1]?.focus();
    if (text.length === 0 && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const getButtonText = () => {
    if (loading) return "Please wait...";
    switch(authMode) {
        case 'login': return 'Login';
        case 'register': return 'Next';
        case 'mobile': return 'Send OTP';
        case 'otp': return 'Verify & Login';
    }
  };

  const handleAction = () => {
    if (loading) return;
    switch(authMode) {
        case 'login': handleLogin(); break;
        case 'register': handleRegister(); break;
        case 'mobile': handleSendOtp(); break;
        case 'otp': handleVerifyOtp(); break;
    }
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
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    if (authMode === 'otp') setAuthMode('mobile');
                    else if (authMode === 'mobile') setAuthMode('register');
                    else if (authMode === 'register') setAuthMode('login');
                    else router.back();
                }}
              >
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>
              {authMode === 'login' ? 'Welcome Back 👋' 
               : authMode === 'register' ? 'Create Account' 
               : authMode === 'mobile' ? 'Mobile Number'
               : 'Verify OTP'}
            </Text>
            <Text style={styles.subtitle}>
              {authMode === 'login' ? 'Please enter your details to sign in.' 
               : authMode === 'register' ? 'Sign up to get started with your trading journey.'
               : authMode === 'mobile' ? 'Enter your mobile number to verify your account.'
               : `Enter the code sent to +91 ${phone}`}
            </Text>

            <View style={styles.formContainer}>
              
              {/* === REGISTER FIELDS === */}
              {authMode === 'register' && (
                <>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Full Name"
                            placeholderTextColor="#A0A0A0"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Email Address"
                            placeholderTextColor="#A0A0A0"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter Password"
                                placeholderTextColor="#A0A0A0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#A0A0A0" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Confirm Password"
                                placeholderTextColor="#A0A0A0"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#A0A0A0" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
              )}

              {/* === MOBILE FIELD === */}
              {authMode === 'mobile' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mobile Number</Text>
                    <View style={styles.phoneContainer}>
                        <Text style={styles.countryCode}>+91</Text>
                        <TextInput
                            style={styles.phoneInput}
                            placeholder="Enter Mobile Number"
                            placeholderTextColor="#A0A0A0"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                    </View>
                </View>
              )}

              {/* === OTP FIELD === */}
              {authMode === 'otp' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Verification Code</Text>
                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref }} 
                            style={styles.otpInput}
                            value={digit}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            placeholder="-"
                            placeholderTextColor="#C0C0C0"
                        />
                        ))}
                    </View>
                    <View style={{ alignItems: 'center', marginBottom: 10 }}>
                        <Text style={{ color: '#666' }}>
                            Didn't receive code? <Text style={{ color: '#005BC1', fontWeight: 'bold' }} onPress={handleSendOtp}>Resend</Text>
                        </Text>
                    </View>
                </View>
              )}

              {/* === LOGIN FIELDS === */}
              {authMode === 'login' && (
                <>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email or Mobile Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Email or Mobile"
                            placeholderTextColor="#A0A0A0"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter Password"
                                placeholderTextColor="#A0A0A0"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#A0A0A0" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.optionsRow}>
                        <TouchableOpacity 
                            style={styles.checkboxContainer}
                            activeOpacity={0.8}
                            onPress={() => setKeepSignedIn(!keepSignedIn)}
                        >
                            <MaterialCommunityIcons 
                                name={keepSignedIn ? "checkbox-marked" : "checkbox-blank-outline"} 
                                size={22} 
                                color={keepSignedIn ? "#005BC1" : "#A0A0A0"} 
                            />
                            <Text style={styles.checkboxLabel}>Keep me signed in</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => console.log("Forgot Password pressed")}>
                            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={handleAction}
                disabled={loading}
              >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.primaryBtnText}>{getButtonText()}</Text>
                )}
              </TouchableOpacity>

              {(authMode === 'login' || authMode === 'register') && (
                <View style={styles.footerRow}>
                    <Text style={styles.footerText}>
                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    </Text>
                    <TouchableOpacity onPress={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                        <Text style={styles.linkText}>
                            {authMode === 'login' ? 'Create Account' : 'Login'}
                        </Text>
                    </TouchableOpacity>
                </View>
              )}

              {authMode === 'login' && (
                <View style={styles.testimonialCard}>
                  <Text style={styles.quoteText}>
                    "Transparency, risk awareness, and long-term value creation are the foundation of our research."
                  </Text>
                  <View style={styles.profileRow}>
                    <View style={styles.avatarCircle}><Text style={styles.avatarText}>NR</Text></View>
                    <View>
                      <Text style={styles.profileName}>Namita Rathore</Text>
                      <Text style={styles.profileTitle}>Proprietor & Research Analyst</Text>
                    </View>
                  </View>
                </View>
              )}

            </View>

          </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
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
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
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
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  countryCode: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    marginRight: 10,
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#ccc'
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#000',
  },
  eyeIcon: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#005BC1',
    fontWeight: '500',
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#005BC1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    fontSize: 14,
    color: '#005BC1',
    fontWeight: '600',
  },
  testimonialCard: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderRadius: 16, 
    padding: 14,    
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',  
  },
  quoteText: {
    fontStyle: 'italic',
    color: '#334155', 
    fontSize: 14,    
    lineHeight: 20,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row', 
    alignItems: 'center',
  },
  avatarCircle: {
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold', 
    fontSize: 14,
  },
  profileName: {
    fontSize: 14, 
    fontWeight: '700',
    color: '#0F172A', 
  },
  profileTitle: {
    fontSize: 12, 
    color: '#64748B', 
    marginTop: 2,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 45,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
    fontWeight: '500',
  },
});

export default LoginRegisterPage;