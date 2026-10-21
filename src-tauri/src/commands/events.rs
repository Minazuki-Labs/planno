use rusqlite::params;
use tauri::State;
use crate::models::{DbState, EventItem, EventTabType};

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
    let mut conn = state.0.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    tx.execute(
        "INSERT INTO events (id, name, event_date, last_edited, location) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![item.id, item.name, item.event_date, item.last_edited, item.location],
    )
    .map_err(|e| e.to_string())?;

    let default_tabs = [
        (EventTabType::Schedule, "Schedule", 0),
        (EventTabType::Participant, "Participant", 1),
        (EventTabType::Budget, "Budget", 2),
        (EventTabType::Committee, "Committee", 3),
    ];

    let default_participant_settings = crate::models::ParticipantTabSettings::default();
    let default_settings_str = serde_json::to_string(&default_participant_settings).map_err(|e| e.to_string())?;

    for (tab_type, label, position) in default_tabs {
        let tab_id: String = tx.query_row(
            "SELECT lower(hex(randomblob(16)))",
            [],
            |row| row.get(0),
        ).map_err(|e| e.to_string())?;

        let settings_str = if tab_type == EventTabType::Participant {
            default_settings_str.clone()
        } else {
            "{}".to_string()
        };

        tx.execute(
            "INSERT INTO event_tabs (id, event_id, tab_type, label, position, settings) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![tab_id, item.id, tab_type.as_str(), label, position, settings_str],
        )
        .map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;

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

    conn.execute(
        "UPDATE events SET name = ?1, event_date = ?2, last_edited = ?3, location = ?4 WHERE id = ?5",
        params![item.name, item.event_date, item.last_edited, item.location, item.id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
