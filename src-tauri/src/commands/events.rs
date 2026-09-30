use rusqlite::params;
use tauri::State;
use crate::models::{DbState, EventItem, EventSettings};

#[tauri::command]
pub fn get_events(state: State<DbState>) -> Result<Vec<EventItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, event_date, last_edited, location, settings FROM events ORDER BY last_edited DESC")
        .map_err(|e| e.to_string())?;

    let event_iter = stmt
        .query_map([], |row| {
            let settings_str: String = row.get(5).unwrap_or_else(|_| "{}".to_string());
            let settings: EventSettings = serde_json::from_str(&settings_str).unwrap_or_default();

            Ok(EventItem {
                id: row.get(0)?,
                name: row.get(1)?,
                event_date: row.get(2)?,
                last_edited: row.get(3)?,
                location: row.get(4)?,
                settings,
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
pub fn create_event(state: State<DbState>, item: EventItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let settings_str = serde_json::to_string(&item.settings).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO events (id, name, event_date, last_edited, location, settings) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![item.id, item.name, item.event_date, item.last_edited, item.location, settings_str],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_event(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM events WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_event(state: State<DbState>, item: EventItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let settings_str = serde_json::to_string(&item.settings).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE events SET name = ?1, event_date = ?2, last_edited = ?3, location = ?4, settings = ?5 WHERE id = ?6",
        params![item.name, item.event_date, item.last_edited, item.location, settings_str, item.id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
