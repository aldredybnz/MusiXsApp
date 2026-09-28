import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppTheme } from "../theme";
import ScreenWrapper from "../components/ScreenWrapper";
import BottomNav from "../components/BottomNav";
import { playNotes, NOTE_NAMES } from "../utils/musicTheory";

export default function LearnChordScreen({ onBack, onNavigate, onSessionComplete }) {
  const { colors, mode } = useAppTheme();
  const [activeNote, setActiveNote] = useState(null);
  const [sessionLogged, setSessionLogged] = useState(false);

  const handlePress = (note) => {
    setActiveNote(note);
    playNotes([note]);
    if (!sessionLogged) {
      onSessionComplete?.({ activity: "LearnAChord", detail: `Note ${note}` });
      setSessionLogged(true);
    }
  };

  return (
    <ScreenWrapper>
      <TouchableOpacity onPress={onBack}>
        <Text style={[styles.backBtn, { color: colors.purpleLight }]}>←</Text>
      </TouchableOpacity>
      <Text style={[styles.kicker, { color: colors.purpleLight }]}>03 / EXPLORE</Text>
      <Text style={[styles.title, { color: colors.text }]}>Learn a chord</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Tap a note and listen.</Text>

      <View style={[styles.display, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.displayText, { color: colors.text }]}>
          {activeNote ? `Note: ${activeNote}` : "Tap a note to hear it"}
        </Text>
      </View>

      <View style={styles.grid}>
        {NOTE_NAMES.map((note) => (
          <TouchableOpacity
            key={note}
            style={[
              styles.noteButton,
              {
                backgroundColor: activeNote === note ? colors.purple : colors.surface2,
                borderColor: activeNote === note ? colors.purple : colors.border,
              },
            ]}
            onPress={() => handlePress(note)}
          >
            <Text
              style={[
                styles.noteText,
                {
                  color:
                    activeNote === note
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

      <BottomNav active="home" onNavigate={onNavigate} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  backBtn: { fontSize: 18, marginBottom: 4 },
  kicker: { fontSize: 10, fontWeight: "800", marginBottom: 6 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: "800" },
  subtitle: { fontSize: 13, marginBottom: 16, marginTop: 4 },
  display: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  displayText: { fontSize: 16, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  noteButton: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noteText: { color: "white", fontSize: 14, fontWeight: "700" },
});
