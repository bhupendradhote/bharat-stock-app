// components/Indices.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
// Ensure this path is correct in your project structure
import { fetchAngelIndices, AngelQuoteRaw } from '../../services/api/methods/marketService';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.42;
const CARD_HEIGHT = 160;

type IndexModel = {
  id: string;
  token: string;
  title: string;
  exchange: string;
  price: string;
  currency: string;
  change: string;
  up: boolean;
  chart: number[];
};

// Full List of Indices
const SYMBOLS = [
  // --- Broad Market ---
  { id: 'nifty', token: '99926000', title: 'NIFTY 50', exchange: 'NSE' },
  { id: 'sensex', token: '99919000', title: 'SENSEX', exchange: 'BSE' },
  { id: 'banknifty', token: '99926009', title: 'NIFTY BANK', exchange: 'NSE' },
  { id: 'finnifty', token: '99926037', title: 'FIN NIFTY', exchange: 'NSE' },
  { id: 'midcap', token: '99926004', title: 'MIDCAP 50', exchange: 'NSE' },

  // --- Sectoral & Others ---
  { id: 'infra', token: '99926021', title: 'INFRA', exchange: 'NSE' },
  { id: 'energy', token: '99926022', title: 'ENERGY', exchange: 'NSE' },
  { id: 'commodities', token: '99926025', title: 'COMMODITIES', exchange: 'NSE' },
  { id: 'consumption', token: '99926019', title: 'CONSUMPTION', exchange: 'NSE' },
  { id: 'cpse', token: '99926020', title: 'CPSE', exchange: 'NSE' },
];

// --- Sub-Components ---

const SparklineBase = ({ data, up }: { data: number[]; up: boolean }) => {
  const chartWidth = CARD_WIDTH - 24;
  const chartHeight = 50;

  if (!data || data.length === 0) {
    return <Svg width={chartWidth} height={chartHeight} />;
  }

  // Handle flat lines (no variance)
  const max = Math.max(...data);
  const min = Math.min(...data);
  const diff = max - min;

  const points = data.map((value, index) => {
    const denom = diff === 0 ? 1 : diff; // Prevent divide by zero
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((value - min) / denom) * (chartHeight - 10); // 10px padding
    return `${x},${y}`;
  });

  const lineCommand = `M ${points.join(' L ')}`;
  const fillCommand = `${lineCommand} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  const color = up ? '#22c55e' : '#ef4444';
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
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

SparklineBase.displayName = 'Sparkline';
const Sparkline = React.memo(SparklineBase);

/**
 * Generates a fake chart path if the API returns 0 or missing data.
 * This ensures the UI doesn't look broken during initial loads or API failures.
 */
function generateInitialGraph(quote: AngelQuoteRaw): number[] {
  const open = Number(quote.open || 0);
  const close = Number(quote.ltp || quote.close || open);
  
  let high = Number(quote.high || Math.max(open, close));
  let low = Number(quote.low || Math.min(open, close));
  high = Math.max(high, open, close);
  low = Math.min(low, open, close);

  if (open === 0) return [0, 0, 0, 0];

  const steps = 8;
  const path: number[] = new Array(steps).fill(0);

  path[0] = open;
  path[steps - 1] = close;

  const highIndex = Math.floor(Math.random() * (steps - 2)) + 1;
  let lowIndex = Math.floor(Math.random() * (steps - 2)) + 1;
  while (lowIndex === highIndex) lowIndex = Math.floor(Math.random() * (steps - 2)) + 1;

  for (let i = 1; i < steps - 1; i++) {
    if (i === highIndex) {
      path[i] = high;
    } else if (i === lowIndex) {
      path[i] = low;
    } else {
      const progress = i / (steps - 1);
      const linearPoint = open + (close - open) * progress;
      const range = high - low || (open * 0.01);
      const noise = (Math.random() - 0.5) * range * 0.6;
      let val = linearPoint + noise;
      val = Math.max(low, Math.min(high, val));
      path[i] = val;
    }
  }

  return path;
}

function fmt(n: number) {
  if (!isFinite(n)) return '-';
  return Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const findMarketData = (fetchedData: AngelQuoteRaw[], symbol: typeof SYMBOLS[0]) => {
  if (!fetchedData || !Array.isArray(fetchedData)) return undefined;

  const byToken = fetchedData.find((f) => String(f.symbolToken) === String(symbol.token));
  if (byToken) return byToken;

  const byExactName = fetchedData.find((f) =>
    f.tradingSymbol?.toLowerCase() === symbol.title.toLowerCase()
  );
  if (byExactName) return byExactName;

  return fetchedData.find((f) => {
    const apiName = f.tradingSymbol?.toLowerCase() || '';
    const searchName = symbol.title.toLowerCase();
    return apiName.includes(searchName);
  });
};

const Indices: React.FC = () => {
  const [indices, setIndices] = useState<IndexModel[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  const chartCache = useRef<Map<string, number[]>>(new Map());
  const isMounted = useRef(true);
  
  // Guard against overlapping requests
  const isFetching = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    // Prevent stacking requests: If a request is active and this isn't a forced refresh, skip.
    if (isFetching.current && !isManualRefresh) {
      return;
    }

    try {
      isFetching.current = true;

      const hasData = chartCache.current.size > 0;
      
      // Only show full loading spinner on initial load
      if (!isManualRefresh && !hasData && isMounted.current) {
        setLoading(true);
      }

      const fetched = await fetchAngelIndices();
      
      if (!isMounted.current) return;

      // Map the static symbols to the dynamic API data
      const mapped: IndexModel[] = SYMBOLS.map((s) => {
        const q = findMarketData(fetched, s);
        
        // Default / Error state for this specific index
        if (!q) {
          // If we have cached data, preserve it instead of showing '-'
          const cachedChart = chartCache.current.get(s.token) || [];
          // If we have previously loaded indices, try to find the old version to keep values stale but visible
          const oldIndex = indices?.find(i => i.id === s.id);
          
          if (oldIndex) return oldIndex;

          return {
            ...s,
            price: '-',
            currency: 'INR',
            change: '-',
            up: false,
            chart: cachedChart,
          };
        }

        const currentLTP = Number(q.ltp ?? q.close ?? 0);
        const netChange = Number(q.netChange);
        const percentChange = Number(q.percentChange);
        const up = netChange >= 0;
        const price = fmt(currentLTP);
        const change = `${netChange.toFixed(2)} (${percentChange.toFixed(2)}%)`;

        // --- Chart Logic ---
        let chartData = chartCache.current.get(s.token);

        if (!chartData || chartData.length === 0) {
          // Generate initial fake graph based on OHLC
          chartData = generateInitialGraph(q);
          chartCache.current.set(s.token, chartData);
        } else {
          // Append new price point to existing chart
          const updatedChart = [...chartData];
          // Replace last point or push new point? 
          // Simple sparkline logic: update the last point to reflect current LTP
          // To make it "move", you would push and shift, but for simple sparklines, updating end is safer.
          updatedChart[updatedChart.length - 1] = currentLTP;
          
          chartCache.current.set(s.token, updatedChart);
          chartData = updatedChart;
        }

        return {
          ...s,
          exchange: q.exchange || s.exchange,
          price,
          currency: 'INR',
          change,
          up,
          chart: chartData,
        };
      });

      if (isMounted.current) {
        setIndices(mapped);
      }
    } catch (err: any) {
      // Log error but don't crash UI
      console.warn('Indices polling failed:', err.message || 'Unknown error');
    } finally {
      isFetching.current = false;
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [indices]);

  // Initial Load & Polling Effect
  useEffect(() => {
    fetchData(); 

    const intervalId = setInterval(() => {
      fetchData();
    }, 3000); // 3 seconds interval

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Market Indices</Text>

      {loading && !indices ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#334155" />
        </View>
      ) : (
        <View>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {(indices ?? []).map((idx) => (
              <View key={idx.id} style={styles.indexCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.indexTitle} numberOfLines={1}>
                    {idx.title}
                  </Text>
                  <Text style={styles.indexExchange}>{idx.exchange}</Text>
                </View>

                <View style={styles.chartWrapper}>
                  <Sparkline data={idx.chart} up={idx.up} />
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.indexPrice}>{idx.price}</Text>
                </View>

                <Text
                  style={[
                    styles.indexChange,
                    idx.price === '-' ? { color: '#94a3b8' } : idx.up ? styles.up : styles.down,
                  ]}
                >
                  {idx.change}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Simple Pagination Dots (Visual Only) */}
          <View style={styles.paginationContainer}>
            <View style={[styles.pageDot, styles.pageDotActive]} />
            <View style={styles.pageDot} />
            <View style={styles.pageDot} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    color: '#000',
  },
  loadingContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  indexCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
    justifyContent: 'space-between',
  },
  cardHeader: {
    marginBottom: 2,
  },
  indexTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  indexExchange: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 1,
  },
  chartWrapper: {
    height: 50,
    marginVertical: 4,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  indexPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
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
    marginTop: 4,
    marginBottom: 8,
  },
  pageDot: {
    width: 6,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginHorizontal: 2,
  },
  pageDotActive: {
    backgroundColor: '#94a3b8',
    width: 24,
  },
});

export default Indices;