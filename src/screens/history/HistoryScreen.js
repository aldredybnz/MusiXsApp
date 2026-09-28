import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomNav from "../../components/BottomNav";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAppTheme } from "../../theme";

const ACTIVITY_LABELS = {
  BuildAChord: "Chord built",
  GuessAChord: "Chord guessed",
  LearnAChord: "Notes explored",
};

function formatDate(value) {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function HistoryScreen({ user, onBack, onNavigate, loadHistory, loadSummary }) {
  const { colors } = useAppTheme();
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    Promise.all([loadHistory(user.id), loadSummary(user.id)])
      .then(([items, totals]) => {
        if (mounted) {
          setSessions(items);
          setSummary(totals);
        }
      })
      .catch(() => {
        if (mounted) setError("Couldn't load your history. Try again later.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [loadHistory, loadSummary, user]);

  const countFor = (activity) => summary[activity] || 0;

  return (
    <ScreenWrapper>
      <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to home">
        <Text style={[styles.back, { color: colors.purpleLight }]}>←</Text>
      </TouchableOpacity>
      <Text style={[styles.kicker, { color: colors.purpleLight }]}>MUSIXS / PROGRESS</Text>
      <Text style={[styles.title, { color: colors.text }]}>History</Text>
      {user ? (
        <>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Your recent sessions</Text>
          <View style={styles.stats}>
            {[
              ["Builds", countFor("BuildAChord")],
              ["Guesses", countFor("GuessAChord")],
              ["Lessons", countFor("LearnAChord")],
            ].map(([label, count]) => (
              <View
                key={label}
                style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.statNumber, { color: colors.purpleLight }]}>{count}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
              </View>
            ))}
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent activity</Text>
          {loading ? (
            <ActivityIndicator style={styles.loader} color={colors.purple} />
          ) : error ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{error}</Text>
          ) : sessions.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No sessions yet</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Your completed sessions will appear here.</Text>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.purple }]}
                onPress={() => onNavigate("home")}
                accessibilityRole="button"
              >
                <Text style={styles.buttonText}>Start a session</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {sessions.map((session) => (
                <View
                  key={session.id}
                  style={[styles.session, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={[styles.sessionIcon, { backgroundColor: colors.surface2 }]}>
                    <Text style={[styles.sessionIconText, { color: colors.purpleLight }]}>♫</Text>
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={[styles.sessionTitle, { color: colors.text }]}>
                      {ACTIVITY_LABELS[session.activity] || session.activity}
                    </Text>
                    {!!session.detail && (
                      <Text style={[styles.sessionDetail, { color: colors.textMuted }]}>{session.detail}</Text>
                    )}
                    <Text style={[styles.sessionDate, { color: colors.textMuted }]}>
                      {formatDate(session.createdAt)}
                    </Text>
                  </View>
                  {!!session.outcome && (
                    <View
                      style={[
                        styles.outcome,
                        { backgroundColor: session.outcome === "correct" ? colors.greenBg : colors.redBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.outcomeText,
                          { color: session.outcome === "correct" ? colors.green : colors.red },
                        ]}
                      >
                        {session.outcome}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </>
      ) : (
        <View style={styles.signedOut}>
          <View style={[styles.lockMark, { backgroundColor: colors.surface2 }]}>
            <Text style={[styles.lockIcon, { color: colors.purpleLight }]}>♫</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Logging in required</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Log in or create an account to keep track of your sessions.</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.purple }]}
            onPress={() => onNavigate("profile")}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Log in / Register</Text>
          </TouchableOpacity>
        </View>
      )}
      <BottomNav active="history" onNavigate={onNavigate} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  back: { fontSize: 20, marginBottom: 4 },
  kicker: { fontSize: 10, fontWeight: "800", marginBottom: 6 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 18 },
  stats: { flexDirection: "row", gap: 10, marginBottom: 24 },
  stat: { flex: 1, minHeight: 78, borderWidth: 1, borderRadius: 12, padding: 12, justifyContent: "center" },
  statNumber: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  list: { flex: 1 },
  listContent: { gap: 9, paddingBottom: 10 },
  session: { minHeight: 76, borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center" },
  sessionIcon: { width: 42, height: 42, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  sessionIconText: { fontSize: 19, fontWeight: "700" },
  sessionInfo: { flex: 1, marginLeft: 12 },
  sessionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  sessionDetail: { fontSize: 12, marginBottom: 3 },
  sessionDate: { fontSize: 10 },
  outcome: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, marginLeft: 8 },
  outcomeText: { fontSize: 10, fontWeight: "800", textTransform: "capitalize" },
  loader: { marginTop: 24 },
  empty: { borderWidth: 1, borderRadius: 14, padding: 18, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  emptyText: { fontSize: 13, lineHeight: 20, textAlign: "center", marginBottom: 18 },
  signedOut: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 12 },
  lockMark: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  lockIcon: { fontSize: 27, fontWeight: "700" },
  button: { minHeight: 50, borderRadius: 12, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", alignSelf: "stretch" },
  buttonText: { color: "#ffffff", fontSize: 14, fontWeight: "700" },
});