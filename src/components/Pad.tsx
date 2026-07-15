import { Pressable, ScrollView, Text, View } from 'react-native';
import { FONT, type Tokens } from '../theme';
import { type Code, SHORT_NAMES } from '../vietnam';
import { BACKSPACE, type Model, NUM_ORDER } from '../useConverter';
import { fmtVnd, noteLabel } from '../format';

/**
 * The design lays the keys out on a 3-column CSS grid. React Native has no grid,
 * so we chunk into rows of three and pad the short row with invisible cells —
 * otherwise a 5-note pad (rand) would stretch its last two keys full width.
 */
function rows<T>(items: T[]): (T | null)[][] {
  const out: (T | null)[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    const row: (T | null)[] = items.slice(i, i + 3);
    while (row.length < 3) row.push(null);
    out.push(row);
  }
  return out;
}

function Key({
  label,
  onPress,
  bg,
  color,
  t,
  weight,
  size,
}: {
  label: string;
  onPress: () => void;
  bg: string;
  color: string;
  t: Tokens;
  weight: string;
  size: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label === BACKSPACE ? 'Backspace' : label}
      style={({ pressed }) => ({
        flex: 1,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: pressed ? t.accent : bg,
        borderColor: pressed ? t.accent : t.keyBorder,
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      {({ pressed }) => (
        <Text
          style={{
            fontFamily: weight,
            fontSize: size,
            fontVariant: ['tabular-nums'],
            color: pressed ? t.onAccent : color,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function Segment({
  title,
  hint,
  on,
  onPress,
  t,
}: {
  title: string;
  hint: string;
  on: boolean;
  onPress: () => void;
  t: Tokens;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 4,
        borderRadius: 9,
        backgroundColor: on ? t.ink : 'transparent',
      }}
    >
      <Text style={{ fontFamily: FONT.sansSemi, fontSize: 13, color: on ? t.bg : t.ink }}>
        {title}
      </Text>
      <Text style={{ fontFamily: FONT.mono, fontSize: 9.5, marginTop: 1, color: on ? t.bg : t.faint }}>
        {hint}
      </Text>
    </Pressable>
  );
}

type Props = {
  t: Tokens;
  model: Model;
  setModel: (m: Model) => void;
  focus: Code;
  buffers: Record<Code, string>;
  exact: boolean;
  showExactToggle: boolean;
  toggleExact: () => void;
  vnd: number;
  noteSet: number[];
  noteItems: number[];
  press: (k: string) => void;
  addNote: (v: number) => void;
  backspace: () => void;
  /** Android runs edge-to-edge, so the keys have to clear the gesture bar. */
  bottomInset: number;
};

export function Pad(p: Props) {
  const { t, focus } = p;
  const isA = p.model === 'A';

  const label = 'ENTERING ' + SHORT_NAMES[focus].toUpperCase();

  const readout =
    focus === 'VND'
      ? p.exact
        ? `${fmtVnd(p.vnd)} ₫`
        : `${p.buffers.VND || '0'} k`
      : focus === 'ZAR'
        ? `R ${p.buffers.ZAR || '0'}`
        : `$ ${p.buffers.USD || '0'}`;

  const sum = p.noteItems.reduce((a, b) => a + b, 0);
  const total =
    focus === 'VND' ? `${fmtVnd(sum)} ₫` : focus === 'ZAR' ? `R${sum}` : `$${sum}`;
  const expression = p.noteItems.length
    ? p.noteItems.map(v => noteLabel(focus, v)).join('  +  ') + '   =   ' + total
    : 'Tap a note to build up a bill';

  return (
    <View
      style={{
        paddingTop: 12,
        paddingHorizontal: 18,
        paddingBottom: 20 + p.bottomInset,
        backgroundColor: t.panel,
        borderTopWidth: 1,
        borderTopColor: t.line2,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: 5,
          borderRadius: 12,
          padding: 4,
          marginBottom: 12,
          backgroundColor: t.segTrack,
        }}
      >
        <Segment title="Thousands" hint="type 95 = 95k" on={isA} onPress={() => p.setModel('A')} t={t} />
        <Segment title="Banknotes" hint="tap the notes" on={!isA} onPress={() => p.setModel('B')} t={t} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: isA ? 'flex-end' : 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.4, color: t.faint }}>
            {label}
          </Text>

          {isA ? (
            <Text
              style={{
                fontFamily: FONT.sansSemi,
                fontSize: 16,
                marginTop: 2,
                fontVariant: ['tabular-nums'],
                color: t.ink,
              }}
            >
              {readout}
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 3 }}
            >
              <Text style={{ fontFamily: FONT.mono, fontSize: 12.5, color: t.ink }}>
                {expression}
              </Text>
            </ScrollView>
          )}
        </View>

        {isA && p.showExactToggle && (
          <Pressable
            onPress={p.toggleExact}
            accessibilityRole="button"
            style={{
              paddingVertical: 6,
              paddingHorizontal: 11,
              borderRadius: 9,
              backgroundColor: t.key,
              borderWidth: 1,
              borderColor: t.keyBorder,
            }}
          >
            <Text style={{ fontFamily: FONT.mono, fontSize: 11, color: t.muted }}>
              {p.exact ? 'k mode' : 'exact ₫'}
            </Text>
          </Pressable>
        )}

        {!isA && (
          <Pressable
            onPress={p.backspace}
            accessibilityRole="button"
            accessibilityLabel="Remove last note"
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 10,
              backgroundColor: t.key,
              borderWidth: 1,
              borderColor: t.keyBorder,
            }}
          >
            <Text style={{ fontFamily: FONT.sans, fontSize: 16, color: t.muted }}>{BACKSPACE}</Text>
          </Pressable>
        )}
      </View>

      <View style={{ gap: 8 }}>
        {isA
          ? rows(NUM_ORDER).map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', gap: 8 }}>
                {row.map((k, ci) =>
                  k === null ? (
                    <View key={ci} style={{ flex: 1 }} />
                  ) : (
                    <Key
                      key={ci}
                      label={k}
                      onPress={() => p.press(k)}
                      bg={k === BACKSPACE ? t.chipOff : t.key}
                      color={
                        k === '.' && focus === 'VND' ? t.faint : k === BACKSPACE ? t.muted : t.ink
                      }
                      weight={FONT.sansMed}
                      size={21}
                      t={t}
                    />
                  ),
                )}
              </View>
            ))
          : rows(p.noteSet).map((row, ri) => (
              <View key={ri} style={{ flexDirection: 'row', gap: 8 }}>
                {row.map((v, ci) =>
                  v === null ? (
                    <View key={ci} style={{ flex: 1 }} />
                  ) : (
                    <Key
                      key={ci}
                      label={noteLabel(focus, v)}
                      onPress={() => p.addNote(v)}
                      bg={t.key}
                      color={t.ink}
                      weight={FONT.sansSemi}
                      size={16}
                      t={t}
                    />
                  ),
                )}
              </View>
            ))}
      </View>
    </View>
  );
}
