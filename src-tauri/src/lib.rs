use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{State, Manager};

#[derive(Debug, Serialize, Deserialize)]
pub struct EventItem {
    pub id: String,
    pub name: String,
    #[serde(rename = "eventDate")]
    pub event_date: String,
    #[serde(rename = "lastEdited")]
    pub last_edited: String,
    pub location: Option<String>,
}

pub struct DbState(pub Mutex<Connection>);

fn init_db(conn: &Connection) -> Result<()> {
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
    Ok(())
}

#[tauri::command]
fn get_events(state: State<DbState>) -> Result<Vec<EventItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, event_date, last_edited, location FROM events ORDER BY last_edited DESC")
        .map_err(|e| e.to_string())?;

    let event_iter = stmt
        .query_map([], |row| {
            Ok(EventItem {
                id: row.get(0)?,
                name: row.get(1)?,
                event_date: row.get(2)?,
                last_edited: row.get(3)?,
                location: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut events = Vec::new();
    for event in event_iter {
        events.push(event.map_err(|e| e.to_string())?);
    }

    Ok(events)
}

#[tauri::command]
fn create_event(state: State<DbState>, item: EventItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO events (id, name, event_date, last_edited, location) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![item.id, item.name, item.event_date, item.last_edited, item.location],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn delete_event(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM events WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
            
            let db_path = app_dir.join("events.db");
            let conn = Connection::open(db_path).expect("Failed to open database");
            
            init_db(&conn).expect("Failed to initialize database");
            
            app.manage(DbState(Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_events,
            create_event,
            delete_event
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
