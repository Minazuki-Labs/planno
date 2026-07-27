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

pub struct DbState(pub Mutex<Connection>);
