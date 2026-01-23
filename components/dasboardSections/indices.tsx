import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

// --- Indices Data ---
const indicesData = [
  {
    id: 'nifty',
    title: 'NIFTY 50',
    exchange: 'NSE',
    price: '25,056.90',
    currency: 'INR',
    change: '+81.65(1.45%)',
    up: true,
    chart: [24800, 24850, 24800, 24850, 24900, 25010, 25056, 25060, 24900], 
  },
  {
    id: 'sensex',
    title: 'SENSEX',
    exchange: 'BSE',
    price: '25,056.90', 
    currency: 'INR',
    change: '-81.65(1.45%)',
    up: false,
    chart: [82300, 82250, 82100, 82150, 82100, 82080, 82056, 82150, 82300],
  },
];

const Sparkline = ({ data, up }: { data: number[]; up: boolean }) => {
  const chartWidth = (width - 60) / 2; 
  const chartHeight = 50;

  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((value - min) / (max - min || 1)) * (chartHeight - 10); // -10 buffer
    return `${x},${y}`;
  });

  const lineCommand = `M ${points.join(' L ')}`;
  const fillCommand = `${lineCommand} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  const color = up ? '#22c55e' : '#ef4444'; // Green or Red
  const gradientId = `gradient-${up ? 'up' : 'down'}`;

  return (
    <Svg width={chartWidth} height={chartHeight}>
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.2" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      <Path d={fillCommand} fill={`url(#${gradientId})`} />

      <Path
        d={lineCommand}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const Indices = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Indices</Text>

      <View style={styles.indicesRow}>
        {indicesData.map((idx) => (
          <View key={idx.id} style={styles.indexCard}>
            
            {/* Header: Title & Exchange */}
            <View style={styles.cardHeader}>
              <Text style={styles.indexTitle}>{idx.title}</Text>
              <Text style={styles.indexExchange}>{idx.exchange}</Text>
            </View>

            {/* Chart with Gradient */}
            <View style={styles.chartWrapper}>
              <Sparkline data={idx.chart} up={idx.up} />
            </View>

            {/* Price Row */}
            <View style={styles.priceRow}>
              <Text style={styles.indexPrice}>{idx.price}</Text>
              <Text style={styles.currency}>{idx.currency}</Text>
            </View>

            {/* Change Text */}
            <Text
              style={[
                styles.indexChange,
                idx.up ? styles.up : styles.down,
              ]}
            >
              {idx.change}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
         <View style={[styles.pageDot, styles.pageDotActive]} />
         <View style={styles.pageDot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    color: '#000',
  },
  indicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
  },
  indexCard: {
    width: (width - 44) / 2, 
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 4,
  },
  indexTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  indexExchange: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
  },
  chartWrapper: {
    height: 50,
    marginVertical: 8,
    overflow: 'hidden',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  indexPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
  },
  currency: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    marginLeft: 2,
  },
  indexChange: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  up: { color: '#22c55e' },
  down: { color: '#ef4444' },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  pageDot: {
    width: 24,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginHorizontal: 3,
  },
  pageDotActive: {
    backgroundColor: '#334155', 
  },
});

export default Indices;