use rusqlite::params;
use tauri::State;
use crate::models::{DbState, EventItem};

#[tauri::command]
pub fn get_events(state: State<DbState>) -> Result<Vec<EventItem>, String> {
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
pub fn create_event(state: State<DbState>, item: EventItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO events (id, name, event_date, last_edited, location) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![item.id, item.name, item.event_date, item.last_edited, item.location],
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
