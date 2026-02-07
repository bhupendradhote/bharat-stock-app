import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

// --- Types ---
type NotificationType = 'trading_buy' | 'trading_sell' | 'system' | 'offer' | 'payment';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// --- Mock Data ---
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'trading_buy',
    title: 'Buy Alert: TATASTEEL',
    message: 'Target 150 achieved. Book partial profit now.',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'payment',
    title: 'Subscription Successful',
    message: 'Your payment of ₹2,499 for Premium Plan was successful.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'trading_sell',
    title: 'Stop Loss Hit: RELIANCE',
    message: 'Market turning bearish. Exit position at 2400.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'KYC Verified',
    message: 'Your documents have been approved. You can now start trading.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '5',
    type: 'offer',
    title: '20% Off Renewal',
    message: 'Renew your plan before 10th Feb and save flat 20%.',
    time: '2 days ago',
    read: true,
  },
];

// --- Components ---

const TabButton = ({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) => (
  <TouchableOpacity
    style={[styles.tab, isActive && styles.activeTab]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
);

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  // Filter Logic
  const getFilteredData = () => {
    if (activeTab === 'All') return notifications;
    if (activeTab === 'Trading') return notifications.filter(n => n.type.includes('trading'));
    if (activeTab === 'System') return notifications.filter(n => ['system', 'payment'].includes(n.type));
    if (activeTab === 'Offers') return notifications.filter(n => n.type === 'offer');
    return notifications;
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
  };

  // Icon Helper
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'trading_buy':
        return <Feather name="trending-up" size={20} color="#059669" />;
      case 'trading_sell':
        return <Feather name="trending-down" size={20} color="#DC2626" />;
      case 'payment':
        return <MaterialIcons name="payment" size={20} color="#005BC1" />;
      case 'system':
        return <Feather name="shield" size={20} color="#7C3AED" />;
      case 'offer':
        return <MaterialCommunityIcons name="tag-outline" size={20} color="#D97706" />;
      default:
        return <Feather name="bell" size={20} color="#666" />;
    }
  };

  // Background Color Helper for Icon
  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case 'trading_buy': return '#ECFDF5';
      case 'trading_sell': return '#FEF2F2';
      case 'payment': return '#E0F2FE';
      case 'system': return '#F3E8FF';
      case 'offer': return '#FFFBEB';
      default: return '#F3F4F6';
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity style={[styles.card, !item.read && styles.unreadCard]} activeOpacity={0.7}>
      <View style={styles.cardRow}>
        {/* Icon Section */}
        <View style={[styles.iconContainer, { backgroundColor: getIconBg(item.type) }]}>
          {getIcon(item.type)}
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        </View>
        
        {/* Unread Dot */}
        {!item.read && <View style={styles.dot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadText}>Read All</Text>
        </TouchableOpacity>
      </View>

      {/* --- Tabs --- */}
      <View style={styles.tabContainer}>
        <TabButton title="All" isActive={activeTab === 'All'} onPress={() => setActiveTab('All')} />
        <TabButton title="Trading" isActive={activeTab === 'Trading'} onPress={() => setActiveTab('Trading')} />
        <TabButton title="System" isActive={activeTab === 'System'} onPress={() => setActiveTab('System')} />
        <TabButton title="Offers" isActive={activeTab === 'Offers'} onPress={() => setActiveTab('Offers')} />
      </View>

      {/* --- List --- */}
      <FlatList
        data={getFilteredData()}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Feather name="bell-off" size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>Youre all caught up! Check back later for updates.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 40,

    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  markReadText: {
    fontSize: 14,
    color: '#005BC1',
    fontWeight: '600',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  tab: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#E0F2FE', // Light blue bg
    borderColor: '#005BC1',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#005BC1',
    fontWeight: '700',
  },

  // List & Cards
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    // Soft Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  unreadCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E7FF',
    borderLeftWidth: 4,
    borderLeftColor: '#005BC1',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  unreadTitle: {
    color: '#000',
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  message: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444', // Red dot
    marginTop: 6,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});