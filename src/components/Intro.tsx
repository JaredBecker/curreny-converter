import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { FONT } from '../theme';

const BG = '#121311';
const ACCENT = '#3B6EA5';
const INK = '#F3EFE6';

const WORDS = ['ding', 'dong', 'dolla'];

/**
 * Topographic contours, like the icon: a handful of "peaks", each ringed by
 * nested closed loops that share one wobble so they nest like map contours.
 * Deterministic (seeded) so the intro looks identical every launch.
 */
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Peak = { cx: number; cy: number; rings: number; step: number; seed: number };

// Laid out in a 400x800 box; edge peaks run off-canvas so lines enter from the sides.
const PEAKS: Peak[] = [
  { cx: 55, cy: 80, rings: 6, step: 30, seed: 11 },
  { cx: 355, cy: 145, rings: 6, step: 32, seed: 23 },
  { cx: 15, cy: 465, rings: 6, step: 31, seed: 41 },
  { cx: 385, cy: 520, rings: 6, step: 30, seed: 53 },
  { cx: 115, cy: 725, rings: 6, step: 33, seed: 67 },
  { cx: 335, cy: 790, rings: 5, step: 30, seed: 79 },
];

function contourPaths(p: Peak): string[] {
  const rnd = lcg(p.seed);
  const harmonics = [
    { amp: 0.1 + rnd() * 0.08, freq: 2, phase: rnd() * Math.PI * 2 },
    { amp: 0.06 + rnd() * 0.08, freq: 3, phase: rnd() * Math.PI * 2 },
    { amp: 0.04 + rnd() * 0.05, freq: 5, phase: rnd() * Math.PI * 2 },
  ];
  const paths: string[] = [];
  for (let ring = 0; ring < p.rings; ring++) {
    const base = p.step * (ring + 1);
    const pts: string[] = [];
    const N = 72;
    for (let k = 0; k <= N; k++) {
      const th = (k / N) * Math.PI * 2;
      const wobble = harmonics.reduce((s, h) => s + h.amp * Math.sin(h.freq * th + h.phase), 0);
      const r = base * (1 + wobble);
      pts.push(`${(p.cx + r * Math.cos(th)).toFixed(1)},${(p.cy + r * Math.sin(th)).toFixed(1)}`);
    }
    paths.push(`M ${pts.join(' L ')} Z`);
  }
  return paths;
}

type Stroke = { d: string; opacity: number; width: number };

// Three layers, drifting at different speeds for a slow parallax "growing" feel.
const LAYERS: Stroke[][] = [0, 1, 2].map(layer =>
  PEAKS.filter((_, i) => i % 3 === layer).flatMap(p =>
    contourPaths(p).map((d, ring) => ({
      d,
      opacity: 0.62 - ring * 0.055,
      width: ring % 2 === 0 ? 2.6 : 2.2,
    })),
  ),
);

export function Intro({ fontsReady, onFinish }: { fontsReady: boolean; onFinish: () => void }) {
  const { width } = useWindowDimensions();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const drift = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const wordAnims = useRef(WORDS.map(() => new Animated.Value(0))).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const started = useRef(false);

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    const loops = drift.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: 8000 + i * 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 8000 + i * 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, []);

  // Words wait for the fonts; the contours are already moving by then.
  useEffect(() => {
    if (!fontsReady || started.current) return;
    started.current = true;
    Animated.sequence([
      Animated.stagger(
        220,
        wordAnims.map(v =>
          Animated.spring(v, { toValue: 1, tension: 42, friction: 7, useNativeDriver: true }),
        ),
      ),
      Animated.delay(400),
      Animated.timing(slideX, {
        toValue: -width,
        duration: 420,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, [fontsReady]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { backgroundColor: BG, transform: [{ translateX: slideX }] }]}
    >
      {LAYERS.map((strokes, i) => {
        const scale = drift[i].interpolate({ inputRange: [0, 1], outputRange: [1, 1.05 + i * 0.02] });
        const translateY = drift[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, i === 1 ? 10 : -8],
        });
        return (
          <Animated.View
            key={i}
            style={[StyleSheet.absoluteFill, { opacity: fadeIn, transform: [{ scale }, { translateY }] }]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
              {strokes.map((s, j) => (
                <Path
                  key={j}
                  d={s.d}
                  stroke={ACCENT}
                  strokeWidth={s.width}
                  strokeOpacity={s.opacity}
                  fill="none"
                  strokeLinejoin="round"
                />
              ))}
            </Svg>
          </Animated.View>
        );
      })}

      {fontsReady && (
        <View style={styles.words}>
          {WORDS.map((word, i) => {
            const v = wordAnims[i];
            const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [70, 0] });
            return (
              <Animated.Text
                key={word}
                style={[styles.word, { opacity: v, transform: [{ translateY }] }]}
              >
                {word}
              </Animated.Text>
            );
          })}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  words: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: {
    fontFamily: FONT.sansBold,
    fontSize: 54,
    lineHeight: 58,
    color: INK,
    letterSpacing: -0.5,
  },
});
