import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import customerProfileServices from '@/services/api/methods/profileService';
import OtherPagesInc from '@/components/includes/otherPagesInc';

export default function ProfileDetails() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const [userId, setUserId] = useState('');
  const [panMasked, setPanMasked] = useState('');
  const [aadharMasked, setAadharMasked] = useState('');

  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const response: any = await customerProfileServices.getAllProfiles();

        if (!mounted) return;

        const userData = response?.user ?? {};

        setUsername(userData.name ?? '');
        setEmail(userData.email ?? '');
        setPhone(userData.phone ?? '');
        setUserId(userData.id ? String(userData.id).padStart(10, '0') : '');
        
        setIsEmailVerified(!!userData.email_verified_at);

        const apiGender = userData.gender ? userData.gender.toLowerCase() : 'male';
        setGender(apiGender === 'female' ? 'Female' : 'Male');

        setPanMasked(userData.pan_card_masked ?? '******XXXX'); 
        setAadharMasked(userData.adhar_card_masked ?? '**** **** XXXX');

        if (userData.dob) {
          const datePart = userData.dob.split('T')[0];
          const [y, m, d] = datePart.split('-');
          setYear(y ?? '');
          setMonth(m ?? '');
          setDay(d ?? '');
        }

      } catch (err) {
        console.warn('Profile fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <OtherPagesInc>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#005BC1" />
        </View>
      </OtherPagesInc>
    );
  }

  return (
    <OtherPagesInc>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.pageTitle}>Profile</Text>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput 
              style={styles.input} 
              value={username} 
              onChangeText={setUsername} 
              placeholder="Enter username"
            />
          </View>

          {/* User ID */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>User ID</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userId}
              editable={false}
            />
          </View>

          {/* PAN & Aadhar */}
          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Pan Number</Text>
              <Text style={styles.staticValue}>{panMasked}</Text>
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Aadhar Number</Text>
              <Text style={styles.staticValue}>{aadharMasked}</Text>
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.emailContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              {!isEmailVerified && (
                <View style={styles.notVerifiedBadge}>
                  <Text style={styles.notVerifiedText}>Not Verified</Text>
                </View>
              )}
            </View>
            {!isEmailVerified && (
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={() => router.push('/pages/profile/verifyEmail')}
              >
                <Text style={styles.verifyBtnText}>Verify Email</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={styles.changeNumberBtn}
              onPress={() => router.push('/pages/profile/verifyNumber')}
            >
              <Text style={styles.changeNumberText}>Change Number</Text>
            </TouchableOpacity>
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {(['Male', 'Female'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* DOB */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date Of Birth</Text>
            <View style={styles.dobRow}>
              <TextInput 
                style={styles.dobInput} 
                value={day} 
                onChangeText={setDay} 
                placeholder="DD"
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput 
                style={styles.dobInput} 
                value={month} 
                onChangeText={setMonth} 
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
              />
              <TextInput
                style={[styles.dobInput, { width: 80 }]}
                value={year}
                onChangeText={setYear}
                placeholder="YYYY"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </OtherPagesInc>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  scrollContent: { 
    padding: 10, 
    paddingTop: 10,
    paddingBottom: 40 
  },
  pageTitle: { fontSize: 23, fontWeight: '600', marginBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',
  },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#000',
  },
  disabledInput: { color: '#9CA3AF', backgroundColor: '#F3F4F6' },
  row: { flexDirection: 'row', marginBottom: 24 },
  halfCol: { flex: 1 },
  staticValue: { fontSize: 14, fontWeight: '500', marginTop: 4 },
  emailContainer: { flexDirection: 'row', alignItems: 'center' },
  notVerifiedBadge: {
    position: 'absolute',
    right: 12,
    backgroundColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  notVerifiedText: { color: '#EF4444', fontSize: 10 },
  verifyBtn: {
    backgroundColor: '#005BC1',
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyBtnText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  changeNumberBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
  },
  changeNumberText: { color: '#EF4444', fontSize: 13, fontWeight: '500' },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  genderBtnActive: { backgroundColor: '#005BC1', borderColor: '#005BC1' },
  genderText: { fontSize: 14, color: '#374151' },
  genderTextActive: { color: '#fff' },
  dobRow: { flexDirection: 'row', gap: 12 },
  dobInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    width: 60,
    textAlign: 'center',
    color: '#000',
  },
});