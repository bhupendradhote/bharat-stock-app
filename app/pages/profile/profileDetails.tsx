import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

export default function ProfileDetails() {
  const router = useRouter();

  const [username, setUsername] = useState('Vasanth Kumar V');
  const [email, setEmail] = useState('vasanthkumarv@gmail.com');
  const [phone, setPhone] = useState('+91 9876543210');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  
  const [day, setDay] = useState('13');
  const [month, setMonth] = useState('07');
  const [year, setYear] = useState('2003');

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

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
        <Text style={styles.pageTitle}>Profile</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>User ID</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value="0000000001"
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Pan Number</Text>
              <Text style={styles.staticValue}>******945N</Text>
            </View>
            <View style={styles.halfCol}>
              <Text style={styles.label}>Aadhar Number</Text>
              <Text style={styles.staticValue}>**** **** 0923</Text>
            </View>
          </View>

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
            <TouchableOpacity style={styles.verifyBtn}
             onPress={() => router.push('/pages/profile/verifyEmail')}
             >
              <Text style={styles.verifyBtnText}>Verify Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.changeNumberBtn}
            onPress={() => router.push('/pages/profile/verifyNumber')}
            >
              <Text style={styles.changeNumberText}>Change Number</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity 
                style={[styles.genderBtn, gender === 'Male' && styles.genderBtnActive]}
                onPress={() => setGender('Male')}
              >
                <Text style={[styles.genderText, gender === 'Male' && styles.genderTextActive]}>Male</Text>
              </TouchableOpacity>
              
              <View style={{ width: 12 }} />

              <TouchableOpacity 
                style={[styles.genderBtn, gender === 'Female' && styles.genderBtnActive]}
                onPress={() => setGender('Female')}
              >
                <Text style={[styles.genderText, gender === 'Female' && styles.genderTextActive]}>Female</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date Of Birth</Text>
            <View style={styles.dobRow}>
              <TextInput
                style={styles.dobInput}
                value={day}
                onChangeText={setDay}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="DD"
              />
              <TextInput
                style={styles.dobInput}
                value={month}
                onChangeText={setMonth}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="MM"
              />
              <TextInput
                style={[styles.dobInput, { width: 80 }]}
                value={year}
                onChangeText={setYear}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="YYYY"
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 23, 
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D9D9D9',

  },
  
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // Light gray border
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#fff', 
        color: '#9CA3AF',
  },

  row: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  halfCol: {
    flex: 1,
  },
  staticValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },

  // Email Section
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  notVerifiedBadge: {
    position: 'absolute',
    right: 12,
    backgroundColor: '#FECACA', // Light red background
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  notVerifiedText: {
    color: '#EF4444', // Red text
    fontSize: 10,
    fontWeight: '500',
  },
  verifyBtn: {
    backgroundColor: '#005BC1',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },

  // Phone Section
  changeNumberBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EF4444', // Red border
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2', // Very light red bg
  },
  changeNumberText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },

  // Gender Section
  genderRow: {
    flexDirection: 'row',
  },
  genderBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minWidth: 80,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: '#005BC1',
    borderColor: '#005BC1',
  },
  genderText: {
    fontSize: 14,
    color: '#000',
  },
  genderTextActive: {
    color: '#fff',
  },

  // Date of Birth Section
  dobRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dobInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 10,
    textAlign: 'center',
    width: 60,
    fontSize: 14,
    color: '#000',
  },
});