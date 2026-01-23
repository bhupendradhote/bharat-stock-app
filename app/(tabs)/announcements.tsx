import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  ListRenderItem,
} from 'react-native';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// 1. Define Types to fix 'implicit any' errors
interface AnnouncementItem {
  id: string;
  title: string;
  subtitle: string;
  when: string;
  tags: string[];
}

interface FilterItem {
  key: string;
  count: number;
}

// 2. Typed Data
const DATA: AnnouncementItem[] = [
  {
    id: '1',
    title: 'New Notification Center & Learning modules',
    subtitle: 'Now Track all Alerts in one place and learn logic behind each tip via structured modules',
    when: 'Today',
    tags: ['Features', 'New'],
  },
  {
    id: '2',
    title: 'Change in Package bill Cycle',
    subtitle: 'Monthly plans now renew exactly 30 days from activation time for more transparent bulls',
    when: '2 days ago',
    tags: ['Service Update', 'New'],
  },
  {
    id: '3',
    title: 'Plan maintenance window',
    subtitle: 'Short maintenance window this weekend; reading access stays on, but new logins',
    when: '3 days ago',
    tags: ['Others', 'Info'],
  },
];

export default function Announcements() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [timeframeOpen, setTimeframeOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('last 30 days');

  // 3. Filter Logic
  const filteredData = useMemo(() => {
    return DATA.filter((d) => {
      if (selectedFilter === 'All') return true;
      return d.tags.includes(selectedFilter);
    }).filter((d) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.subtitle.toLowerCase().includes(q) ||
        d.tags.join(' ').toLowerCase().includes(q)
      );
    });
  }, [search, selectedFilter]);

  // 4. Dynamic Counts Calculation
  const getCount = (key: string) => {
    if (key === 'All') return DATA.length;
    return DATA.filter((d) => d.tags.includes(key)).length;
  };

  const FILTERS: FilterItem[] = [
    { key: 'All', count: getCount('All') },
    { key: 'Features', count: getCount('Features') },
    { key: 'Service Update', count: getCount('Service Update') },
    { key: 'Others', count: getCount('Others') },
  ];

  // Typed Render Functions
  function renderChip(item: FilterItem) {
    const active = selectedFilter === item.key;
    return (
      <TouchableOpacity
        key={item.key}
        onPress={() => setSelectedFilter(item.key)}
        activeOpacity={0.8}
        style={[styles.chip, active && styles.chipActive]}
      >
        <Text style={[styles.chipText, active && styles.chipTextActive]}>
          {item.key}{' '}
          <Text style={[styles.chipCount, active && styles.chipCountActive]}>
            {item.count}
          </Text>
        </Text>
      </TouchableOpacity>
    );
  }

const renderCard: ListRenderItem<AnnouncementItem> = ({ item }) => {
    return (
      <TouchableOpacity 
        activeOpacity={0.95} 
        style={styles.card}
        // FIXED: onPress goes here as a prop
        onPress={() => {
          router.push({
            pathname: '/pages/detailPages/announcementDetails',
            params: {
              id: item.id,
              title: item.title,
              date: item.when,
              tag: item.tags[0] // Passing the first tag
            }
          });
        }}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text numberOfLines={3} style={styles.cardSubtitle}>
              {item.subtitle}
            </Text>
            <View style={styles.tagRow}>
              {item.tags.map((t) => {
                const isNew = t.toLowerCase() === 'new';
                return (
                  <View
                    key={t}
                    style={[
                      styles.smallTag,
                      isNew ? styles.smallTagGreen : styles.smallTagBlue,
                    ]}
                  >
                    <Text
                      style={[
                        styles.smallTagText,
                        isNew && styles.smallTagTextGreen,
                      ]}
                    >
                      {t}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.whenWrap}>
            <Text style={styles.whenText}>{item.when}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Tabs.Screen
        options={{
          title: 'Announcement',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="campaign" size={size ?? 26} color={color} />
          ),
          headerShown: false,
        }}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <View style={styles.searchWrap}>
              <Feather
                name="search"
                size={18}
                color="#999"
                style={{ marginRight: 8 }}
              />
              <TextInput
                placeholder="Search using keywords"
                placeholderTextColor="#BDBDBD"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
                returnKeyType="search"
              />
            </View>

            <TouchableOpacity
              style={styles.timeframeBtn}
              activeOpacity={0.85}
              onPress={() => setTimeframeOpen(!timeframeOpen)}
            >
              <Text style={styles.timeframeText}>{timeframe}</Text>
              <Ionicons name="chevron-down" size={18} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Filter chips */}
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
            >
              {FILTERS.map((filter) => renderChip(filter))}
            </ScrollView>
          </View>

          {/* Title */}
          <Text style={styles.sectionTitle}>Updates Feed</Text>
          <Text style={styles.sectionSubtitle}>
            Click an Announcement to view full details on the right.
          </Text>

          {/* List */}
          <FlatList
            data={filteredData}
            keyExtractor={(i) => i.id}
            renderItem={renderCard}
            contentContainerStyle={{ paddingBottom: 140, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text
                style={{ textAlign: 'center', marginTop: 20, color: '#999' }}
              >
                No announcements found.
              </Text>
            }
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  searchWrap: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    padding: 0,
  },

  timeframeBtn: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeframeText: {
    marginRight: 6,
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
  },

  chipsContainer: {
    paddingVertical: 12,
    paddingLeft: 0,
  },
  chip: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chipActive: {
    backgroundColor: '#005BC1',
    borderColor: '#005BC1',
  },
  chipText: {
    fontSize: 12,
    color: '#444',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  chipCount: {
    color: '#999',
    fontWeight: '700',
    marginLeft: 4,
  },
  chipCountActive: {
    color: '#e0e0e0',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 6,
    color: '#111',
  },
  sectionSubtitle: {
    color: '#9b9b9b',
    marginTop: 6,
    marginBottom: 12,
    fontSize: 13,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 1,
    width: width - 32,
    alignSelf: 'center',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  cardSubtitle: {
    color: '#9b9b9b',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 12,
  },

  whenWrap: {
    marginLeft: 12,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minWidth: 68,
  },
  whenText: {
    color: '#00000080',
    fontWeight: '500',
    fontSize: 12,

  },

  tagRow: {
    flexDirection: 'row',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 1,
  },
  smallTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    
  },
  smallTagBlue: {
    backgroundColor: '#e7f6ff',
    borderColor: '#d8f0ff',

  },
  smallTagGreen: {
    backgroundColor: '#ecffee',
    borderColor: '#d8ffd8',
  },
  smallTagText: {
    fontSize: 10,
    color: '#0369a1',
    fontWeight: '500',
  },
  smallTagTextGreen: {
    color: '#0f8f2a',
  },
});