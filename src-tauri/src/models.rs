use serde::{Deserialize, Serialize};
use rusqlite::Connection;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct EventItem {
    pub id: String,
    pub name: String,
    pub event_date: String,
    pub last_edited: String,
    pub location: Option<String>,
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
