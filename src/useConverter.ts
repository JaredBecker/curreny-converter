import { useCallback, useState } from 'react';
import type { Rates } from './rates';
import { type Code, NOTES, USES_K } from './vietnam';

/** A = thousands numpad (read one price), B = banknote accumulator (add up a bill). */
export type Model = 'A' | 'B';

export const BACKSPACE = '⌫';
export const CLEAR = 'C';
/**
 * No decimal key: every field rounds to whole units on display, so a decimal
 * could only ever enter a number you'd never see back. That slot is worth more
 * as a one-tap clear than as a "." nobody can use.
 */
export const NUM_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', CLEAR, '0', BACKSPACE];

const MAX_LEN = 13;
const empty: Record<Code, number[]> = { VND: [], ZAR: [], USD: [] };

export function useConverter(rates: Rates) {
  const [model, setModel] = useState<Model>('A');
  const [focus, setFocus] = useState<Code>('VND');
  const [exact, setExact] = useState(false);
  const [buffers, setBuffers] = useState<Record<Code, string>>({ VND: '95', ZAR: '', USD: '' });
  const [notes, setNotes] = useState<Record<Code, number[]>>(empty);

  /**
   * Single source of truth: whatever field has focus. Everything else is derived
   * from it, which is why tapping a field seeds its buffer from the current value
   * rather than blanking it.
   */
  const toVnd = (
    m: Model,
    f: Code,
    ex: boolean,
    bufs: Record<Code, string>,
    ns: Record<Code, number[]>,
  ) => {
    const base =
      m === 'B'
        ? (ns[f] ?? []).reduce((a, b) => a + b, 0)
        : parseFloat(String(bufs[f] ?? '').replace(/,/g, '')) || 0;

    if (f === 'VND') return m === 'B' ? base : ex ? base : base * 1000;
    if (f === 'ZAR') return base * rates.vndPerZar;
    return base * rates.vndPerUsd;
  };

  const vnd = toVnd(model, focus, exact, buffers, notes);
  const zar = vnd / rates.vndPerZar;
  const usd = vnd / rates.vndPerUsd;

  const press = useCallback(
    (k: string) => {
      setBuffers(s => {
        let b = String(s[focus] ?? '');
        if (k === BACKSPACE) b = b.slice(0, -1);
        else if (k === CLEAR) b = '';
        else b = b === '0' ? k : b + k;
        if (b.length > MAX_LEN) return s;
        return { ...s, [focus]: b };
      });
    },
    [focus],
  );

  const addNote = useCallback(
    (v: number) => setNotes(s => ({ ...s, [focus]: [...s[focus], v] })),
    [focus],
  );

  /** In note mode this drops the last *item*, not the last digit — that's the point of it. */
  const backspace = useCallback(() => {
    if (model === 'A') return press(BACKSPACE);
    setNotes(s => ({ ...s, [focus]: s[focus].slice(0, -1) }));
  }, [model, focus, press]);

  const focusField = useCallback(
    (f: Code) => {
      if (f === focus) return;
      if (model === 'B') {
        setFocus(f);
        return;
      }
      let seed = '';
      if (vnd > 0) {
        if (f === 'VND') seed = String(Math.round(exact ? vnd : vnd / 1000));
        else if (f === 'ZAR') seed = String(Math.round(vnd / rates.vndPerZar));
        else seed = String(Math.round(vnd / rates.vndPerUsd));
      }
      setFocus(f);
      setBuffers(s => ({ ...s, [f]: seed }));
    },
    [focus, model, exact, vnd, rates],
  );

  const toggleExact = useCallback(() => {
    setBuffers(s => {
      const n = parseFloat(String(s.VND ?? '').replace(/,/g, '')) || 0;
      let nb = exact ? String(Math.round(n / 1000)) : String(Math.round(n * 1000));
      if (nb === '0') nb = '';
      return { ...s, VND: nb };
    });
    setExact(e => !e);
  }, [exact]);

  return {
    model,
    setModel,
    focus,
    focusField,
    exact,
    toggleExact,
    buffers,
    noteItems: notes[focus],
    noteSet: NOTES[focus],
    press,
    addNote,
    backspace,
    vnd,
    zar,
    usd,
    /** Only the dong pad is in thousands; rand and dollar take plain numbers. */
    showExactToggle: model === 'A' && USES_K[focus],
  };
}
