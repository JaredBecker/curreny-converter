import type { Code } from './vietnam';

/**
 * Grouping is done by hand rather than via toLocaleString: Hermes' Intl support
 * varies by build, and a dong figure silently losing its separators turns
 * 1500000 into something unreadable at exactly the moment you need to read it.
 */
const group = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Dong always gets separators. Returns digits only — call sites append ₫. */
export const fmtVnd = (n: number) => group(String(Math.round(n)));

/** Round hard: you're deciding if a snack is cheap, not reconciling a statement. */
export const fmtZar = (n: number) => {
  if (n < 100) return 'R' + Math.round(n);
  const [i, d] = n.toFixed(2).split('.');
  return 'R' + group(i) + '.' + d;
};

export const fmtUsd = (n: number) => {
  if (n < 10) return '$' + n.toFixed(2);
  return '$' + group(String(Math.round(n)));
};

/** 1000 -> "1k", 500000 -> "500k", 20 -> "20" */
export const kLabel = (v: number) => (v >= 1000 ? v / 1000 + 'k' : String(v));

export const noteLabel = (code: Code, v: number) =>
  code === 'VND' ? kLabel(v) : code === 'ZAR' ? 'R' + v : '$' + v;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** UTC, to match how the API labels its own update times. */
export const fmtDate = (unix: number, withYear: boolean) => {
  const d = new Date(unix * 1000);
  const base = `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  return withYear ? `${base} ${d.getUTCFullYear()}` : base;
};
