use rusqlite::{Connection, Result};

pub fn init_db(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            event_date TEXT NOT NULL,
            last_edited TEXT NOT NULL,
            location TEXT
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS activities (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL,
            title TEXT NOT NULL,
            day_date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            color TEXT NOT NULL,
            description TEXT,
            person_in_charge TEXT,
            FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS participants (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL,
            group_id TEXT,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('teacher', 'leader', 'co_leader', 'member')),
            FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
            FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE SET NULL
        )",
        [],
    )?;

    Ok(())
}
