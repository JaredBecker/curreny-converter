import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Scheme = 'light' | 'dark';
export type ThemePref = 'system' | Scheme;

/**
 * Blue accent (#3B6EA5), used in both schemes.
 *
 * Contrast checks, since this colour carries the "which field am I editing"
 * signal: white on accent is 5.30:1 (passes AA for the chip text), and accent
 * against the dark background is 3.35:1 (passes the 3:1 bar for borders and
 * the caret, which is all it's used for there).
 */
const ACCENT = '#3B6EA5';
const ON_ACCENT = '#FFFFFF';

export type Tokens = {
  bg: string;
  panel: string;
  key: string;
  keyBorder: string;
  ink: string;
  muted: string;
  faint: string;
  line: string;
  line2: string;
  ref: string;
  segTrack: string;
  homeBorder: string;
  chipOff: string;
  chipOffText: string;
  derived: string;
  iBorder: string;
  accent: string;
  onAccent: string;
  dotLive: string;
  dotStale: string;
};

const LIGHT: Tokens = {
  bg: '#F6F3EB',
  panel: '#EDE9DE',
  key: '#FDFCF8',
  keyBorder: '#E4DECF',
  ink: '#17150F',
  muted: '#8B8676',
  faint: '#B0AA9A',
  line: '#E4DECF',
  line2: '#E1DBCD',
  ref: '#EFEBE0',
  segTrack: '#E1DBCD',
  homeBorder: '#DED8CB',
  chipOff: '#EAE5D8',
  chipOffText: '#4A473E',
  derived: '#78746A',
  iBorder: '#D8D2C4',
  accent: ACCENT,
  onAccent: ON_ACCENT,
  dotLive: '#5B8C51',
  dotStale: '#C9942F',
};

const DARK: Tokens = {
  bg: '#191815',
  panel: '#221F1A',
  key: '#2B2924',
  keyBorder: '#3A372F',
  ink: '#F3EFE6',
  muted: '#9A9484',
  faint: '#6E6A5E',
  line: '#322F28',
  line2: '#322F28',
  ref: '#242118',
  segTrack: '#2B2924',
  homeBorder: '#3A372F',
  chipOff: '#322F28',
  chipOffText: '#C9C3B4',
  derived: '#8B8676',
  iBorder: '#3A372F',
  accent: ACCENT,
  onAccent: ON_ACCENT,
  dotLive: '#5B8C51',
  dotStale: '#C9942F',
};

export const FONT = {
  sans: 'SpaceGrotesk_400Regular',
  sansMed: 'SpaceGrotesk_500Medium',
  sansSemi: 'SpaceGrotesk_600SemiBold',
  sansBold: 'SpaceGrotesk_700Bold',
  mono: 'IBMPlexMono_400Regular',
  monoMed: 'IBMPlexMono_500Medium',
};

const PREF_KEY = 'theme.pref.v1';

export function useTheme() {
  const system = useColorScheme();
  const [pref, setPref] = useState<ThemePref>('system');

  useEffect(() => {
    AsyncStorage.getItem(PREF_KEY)
      .then(v => {
        if (v === 'light' || v === 'dark' || v === 'system') setPref(v);
      })
      .catch(() => {});
  }, []);

  const choose = useCallback((next: ThemePref) => {
    setPref(next);
    AsyncStorage.setItem(PREF_KEY, next).catch(() => {});
  }, []);

  const scheme: Scheme = pref === 'system' ? (system === 'dark' ? 'dark' : 'light') : pref;

  // The header button flips whatever you're currently looking at, which means it
  // also pins you off 'system'. About is where you get back to following the phone.
  const toggle = useCallback(
    () => choose(scheme === 'dark' ? 'light' : 'dark'),
    [choose, scheme],
  );

  return { t: scheme === 'dark' ? DARK : LIGHT, scheme, pref, choose, toggle };
}
