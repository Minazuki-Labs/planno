mod commands;
mod db;
mod models;

use db::init_db;
use models::DbState;
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.maximize()?;

            let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("Failed to create app data directory");

            let db_path = app_dir.join("events.db");
            let conn = Connection::open(db_path).expect("Failed to open database");

            init_db(&conn).expect("Failed to initialize database");

            app.manage(DbState(Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::events::get_events,
            commands::events::create_event,
            commands::events::delete_event,
            commands::events::update_event,

            commands::activities::get_activities,
            commands::activities::create_activity,
            commands::activities::delete_activity,
            commands::activities::update_activity,

            commands::groups::get_groups,
            commands::groups::create_group,
            commands::groups::update_group,
            commands::groups::reorder_groups,
            commands::groups::delete_group,

            commands::participants::get_participants,
            commands::participants::create_participant,
            commands::participants::delete_participant,
            commands::participants::update_participant,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
