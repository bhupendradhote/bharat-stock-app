import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

const movers = [
  { id: '1', name: 'TATAINVEST', subtitle: 'Tata Investment Corporat..', price: '25,056.90', change: '112.60(+0.45%)' },
  { id: '2', name: 'MINDACORP', subtitle: 'Minda Corporation Ltd..', price: '55,056.90', change: '388.60(+0.45%)' },
  { id: '3', name: 'SYRMA', subtitle: 'Syrma SGS Technology Ltd..', price: '81,056.90', change: '112.60(+0.45%)' },
  { id: '4', name: 'SCi', subtitle: 'Shipping Corporation of..', price: '62,056.90', change: '112.60(+0.45%)' },
];

const MarketMovers = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Market Movers</Text>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      <View style={styles.moversCard}>
        {movers.map((item, index) => (
          <View key={item.id}>
            <View style={styles.moverRow}>
              <View>
                <Text style={styles.moverTitle}>{item.name}</Text>
                <Text style={styles.moverSubtitle}>{item.subtitle}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.moverPrice}>{item.price}</Text>
                <Text style={[styles.moverChange, styles.up]}>{item.change}</Text>
              </View>
            </View>
            {/* Separator */}
            {index < movers.length - 1 && <View style={{ height: 8 }} />}
          </View>
        ))}

        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    // Note: paddingHorizontal removed here as the parent container handles it
  },
  liveBadge: {
    backgroundColor: '#ecfccb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#2f855a',
    fontWeight: '700',
  },
  moversCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  moverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  moverTitle: {
    fontWeight: '700',
  },
  moverSubtitle: {
    color: '#6b7280',
    fontSize: 12,
  },
  moverPrice: {
    fontWeight: '700',
  },
  moverChange: {
    fontSize: 12,
  },
  viewAllBtn: {
    marginTop: 10,
    backgroundColor: '#0b63d9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#fff',
    fontWeight: '700',
  },
  up: {
    color: '#16a34a',
  },
});

export default MarketMovers;