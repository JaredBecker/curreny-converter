import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';

import { FONT, type Tokens, useTheme } from './src/theme';
import { useRates } from './src/rates';
import { useConverter } from './src/useConverter';
import { fmtUsd, fmtVnd, fmtZar, kLabel } from './src/format';
import { type Code, ORDER, REF_ROWS } from './src/vietnam';
import { Field } from './src/components/Field';
import { Pad } from './src/components/Pad';
import { About } from './src/components/About';
import { Intro } from './src/components/Intro';

/** A half-filled disc — reads as contrast without pulling in an icon library. */
function ThemeButton({ t, dark, onPress }: { t: Tokens; dark: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${dark ? 'light' : 'dark'} mode`}
      hitSlop={8}
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1.5,
        borderColor: t.iBorder,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          overflow: 'hidden',
          flexDirection: 'row',
          borderWidth: 1,
          borderColor: t.muted,
        }}
      >
        <View style={{ flex: 1, backgroundColor: t.muted }} />
        <View style={{ flex: 1 }} />
      </View>
    </Pressable>
  );
}

function Converter() {
  const insets = useSafeAreaInsets();
  const { t, scheme, pref, choose, toggle } = useTheme();
  const { rates, net, line, refresh } = useRates();
  const c = useConverter(rates);
  const [aboutOpen, setAboutOpen] = useState(false);

  const values: Record<Code, string> = {
    VND: `${fmtVnd(c.vnd)} ₫`,
    ZAR: fmtZar(c.zar),
    USD: fmtUsd(c.usd),
  };

  const dot = net === 'live' ? t.dotLive : net === 'offline' ? t.dotStale : t.faint;
  const rotZar = 'R' + (1000 / rates.vndPerZar).toFixed(2);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      <View style={{ flex: 1, paddingTop: 6, paddingHorizontal: 22, paddingBottom: 12 }}>
        <View
          style={{
            height: 40,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{ fontFamily: FONT.mono, fontSize: 12, letterSpacing: 1.92, color: t.muted }}
          >
            DING DONG DOLLA
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ThemeButton t={t} dark={scheme === 'dark'} onPress={toggle} />
            <Pressable
              onPress={() => setAboutOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="About"
              hitSlop={8}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                borderWidth: 1.5,
                borderColor: t.iBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: FONT.sansSemi,
                  fontStyle: 'italic',
                  fontSize: 15,
                  color: t.muted,
                }}
              >
                i
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          {ORDER.map(code => (
            <Field
              key={code}
              code={code}
              value={values[code]}
              isSource={c.focus === code}
              onPress={() => c.focusField(code)}
              t={t}
            />
          ))}
        </View>

        <View style={{ marginTop: 14 }}>
          <Text
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              letterSpacing: 1.6,
              marginBottom: 7,
              color: t.faint,
            }}
          >
            AT A GLANCE · ₫ → R
          </Text>
          <View style={{ flexDirection: 'row', gap: 5 }}>
            {REF_ROWS.map(v => (
              <View
                key={v}
                style={{
                  flex: 1,
                  borderRadius: 9,
                  paddingVertical: 7,
                  paddingHorizontal: 4,
                  alignItems: 'center',
                  backgroundColor: t.ref,
                }}
              >
                <Text style={{ fontFamily: FONT.mono, fontSize: 11, color: t.muted }}>
                  {kLabel(v)}
                </Text>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={{
                    fontFamily: FONT.sansSemi,
                    fontSize: 14,
                    marginTop: 2,
                    fontVariant: ['tabular-nums'],
                    color: t.ink,
                  }}
                >
                  {fmtZar(v / rates.vndPerZar)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 10 }} />

        <Pressable
          onPress={refresh}
          accessibilityRole="button"
          accessibilityLabel={`${line}. Tap to check for new rates.`}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot }} />
          <Text style={{ fontFamily: FONT.mono, fontSize: 11, color: t.muted }}>{line}</Text>
        </Pressable>
      </View>

      <Pad
        t={t}
        model={c.model}
        setModel={c.setModel}
        focus={c.focus}
        buffers={c.buffers}
        exact={c.exact}
        showExactToggle={c.showExactToggle}
        toggleExact={c.toggleExact}
        vnd={c.vnd}
        noteSet={c.noteSet}
        noteItems={c.noteItems}
        press={c.press}
        addNote={c.addNote}
        backspace={c.backspace}
        bottomInset={insets.bottom}
      />

      {aboutOpen && (
        <About
          t={t}
          onClose={() => setAboutOpen(false)}
          ratesLine={line}
          rotZar={rotZar}
          pref={pref}
          choose={choose}
        />
      )}
    </View>
  );
}

export default function App() {
  const [loaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });
  const [introDone, setIntroDone] = useState(false);

  // The intro doubles as the loading screen: its contours render on the first
  // frame (no fonts needed), the words join once the fonts are in, and the
  // converter mounts underneath ready for the reveal.
  return (
    <SafeAreaProvider>
      {loaded && <Converter />}
      {!introDone && <Intro fontsReady={loaded} onFinish={() => setIntroDone(true)} />}
    </SafeAreaProvider>
  );
}
