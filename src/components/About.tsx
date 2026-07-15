import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { FONT, type ThemePref, type Tokens } from '../theme';

const ATTRIB_URL = 'https://www.exchangerate-api.com';

const PREFS: { key: ThemePref; label: string }[] = [
  { key: 'system', label: 'System' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

type Props = {
  t: Tokens;
  onClose: () => void;
  ratesLine: string;
  rotZar: string;
  pref: ThemePref;
  choose: (p: ThemePref) => void;
};

export function About({ t, onClose, ratesLine, rotZar, pref, choose }: Props) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex: 5,
          paddingTop: 34,
          paddingHorizontal: 26,
          paddingBottom: 26,
          backgroundColor: t.bg,
        },
      ]}
    >
      <Pressable onPress={onClose} accessibilityRole="button" hitSlop={12}>
        <Text style={{ fontFamily: FONT.mono, fontSize: 12, color: t.muted }}>‹&nbsp;&nbsp;Back</Text>
      </Pressable>

      <Text style={{ fontFamily: FONT.sansSemi, fontSize: 30, marginTop: 22, color: t.ink }}>
        About
      </Text>

      <Text style={{ fontFamily: FONT.sans, fontSize: 15, lineHeight: 23, marginTop: 16, color: t.ink }}>
        Converts Rand, Đồng and Dollar using rates that refresh once a day.
      </Text>
      <Text style={{ fontFamily: FONT.sans, fontSize: 15, lineHeight: 23, marginTop: 12, color: t.muted }}>
        Works offline — it keeps the last rates it fetched and never blocks on the network. Stale
        rates are harmless here.
      </Text>

      <View style={{ height: 1, marginVertical: 22, backgroundColor: t.line }} />

      <Text style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 1.1, color: t.faint }}>
        APPEARANCE
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: 5,
          borderRadius: 12,
          padding: 4,
          marginTop: 8,
          backgroundColor: t.segTrack,
        }}
      >
        {PREFS.map(o => {
          const on = pref === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => choose(o.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 7,
                borderRadius: 9,
                backgroundColor: on ? t.ink : 'transparent',
              }}
            >
              <Text style={{ fontFamily: FONT.sansSemi, fontSize: 13, color: on ? t.bg : t.ink }}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 1, marginVertical: 22, backgroundColor: t.line }} />

      <Text style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: 1.1, color: t.faint }}>
        RATES
      </Text>
      <Text style={{ fontFamily: FONT.sans, fontSize: 14, marginTop: 6, color: t.ink }}>
        {ratesLine}
      </Text>

      <Pressable
        onPress={() => Linking.openURL(ATTRIB_URL).catch(() => {})}
        accessibilityRole="link"
        style={{ marginTop: 14, alignSelf: 'flex-start' }}
      >
        <Text
          style={{
            fontFamily: FONT.mono,
            fontSize: 12,
            color: t.muted,
            textDecorationLine: 'underline',
          }}
        >
          Rates By Exchange Rate API
        </Text>
      </Pressable>

      <View style={{ flex: 1 }} />

      <Text style={{ fontFamily: FONT.mono, fontSize: 11, color: t.faint }}>
        1,000₫ ≈ {rotZar} · v1 · Vietnam
      </Text>
    </View>
  );
}
