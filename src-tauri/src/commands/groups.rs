use rusqlite::{params, OptionalExtension};
use tauri::State;
use crate::models::{DbState, GroupItem};

#[tauri::command]
pub fn get_groups(state: State<DbState>, event_id: String) -> Result<Vec<GroupItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, event_id, name, position FROM groups WHERE event_id = ?1 ORDER BY position ASC, rowid ASC")
        .map_err(|e| e.to_string())?;

    let group_iter = stmt
        .query_map(params![event_id], |row| {
            Ok(GroupItem {
                id: row.get(0)?,
                event_id: row.get(1)?,
                name: row.get(2)?,
                position: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut groups = Vec::new();
    for group in group_iter {
        groups.push(group.map_err(|e| e.to_string())?);
    }

    Ok(groups)
}

#[tauri::command]
pub fn create_group(state: State<DbState>, mut item: GroupItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    if item.position == 0 {
        let max_pos: Option<i64> = conn
            .query_row(
                "SELECT MAX(position) FROM groups WHERE event_id = ?1",
                params![item.event_id],
                |row| row.get(0),
            )
            .unwrap_or(None);

        item.position = max_pos.map_or(0, |p| p + 1);
    }

    conn.execute(
        "INSERT INTO groups (id, event_id, name, position) VALUES (?1, ?2, ?3, ?4)",
        params![item.id, item.event_id, item.name, item.position],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_group(state: State<DbState>, id: String, name: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE groups SET name = ?1 WHERE id = ?2",
        params![name, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn reorder_groups(state: State<DbState>, group_ids: Vec<String>) -> Result<(), String> {
    let mut conn = state.0.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    for (index, id) in group_ids.into_iter().enumerate() {
        tx.execute(
            "UPDATE groups SET position = ?1 WHERE id = ?2",
            params![index as i64, id],
        )
        .map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_group(state: State<DbState>, id: String) -> Result<(), String> {
    let mut conn = state.0.lock().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    let info: Option<(String, i64)> = tx
        .query_row(
            "SELECT event_id, position FROM groups WHERE id = ?1",
            params![id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .optional()
        .map_err(|e| e.to_string())?;

    if let Some((event_id, pos)) = info {
        tx.execute("DELETE FROM groups WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;

        tx.execute(
            "UPDATE groups SET position = position - 1 WHERE event_id = ?1 AND position > ?2",
            params![event_id, pos],
        )
        .map_err(|e| e.to_string())?;
    }

    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}
