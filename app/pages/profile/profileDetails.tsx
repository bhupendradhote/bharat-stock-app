import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import customerProfileServices from '@/services/api/methods/profileService';

export default function ProfileDetails() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        const response: any = await customerProfileServices.getAllProfiles();

        // normalize response
        const profile = response?.data ?? response ?? {};

        if (!mounted) return;

        setUsername(profile.name ?? '');
        setEmail(profile.email ?? '');
        setPhone(profile.phone ?? '');
        setUserId(profile.id ? String(profile.id).padStart(10, '0') : '');

        // optional masked fields
        setPanMasked(profile.pan_masked ?? '******XXXX');
        setAadharMasked(profile.aadhar_masked ?? '**** **** XXXX');

        if (profile.gender === 'Female') setGender('Female');
        else setGender('Male');

        // DOB parsing (YYYY-MM-DD)
        if (profile.dob) {
          const [y, m, d] = profile.dob.split('-');
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
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.pageTitle}>Profile</Text>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} />
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
              <View style={styles.notVerifiedBadge}>
                <Text style={styles.notVerifiedText}>Not Verified</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={() => router.push('/pages/profile/verifyEmail')}
            >
              <Text style={styles.verifyBtnText}>Verify Email</Text>
            </TouchableOpacity>
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
              <TextInput style={styles.dobInput} value={day} onChangeText={setDay} />
              <TextInput style={styles.dobInput} value={month} onChangeText={setMonth} />
              <TextInput
                style={[styles.dobInput, { width: 80 }]}
                value={year}
                onChangeText={setYear}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================== STYLES (UNCHANGED) ================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerRow: { paddingHorizontal: 16, paddingVertical: 12 },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
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
  },
  disabledInput: { color: '#9CA3AF' },
  row: { flexDirection: 'row', marginBottom: 24 },
  halfCol: { flex: 1 },
  staticValue: { fontSize: 14, fontWeight: '500' },
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
  },
  verifyBtnText: { color: '#fff', fontSize: 13 },
  changeNumberBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#FEF2F2',
  },
  changeNumberText: { color: '#EF4444', fontSize: 13 },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  genderBtnActive: { backgroundColor: '#005BC1', borderColor: '#005BC1' },
  genderText: { fontSize: 14 },
  genderTextActive: { color: '#fff' },
  dobRow: { flexDirection: 'row', gap: 12 },
  dobInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    width: 60,
    textAlign: 'center',
  },
});
