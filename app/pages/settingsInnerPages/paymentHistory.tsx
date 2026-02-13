import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import OtherPagesInc from '@/components/includes/otherPagesInc';
import subscriptionService, { Invoice } from '@/services/api/methods/subscriptionService';

export default function PaymentHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

 const fetchHistory = async () => {
  try {
    const response = await subscriptionService.getInvoices();
    
    // DEBUG LOGS - Check your terminal/debugger
    console.log("Full API Response:", response);
    
    if (response.success && Array.isArray(response.data)) {
      setInvoices(response.data);
    } else {
      console.log("Response success was false or data is not an array");
      setInvoices([]);
    }
  } catch (error: any) {
    console.error("API Error Details:", error?.response?.data || error.message);
    Alert.alert('Error', 'Could not connect to server');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleDownload = async (invoiceId: number) => {
    setDownloadingId(invoiceId);
    try {
      // Calls your downloadInvoice($id) backend function
      const res = await subscriptionService.getInvoiceDownloadUrl(invoiceId);
      if (res.success && res.download_url) {
        await Linking.openURL(res.download_url);
      } else {
        Alert.alert('Error', 'Could not generate download link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open invoice');
    } finally {
      setDownloadingId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    // Accessing nested data from your Laravel relations:
    // subscription -> plan -> name
    // subscription -> duration -> duration (label)
    const planName = item.subscription?.plan?.name || 'Service Plan';
    const durationLabel = item.subscription?.duration?.duration || '';

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.infoCol}>
            <Text style={styles.planText}>{planName}</Text>
            {durationLabel ? <Text style={styles.subPlanText}>{durationLabel}</Text> : null}
            
            <Text style={styles.dateText}>
              {new Date(item.invoice_date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
            <Text style={styles.idText}>ID: {item.invoice_number}</Text>
          </View>

          <View style={styles.statusCol}>
            <Text style={styles.amountText}>₹{item.amount}</Text>
            <View style={[styles.badge, styles.badgeSuccess]}>
              <Text style={[styles.badgeText, styles.textSuccess]}>SUCCESS</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.downloadRow} 
          onPress={() => handleDownload(item.id)}
          disabled={downloadingId === item.id}
        >
          {downloadingId === item.id ? (
            <ActivityIndicator size="small" color="#005BC1" />
          ) : (
            <>
              <Feather name="download" size={16} color="#005BC1" />
              <Text style={styles.downloadText}>Download Invoice</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <OtherPagesInc>
      <Stack.Screen options={{ headerShown: false }} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#005BC1" />
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#005BC1']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={50} color="#E5E7EB" />
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
        />
      )}
    </OtherPagesInc>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  planText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subPlanText: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  dateText: { fontSize: 13, color: '#6B7280', marginTop: 8 },
  idText: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  statusCol: { alignItems: 'flex-end' },
  amountText: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeSuccess: { backgroundColor: '#D1FAE5' },
  badgeText: { fontSize: 10, fontWeight: '800' },
  textSuccess: { color: '#065F46' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  downloadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  downloadText: { fontSize: 14, color: '#005BC1', fontWeight: '600', marginLeft: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});