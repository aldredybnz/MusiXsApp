import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppTheme } from "../theme";
import ScreenWrapper from "../components/ScreenWrapper";
import BottomNav from "../components/BottomNav";
import { identifyChord, playNotes } from "../utils/musicTheory";

const GRID = [
  ["A", "B", "C", "D"],
  ["E", "F", "G"],
];

export default function BuildChordScreen({ onBack, onBuilt, onNavigate }) {
  const { colors, mode } = useAppTheme();
  const [selected, setSelected] = useState([]);

  const toggleNote = (note) => {
    setSelected((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const handleEnter = () => {
    if (selected.length < 2) return;
    onBuilt({ notes: selected, chordName: identifyChord(selected) });
  };

  return (
    <ScreenWrapper>
      <TouchableOpacity onPress={onBack}>
        <Text style={[styles.backBtn, { color: colors.purpleLight }]}>←</Text>
      </TouchableOpacity>
              <Text style={[styles.kicker, { color: colors.purpleLight }]}>01 / CREATE</Text>
      <Text style={[styles.title, { color: colors.text }]}>Build a chord</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Start with two or more notes.</Text>

      <View style={[styles.selectedBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {selected.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Tap notes below</Text>
        ) : (
          selected.map((n) => (
            <View key={n} style={[styles.selectedDot, { backgroundColor: colors.purple }]}>
              <Text style={styles.selectedDotText}>{n}</Text>
            </View>
          ))
        )}
      </View>

      {GRID.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((note) => (
            <TouchableOpacity
              key={note}
              style={[
                styles.noteButton,
                {
                  backgroundColor: selected.includes(note) ? colors.purple : colors.surface2,
                  borderColor: selected.includes(note) ? colors.purple : colors.border,
                },
              ]}
              onPress={() => toggleNote(note)}
            >
              <Text
                style={[
                  styles.noteText,
                  {
                    color: selected.includes(note)
                      ? "#ffffff"
                      : mode === "light"
                        ? colors.purpleLight
                        : colors.text,
                  },
                ]}
              >
                {note}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.actionButton, { flex: 1, backgroundColor: colors.surface2 }]}
          onPress={() => setSelected([])}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>Clear selection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { flex: 1, backgroundColor: colors.surface2, opacity: selected.length ? 1 : 0.5 },
          ]}
          disabled={selected.length === 0}
          onPress={() => playNotes(selected)}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>Play</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.enterButton,
          { backgroundColor: colors.purple, opacity: selected.length >= 2 ? 1 : 0.5 },
        ]}
        disabled={selected.length < 2}
        onPress={handleEnter}
      >
        <Text style={styles.enterText}>Enter</Text>
      </TouchableOpacity>

      <BottomNav active="home" onNavigate={onNavigate} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  backBtn: { fontSize: 18, marginBottom: 4 },
  kicker: { fontSize: 10, fontWeight: "800", marginBottom: 6 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: "800" },
  subtitle: { fontSize: 13, marginBottom: 16, marginTop: 4 },
  selectedBar: {
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
    padding: 8,
  },
  selectedDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDotText: { color: "white", fontSize: 13, fontWeight: "700" },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  noteButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noteText: { color: "white", fontSize: 14, fontWeight: "700" },
  actionButton: { borderRadius: 12, padding: 14, alignItems: "center" },
  actionText: { fontWeight: "600" },
  enterButton: { borderRadius: 12, padding: 14, alignItems: "center", marginTop: 2 },
  enterText: { color: "white", fontWeight: "700" },
});
