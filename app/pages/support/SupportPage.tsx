import React, { useState, useCallback, useEffect } from 'react';
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
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment'; 
import ticketServices from '@/services/api/methods/ticketServices';

const { width, height } = Dimensions.get('window');

interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  issue: string;
  description: string;
  admin_note?: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'In Progress' | 'Open' | 'Resolved';
  created_at: string;
  updated_at: string;
  attachment?: string;      // Path from DB
  attachment_url?: string;  // Full URL helper
}

const CATEGORIES = ['Account Issue', 'Payment/Billing', 'KYC Verification', 'Technical Bug', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function SupportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // --- Form State ---
  const [issue, setIssue] = useState(CATEGORIES[0]); 
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Low');
  const [attachment, setAttachment] = useState<string | null>(null); 
  
  // --- UI State ---
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  
  // --- Details Modal State ---
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false); // For viewing attachment full screen

  const [tickets, setTickets] = useState<Ticket[]>([]);

  // --- 1. Fetch Tickets (Read) ---
  const fetchTickets = async () => {
    try {
      setLoadingHistory(true);
      const apiResponse = await ticketServices.getTicketList();
      
      let ticketData = [];
      if (Array.isArray(apiResponse)) {
        ticketData = apiResponse;
      } else if (apiResponse.tickets && Array.isArray(apiResponse.tickets)) {
        ticketData = apiResponse.tickets;
      } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
        ticketData = apiResponse.data;
      } else if (apiResponse.ticket && Array.isArray(apiResponse.ticket)) {
         ticketData = apiResponse.ticket;
      }
      setTickets(ticketData);
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert('Error', 'Failed to load ticket history.');
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchTickets();
    }
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets();
  }, []);

  // --- 2. Handle Attachment (Upload) ---
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

  // --- 3. Submit Ticket (Create) ---
  const handleSubmitTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Incomplete', 'Please provide a subject and description.');
      return;
    }

    setSubmitting(true);

    try {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('issue', issue);
      formData.append('description', description);
      formData.append('priority', priority);
      // @ts-ignore
      formData.append('status', 'Open');

      if (attachment) {
        const filename = attachment.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;
        // @ts-ignore
        formData.append('attachment', { uri: attachment, name: filename, type });
      }

      await ticketServices.storeTicket(formData);

      Alert.alert('Success', 'Your ticket has been raised successfully!', [
        {
          text: 'View Status',
          onPress: () => {
            setSubject(''); setDescription(''); setAttachment(null); setPriority('Low');
            setActiveTab('history');
            fetchTickets();
          },
        },
      ]);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Submission Failed', 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- 4. Fetch Single Ticket Details ---
  const handleViewDetails = async (ticketId: number) => {
    setDetailsModalVisible(true);
    setLoadingDetails(true);
    setSelectedTicket(null); // Clear previous

    try {
      const response = await ticketServices.getTicketDetails(ticketId);
      // Handle response structure (ticket object inside response)
      const data = response.ticket || response.data || response;
      setSelectedTicket(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not fetch ticket details.');
      setDetailsModalVisible(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const openLink = (type: 'whatsapp' | 'email' | 'call') => {
    switch (type) {
      case 'whatsapp': Linking.openURL('whatsapp://send?phone=919876543210&text=Hi, I need help.'); break;
      case 'email': Linking.openURL('mailto:support@bharatstock.com'); break;
      case 'call': Linking.openURL('tel:+919876543210'); break;
    }
  };

  // --- Renderers ---

  const renderCreateTicket = () => (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Raise a New Ticket</Text>
        <Text style={styles.cardSubtitle}>Describe your issue and we will get back to you.</Text>

        <Text style={styles.label}>Issue Type</Text>
        <TouchableOpacity 
          style={styles.dropdownBtn} 
          activeOpacity={0.8}
          onPress={() => { setShowCatDropdown(!showCatDropdown); setShowPriorityDropdown(false); }}
        >
          <Text style={styles.dropdownText}>{issue}</Text>
          <Ionicons name={showCatDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
        </TouchableOpacity>
        
        {showCatDropdown && (
          <View style={styles.dropdownList}>
            {CATEGORIES.map((cat, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.dropdownItem, idx === CATEGORIES.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => { setIssue(cat); setShowCatDropdown(false); }}
              >
                <Text style={[styles.dropdownItemText, issue === cat && { color: '#005BC1', fontWeight: '600' }]}>{cat}</Text>
                {issue === cat && <Ionicons name="checkmark" size={18} color="#005BC1" />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Priority</Text>
        <TouchableOpacity 
          style={styles.dropdownBtn} 
          activeOpacity={0.8}
          onPress={() => { setShowPriorityDropdown(!showPriorityDropdown); setShowCatDropdown(false); }}
        >
          <Text style={styles.dropdownText}>{priority}</Text>
          <Ionicons name={showPriorityDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
        </TouchableOpacity>

        {showPriorityDropdown && (
          <View style={styles.dropdownList}>
            {PRIORITIES.map((p, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.dropdownItem, idx === PRIORITIES.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => { setPriority(p); setShowPriorityDropdown(false); }}
              >
                <Text style={[styles.dropdownItemText, priority === p && { color: '#005BC1', fontWeight: '600' }]}>{p}</Text>
                {priority === p && <Ionicons name="checkmark" size={18} color="#005BC1" />}
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
            {attachment ? 'Image Selected (Tap to change)' : 'Upload Screenshot'}
          </Text>
        </TouchableOpacity>

        {attachment && (
          <Image source={{ uri: attachment }} style={styles.previewImage} resizeMode="cover" />
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitTicket} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Ticket</Text>}
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
      data={tickets}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        !loadingHistory ? (
          <View style={styles.emptyState}>
            <Ionicons name="documents-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>No tickets found</Text>
          </View>
        ) : (
          <View style={{ marginTop: 50 }}>
             <ActivityIndicator size="large" color="#005BC1" />
          </View>
        )
      }
      renderItem={({ item }) => {
        let statusColor = '#3B82F6'; 
        let statusBg = '#EFF6FF';
        if (item.status === 'In Progress') { statusColor = '#EAB308'; statusBg = '#FEF9C3'; } 
        else if (item.status === 'Resolved') { statusColor = '#16A34A'; statusBg = '#DCFCE7'; }

        return (
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View style={styles.ticketIdBadge}>
                <Text style={styles.ticketIdText}>#{item.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
              </View>
            </View>
            
            <Text style={styles.ticketSubject}>{item.subject}</Text>
            
            <View style={styles.metaRow}>
              <Text style={styles.ticketMeta}>{item.issue}</Text>
              <Text style={styles.ticketDot}>•</Text>
              <Text style={styles.ticketMeta}>{moment(item.created_at).fromNow()}</Text>
            </View>
            
            <View style={styles.divider} />

            <View style={styles.footerRow}>
               <View style={styles.priorityContainer}>
                  <Text style={styles.priorityLabel}>Priority: </Text>
                  <Text style={[styles.priorityValue, item.priority === 'High' ? { color: '#DC2626' } : { color: '#666' }]}>
                    {item.priority}
                  </Text>
               </View>

               <TouchableOpacity 
                 style={styles.viewBtn}
                 onPress={() => handleViewDetails(item.id)}
               >
                  <Text style={styles.viewBtnText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#005BC1" />
               </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );

  // --- Modal Renderer ---
  const renderDetailsModal = () => {
    if (!selectedTicket && !loadingDetails) return null;

    let statusColor = '#3B82F6';
    let statusBg = '#EFF6FF';
    if (selectedTicket?.status === 'In Progress') { statusColor = '#EAB308'; statusBg = '#FEF9C3'; } 
    else if (selectedTicket?.status === 'Resolved') { statusColor = '#16A34A'; statusBg = '#DCFCE7'; }

    return (
      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ticket Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)} style={styles.closeIcon}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {loadingDetails ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#005BC1" />
              </View>
            ) : selectedTicket && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                {/* Header Info */}
                <View style={styles.detailHeaderRow}>
                  <View style={styles.ticketIdBadge}>
                    <Text style={styles.ticketIdText}>#{selectedTicket.id}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{selectedTicket.status}</Text>
                  </View>
                </View>

                {/* Subject */}
                <Text style={styles.detailSubject}>{selectedTicket.subject}</Text>
                
                {/* Metadata Grid */}
                <View style={styles.metaGrid}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Category</Text>
                    <Text style={styles.metaValue}>{selectedTicket.issue}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Priority</Text>
                    <Text style={[styles.metaValue, selectedTicket.priority === 'High' && {color:'#DC2626'}]}>
                      {selectedTicket.priority}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Date</Text>
                    <Text style={styles.metaValue}>{moment(selectedTicket.created_at).format('DD MMM YYYY')}</Text>
                  </View>
                </View>

                {/* Description */}
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.sectionContent}>{selectedTicket.description}</Text>
                </View>

                {/* Admin Note */}
                {selectedTicket.admin_note && (
                  <View style={[styles.sectionContainer, styles.adminNoteBox]}>
                    <Text style={[styles.sectionTitle, { color: '#854D0E' }]}>
                      <Ionicons name="shield-checkmark" size={14} /> Admin Response
                    </Text>
                    <Text style={styles.sectionContent}>{selectedTicket.admin_note}</Text>
                  </View>
                )}

                {/* Attachment */}
                {(selectedTicket.attachment_url || selectedTicket.attachment) && (
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Attachment</Text>
                    <TouchableOpacity 
                      style={styles.attachmentPreview}
                      onPress={() => setImageModalVisible(true)}
                    >
                      <Image 
                        source={{ uri: selectedTicket.attachment_url || selectedTicket.attachment }} 
                        style={styles.attachmentImage} 
                        resizeMode="cover"
                      />
                      <View style={styles.zoomOverlay}>
                        <Ionicons name="expand" size={24} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.closeBtn} 
                  onPress={() => setDetailsModalVisible(false)}
                >
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>

        {/* Full Screen Image Modal */}
        <Modal visible={imageModalVisible} transparent={true} animationType="fade">
          <View style={styles.imageModalContainer}>
            <TouchableOpacity style={styles.imageModalClose} onPress={() => setImageModalVisible(false)}>
              <Ionicons name="close-circle" size={40} color="#fff" />
            </TouchableOpacity>
            {selectedTicket && (
              <Image 
                source={{ uri: selectedTicket.attachment_url || selectedTicket.attachment }} 
                style={styles.fullScreenImage} 
                resizeMode="contain" 
              />
            )}
          </View>
        </Modal>
      </Modal>
    );
  };

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

        {/* Render Popup */}
        {renderDetailsModal()}

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
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  
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
  activeTab: { borderBottomColor: '#005BC1' },
  tabText: { fontSize: 15, fontWeight: '500', color: '#666' },
  activeTabText: { color: '#005BC1', fontWeight: '700' },

  scrollContent: { padding: 16 },
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
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 12 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#000',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  
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
  dropdownText: { fontSize: 15, color: '#333' },
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
  dropdownItemText: { fontSize: 14, color: '#333' },

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
  attachText: { marginLeft: 8, color: '#555', fontSize: 14 },
  previewImage: { width: '100%', height: 150, borderRadius: 8, marginTop: 12 },

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
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  /* Contact Options */
  orText: { textAlign: 'center', color: '#888', fontSize: 14, marginBottom: 20 },
  contactRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  contactItem: { alignItems: 'center' },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactLabel: { fontSize: 13, color: '#444', fontWeight: '500' },

  /* History List */
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ticketIdBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ticketIdText: { fontSize: 12, fontWeight: '700', color: '#666' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  ticketSubject: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ticketMeta: { fontSize: 13, color: '#888' },
  ticketDot: { fontSize: 13, color: '#888', marginHorizontal: 6 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priorityContainer: { flexDirection: 'row' },
  priorityLabel: { fontSize: 12, color: '#888' },
  priorityValue: { fontSize: 12, fontWeight: '600' },
  viewBtn: { flexDirection: 'row', alignItems: 'center' },
  viewBtnText: { color: '#005BC1', fontSize: 14, fontWeight: '600', marginRight: 4 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, color: '#999', fontSize: 16 },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.8,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  closeIcon: { padding: 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  detailHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  detailSubject: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 20 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12 },
  metaItem: { width: '33.33%', marginBottom: 4 },
  metaLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  
  sectionContainer: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 8 },
  sectionContent: { fontSize: 15, color: '#444', lineHeight: 22 },
  
  adminNoteBox: {
    backgroundColor: '#FEFCE8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  
  attachmentPreview: { 
    height: 180, 
    borderRadius: 12, 
    overflow: 'hidden', 
    position: 'relative' 
  },
  attachmentImage: { width: '100%', height: '100%' },
  zoomOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  closeBtn: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  closeBtnText: { color: '#333', fontWeight: '600', fontSize: 16 },

  /* Full Screen Image Modal */
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullScreenImage: { width: width, height: height * 0.8 },
});