import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BUNDLED_RATES } from './vietnam';
import { fmtDate } from './format';

const URL = 'https://open.er-api.com/v6/latest/ZAR';
const CACHE_KEY = 'rates.v1';
const TIMEOUT_MS = 8000;

export type Rates = {
  vndPerZar: number;
  vndPerUsd: number;
  /** unix seconds, straight from the API */
  lastUpdate: number;
  /** unix seconds — the API tells us exactly when to come back, so we never guess a TTL */
  nextUpdate: number;
};

export type Net = 'live' | 'offline' | 'first';

const BUNDLED: Rates = { ...BUNDLED_RATES, nextUpdate: 0 };

const ok = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0;

async function fetchRates(): Promise<Rates> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(URL, { signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    if (j?.result !== 'success') throw new Error(j?.['error-type'] ?? 'bad payload');

    const vndPerZar = j?.rates?.VND;
    const usdPerZar = j?.rates?.USD;
    if (!ok(vndPerZar) || !ok(usdPerZar)) throw new Error('missing rates');

    const next: Rates = {
      vndPerZar,
      vndPerUsd: vndPerZar / usdPerZar,
      lastUpdate: ok(j.time_last_update_unix) ? j.time_last_update_unix : Date.now() / 1000,
      nextUpdate: ok(j.time_next_update_unix) ? j.time_next_update_unix : 0,
    };
    return next;
  } finally {
    clearTimeout(timer);
  }
}

const load = async (): Promise<Rates | null> => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!ok(p?.vndPerZar) || !ok(p?.vndPerUsd)) return null;
    return p as Rates;
  } catch {
    return null;
  }
};

/**
 * Offline is a normal state here, not an error state. The app renders from cache
 * (or bundled rates) immediately and never blocks on the network; a failed fetch
 * just means we keep using what we have. The dong barely moves, so stale rates
 * are harmless.
 */
export function useRates() {
  const [rates, setRates] = useState<Rates>(BUNDLED);
  const [isBundled, setIsBundled] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const refresh = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const next = await fetchRates();
      setRates(next);
      setIsBundled(false);
      setFailed(false);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(next)).catch(() => {});
    } catch {
      setFailed(true);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  /** Only go to the network if the API's own next-update time has passed. ~30 requests a month. */
  const refreshIfDue = useCallback(
    (current: Rates | null) => {
      if (!current || Date.now() / 1000 >= current.nextUpdate) refresh();
    },
    [refresh],
  );

  useEffect(() => {
    let alive = true;
    load().then(cached => {
      if (!alive) return;
      if (cached) {
        setRates(cached);
        setIsBundled(false);
      }
      refreshIfDue(cached);
    });
    return () => {
      alive = false;
    };
  }, [refreshIfDue]);

  // "On app open" means foregrounding too, not just cold start.
  const ratesRef = useRef(rates);
  ratesRef.current = rates;
  const bundledRef = useRef(isBundled);
  bundledRef.current = isBundled;

  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') refreshIfDue(bundledRef.current ? null : ratesRef.current);
    });
    return () => sub.remove();
  }, [refreshIfDue]);

  const net: Net = isBundled ? 'first' : failed ? 'offline' : 'live';

  const line = busy
    ? 'Checking for new rates…'
    : net === 'first'
      ? 'Bundled rates · connect to update'
      : net === 'offline'
        ? `Rates from ${fmtDate(rates.lastUpdate, false)} · offline`
        : `Rates from ${fmtDate(rates.lastUpdate, true)}`;

  return { rates, net, line, busy, refresh };
}
