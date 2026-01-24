import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'; // 1. Import router

import Search from '@/components/includes/search';

const { width } = Dimensions.get('window');

// Data Types
interface MarketCallData {
  id: number;
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
}

// Mock Data
const CALLS_DATA: MarketCallData[] = [
  {
    id: 1,
    title: 'NIFTY 50',
    date: '16 JAN',
    time: '3:18 PM',
    ltp: '69.25%',
    change: '+1.45',
    changePercent: '(2.14%)',
    potential: '2.0%',
    stopLoss: '25307.51',
    entry: '25692.90',
    target: '26206.76',
    sliderValue: 0.25,
  },
  {
    id: 2,
    title: 'BANK NIFTY',
    date: '17 JAN',
    time: '10:00 AM',
    ltp: '42.10%',
    change: '+0.85',
    changePercent: '(1.12%)',
    potential: '1.5%',
    stopLoss: '44200.00',
    entry: '44500.50',
    target: '45000.00',
    sliderValue: 0.6,
  },
];

const TABS = ['Intraday', 'Short', 'Long', 'Options', 'Futures'];

const MarketCalls = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Intraday');

  // 2. Helper to handle simple navigation
  const handleCardPress = (item: MarketCallData) => {
    router.push({
      pathname: '/pages/detailPages/marketCallDetails',
      params: { ...item } // Passing data as params
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.topHeaderContainer}>
             <Search 
                value={search} 
                onChangeText={(text: string) => setSearch(text)} 
             />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <Text style={styles.sectionTitle}>Today’s Market Highlights</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16, paddingRight: 8 }}
          >
            {CALLS_DATA.map((item) => (
              <MarketCard 
                key={item.id} 
                data={item} 
                highlight 
                onPress={() => handleCardPress(item)} 
              />
            ))}
          </ScrollView>
          
          <View style={styles.dotsContainer}>
             <View style={[styles.dot, styles.activeDot]} />
             <View style={styles.dot} />
          </View>

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
            {CALLS_DATA.map((item) => (
              <MarketCard 
                key={item.id} 
                data={item} 
                onPress={() => handleCardPress(item)} 
              />
            ))}
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
}

const MarketCard: React.FC<MarketCardProps> = ({ highlight = false, data, onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.cardContainer, highlight && { width: width * 0.88, marginRight: 16 }]}
    >
      
      <LinearGradient
        colors={['#7C3AED', '#9333EA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.potentialBadge}
      >
        <Text style={styles.potentialText}>{data.potential} Potential</Text>
      </LinearGradient>

      <View style={styles.topRightActions}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Header Info */}
      <View style={styles.cardHeader}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>NSE</Text>
        </View>
        <View style={styles.headerTitleCol}>
           <Text style={styles.stockTitle}>{data.title}</Text>
           <Text style={styles.publishText}>Published on {data.date} • {data.time}</Text>
        </View>
        <View style={styles.headerPriceCol}>
           <Text style={styles.priceMain}>
             {data.change}<Text style={styles.priceSmall}>{data.changePercent}</Text>
           </Text>
           <Text style={styles.greenLtp}>{data.ltp}</Text>
        </View>
      </View>

      {/* Inner White Bordered Card */}
      <View style={styles.innerCard}>
         <View style={styles.potentialRow}>
            <Text style={styles.hugePercent}>{data.potential}</Text>
            <Text style={styles.potentialLabel}>POTENTIAL UPSIDE</Text>
         </View>

         {/* Stats Grid */}
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

         {/* Gradient Slider */}
         <View style={styles.sliderWrapper}>
           <LinearGradient
             colors={['#EF4444', '#EAB308', '#22C55E']} 
             start={{ x: 0, y: 0.5 }}
             end={{ x: 1, y: 0.5 }}
             style={styles.sliderTrack}
           />
           {/* Thumb */}
           <View style={[styles.sliderThumb, { left: `${data.sliderValue * 100}%` }]}>
              <View style={styles.sliderThumbInner} />
           </View>
         </View>

         {/* Bottom White Pill Container */}
         <View style={styles.bottomPill}>
            <Text style={styles.bottomPillText}>{data.stopLoss}</Text>
            <View style={styles.pillDivider} />
            <Text style={styles.bottomPillText}>{data.stopLoss}</Text>
            <View style={styles.pillDivider} />
            <Text style={styles.bottomPillText}>{data.stopLoss}</Text>
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
    backgroundColor: '#F3F5F9', // Light bluish grey background
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
  },
  saveButton: {
    backgroundColor: '#E5E7EB', // Grey bg
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
    backgroundColor: '#1E3A8A',
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
  },
  potentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hugePercent: {
    fontSize: 28,
    fontWeight: '700',
    color: '#22C55E', // Green
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
    backgroundColor: '#22C55E', // Green dot inside
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