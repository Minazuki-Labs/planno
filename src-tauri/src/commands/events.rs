use rusqlite::params;
use tauri::State;
use crate::models::{DbState, EventItem, ActivityItem};

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

#[tauri::command]
pub fn get_activities(state: State<DbState>, event_id: String) -> Result<Vec<ActivityItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, event_id, title, day_date, start_time, end_time, color FROM activities WHERE event_id = ?1 ORDER BY start_time ASC")
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
        "INSERT INTO activities (id, event_id, title, day_date, start_time, end_time, color) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![item.id, item.event_id, item.title, item.day_date, item.start_time, item.end_time, item.color],
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
