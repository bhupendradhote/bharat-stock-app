import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Image,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; 

const MOCK_HISTORY = [
  { id: '1024', subject: 'KYC Verification Pending', status: 'pending', date: '2 mins ago', category: 'Account' },
  { id: '1023', subject: 'Payment deduction issue', status: 'resolved', date: 'Yesterday', category: 'Payment' },
  { id: '1021', subject: 'App crashing on login', status: 'rejected', date: '12 Oct 2024', category: 'Technical' },
];

const CATEGORIES = ['Account Issue', 'Payment/Billing', 'KYC Verification', 'Technical Bug', 'Other'];

export default function SupportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);


  const handleAttachment = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to attach screenshots.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setAttachment(result.assets[0].uri);
    }
  };

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Incomplete', 'Please provide a subject and description.');
      return;
    }

    setSubmitting(true);

    // Simulate API Call
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert('Success', 'Your ticket has been raised successfully! Ticket ID: #8839', [
        {
          text: 'View Status',
          onPress: () => {
            setSubject('');
            setDescription('');
            setAttachment(null);
            setActiveTab('history');
          },
        },
      ]);
    }, 1500);
  };

  const openLink = (type: 'whatsapp' | 'email' | 'call') => {
    switch (type) {
      case 'whatsapp':
        Linking.openURL('whatsapp://send?phone=919876543210&text=Hi, I need help.');
        break;
      case 'email':
        Linking.openURL('mailto:support@bharatstock.com');
        break;
      case 'call':
        Linking.openURL('tel:+919876543210');
        break;
    }
  };

  // --- Renderers ---

  const renderCreateTicket = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Raise a New Ticket</Text>
        <Text style={styles.cardSubtitle}>Describe your issue and we will get back to you.</Text>

        <Text style={styles.label}>Category</Text>
        <TouchableOpacity 
          style={styles.dropdownBtn} 
          activeOpacity={0.8}
          onPress={() => setShowCatDropdown(!showCatDropdown)}
        >
          <Text style={styles.dropdownText}>{category}</Text>
          <Ionicons name={showCatDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
        </TouchableOpacity>
        
        {showCatDropdown && (
          <View style={styles.dropdownList}>
            {CATEGORIES.map((cat, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.dropdownItem, idx === CATEGORIES.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => {
                  setCategory(cat);
                  setShowCatDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, category === cat && { color: '#005BC1', fontWeight: '600' }]}>{cat}</Text>
                {category === cat && <Ionicons name="checkmark" size={18} color="#005BC1" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. KYC not verified"
          placeholderTextColor="#999"
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tell us more about the issue..."
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Attachment (Optional)</Text>
        <TouchableOpacity style={styles.attachBtn} onPress={handleAttachment}>
          <Ionicons name="attach" size={20} color="#555" />
          <Text style={styles.attachText}>
            {attachment ? 'Image Attached (Tap to change)' : 'Upload Screenshot'}
          </Text>
        </TouchableOpacity>

        {attachment && (
          <Image source={{ uri: attachment }} style={styles.previewImage} resizeMode="cover" />
        )}

        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleSubmitTicket} 
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Ticket</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.orText}>Or connect with us directly</Text>
      <View style={styles.contactRow}>
        <TouchableOpacity style={styles.contactItem} onPress={() => openLink('email')}>
          <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
            <MaterialCommunityIcons name="email-outline" size={24} color="#0284C7" />
          </View>
          <Text style={styles.contactLabel}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={() => openLink('whatsapp')}>
          <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
            <MaterialCommunityIcons name="whatsapp" size={24} color="#16A34A" />
          </View>
          <Text style={styles.contactLabel}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={() => openLink('call')}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
            <MaterialCommunityIcons name="phone-outline" size={24} color="#DC2626" />
          </View>
          <Text style={styles.contactLabel}>Call Us</Text>
        </TouchableOpacity>
      </View>
      <View style={{height: 40}} />
    </ScrollView>
  );

  const renderHistory = () => (
    <FlatList
      data={MOCK_HISTORY}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="documents-outline" size={64} color="#ddd" />
          <Text style={styles.emptyText}>No tickets found</Text>
        </View>
      }
      renderItem={({ item }) => {
        let statusColor = '#EAB308'; 
        if (item.status === 'resolved') statusColor = '#16A34A'; 
        if (item.status === 'rejected') statusColor = '#DC2626';

        return (
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View style={styles.ticketIdBadge}>
                <Text style={styles.ticketIdText}>#{item.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.ticketSubject}>{item.subject}</Text>
            <Text style={styles.ticketMeta}>{item.category} • {item.date}</Text>
            
            <TouchableOpacity style={styles.viewBtn}>
               <Text style={styles.viewBtnText}>View Details</Text>
               <Ionicons name="chevron-forward" size={16} color="#005BC1" />
            </TouchableOpacity>
          </View>
        );
      }}
    />
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'create' && styles.activeTab]} 
            onPress={() => setActiveTab('create')}
          >
            <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>Raise Ticket</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>My Tickets</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
        >
          {activeTab === 'create' ? renderCreateTicket() : renderHistory()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  
  /* Tabs */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#005BC1',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#005BC1',
    fontWeight: '700',
  },

  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#000',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  /* Dropdown */
  dropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
  },
  dropdownList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },

  /* Attachments */
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  attachText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 12,
  },

  submitBtn: {
    backgroundColor: '#005BC1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#005BC1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  /* Contact Options */
  orText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  contactItem: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },

  /* History List */
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketIdBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ticketIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  ticketMeta: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#005BC1',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
  },
});