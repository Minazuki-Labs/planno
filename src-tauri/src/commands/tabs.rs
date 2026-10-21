use rusqlite::params;
use tauri::State;
use crate::models::{DbState, EventTabItem};

#[tauri::command]
pub fn get_event_tabs(state: State<DbState>, event_id: String) -> Result<Vec<EventTabItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, event_id, tab_type, label, position FROM event_tabs WHERE event_id = ?1 ORDER BY position ASC")
        .map_err(|e| e.to_string())?;

    let tab_iter = stmt
        .query_map(params![event_id], |row| {
            Ok(EventTabItem {
                id: row.get(0)?,
                event_id: row.get(1)?,
                tab_type: row.get(2)?,
                label: row.get(3)?,
                position: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut tabs = Vec::new();
    for tab in tab_iter {
        tabs.push(tab.map_err(|e| e.to_string())?);
    }

    Ok(tabs)
}
