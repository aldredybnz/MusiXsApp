import * as Crypto from "expo-crypto";
import * as SQLite from "expo-sqlite";

let databasePromise;

function getDatabase() {
	if (!databasePromise) {
		databasePromise = SQLite.openDatabaseAsync("musixs.db")
			.then(async (database) => {
				await database.execAsync("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
				await database.execAsync(`
					CREATE TABLE IF NOT EXISTS users (
						id INTEGER PRIMARY KEY NOT NULL,
						username TEXT NOT NULL COLLATE NOCASE UNIQUE,
						password_salt TEXT NOT NULL,
						password_hash TEXT NOT NULL,
						created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
					);
					CREATE TABLE IF NOT EXISTS app_session (
						id INTEGER PRIMARY KEY CHECK (id = 1),
						user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
					);
					CREATE TABLE IF NOT EXISTS history_sessions (
						id INTEGER PRIMARY KEY NOT NULL,
						user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
						activity TEXT NOT NULL,
						detail TEXT,
						outcome TEXT,
						created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
					);
					CREATE INDEX IF NOT EXISTS history_sessions_user_date
						ON history_sessions (user_id, created_at DESC);
				`);
				return database;
			})
			.catch((error) => {
				databasePromise = null;
				throw error;
			});
	}
	return databasePromise;
}

async function getUserById(database, id) {
	return database.getFirstAsync(
		"SELECT id, username, created_at AS createdAt FROM users WHERE id = ?",
		id
	);
}

async function hashPassword(password, salt) {
	return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

export async function registerUser({ username, password }) {
	const cleanUsername = username.trim();
	if (!cleanUsername || !password) throw new Error("Enter a username and password.");

	const database = await getDatabase();
	const existingUser = await database.getFirstAsync(
		"SELECT id FROM users WHERE username = ? COLLATE NOCASE",
		cleanUsername
	);
	if (existingUser) throw new Error("That username is already in use.");

	const salt = Crypto.randomUUID();
	const passwordHash = await hashPassword(password, salt);
	let result;
	try {
		result = await database.runAsync(
			"INSERT INTO users (username, password_salt, password_hash) VALUES (?, ?, ?)",
			cleanUsername,
			salt,
			passwordHash
		);
	} catch (error) {
		const duplicate = await database.getFirstAsync(
			"SELECT id FROM users WHERE username = ? COLLATE NOCASE",
			cleanUsername
		);
		if (duplicate) throw new Error("That username is already in use.");
		throw error;
	}

	return getUserById(database, result.lastInsertRowId);
}

export async function loginUser({ username, password }) {
	const database = await getDatabase();
	const user = await database.getFirstAsync(
		"SELECT id, username, password_salt, password_hash FROM users WHERE username = ? COLLATE NOCASE",
		username.trim()
	);
	if (!user || (await hashPassword(password, user.password_salt)) !== user.password_hash) {
		return null;
	}
	return getUserById(database, user.id);
}

export async function saveCurrentUser(userId) {
	const database = await getDatabase();
	await database.runAsync(
		"INSERT INTO app_session (id, user_id) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET user_id = excluded.user_id",
		userId
	);
}

export async function getCurrentUser() {
	const database = await getDatabase();
	return database.getFirstAsync(
		`SELECT users.id, users.username, users.created_at AS createdAt
		 FROM app_session JOIN users ON users.id = app_session.user_id
		 WHERE app_session.id = 1`
	);
}

export async function clearCurrentUser() {
	const database = await getDatabase();
	await database.runAsync("DELETE FROM app_session WHERE id = 1");
}

export async function recordHistorySession({ userId, activity, detail = null, outcome = null }) {
	const database = await getDatabase();
	await database.runAsync(
		"INSERT INTO history_sessions (user_id, activity, detail, outcome) VALUES (?, ?, ?, ?)",
		userId,
		activity,
		detail,
		outcome
	);
}

export async function getUserHistory(userId) {
	const database = await getDatabase();
	return database.getAllAsync(
		`SELECT id, activity, detail, outcome, created_at AS createdAt
		 FROM history_sessions
		 WHERE user_id = ?
		 ORDER BY id DESC
		 LIMIT 100`,
		userId
	);
}

export async function getUserHistorySummary(userId) {
	const database = await getDatabase();
	const rows = await database.getAllAsync(
		`SELECT activity, COUNT(*) AS total
		 FROM history_sessions
		 WHERE user_id = ?
		 GROUP BY activity`,
		userId
	);
	return rows.reduce((summary, row) => ({ ...summary, [row.activity]: row.total }), {});
}