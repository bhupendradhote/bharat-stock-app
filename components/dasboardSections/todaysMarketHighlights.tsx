import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import customerProfileServices from '@/services/api/methods/profileService';

const { width } = Dimensions.get('window');

// --- Types ---
interface HighlightItem {
  id: string | number;
  action: string;
  tags: string[];
  title: string;
  date: string;
  ltp: string;
  change: string;
  changePercent: string;
  sl: string;
  entry: string;
  target: string;
  isBuy: boolean;
  isLocked?: boolean; // New prop for locked state
}

// --- Dummy Data for Fallback/Upgrade Teaser ---
const LOCKED_HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'locked-1',
    action: 'Buy',
    tags: ['Premium', 'Jackpot'],
    title: 'BANKNIFTY',
    date: 'TODAY, 09:15 AM',
    ltp: '****',
    change: '****',
    changePercent: '(****)',
    sl: '****',
    entry: '****',
    target: '****',
    isBuy: true,
    isLocked: true,
  },
  {
    id: 'locked-2',
    action: 'Sell',
    tags: ['Premium', 'Sure Shot'],
    title: 'RELIANCE',
    date: 'TODAY, 10:30 AM',
    ltp: '****',
    change: '****',
    changePercent: '(****)',
    sl: '****',
    entry: '****',
    target: '****',
    isBuy: false,
    isLocked: true,
  },
];

const HighlightCard = ({ item, onUpgrade }: { item: HighlightItem; onUpgrade: () => void }) => {
  const isBuy = item.isBuy;
  const isLocked = item.isLocked;

  const handlePress = () => {
    if (isLocked) {
      onUpgrade();
    } else {
    //   router.push({
    //     pathname: '/pages/detailPages/marketCallDetails',
    //     params: { ...item } as any
    //   });
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.card}
    >
      {/* --- LOCKED OVERLAY CONTENT --- */}
      {isLocked && (
        <View style={styles.lockedOverlay}>
          <View style={styles.lockedContent}>
             <View style={styles.lockIconCircle}>
                <Ionicons name="lock-closed" size={24} color="#1E3A8A" />
             </View>
             <Text style={styles.lockedTitle}>Premium Call</Text>
             <Text style={styles.lockedSub}>Unlock entry, target & stop-loss</Text>
             
             <TouchableOpacity onPress={onUpgrade} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#1E3A8A', '#005BC1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.upgradeBtn}
                >
                  <Text style={styles.upgradeBtnText}>Upgrade Plan</Text>
                  <Ionicons name="arrow-forward" size={14} color="#fff" style={{marginLeft: 6}}/>
                </LinearGradient>
             </TouchableOpacity>
          </View>
        </View>
      )}

      {/* --- BACKGROUND CONTENT (Blurred/Dimmed if Locked) --- */}
      <View style={{ opacity: isLocked ? 0.1 : 1 }}>
        <View style={styles.cardTopRow}>
          <View style={[styles.actionBadge, isBuy ? styles.badgeGreen : styles.badgeRed, isLocked && { backgroundColor: '#374151' }]}>
            <Text style={styles.actionText}>{item.action}</Text>
          </View>

          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={[styles.tag, tag === 'Premium' ? styles.tagPurpleBg : (tag === 'Live' ? styles.tagRedBg : styles.tagBlueBg)]}>
                <Text style={[styles.tagText, tag === 'Premium' ? styles.tagPurpleText : (tag === 'Live' ? styles.tagRedText : styles.tagBlueText)]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.mainInfoRow}>
          <View>
            <Text style={styles.stockTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.stockDate}>{item.date}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.stockLtp, isBuy ? styles.textGreen : styles.textRed]}>
              {item.ltp}
            </Text>
            <Text style={styles.stockChange}>
              {item.change} <Text style={{ fontSize: 10, color: '#6b7280' }}>{item.changePercent}</Text>
            </Text>
          </View>
        </View>

        {/* Visual Slider Representation */}
        <View style={styles.sliderContainer}>
          <View style={styles.sliderLine} />
          <View style={[styles.sliderDot, styles.dotLeft, { backgroundColor: '#ef4444' }]} />
          <View style={[styles.sliderDot, styles.dotCenter, { backgroundColor: '#f59e0b' }]} />
          <View style={[styles.sliderDotRing, styles.dotRight, { borderColor: isBuy ? '#10b981' : '#ef4444' }]}>
            <View style={[styles.sliderDotInnerGreen, { backgroundColor: isBuy ? '#10b981' : '#ef4444' }]} />
          </View>
        </View>

        <View style={styles.valuesRow}>
          <View style={styles.valueColLeft}>
            <Text style={styles.valueLabel}>Stop-Loss</Text>
            <Text style={[styles.valueNum, styles.textRed]}>{item.sl}</Text>
          </View>

          <View style={styles.valueColCenter}>
            <Text style={styles.valueLabel}>Entry</Text>
            <Text style={[styles.valueNum, { color: '#f59e0b' }]}>{item.entry}</Text>
          </View>

          <View style={styles.valueColRight}>
            <Text style={styles.valueLabel}>Target</Text>
            <Text style={[styles.valueNum, isBuy ? styles.textGreen : styles.textRed]}>{item.target}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function TodaysMarketHighlights() {
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarketHighlights = async () => {
    try {
      const response: any = await customerProfileServices.getAllProfiles();
      const userData = response?.data?.user || response?.user || {};
      const apiTips = userData.tips || [];

      if (!apiTips || apiTips.length === 0) {
        // --- FALLBACK: No data found, show Locked Cards ---
        setHighlights(LOCKED_HIGHLIGHTS);
        return;
      }

      const formattedCalls: HighlightItem[] = apiTips.map((tip: any) => {
        const entry = parseFloat(tip.entry_price || '0');
        const target = parseFloat(tip.target_price || '0');
        const sl = parseFloat(tip.stop_loss || '0');
        const ltp = parseFloat(tip.current_price || tip.cmp_price || '0');
        const isBuy = target >= entry;
        const action = isBuy ? 'Buy' : 'Sell';

        // Check if item is premium/locked from API
        const isLocked = tip.is_premium || tip.status === 'Premium' || false; 

        return {
          id: tip.id,
          action: action,
          isBuy: isBuy,
          isLocked: isLocked, // Use API flag
          tags: isLocked ? ['Premium'] : ['Intraday', tip.status || 'Live'],
          title: tip.symbol || tip.stock_name || 'UNKNOWN',
          date: 'TODAY', // Simplified for demo, use real date logic
          ltp: isLocked ? '****' : ltp.toFixed(2),
          change: isLocked ? '****' : (ltp - entry).toFixed(2),
          changePercent: isLocked ? '(****)' : `(${((ltp - entry) / entry * 100).toFixed(2)}%)`,
          sl: isLocked ? '****' : '₹' + sl.toFixed(2),
          entry: isLocked ? '****' : '₹' + entry.toFixed(2),
          target: isLocked ? '****' : '₹' + target.toFixed(2),
        };
      });

      // Show latest 5
      const latestFive = formattedCalls.reverse().slice(0, 5);
      setHighlights(latestFive);

    } catch (error) {
      console.error("Failed to fetch highlights", error);
      // On error, also show locked cards as fallback so UI isn't empty
      setHighlights(LOCKED_HIGHLIGHTS);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMarketHighlights();
    }, [])
  );

  const handleUpgrade = () => {
    router.push('/pages/settingsInnerPages/pricingPlans');
  };

  const handleViewAll = () => {
    router.push('/(tabs)/market-calls'); 
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Today’s Market Highlights</Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
      >
        {highlights.map((item) => (
          <HighlightCard 
            key={item.id} 
            item={item} 
            onUpgrade={handleUpgrade}
          />
        ))}
      </ScrollView>

      <View style={styles.paginationContainer}>
        <View style={[styles.pageDot, styles.pageDotActive]} />
        <View style={styles.pageDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { height: 200, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  viewAllText: { fontSize: 14, color: '#005BC1', fontWeight: '600' },
  
  card: {
    width: width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    position: 'relative', // Needed for overlay
    overflow: 'hidden',
  },
  
  /* --- LOCKED STATE STYLES --- */
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)', 
  },
  lockedContent: {
    alignItems: 'center',
    width: '100%',
  },
  lockIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  lockedSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  upgradeBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  upgradeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  /* --------------------------- */

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    borderTopLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  badgeGreen: { backgroundColor: '#10b981' },
  badgeRed: { backgroundColor: '#ef4444' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  
  tagsContainer: { flexDirection: 'row', alignItems: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 6 },
  tagText: { fontSize: 10, fontWeight: '600' },
  tagBlueBg: { backgroundColor: '#e0f2fe' },
  tagRedBg: { backgroundColor: '#fee2e2' },
  tagPurpleBg: { backgroundColor: '#F3E8FF' }, // Purple for premium
  tagBlueText: { color: '#0284c7' },
  tagRedText: { color: '#dc2626' },
  tagPurpleText: { color: '#7C3AED' }, // Purple text

  mainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stockTitle: { fontSize: 16, fontWeight: '800', color: '#000', maxWidth: '60%' },
  stockDate: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  stockLtp: { fontSize: 16, fontWeight: '700' },
  stockChange: { fontSize: 12, color: '#1f2937', marginTop: 2, fontWeight: '600' },
  
  sliderContainer: {
    height: 20,
    justifyContent: 'center',
    marginVertical: 12,
    position: 'relative',
  },
  sliderLine: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    width: '100%',
    position: 'absolute',
  },
  sliderDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 6,
  },
  sliderDotRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    top: 3,
  },
  sliderDotInnerGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotLeft: { left: 0 },
  dotCenter: { left: '48%' },
  dotRight: { right: 0 },
  
  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  valueColLeft: { alignItems: 'flex-start' },
  valueColCenter: { alignItems: 'center' },
  valueColRight: { alignItems: 'flex-end' },
  valueLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  valueNum: { fontSize: 14, fontWeight: '700' },
  textGreen: { color: '#10b981' },
  textRed: { color: '#ef4444' },
  
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  pageDot: { width: 24, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginHorizontal: 3 },
  pageDotActive: { backgroundColor: '#1f2937' },
});