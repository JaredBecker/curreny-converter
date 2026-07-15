import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { FONT, type Tokens } from '../theme';
import { type Code, HOME, NAMES } from '../vietnam';

/** step-end blink at a 1.05s period, matching the design's caret keyframes. */
function Caret({ color }: { color: string }) {
  const op = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.delay(525),
        Animated.timing(op, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(525),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [op]);

  return (
    <Animated.View
      style={{ width: 2, height: 28, marginLeft: 4, backgroundColor: color, opacity: op }}
    />
  );
}

type Props = {
  code: Code;
  value: string;
  isSource: boolean;
  onPress: () => void;
  t: Tokens;
};

export function Field({ code, value, isSource, onPress, t }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSource }}
      accessibilityLabel={`${NAMES[code]}, ${value}${isSource ? ', editing' : ''}`}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 9,
        borderBottomWidth: isSource ? 2 : 1,
        borderBottomColor: isSource ? t.accent : t.line,
      }}
    >
      <View style={{ gap: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              paddingVertical: 3,
              paddingHorizontal: 7,
              borderRadius: 6,
              backgroundColor: isSource ? t.accent : t.chipOff,
            }}
          >
            <Text
              style={{
                fontFamily: FONT.monoMed,
                fontSize: 11,
                letterSpacing: 0.44,
                color: isSource ? t.onAccent : t.chipOffText,
              }}
            >
              {code}
            </Text>
          </View>

          {code === HOME && (
            <View
              style={{
                borderRadius: 5,
                paddingVertical: 2,
                paddingHorizontal: 5,
                borderWidth: 1,
                borderColor: t.homeBorder,
              }}
            >
              <Text
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 9.5,
                  letterSpacing: 0.95,
                  color: t.faint,
                }}
              >
                HOME
              </Text>
            </View>
          )}
        </View>

        <Text style={{ fontFamily: FONT.sans, fontSize: 12, color: t.muted }}>{NAMES[code]}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            fontFamily: FONT.sansSemi,
            fontSize: 31,
            fontVariant: ['tabular-nums'],
            color: isSource ? t.ink : t.derived,
          }}
        >
          {value}
        </Text>
        {isSource && <Caret color={t.accent} />}
      </View>
    </Pressable>
  );
}
