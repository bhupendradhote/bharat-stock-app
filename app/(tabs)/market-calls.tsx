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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Search from '@/components/includes/search';

const { width } = Dimensions.get('window');

const TABS = ['Intraday', 'Short', 'Long', 'Options', 'Futures'];

const MarketCalls = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Intraday');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* 🔍 Search Bar - Fixed Props */}
          <Search 
            value={search} 
            onChangeText={setSearch} 
          />

          {/* 🔥 Highlights */}
          <Text style={styles.sectionTitle}>Today’s Market Highlights</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 16 }}
          >
            <MarketCard highlight />
            <MarketCard highlight />
          </ScrollView>

          {/* 📈 Market Calls */}
          <Text style={styles.sectionTitle}>Market Calls</Text>

          {/* Tabs */}
          <View style={styles.tabRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={styles.tabItem}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Calls List */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
            <MarketCard />
            <MarketCard />
            <MarketCard />
            <MarketCard />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

/* ===================== CARD ===================== */

const MarketCard = ({ highlight = false }: { highlight?: boolean }) => {
  return (
    <View
      style={[
        styles.card,
        highlight && { width: width * 0.85, marginRight: 12 },
      ]}
    >
      {/* BUY Badge */}
      <View style={styles.buyBadge}>
        <Text style={styles.buyText}>Buy</Text>
      </View>

      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.stockName}>TATA Motors</Text>
          <Text style={styles.time}>17 DEC, 10:19 AM</Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.ltp}>69.25</Text>
          <Text style={styles.change}>+1.45 (2.14%)</Text>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tagRow}>
        <View style={styles.tagBlue}>
          <Text style={styles.tagBlueText}>Intraday</Text>
        </View>

        <View style={styles.tagGray}>
          <Ionicons name="information-circle-outline" size={14} color="#666" />
          <Text style={styles.tagGrayText}>info</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Values */}
      <View style={styles.valuesRow}>
        <View style={styles.valueCol}>
          <Text style={styles.valueLabel}>Entry</Text>
          <Text style={[styles.valueText, styles.green]}>
            ₹642.50
          </Text>
        </View>

        <View style={styles.valueCol}>
          <Text style={styles.valueLabel}>Target</Text>
          <Text style={styles.valueText}>₹648.00</Text>
        </View>

        <View style={styles.valueCol}>
          <Text style={styles.valueLabel}>Stop-Loss</Text>
          <Text style={[styles.valueText, styles.red]}>
            ₹638.00
          </Text>
        </View>
      </View>
    </View>
  );
};

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 10,

  },

  /* Titles */
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
    color: '#000',
  },

  /* Tabs */
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabItem: {
    marginRight: 22,
    paddingBottom: 4,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '700',
  },
  activeIndicator: {
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
    marginTop: 4,
  },

  /* Card */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    // Adding shadow for better visibility
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  buyBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#22c55e',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderTopLeftRadius: 15,
    borderBottomRightRadius: 16,
  },
  buyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14, // Space for the badge
  },
  stockName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  ltp: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22c55e',
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    color: '#333',
  },

  tagRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  tagBlue: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagBlueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
  },
  tagGray: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagGrayText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#444',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 14,
  },

  valuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueCol: {
    alignItems: 'center',
    flex: 1,
  },
  valueLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 6,
    fontWeight: '500',
  },
  valueText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  green: {
    color: '#22c55e',
  },
  red: {
    color: '#ef4444',
  },
});

export default MarketCalls;