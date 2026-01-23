import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Header from '@/components/includes/header';
import Sidebar from '@/components/includes/sidebar';
import Indices from '@/components/dasboardSections/indices';
import MarketMovers from '@/components/dasboardSections/marketMovers';
import Search from '@/components/includes/search';

const { width } = Dimensions.get('window');

// --- Types & Interfaces ---

interface HighlightItem {
  id: string;
  action: string;
  tags: string[];
  title: string;
  date: string;
  ltp: string;
  change: string;
  sl: string;
  entry: string;
  target: string;
}

interface MomentumItem {
  symbol: string;
  change: string;
  ltp: string;
}

// --- Mock Data ---

const highlights: HighlightItem[] = [
  {
    id: 'tata',
    action: 'Buy',
    tags: ['Intraday', 'Live'],
    title: 'TATA Motors',
    date: '17 DEC, 10:19 AM',
    ltp: '69.25',
    change: '+1.45(2.14%)',
    sl: '₹638.00',
    entry: '₹642.50',
    target: '₹648.00',
  },
  {
    id: 'hdfc',
    action: 'Sell',
    tags: ['Intraday', 'Live'],
    title: 'HDFC Bank',
    date: '17 DEC, 11:02 AM',
    ltp: '1420.50',
    change: '-12.35(-0.87%)',
    sl: '₹1400.00',
    entry: '₹1410.00',
    target: '₹1380.00',
  },
];

const momentum: MomentumItem[] = [
  { symbol: 'SHAKTIPUMP', change: '+13.65(+2.49%)', ltp: '585.00' },
  { symbol: 'JAINREC', change: '+3.90(+1.02%)', ltp: '391.35' },
  { symbol: 'BALRAMCHIN', change: '+5.90(+1.35%)', ltp: '443.00' },
  { symbol: 'PFOCUS', change: '-2.33(-1.13%)', ltp: '203.00' },
];

// --- Sub-Components ---

// We explicitly type the props here so 'item' is no longer 'any'
const HighlightCard = ({ item }: { item: HighlightItem }) => {
  const isBuy = item.action === 'Buy';

  return (
    <View style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={[styles.actionBadge, isBuy ? styles.badgeGreen : styles.badgeRed]}>
          <Text style={styles.actionText}>{item.action}</Text>
        </View>

        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={[styles.tag, tag === 'Live' ? styles.tagRedBg : styles.tagBlueBg]}>
              <Text style={[styles.tagText, tag === 'Live' ? styles.tagRedText : styles.tagBlueText]}>
                {tag}
              </Text>
            </View>
          ))}
          <View style={styles.tagGrayBg}>
            <Ionicons name="information-circle-outline" size={14} color="#666" />
            <Text style={styles.tagGrayText}> info</Text>
          </View>
        </View>
      </View>

      <View style={styles.mainInfoRow}>
        <View>
          <Text style={styles.stockTitle}>{item.title}</Text>
          <Text style={styles.stockDate}>{item.date}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.stockLtp, isBuy ? styles.textGreen : styles.textRed]}>
            {item.ltp}
          </Text>
          <Text style={styles.stockChange}>{item.change}</Text>
        </View>
      </View>

      {/* Visual Range Slider */}
      <View style={styles.sliderContainer}>
        {/* The Line */}
        <View style={styles.sliderLine} />

        {/* Dots */}
        {/* Stop Loss Dot (Left) */}
        <View style={[styles.sliderDot, styles.dotLeft, { backgroundColor: '#ef4444' }]} />
        {/* Entry Dot (Middle) */}
        <View style={[styles.sliderDot, styles.dotCenter, { backgroundColor: '#f59e0b' }]} />
        {/* Target Dot (Right) - represented as a ring in the design */}
        <View style={[styles.sliderDotRing, styles.dotRight]}>
          <View style={styles.sliderDotInnerGreen} />
        </View>
      </View>

      {/* Values Row (SL - Entry - Target) */}
      <View style={styles.valuesRow}>
        <View style={styles.valueColLeft}>
          <Text style={styles.valueLabel}>Stop-Loss</Text>
          <Text style={[styles.valueNum, styles.textRed]}>{item.sl}</Text>
        </View>

        <View style={styles.valueColCenter}>
          <Text style={styles.valueLabel}>Entry</Text>
          <Text style={[styles.valueNum, styles.textGreen]}>{item.entry}</Text>
        </View>

        <View style={styles.valueColRight}>
          <Text style={styles.valueLabel}>Target</Text>
          <Text style={[styles.valueNum, styles.textBlack]}>{item.target}</Text>
        </View>
      </View>
    </View>
  );
};

// --- Main Component ---

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [capTab, setCapTab] = useState('Small Cap');
  const [timeTab, setTimeTab] = useState('15 min');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <SafeAreaView style={styles.safe}>
      <Sidebar
        visible={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

          <Header
            onMenuPress={() => setSidebarOpen(true)}
          />

          <Sidebar
            visible={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <Search value={search} onChangeText={setSearch} />
          <Indices />

          {/* Today's Market Highlights */}
          <Text style={styles.sectionTitle}>Today’s Market Highlights</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
          >
            {highlights.map((item) => (
              <HighlightCard key={item.id} item={item} />
            ))}
          </ScrollView>

          {/* Pagination Dots (Mock) */}
          <View style={styles.paginationContainer}>
            <View style={[styles.pageDot, styles.pageDotActive]} />
            <View style={styles.pageDot} />
          </View>


          {/* Tabs Section */}
          <View style={styles.tabContainer}>
            <View style={styles.liveRow}>
              <Text style={styles.tabHeading}>Stock in Momentum</Text>
              <View style={styles.liveBadge}><Text style={styles.liveText}>Live</Text></View>
            </View>

            <View style={styles.capTabs}>
              {['Small Cap', 'Mid Cap', 'Large Cap'].map((c) => (
                <TouchableOpacity key={c} onPress={() => setCapTab(c)} style={[styles.capTab, capTab === c && styles.capTabActive]}>
                  <Text style={[styles.capTabText, capTab === c && styles.capTabTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timeTabs}>
              {['15 min', '30 min', '1 day'].map((t) => (
                <TouchableOpacity key={t} onPress={() => setTimeTab(t)} style={[styles.timeTab, timeTab === t && styles.timeTabActive]}>
                  <Text style={[styles.timeTabText, timeTab === t && styles.timeTabTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Momentum Table */}
            <View style={styles.momentumCard}>
              <View style={styles.momentumHeaderBar}>
                <Text style={styles.momentumTitleText}>Intraday Trends for you</Text>
              </View>

              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Symbol</Text>
                <Text style={[styles.tableHeaderCell, { flex: 3, textAlign: 'center' }]}>15 min change</Text>
                <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: 'right' }]}>LTP</Text>
              </View>

              {momentum.map((m) => (
                <View key={m.symbol} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 3 }]}>{m.symbol}</Text>
                  <Text style={[styles.tableCell, { flex: 3, textAlign: 'center' }, m.change.startsWith('+') ? styles.textGreen : styles.textRed]}>{m.change}</Text>
                  <Text style={[styles.tableCell, { flex: 2, textAlign: 'right' }]}>{m.ltp}</Text>
                </View>
              ))}
            </View>
          </View>

          <MarketMovers />

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '700', paddingHorizontal: 16, marginTop: 20, marginBottom: 12 },

  // --- Card Styles ---
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
  },
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
  
  // --- ADDED MISSING STYLE HERE ---
  tagText: { fontSize: 10, fontWeight: '600' }, 

  tagBlueBg: { backgroundColor: '#e0f2fe' },
  tagRedBg: { backgroundColor: '#fee2e2' },
  tagGrayBg: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 6 },
  
  tagBlueText: { color: '#0284c7' }, // Removed fontSize/weight (inherited from tagText)
  tagRedText: { color: '#dc2626' },  // Removed fontSize/weight (inherited from tagText)
  tagGrayText: { color: '#4b5563', fontSize: 10, fontWeight: '500' },

  mainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stockTitle: { fontSize: 16, fontWeight: '800', color: '#000' },
  stockDate: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  stockLtp: { fontSize: 16, fontWeight: '700' },
  stockChange: { fontSize: 12, color: '#1f2937', marginTop: 2, fontWeight: '600' },

  // --- Slider Visuals ---
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
    borderColor: '#4ade80',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    top: 3,
  },
  sliderDotInnerGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  dotLeft: { left: 0 },
  dotCenter: { left: '48%' },
  dotRight: { right: 0 },

  // --- Values Row ---
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

  // --- Shared Colors ---
  textGreen: { color: '#10b981' },
  textRed: { color: '#ef4444' },
  textBlack: { color: '#000' },

  // --- Pagination ---
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  pageDot: { width: 24, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, marginHorizontal: 3 },
  pageDotActive: { backgroundColor: '#1f2937' },

  // --- Other Sections (Tabs, Momentum) ---
  tabContainer: { paddingHorizontal: 16, marginTop: 24 },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tabHeading: { fontSize: 18, fontWeight: '700', marginRight: 10 },
  liveBadge: { backgroundColor: '#ecfccb', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  liveText: { color: '#166534', fontWeight: '700', fontSize: 10 },

  capTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  capTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  capTabActive: { borderBottomColor: '#000' },
  capTabText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
  capTabTextActive: { color: '#000' },

  timeTabs: { flexDirection: 'row', marginTop: 16, marginBottom: 16 },
  timeTab: { paddingVertical: 6, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#f9fafb', marginRight: 10, borderWidth: 1, borderColor: '#f3f4f6' },
  timeTabActive: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  timeTabText: { color: '#374151', fontSize: 12, fontWeight: '600' },
  timeTabTextActive: { color: '#fff' },

  momentumCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden' },
  momentumHeaderBar: { backgroundColor: '#0284c7', paddingVertical: 8, alignItems: 'center' },
  momentumTitleText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  tableHeaderRow: { flexDirection: 'row', padding: 12, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  tableHeaderCell: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  tableRow: { flexDirection: 'row', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  tableCell: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
});