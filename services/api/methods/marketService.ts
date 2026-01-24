// services/api/methods/marketService.ts
import axios from 'axios';

// --- Types ---

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

export type AngelGainerLoserResponse = {
  status: boolean;
  message: string;
  data: AngelGainerLoserRaw[];
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

export async function fetchAngelIndices(): Promise<AngelQuoteRaw[]> {
  try {
    const res = await axios.get<AngelQuoteResponse>(INDICES_ENDPOINT, {
      headers: { Accept: 'application/json' },
      timeout: 10_000,
    });
    return res.data?.data?.fetched ?? [];
  } catch (err) {
    console.error('fetchAngelIndices Error:', err);
    throw err;
  }
}

export async function fetchGainersLosers(): Promise<AngelGainerLoserRaw[]> {
  try {
    const config = { headers: { Accept: 'application/json' }, timeout: 10_000 };
    
    // We explicitly add 'expirytype' to ensure the backend uses the correct default
    const commonParams = { exchange: 'NSE', expirytype: 'NEAR' };

    const [gainersRes, losersRes] = await Promise.all([
      // 1. Fetch Gainers
      axios.get<AngelGainerLoserResponse>(MOVERS_ENDPOINT, { 
        ...config, 
        params: { ...commonParams, datatype: 'GAINERS' } 
      }).catch(err => {
        if (err.response?.status !== 400) console.warn('Gainers API Error:', err.message);
        return null;
      }),

      // 2. Fetch Losers
      axios.get<AngelGainerLoserResponse>(MOVERS_ENDPOINT, { 
        ...config, 
        params: { ...commonParams, datatype: 'LOSERS' } 
      }).catch(err => {
        if (err.response?.status !== 400) console.warn('Losers API Error:', err.message);
        return null;
      }),
    ]);

    const gainers = gainersRes?.data?.data ?? [];
    const losers = losersRes?.data?.data ?? [];

    return [...gainers, ...losers];

  } catch (err) {
    console.error('fetchGainersLosers Critical Error:', err);
    return [];
  }
}

/* FETCH SPECIFIC QUOTES */
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
      headers: { Accept: 'application/json' },
      timeout: 10_000,
    });

    const fetched = res.data?.data?.fetched ?? [];
    
    if (!symbolTokens || symbolTokens.length === 0) return fetched;

    const mapped: AngelQuoteRaw[] = [];
    for (const token of symbolTokens) {
      const found = fetched.find((f) => String(f.symbolToken) === String(token));
      if (found) mapped.push(found);
    }
    return mapped.length > 0 ? mapped : fetched;
  } catch (err) {
    throw err;
  }
}

/* FETCH HISTORY */
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
      headers: { Accept: 'application/json' },
      timeout: 10_000,
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