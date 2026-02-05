// services/api/methods/marketService.ts
import axios from 'axios';


export type AngelQuoteRaw = {
  exchange: string;
  tradingSymbol: string;
  symbolToken: string;
  ltp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  netChange: number;
  percentChange: number;
  exchFeedTime?: string;
  depth?: {
    buy: any[];
    sell: any[];
  };
};

export type AngelQuoteResponse = {
  status: boolean;
  message: string;
  data: {
    fetched: AngelQuoteRaw[];
  };
};

export type AngelGainerLoserRaw = {
  tradingSymbol: string;
  symbolToken: number | string;
  ltp: number;
  netChange: number;
  percentChange: number;
};

type AngelMoverAPIResponse = {
  status: boolean;
  message: string;
  data: AngelGainerLoserRaw[];
};

export type MarketMoversResult = {
  gainers: AngelGainerLoserRaw[];
  losers: AngelGainerLoserRaw[];
};

export type AngelCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type AngelHistoryResponse = {
  status: boolean;
  message: string;
  data: any[];
};

// --- API Config ---

const API_BASE = 'https://bharatstockmarketresearch.com/api/angel';
const QUOTE_ENDPOINT = `${API_BASE}/quote`;
const INDICES_ENDPOINT = `${API_BASE}/indices`;
const MOVERS_ENDPOINT = `${API_BASE}/gainers-losers`;
const HISTORY_ENDPOINT = `${API_BASE}/history`;

const DEFAULT_TIMEOUT = 10_000;
const JSON_HEADERS = { Accept: 'application/json' };

// --- Methods ---

export async function fetchAngelIndices(): Promise<AngelQuoteRaw[]> {
  try {
    const res = await axios.get<AngelQuoteResponse>(INDICES_ENDPOINT, {
      headers: JSON_HEADERS,
      timeout: DEFAULT_TIMEOUT,
    });
    return res.data?.data?.fetched ?? [];
  } catch (err) {
    console.error('fetchAngelIndices Error:', err);
    throw err;
  }
}


export async function fetchGainersLosers(): Promise<MarketMoversResult> {
  try {
    const config = { headers: JSON_HEADERS, timeout: DEFAULT_TIMEOUT };
    const params = { exchange: 'NSE', expirytype: 'NEAR' };

    const [gainersRes, losersRes] = await Promise.all([
      axios.get<AngelMoverAPIResponse>(MOVERS_ENDPOINT, { 
        ...config, 
        params: { ...params, datatype: 'GAINERS' } 
      }).catch(err => {
        console.warn('Gainers fetch failed:', err.message);
        return null;
      }),

      axios.get<AngelMoverAPIResponse>(MOVERS_ENDPOINT, { 
        ...config, 
        params: { ...params, datatype: 'LOSERS' } 
      }).catch(err => {
        console.warn('Losers fetch failed:', err.message);
        return null;
      }),
    ]);

    const gainers = gainersRes?.data?.data || [];
    const losers = losersRes?.data?.data || [];

    return {
      gainers,
      losers
    };

  } catch (err) {
    console.error('fetchGainersLosers Critical Error:', err);
    return { gainers: [], losers: [] };
  }
}

export async function fetchAngelQuotes(
  symbolTokens?: string[]
): Promise<AngelQuoteRaw[]> {
  try {
    const params: Record<string, string> = {};
    if (symbolTokens && symbolTokens.length > 0) {
      params.symbolTokens = symbolTokens.join(',');
    }

    const res = await axios.get<AngelQuoteResponse>(QUOTE_ENDPOINT, {
      params,
      headers: JSON_HEADERS,
      timeout: DEFAULT_TIMEOUT,
    });

    const fetched = res.data?.data?.fetched ?? [];
    
    if (!symbolTokens || symbolTokens.length === 0) return fetched;

    const mapped: AngelQuoteRaw[] = [];
    const fetchedMap = new Map(fetched.map(f => [String(f.symbolToken), f]));

    for (const token of symbolTokens) {
      const found = fetchedMap.get(String(token));
      if (found) mapped.push(found);
    }
    
    return mapped.length > 0 ? mapped : fetched;
  } catch (err) {
    throw err;
  }
}

export async function fetchAngelHistory(params: {
  symbolToken: string;
  exchange: 'NSE' | 'BSE';
  interval: string;
  from: string;
  to: string;
}): Promise<AngelCandle[]> {
  try {
    const res = await axios.get<AngelHistoryResponse>(HISTORY_ENDPOINT, {
      params,
      headers: JSON_HEADERS,
      timeout: DEFAULT_TIMEOUT,
    });

    const data = res.data?.data;
    if (Array.isArray(data)) {
      return data.map((d: any) => {
        if (Array.isArray(d)) {
          return {
            time: d[0],
            open: d[1],
            high: d[2],
            low: d[3],
            close: d[4],
            volume: d[5], // Map volume if available
          };
        }
        return d;
      });
    }
    return [];
  } catch (err) {
    return [];
  }
}