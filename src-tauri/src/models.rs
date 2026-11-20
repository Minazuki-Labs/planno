use serde::{Deserialize, Serialize};
use rusqlite::Connection;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct EventSettings {
    #[serde(default = "default_true")]
    pub groups_enabled: bool,
}

impl Default for EventSettings {
    fn default() -> Self {
        Self {
            groups_enabled: true,
        }
    }
}

fn default_true() -> bool {
    true
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EventItem {
    pub id: String,
    pub name: String,
    pub event_date: String,
    pub last_edited: String,
    pub location: Option<String>,
    #[serde(default)]
    pub settings: EventSettings,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ActivityItem {
    pub id: String,
    pub event_id: String,
    pub title: String,
    pub day_date: String,
    pub start_time: String,
    pub end_time: String,
    pub color: String,
    pub description: Option<String>,
    pub person_in_charge: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ParticipantRole {
    Teacher,
    Leader,
    CoLeader,
    Member,
}

impl ParticipantRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            ParticipantRole::Teacher => "teacher",
            ParticipantRole::Leader => "leader",
            ParticipantRole::CoLeader => "co_leader",
            ParticipantRole::Member => "member",
        }
    }

    pub fn from_str(s: &str) -> Result<Self, String> {
        match s {
            "teacher" => Ok(ParticipantRole::Teacher),
            "leader" => Ok(ParticipantRole::Leader),
            "co_leader" => Ok(ParticipantRole::CoLeader),
            "member" => Ok(ParticipantRole::Member),
            _ => Err(format!("Invalid role: {}", s)),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GroupItem {
    pub id: String,
    pub event_id: String,
    pub name: String,
    #[serde(default)]
    pub position: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ParticipantItem {
    pub id: String,
    pub event_id: String,
    pub group_id: Option<String>,
    pub name: String,
    pub role: ParticipantRole,
}

pub struct DbState(pub Mutex<Connection>);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_participant_role_conversion() {
        assert_eq!(ParticipantRole::from_str("teacher").unwrap(), ParticipantRole::Teacher);
        assert_eq!(ParticipantRole::from_str("leader").unwrap(), ParticipantRole::Leader);
        assert_eq!(ParticipantRole::from_str("co_leader").unwrap(), ParticipantRole::CoLeader);
        assert_eq!(ParticipantRole::from_str("member").unwrap(), ParticipantRole::Member);

        assert_eq!(ParticipantRole::Teacher.as_str(), "teacher");
        assert_eq!(ParticipantRole::Leader.as_str(), "leader");
        assert_eq!(ParticipantRole::CoLeader.as_str(), "co_leader");
        assert_eq!(ParticipantRole::Member.as_str(), "member");

        assert!(ParticipantRole::from_str("invalid_role").is_err());
    }

    #[test]
    fn test_event_settings_default() {
        let default_settings = EventSettings::default();
        assert!(default_settings.groups_enabled);

        let parsed: EventSettings = serde_json::from_str("{}").unwrap();
        assert!(parsed.groups_enabled);

        let parsed_disabled: EventSettings = serde_json::from_str(r#"{"groupsEnabled": false}"#).unwrap();
        assert!(!parsed_disabled.groups_enabled);
    }

    #[test]
    fn test_event_item_json_roundtrip() {
        let json = r#"{
            "id": "evt-123",
            "name": "Design Workshop",
            "eventDate": "2026/09/20",
            "lastEdited": "2026-09-01T00:00:00Z",
            "location": "Room 101",
            "settings": { "groupsEnabled": true }
        }"#;

        let item: EventItem = serde_json::from_str(json).expect("Deserialization failed");
        assert_eq!(item.id, "evt-123");
        assert_eq!(item.name, "Design Workshop");
        assert_eq!(item.location, Some("Room 101".to_string()));
        assert!(item.settings.groups_enabled);

        let serialized = serde_json::to_string(&item).expect("Serialization failed");
        assert!(serialized.contains(r#""groupsEnabled":true"#));
    }
}
