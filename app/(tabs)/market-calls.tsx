import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

import Search from '@/components/includes/search';
import customerProfileServices from '@/services/api/methods/profileService';

const { width } = Dimensions.get('window');

// --- Data Types ---
interface MarketCallData {
  id: number | string;
  title: string;
  date: string;
  time: string;
  ltp: string;
  change: string;
  changePercent: string;
  potential: string;
  stopLoss: string;
  entry: string;
  target: string;
  sliderValue: number;
  status: string;
  isLocked?: boolean;
  description?: string;
}

const TABS = ['Intraday', 'Short', 'Long', 'Options', 'Futures'];

// --- Dummy Static Locked Data ---
// Note: Titles here will be hidden in the UI
const LOCKED_PREMIUM_CALLS: MarketCallData[] = [
  {
    id: 'locked-1',
    title: 'BANKNIFTY', // Will be masked
    date: 'TODAY',
    time: '10:30 AM',
    ltp: '0.00',
    change: '0.00',
    changePercent: '(0.00%)',
    potential: 'High',
    stopLoss: '****',
    entry: '****',
    target: '****',
    sliderValue: 0.5,
    status: 'Premium',
    isLocked: true,
    description: 'Jackpot Call'
  },
  {
    id: 'locked-2',
    title: 'RELIANCE', // Will be masked
    date: 'TODAY',
    time: '09:15 AM',
    ltp: '0.00',
    change: '0.00',
    changePercent: '(0.00%)',
    potential: 'High',
    stopLoss: '****',
    entry: '****',
    target: '****',
    sliderValue: 0.5,
    status: 'Premium',
    isLocked: true,
    description: 'Sure Shot'
  }
];

const MarketCalls = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Intraday');
  
  // Dynamic State
  const [marketCalls, setMarketCalls] = useState<MarketCallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Fetch Data Logic ---
  const fetchMarketCalls = async () => {
    try {
      const response: any = await customerProfileServices.getAllProfiles();
      const userData = response?.data?.user || response?.user || {};
      const apiTips = userData.tips || [];

      const formattedCalls: MarketCallData[] = apiTips.map((tip: any) => {
        const entry = parseFloat(tip.entry_price || '0');
        const target = parseFloat(tip.target_price || '0');
        const sl = parseFloat(tip.stop_loss || '0');
        const ltp = parseFloat(tip.current_price || tip.cmp_price || '0'); 

        let progress = 0;
        if (target > entry) {
          progress = (ltp - entry) / (target - entry);
        } else {
           progress = 0; 
        }
        const sliderValue = Math.max(0, Math.min(1, progress));

        const potentialVal = entry > 0 ? ((target - entry) / entry) * 100 : 0;
        const potential = `${potentialVal.toFixed(2)}%`;

        const dateObj = new Date(tip.created_at || new Date());
        const date = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
        const time = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        return {
          id: tip.id,
          title: tip.symbol || tip.stock_name || 'UNKNOWN',
          date: date,
          time: time,
          ltp: ltp.toFixed(2),
          change: (ltp - entry).toFixed(2), 
          changePercent: `(${((ltp - entry)/entry * 100).toFixed(2)}%)`,
          potential: potential,
          stopLoss: sl.toFixed(2),
          entry: entry.toFixed(2),
          target: target.toFixed(2),
          sliderValue: sliderValue,
          status: tip.status || 'Live',
          isLocked: false
        };
      });

      const reversedApiCalls = formattedCalls.reverse();
      
      // Combine API calls with Dummy Locked calls
      const combinedCalls = [...reversedApiCalls, ...LOCKED_PREMIUM_CALLS];

      setMarketCalls(combinedCalls);
    } catch (error) {
      console.error("Failed to fetch market calls", error);
      // Fallback
      setMarketCalls(LOCKED_PREMIUM_CALLS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMarketCalls();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarketCalls();
  };

  const handleCardPress = (item: MarketCallData) => {
    if (item.isLocked) {
      handleUpgrade();
      return;
    }
    // router.push({
    //   pathname: '/pages/detailPages/marketCallDetails',
    //   params: { ...item } as any
    // });
  };

  const handleUpgrade = () => {
    router.push('/pages/settingsInnerPages/pricingPlans'); 
  };

  const filteredCalls = marketCalls.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const highlights = filteredCalls.slice(0, 3);
  const allCalls = filteredCalls;

  if (loading && !refreshing) {
     return (
       <SafeAreaView style={styles.safeArea}>
         <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
           <ActivityIndicator size="large" color="#005BC1" />
         </View>
       </SafeAreaView>
     );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.topHeaderContainer}>
             <Search 
                value={search} 
                onChangeText={(text: string) => setSearch(text)} 
             />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          
          {/* Highlights Section */}
          {highlights.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Today’s Market Highlights</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
              >
                {highlights.map((item) => (
                  <MarketCard 
                    key={item.id} 
                    data={item} 
                    highlight 
                    onPress={() => handleCardPress(item)}
                    onUpgrade={handleUpgrade} 
                  />
                ))}
              </ScrollView>
              
              <View style={styles.dotsContainer}>
                  <View style={[styles.dot, styles.activeDot]} />
                  <View style={styles.dot} />
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Market Calls</Text>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.tabRow}
          >
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Vertical List */}
          <View style={{ paddingHorizontal: 16 }}>
            {allCalls.length > 0 ? (
              allCalls.map((item) => (
                <MarketCard 
                  key={item.id} 
                  data={item} 
                  onPress={() => handleCardPress(item)} 
                  onUpgrade={handleUpgrade}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                 <Text style={styles.emptyText}>No active market calls found.</Text>
              </View>
            )}
          </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

/* ===================== CARD COMPONENT ===================== */

interface MarketCardProps {
  highlight?: boolean;
  data: MarketCallData;
  onPress?: () => void;
  onUpgrade?: () => void;
}

const MarketCard: React.FC<MarketCardProps> = ({ highlight = false, data, onPress, onUpgrade }) => {
  const isLocked = data.isLocked || false;

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.cardContainer, highlight && { width: width * 0.88, marginRight: 16 }]}
    >
      
      {/* Badge: Purple for Normal, Dark Grey/Black for Locked */}
      <LinearGradient
        colors={isLocked ? ['#1F2937', '#111827'] : ['#7C3AED', '#9333EA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.potentialBadge}
      >
        <Text style={styles.potentialText}>
            {isLocked ? 'PREMIUM PICK' : `${data.potential} Potential`}
        </Text>
      </LinearGradient>

      <View style={styles.topRightActions}>
        <View style={[styles.liveBadge, isLocked && { backgroundColor: '#374151' }]}>
          {!isLocked && <View style={styles.liveDot} />}
          <Text style={styles.liveText}>{data.status || 'Live'}</Text>
        </View>
        {!isLocked && (
            <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardHeader}>
        <View style={[styles.logoBox, isLocked && { backgroundColor: '#374151' }]}>
          {isLocked ? (
              <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
          ) : (
              <Text style={styles.logoText}>{data.title.substring(0, 3)}</Text>
          )}
        </View>
        <View style={styles.headerTitleCol}>
           <Text style={[styles.stockTitle, isLocked && { letterSpacing: 3 }]}>
             {isLocked ? '' : data.title}
           </Text>
           <Text style={styles.publishText}>Published on {data.date} • {data.time}</Text>
        </View>
        
        {!isLocked && (
            <View style={styles.headerPriceCol}>
                <Text style={styles.priceMain}>
                    {Number(data.change) > 0 ? '+' : ''}{data.change}<Text style={styles.priceSmall}>{data.changePercent}</Text>
                </Text>
                <Text style={styles.greenLtp}>{data.ltp}</Text>
            </View>
        )}
      </View>

      <View style={styles.innerCard}>
         
         {isLocked && (
             <View style={styles.lockedOverlay}>
                 <View style={styles.lockedIconCircle}>
                    <Ionicons name="lock-closed" size={24} color="#1E3A8A" />
                 </View>
                 <Text style={styles.lockedTitle}>Premium Research</Text>
                 <Text style={styles.lockedSub}>Unlock hidden potential & entry levels</Text>
                 
                 <TouchableOpacity onPress={onUpgrade} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#1E3A8A', '#005BC1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.upgradeBtn}
                    >
                        <Text style={styles.upgradeBtnText}>Upgrade Plan</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fff" style={{marginLeft: 6}}/>
                    </LinearGradient>
                 </TouchableOpacity>
             </View>
         )}

         <View style={[isLocked && { opacity: 0.1 }]}> 
            <View style={styles.potentialRow}>
                <Text style={styles.hugePercent}>{isLocked ? '??%' : data.potential}</Text>
                <Text style={styles.potentialLabel}>POTENTIAL UPSIDE</Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Stop-Loss</Text>
                    <Text style={styles.statValue}>{data.stopLoss}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Entry</Text>
                    <Text style={styles.statValue}>{data.entry}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Target</Text>
                    <Text style={styles.statValue}>{data.target}</Text>
                </View>
            </View>

            <View style={styles.sliderWrapper}>
                <LinearGradient
                    colors={['#EF4444', '#EAB308', '#22C55E']} 
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.sliderTrack}
                />
                <View style={[styles.sliderThumb, { left: `${data.sliderValue * 100}%` }]}>
                    <View style={styles.sliderThumbInner} />
                </View>
            </View>
         </View>

         {/* Bottom Pill */}
         <View style={styles.bottomPill}>
            <Text style={styles.bottomPillText}>{data.stopLoss}</Text>
            <View style={styles.pillDivider} />
            <Text style={styles.bottomPillText}>{data.ltp}</Text>
            <View style={styles.pillDivider} />
            <Text style={styles.bottomPillText}>{data.target}</Text>
         </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },

  /* Header */
  topHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 12,
  },

  /* Dots */
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#1F2937',
    width: 20,
  },

  /* Tabs */
  tabRow: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  tabItem: {
    marginRight: 24,
    paddingBottom: 8,
  },
  activeTabItem: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },

  /* ================= CARD STYLE ================= */
  cardContainer: {
    backgroundColor: '#F3F5F9',
    borderRadius: 20,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  potentialBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomRightRadius: 20,
    zIndex: 10,
  },
  potentialText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  topRightActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  saveButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },

  /* Card Header */
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  logoBox: {
    width: 36,
    height: 36,
    backgroundColor: '#1E3A8A', // Existing Deep Blue
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  headerTitleCol: { flex: 1, justifyContent: 'center' },
  stockTitle: { fontSize: 17, fontWeight: '800', color: '#000' },
  publishText: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  headerPriceCol: { alignItems: 'flex-end' },
  priceMain: { fontSize: 15, fontWeight: '800', color: '#000' },
  priceSmall: { fontSize: 13, fontWeight: '600' },
  greenLtp: { color: '#22C55E', fontWeight: '700', fontSize: 13, marginTop: 1 },

  /* Inner Card (White Border) */
  innerCard: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 16,
    padding: 12,
    position: 'relative', 
  },
  
  /* Locked State Styles */
  lockedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.7)', 
  },
  lockedIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#E0E7FF', // Light Blue tint
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
  },
  lockedTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#1F2937',
      marginBottom: 2,
  },
  lockedSub: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 12,
  },
  upgradeBtn: {
      paddingHorizontal: 20,
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
      fontSize: 13,
  },

  /* Normal Content */
  potentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hugePercent: {
    fontSize: 28,
    fontWeight: '700',
    color: '#22C55E',
    marginRight: 8,
  },
  potentialLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: '800', color: '#000' },

  /* Slider */
  sliderWrapper: {
    height: 24,
    justifyContent: 'center',
    marginBottom: 12,
  },
  sliderTrack: {
    height: 10,
    borderRadius: 5,
    width: '100%',
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -11,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width:0, height:1},
  },
  sliderThumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },

  /* Bottom Pill */
  bottomPill: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bottomPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  pillDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E5E7EB',
  },
});

export default MarketCalls;