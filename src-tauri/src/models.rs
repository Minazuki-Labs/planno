use serde::{Deserialize, Serialize};
use rusqlite::Connection;
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize)]
pub struct EventItem {
    pub id: String,
    pub name: String,
    #[serde(rename = "eventDate")]
    pub event_date: String,
    #[serde(rename = "lastEdited")]
    pub last_edited: String,
    pub location: Option<String>,
}

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
}

pub struct DbState(pub Mutex<Connection>);
