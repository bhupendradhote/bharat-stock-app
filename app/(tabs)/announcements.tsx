import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ListRenderItem,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import announcementServices from '@/services/api/methods/announcementService';

const { width } = Dimensions.get('window');

interface AnnouncementItem {
  id: string;
  title: string;
  subtitle: string;
  contentDetail: string;
  when: string;
  tag: string; // Mapped from DB 'type'
}

interface FilterItem {
  key: string;
  count: number;
}

export default function Announcements() {
  const router = useRouter();

  const [data, setData] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementServices.getAllAnnouncements();
      

      const formatted = response.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        subtitle: item.content,
        contentDetail: item.detail,
        when: item.published_at 
          ? new Date(item.published_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
            }) 
          : '',
        tag: item.type || 'General', // From 'type' column
      }));

      setData(formatted.filter((item: any) => item.is_active !== 0));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnnouncements();
  }, []);

  // ✅ Dynamic Filters logic
  const filters: FilterItem[] = useMemo(() => {
    const uniqueTypes = Array.from(new Set(data.map((item) => item.tag)));
    return [
      { key: 'All', count: data.length },
      ...uniqueTypes.map((type) => ({
        key: type,
        count: data.filter((d) => d.tag === type).length,
      })),
    ];
  }, [data]);

  // ✅ Search and Filter Logic
  const filteredData = useMemo(() => {
    return data
      .filter((d) => (selectedFilter === 'All' ? true : d.tag === selectedFilter))
      .filter((d) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          d.subtitle.toLowerCase().includes(q) ||
          d.tag.toLowerCase().includes(q)
        );
      });
  }, [search, selectedFilter, data]);

  const renderCard: ListRenderItem<AnnouncementItem> = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/pages/detailPages/announcementDetails',
          params: { id: item.id, title: item.title },
        })
      }
    >
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text numberOfLines={2} style={styles.cardSubtitle}>
            {item.subtitle}
          </Text>
          <View style={[styles.tagBadge, item.tag.toLowerCase() === 'urgent' ? styles.tagUrgent : styles.tagInfo]}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.dateText}>{item.when}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Tabs.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Announcements</Text>
      </View>

      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#999" />
          <TextInput
            placeholder="Search updates..."
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Chips / Filters */}
        <View style={styles.filterBar}>
          <FlatList
            horizontal
            data={filters}
            keyExtractor={(item) => item.key}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedFilter(item.key)}
                style={[styles.chip, selectedFilter === item.key && styles.chipActive]}
              >
                <Text style={[styles.chipText, selectedFilter === item.key && styles.chipTextActive]}>
                  {item.key} ({item.count})
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
            renderItem={renderCard}
            contentContainerStyle={styles.listPadding}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={<Text style={styles.emptyLabel}>No announcements matches your search.</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, paddingHorizontal: 16 },
  header: { padding: 16, paddingTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  filterBar: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#005BC1', borderColor: '#005BC1' },
  chipText: { color: '#666', fontSize: 14 },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cardSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 10 },
  cardRight: { marginLeft: 10 },
  dateText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagInfo: { backgroundColor: '#E0F2FE' },
  tagUrgent: { backgroundColor: '#FEE2E2' },
  tagText: { fontSize: 11, fontWeight: '600', color: '#0369A1' },
  listPadding: { paddingBottom: 100 },
  emptyLabel: { textAlign: 'center', color: '#999', marginTop: 40 },
});