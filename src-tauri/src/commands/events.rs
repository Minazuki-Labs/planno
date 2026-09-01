use rusqlite::params;
use tauri::State;
use crate::models::{DbState, EventItem, ActivityItem, GroupItem, ParticipantItem, ParticipantRole};

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

#[tauri::command]
pub fn get_groups(state: State<DbState>, event_id: String) -> Result<Vec<GroupItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, event_id, name FROM groups WHERE event_id = ?1 ORDER BY name ASC")
        .map_err(|e| e.to_string())?;

    let group_iter = stmt
        .query_map(params![event_id], |row| {
            Ok(GroupItem {
                id: row.get(0)?,
                event_id: row.get(1)?,
                name: row.get(2)?,
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
pub fn create_group(state: State<DbState>, item: GroupItem) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO groups (id, event_id, name) VALUES (?1, ?2, ?3)",
        params![item.id, item.event_id, item.name],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_group(state: State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM groups WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

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
