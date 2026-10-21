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
pub fn create_event_tab(state: State<DbState>, item: EventTabItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let settings_to_save = if item.tab_type == EventTabType::Participant {
        item.settings.clone().unwrap_or_default()
    } else {
        ParticipantTabSettings::default()
    };
    let settings_str = serde_json::to_string(&settings_to_save).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO event_tabs (id, event_id, tab_type, label, position, settings) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            item.id,
            item.event_id,
            item.tab_type.as_str(),
            item.label,
            item.position,
            settings_str
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
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

#[tauri::command]
pub fn reorder_event_tabs(state: State<DbState>, items: Vec<EventTabItem>) -> Result<(), String> {
    let mut conn = state.0.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    {
        let mut stmt = tx.prepare(
            "UPDATE event_tabs SET position = ?1 WHERE id = ?2"
        ).map_err(|e| e.to_string())?;

        for item in items {
            stmt.execute(params![item.position, item.id])
                .map_err(|e| e.to_string())?;
        }
    }

    tx.commit().map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_event_tab(state: State<DbState>, tab_id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM event_tabs WHERE id = ?1", params![tab_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
