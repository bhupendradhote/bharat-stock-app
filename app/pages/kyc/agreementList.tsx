// app/KycAgreementPage.tsx
import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  FlatList,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import AgreementService, { SignedAgreement } from '@/services/api/methods/agreementService';

export default function KycAgreementPage() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [agreements, setAgreements] = useState<SignedAgreement[]>([]);

  // Fetch all agreements
  const fetchAgreements = async () => {
    try {
      const response = await AgreementService.getAgreementsList();
      if (response && response.success) {
        setAgreements(response.data || []);
      } else {
        Alert.alert('Notice', 'Unable to load agreements at this time.');
      }
    } catch (error: any) {
      console.warn('Error fetching agreements:', error);
      Alert.alert('Error', 'Something went wrong while fetching your agreements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchAgreements();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAgreements();
  };

  const handleOpenPdf = async (url: string | null) => {
    if (!url) {
      Alert.alert('Not Available', 'The PDF document is not available for this agreement.');
      return;
    }
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this file type.');
      }
    } catch (error) {
      console.warn('Error opening URL:', error);
      Alert.alert('Error', 'An error occurred while trying to open the document.');
    }
  };

  // Utility to determine status colors
  const getStatusStyles = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'signed' || s === 'active') return { bg: '#ECFDF5', text: '#059669' }; // Green
    if (s === 'pending' || s === 'draft') return { bg: '#FEF3C7', text: '#D97706' }; // Orange
    if (s === 'expired' || s === 'cancelled' || s === 'failed') return { bg: '#FEE2E2', text: '#DC2626' }; // Red
    return { bg: '#F3F4F6', text: '#374151' }; // Gray fallback
  };

  // Format date nicely
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Render individual agreement card
  const renderItem = ({ item }: { item: SignedAgreement }) => {
    const statusStyle = getStatusStyles(item.status);
    const amount = item.invoice?.amount ? `₹${item.invoice.amount}` : 'N/A';
    const displayDate = item.signed_at ? formatDate(item.signed_at) : formatDate(item.created_at);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.agreementNo}>{item.agreement_no}</Text>
            <Text style={styles.dateText}>{displayDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsRow}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Invoice Amount</Text>
            <Text style={styles.detailValue}>{amount}</Text>
          </View>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Plan / Duration</Text>
            <Text style={styles.detailValue}>
              {item.plan?.plan_id ? 'Standard Plan' : 'Custom'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.pdfButton, !item.pdf?.url && styles.pdfButtonDisabled]}
          activeOpacity={0.8}
          disabled={!item.pdf?.url}
          onPress={() => handleOpenPdf(item.pdf?.url)}
        >
          <Ionicons 
            name="document-text-outline" 
            size={18} 
            color={item.pdf?.url ? "#005BC1" : "#9CA3AF"} 
            style={{ marginRight: 6 }} 
          />
          <Text style={[styles.pdfButtonText, !item.pdf?.url && { color: '#9CA3AF' }]}>
            {item.pdf?.url ? 'View Agreement PDF' : 'PDF Not Available'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backWrap} activeOpacity={0.8} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Agreements</Text>
          <View style={{ width: 40 }} /> {/* Spacer for centering */}
        </View>

        {/* Main Content */}
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#005BC1" />
          </View>
        ) : (
          <FlatList
            data={agreements}
            keyExtractor={(item) => item.agreement_id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#005BC1']} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={60} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No Agreements Found</Text>
                <Text style={styles.emptySubtitle}>You do not have any agreements or drafts yet.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  backWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  
  /* Card Styles */
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  agreementNo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F5FA',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0EFFF',
  },
  pdfButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  pdfButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#005BC1',
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});