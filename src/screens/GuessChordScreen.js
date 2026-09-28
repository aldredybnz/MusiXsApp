import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppTheme } from "../theme";
import ScreenWrapper from "../components/ScreenWrapper";
import BottomNav from "../components/BottomNav";
import { KNOWN_CHORDS, playNotes, sameNotes } from "../utils/musicTheory";

const GRID = [
  ["A", "B", "C", "D"],
  ["E", "F", "G"],
];

function pickRandomChord() {
  return KNOWN_CHORDS[Math.floor(Math.random() * KNOWN_CHORDS.length)];
}

export default function GuessChordScreen({ onBack, onNavigate, onSessionComplete }) {
  const { colors, mode } = useAppTheme();
  const [target, setTarget] = useState(pickRandomChord);
  const [selected, setSelected] = useState([]);
  const [phase, setPhase] = useState("guessing"); // "guessing" | "correct" | "wrong"

  const toggleNote = (note) => {
    if (phase !== "guessing") return;
    setSelected((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const handleHear = useCallback(() => playNotes(target.notes), [target]);

  const handleSubmit = () => {
    if (selected.length === 0) return;
    const isCorrect = sameNotes(selected, target.notes);
    onSessionComplete?.({
      activity: "GuessAChord",
      detail: target.name,
      outcome: isCorrect ? "correct" : "wrong",
    });
    setPhase(isCorrect ? "correct" : "wrong");
  };

  const handleNext = () => {
    setTarget(pickRandomChord());
    setSelected([]);
    setPhase("guessing");
  };

  const handleTryAgain = () => {
    setSelected([]);
    setPhase("guessing");
  };

  if (phase !== "guessing") {
    const isCorrect = phase === "correct";
    return (
      <ScreenWrapper>
        <Text style={[styles.kicker, { color: colors.purpleLight }]}>02 / LISTEN</Text>
        <Text style={[styles.title, { color: colors.text }]}>Guess the chord</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Your answer</Text>

        <View
          style={[
            styles.feedbackBox,
            {
              backgroundColor: isCorrect ? colors.greenBg : colors.redBg,
              borderColor: isCorrect ? colors.green : colors.red,
            },
          ]}
        >
          {selected.map((n) => (
            <View key={n} style={styles.feedbackDot}>
              <Text style={styles.feedbackDotText}>{n}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.feedbackLabel, { color: isCorrect ? colors.green : colors.red }]}>
          {isCorrect ? "Correct" : "Wrong"}
        </Text>
        <Text style={[styles.feedbackSub, { color: colors.textMuted }]}>
          This is a {target.name}
        </Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.actionButton, { flex: 1, backgroundColor: colors.surface2 }]}
            onPress={handleHear}
          >
            <Text style={[styles.actionText, { color: colors.text }]}>Hear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { flex: 1, backgroundColor: colors.purple }]}
            onPress={isCorrect ? handleNext : handleTryAgain}
          >
            <Text style={styles.primaryActionText}>
              {isCorrect ? "Next Chord" : "Try Again"}
            </Text>
          </TouchableOpacity>
        </View>

        <BottomNav active="home" onNavigate={onNavigate} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <TouchableOpacity onPress={onBack}>
        <Text style={[styles.backBtn, { color: colors.purpleLight }]}>←</Text>
      </TouchableOpacity>
      <Text style={[styles.kicker, { color: colors.purpleLight }]}>02 / LISTEN</Text>
      <Text style={[styles.title, { color: colors.text }]}>Guess the chord</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Listen closely, then choose your notes.</Text>

      <TouchableOpacity
        style={[styles.hearButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handleHear}
      >
        <Text style={[styles.hearText, { color: colors.text }]}>▶ Hear the chord</Text>
      </TouchableOpacity>

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

      <TouchableOpacity
        style={[
          styles.enterButton,
          { backgroundColor: colors.purple, opacity: selected.length ? 1 : 0.5 },
        ]}
        disabled={selected.length === 0}
        onPress={handleSubmit}
      >
        <Text style={styles.enterText}>Submit Guess</Text>
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
  hearButton: { borderRadius: 12, borderWidth: 1, padding: 16, alignItems: "center", marginBottom: 20 },
  hearText: { fontSize: 15, fontWeight: "700" },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  noteButton: { flex: 1, aspectRatio: 1, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  noteText: { color: "white", fontSize: 14, fontWeight: "700" },
  enterButton: { borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 },
  enterText: { color: "white", fontWeight: "700" },
  feedbackBox: {
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
    padding: 12,
  },
  feedbackDot: {
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackDotText: { fontWeight: "800", color: "#1A1A1A" },
  feedbackLabel: { fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: 4 },
  feedbackSub: { fontSize: 13, textAlign: "center", marginBottom: 20 },
  actionButton: { borderRadius: 12, padding: 14, alignItems: "center" },
  actionText: { fontWeight: "600" },
  primaryActionText: { color: "white", fontWeight: "700" },
});
