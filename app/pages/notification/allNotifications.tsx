import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import notificationServices from '@/services/api/methods/notificationService';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const response = await notificationServices.getAllNotifications();
      
      const rawData = Array.isArray(response) 
        ? response 
        : (response?.data && Array.isArray(response.data)) 
          ? response.data 
          : [];

      const formatted: NotificationItem[] = rawData.map((item: any) => ({
        id: String(item.id),
        type: item.type || 'General',
        title: item.title || 'Notification',
        message: item.message || '',
        read: item.read_at !== null, 
        time: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      }));

      setNotifications(formatted);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ NAVIGATION LOGIC BASED ON TYPE
  const handleNavigation = (type: string) => {
    const routeMap: Record<string, any> = {
      announcement: '/announcements',
      chat: '/chat',
      tip: '/market-calls',
      ticket: '/pages/support/SupportPage',
    };

    const targetRoute = routeMap[type.toLowerCase()];
    if (targetRoute) {
      router.push(targetRoute);
    }
  };

  const filterCategories = useMemo(() => {
    const types = notifications.map(n => n.type);
    return ['All', ...Array.from(new Set(types))];
  }, [notifications]);

  const filteredData = useMemo(() => {
    if (activeTab === 'All') return notifications;
    return notifications.filter((n) => n.type === activeTab);
  }, [activeTab, notifications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(true);
  }, []);

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity 
      style={[styles.card, !item.read && styles.unreadCard]} 
      activeOpacity={0.8}
      onPress={async () => {
        if(!item.read) {
            await notificationServices.markAsRead(item.id);
            fetchNotifications(true);
        }
        handleNavigation(item.type);
      }}
    >
      <View style={styles.cardRow}>
        <View style={styles.iconContainer}>
            <Feather 
              name={item.type === 'chat' ? "message-square" : "bell"} 
              size={18} 
              color={item.read ? "#999" : "#005BC1"} 
            />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.typeLabel}>{item.type.replace('_', ' ')}</Text> 
        </View>
        {!item.read && <View style={styles.dot} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          data={filterCategories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => setActiveTab(item)}
              style={[styles.tab, activeTab === item && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === item && styles.activeTabText]}>
                {item.charAt(0).toUpperCase() + item.slice(1).replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#005BC1" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No {activeTab} notifications</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginTop: Platform.OS === 'android' ? 30 : 0,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  tabContainer: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    marginRight: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTab: { backgroundColor: '#005BC1' },
  tabText: { fontSize: 13, color: '#6B7280' },
  activeTabText: { color: '#FFF', fontWeight: '700' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: '#005BC1' },
  cardRow: { flexDirection: 'row' },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  title: { fontSize: 14, fontWeight: '600' },
  unreadTitle: { fontWeight: '800', color: '#000' },
  time: { fontSize: 10, color: '#999' },
  message: { fontSize: 13, color: '#666', lineHeight: 18 },
  typeLabel: {
    fontSize: 10,
    color: '#005BC1',
    marginTop: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginTop: 5 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: '#999' },
});