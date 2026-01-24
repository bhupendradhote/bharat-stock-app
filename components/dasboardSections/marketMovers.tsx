// components/MarketMovers.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { fetchGainersLosers, AngelGainerLoserRaw } from '../../services/api/methods/marketService';

type TabOption = 'gainers' | 'losers';

const MarketMovers = () => {
  const [gainers, setGainers] = useState<AngelGainerLoserRaw[]>([]);
  const [losers, setLosers] = useState<AngelGainerLoserRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabOption>('gainers');

  const loadData = useCallback(async () => {
    try {
      const combinedData = await fetchGainersLosers();

      if (combinedData && combinedData.length > 0) {
        // Process Gainers
        const sortedGainers = combinedData
          .filter((item) => item.percentChange > 0)
          .sort((a, b) => b.percentChange - a.percentChange)
          .slice(0, 10);

        // Process Losers
        const sortedLosers = combinedData
          .filter((item) => item.percentChange < 0)
          .sort((a, b) => a.percentChange - b.percentChange)
          .slice(0, 10);

        setGainers(sortedGainers);
        setLosers(sortedLosers);
      }
    } catch (error) {
      console.error('Failed to load movers', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Helper Functions ---

  const fmtPrice = (price: number) =>
    price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00';

  // CLEANS THE NAME: "BANDHANBNK27JAN26FUT" -> "BANDHANBNK"
  const formatSymbol = (rawSymbol: string) => {
    if (!rawSymbol) return '-';
    // Splits the string at the first digit and takes the first part
    // e.g., "TATASTEEL29JAN" -> ["TATASTEEL", "29JAN"] -> "TATASTEEL"
    return rawSymbol.split(/\d/)[0]; 
  };

  const renderItem = ({ item, index }: { item: AngelGainerLoserRaw; index: number }) => {
    const isUp = item.percentChange >= 0;
    const sign = isUp ? '+' : '';
    const colorStyle = isUp ? styles.textUp : styles.textDown;
    const currentList = activeTab === 'gainers' ? gainers : losers;

    // Use the cleaner function here
    const displayName = formatSymbol(item.tradingSymbol);

    return (
      <View style={styles.rowWrapper}>
        <View style={styles.moverRow}>
          <View style={styles.nameCol}>
            {/* Display Clean Name */}
            <Text style={styles.moverTitle} numberOfLines={1}>
              {displayName}
            </Text>
            {/* Display Exchange */}
            <Text style={styles.moverSubtitle}>NSE</Text>
          </View>
          
          <View style={styles.priceCol}>
            <Text style={styles.moverPrice}>{fmtPrice(item.ltp)}</Text>
            <Text style={[styles.moverChange, colorStyle]}>
              {item.netChange.toFixed(2)} ({sign}{item.percentChange.toFixed(2)}%)
            </Text>
          </View>
        </View>
        {index < currentList.length - 1 && <View style={styles.separator} />}
      </View>
    );
  };

  const listData = activeTab === 'gainers' ? gainers : losers;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Market Movers</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {/* Tab Header */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'gainers' && styles.activeTab]}
            onPress={() => setActiveTab('gainers')}
          >
            <Text style={[styles.tabText, activeTab === 'gainers' ? styles.activeTabText : styles.inactiveTabText]}>
              Top Gainers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'losers' && styles.activeTab]}
            onPress={() => setActiveTab('losers')}
          >
            <Text style={[styles.tabText, activeTab === 'losers' ? styles.activeTabText : styles.inactiveTabText]}>
              Top Losers
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Body */}
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="small" color="#334155" />
          </View>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item, index) => `${item.symbolToken}-${index}`}
            renderItem={renderItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {activeTab === 'gainers' ? 'No Gainers Found' : 'No Losers Found'}
                </Text>
              </View>
            }
          />
        )}

        <TouchableOpacity style={styles.viewAllBtn} onPress={() => { setLoading(true); loadData(); }}>
          <Text style={styles.viewAllText}>Refresh Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 16, marginBottom: 20 },
  centerLoading: { height: 150, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  liveBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#bbf7d0' },
  liveText: { fontSize: 10, fontWeight: '700', color: '#15803d' },
  cardContainer: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', padding: 4, elevation: 2 },
  
  // Tabs
  tabContainer: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 12, margin: 8, padding: 4 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#fff', elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2 },
  tabText: { fontSize: 13, fontWeight: '600' },
  activeTabText: { color: '#0f172a', fontWeight: '700' },
  inactiveTabText: { color: '#64748b' },

  // List Rows
  rowWrapper: { paddingHorizontal: 12 },
  moverRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  nameCol: { flex: 1 },
  priceCol: { alignItems: 'flex-end' },
  moverTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  moverSubtitle: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '500' }, // Updated Style
  moverPrice: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  moverChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  textUp: { color: '#22c55e' },
  textDown: { color: '#ef4444' },
  separator: { height: 1, backgroundColor: '#f1f5f9' },

  // Empty/Footer
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 13 },
  viewAllBtn: { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingVertical: 14, alignItems: 'center', backgroundColor: '#fafbfc' },
  viewAllText: { fontSize: 13, fontWeight: '600', color: '#3b82f6' },
});

export default MarketMovers;