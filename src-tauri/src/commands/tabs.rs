use rusqlite::params;
use tauri::State;
use crate::models::{DbState, EventTabItem, EventTabType, ParticipantTabSettings};

#[tauri::command]
pub fn get_event_tabs(state: State<DbState>, event_id: String) -> Result<Vec<EventTabItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, event_id, tab_type, label, position, settings FROM event_tabs WHERE event_id = ?1 ORDER BY position ASC")
        .map_err(|e| e.to_string())?;

    let tab_iter = stmt
        .query_map(params![event_id], |row| {
            let tab_type_str: String = row.get(2)?;
            let tab_type = EventTabType::from_str(&tab_type_str).map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(std::io::Error::new(std::io::ErrorKind::Other, e))))?;

            let settings = if tab_type == EventTabType::Participant {
                let settings_str: String = row.get(5).unwrap_or_else(|_| "{}".to_string());
                Some(serde_json::from_str(&settings_str).unwrap_or_default())
            } else {
                None
            };

            Ok(EventTabItem {
                id: row.get(0)?,
                event_id: row.get(1)?,
                tab_type,
                label: row.get(3)?,
                position: row.get(4)?,
                settings,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut tabs = Vec::new();
    for tab in tab_iter {
        tabs.push(tab.map_err(|e| e.to_string())?);
    }

    Ok(tabs)
}

#[tauri::command]
pub fn update_event_tab(state: State<DbState>, item: EventTabItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let settings_to_save = if item.tab_type == EventTabType::Participant {
        item.settings.unwrap_or_default()
    } else {
        ParticipantTabSettings::default()
    };
    
    let settings_str = serde_json::to_string(&settings_to_save).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE event_tabs SET label = ?1, position = ?2, settings = ?3 WHERE id = ?4",
        params![item.label, item.position, settings_str, item.id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
