/**
 * Every Vietnam-specific assumption in the app lives here.
 *
 * Nothing else reads this file in v1 — there is only one country. The point is
 * that when this app gets pointed at Thailand next year, the assumptions are in
 * one place instead of scattered through components.
 */

export type Code = 'VND' | 'ZAR' | 'USD';

/** The currency everything gets compared *to*. Only decides direction of helper text. */
export const HOME: Code = 'ZAR';

export const ORDER: Code[] = ['VND', 'ZAR', 'USD'];

export const NAMES: Record<Code, string> = {
  VND: 'Vietnamese Đồng',
  ZAR: 'South African Rand',
  USD: 'US Dollar · hotels & tours',
};

/** Used for the "ENTERING X" label above the keys. */
export const SHORT_NAMES: Record<Code, string> = {
  VND: 'Đồng',
  ZAR: 'Rand',
  USD: 'Dollar',
};

/**
 * The banknote pads. These are the actual notes in circulation, so the pad is
 * shaped like the money in your pocket rather than an arbitrary list of round
 * numbers. Also helps with the 20k/500k confusion — both are blue-ish polymer.
 */
export const NOTES: Record<Code, number[]> = {
  VND: [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000],
  ZAR: [10, 20, 50, 100, 200],
  USD: [1, 5, 10, 20, 50, 100],
};

/** The "at a glance" row — the notes you'll actually be handed. */
export const REF_ROWS = [10000, 20000, 50000, 100000, 200000, 500000];

/**
 * Only VND is big enough to need thousands-entry. A menu prints "95" meaning
 * 95,000, so the dong pad's native unit is thousands. Rand and dollar take
 * plain numbers.
 */
export const USES_K: Record<Code, boolean> = { VND: true, ZAR: false, USD: false };

/**
 * Shipped so a first launch with no signal still renders something real.
 * Rates as of 14 Jul 2026.
 */
export const BUNDLED_RATES = {
  vndPerZar: 1588.02,
  vndPerUsd: 26009,
  lastUpdate: Date.UTC(2026, 6, 14) / 1000,
};
