use rusqlite::params;
use tauri::State;
use crate::models::{DbState, ParticipantItem, ParticipantRole};

#[tauri::command]
pub fn get_participants(state: State<DbState>, event_id: String) -> Result<Vec<ParticipantItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, event_id, group_id, name, role FROM participants WHERE event_id = ?1 ORDER BY name ASC")
        .map_err(|e| e.to_string())?;

    let participant_iter = stmt
        .query_map(params![event_id], |row| {
            let role_str: String = row.get(4)?;
            let role = ParticipantRole::from_str(&role_str).unwrap_or(ParticipantRole::Member);

            let raw_group_id: Option<String> = row.get(2)?;
            let group_id = match raw_group_id {
                Some(ref s) if s.trim().is_empty() => None,
                other => other,
            };

            Ok(ParticipantItem {
                id: row.get(0)?,
                event_id: row.get(1)?,
                group_id,
                name: row.get(3)?,
                role,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut participants = Vec::new();
    for participant in participant_iter {
        participants.push(participant.map_err(|e| e.to_string())?);
    }

    Ok(participants)
}

#[tauri::command]
pub fn create_participant(state: State<DbState>, item: ParticipantItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    
    let normalized_group_id = match item.group_id {
        Some(ref id) if id.trim().is_empty() => None,
        other => other,
    };

    conn.execute(
        "INSERT INTO participants (id, event_id, group_id, name, role) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            item.id,
            item.event_id,
            normalized_group_id,
            item.name,
            item.role.as_str()
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_participant(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM participants WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_participant(state: State<DbState>, item: ParticipantItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let normalized_group_id = match item.group_id {
        Some(ref id) if id.trim().is_empty() => None,
        other => other,
    };

    conn.execute(
        "UPDATE participants SET group_id = ?1, name = ?2, role = ?3 WHERE id = ?4",
        params![normalized_group_id, item.name, item.role.as_str(), item.id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
