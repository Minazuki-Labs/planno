use rusqlite::params;
use tauri::State;
use crate::models::{ActivityItem, DbState};

#[tauri::command]
pub fn get_activities(state: State<DbState>, event_id: String) -> Result<Vec<ActivityItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, event_id, title, day_date, start_time, end_time, color, description, person_in_charge FROM activities WHERE event_id = ?1 ORDER BY start_time ASC")
        .map_err(|e| e.to_string())?;

    let activity_iter = stmt
        .query_map(params![event_id], |row| {
            Ok(ActivityItem {
                id: row.get(0)?,
                event_id: row.get(1)?,
                title: row.get(2)?,
                day_date: row.get(3)?,
                start_time: row.get(4)?,
                end_time: row.get(5)?,
                color: row.get(6)?,
                description: row.get(7)?,
                person_in_charge: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut activities = Vec::new();
    for activity in activity_iter {
        activities.push(activity.map_err(|e| e.to_string())?);
    }

    Ok(activities)
}

#[tauri::command]
pub fn create_activity(state: State<DbState>, item: ActivityItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO activities (id, event_id, title, day_date, start_time, end_time, color, description, person_in_charge) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![item.id, item.event_id, item.title, item.day_date, item.start_time, item.end_time, item.color, item.description, item.person_in_charge],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_activity(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM activities WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn update_activity(state: State<DbState>, item: ActivityItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE activities 
         SET title = ?1, day_date = ?2, start_time = ?3, end_time = ?4, color = ?5, description = ?6, person_in_charge = ?7 
         WHERE id = ?8",
        params![
            item.title,
            item.day_date,
            item.start_time,
            item.end_time,
            item.color,
            item.description,
            item.person_in_charge,
            item.id
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
