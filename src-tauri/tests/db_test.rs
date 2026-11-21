use planno_lib::db::init_db;
use rusqlite::{params, Connection};

fn setup_test_db() -> Connection {
    let conn = Connection::open_in_memory().expect("Failed to open in-memory DB");
    init_db(&conn).expect("Failed to initialize database schema");
    conn
}

#[test]
fn test_init_db_creates_tables() {
    let conn = setup_test_db();

    let mut stmt = conn
        .prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name IN ('events', 'activities', 'groups', 'participants')")
        .expect("Query failed");
    let count: i64 = stmt.query_row([], |row| row.get(0)).unwrap();
    assert_eq!(count, 4);
}

#[test]
fn test_event_crud_operations() {
    let conn = setup_test_db();

    // Create event
    conn.execute(
        "INSERT INTO events (id, name, event_date, last_edited, location, settings) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params!["e1", "Hackathon", "2026/10/01", "2026-09-01T00:00:00Z", "Hall B", r#"{"groupsEnabled":true}"#],
    ).unwrap();

    // Query event
    let name: String = conn
        .query_row("SELECT name FROM events WHERE id = ?1", params!["e1"], |r| r.get(0))
        .unwrap();
    assert_eq!(name, "Hackathon");

    // Update event
    conn.execute(
        "UPDATE events SET name = ?1 WHERE id = ?2",
        params!["Hackathon 2026", "e1"],
    ).unwrap();
    let updated_name: String = conn
        .query_row("SELECT name FROM events WHERE id = ?1", params!["e1"], |r| r.get(0))
        .unwrap();
    assert_eq!(updated_name, "Hackathon 2026");

    // Delete event
    conn.execute("DELETE FROM events WHERE id = ?1", params!["e1"]).unwrap();
    let count: i64 = conn
        .query_row("SELECT count(*) FROM events WHERE id = ?1", params!["e1"], |r| r.get(0))
        .unwrap();
    assert_eq!(count, 0);
}

#[test]
fn test_cascade_delete_on_event() {
    let conn = setup_test_db();

    // Insert event
    conn.execute(
        "INSERT INTO events (id, name, event_date, last_edited, location, settings) VALUES ('e1', 'Camp', '2026/07/01', 'now', 'Site A', '{}')",
        [],
    ).unwrap();

    // Insert activity, group, participant referencing event 'e1'
    conn.execute(
        "INSERT INTO activities (id, event_id, title, day_date, start_time, end_time, color) VALUES ('a1', 'e1', 'Intro', '2026-07-01', '09:00', '10:00', 'blue')",
        [],
    ).unwrap();

    conn.execute(
        "INSERT INTO groups (id, event_id, name, position) VALUES ('g1', 'e1', 'Group 1', 0)",
        [],
    ).unwrap();

    conn.execute(
        "INSERT INTO participants (id, event_id, group_id, name, role) VALUES ('p1', 'e1', 'g1', 'Alice', 'leader')",
        [],
    ).unwrap();

    // Deleting the event must cascade delete all associated records
    conn.execute("DELETE FROM events WHERE id = 'e1'", []).unwrap();

    let act_count: i64 = conn.query_row("SELECT count(*) FROM activities WHERE event_id = 'e1'", [], |r| r.get(0)).unwrap();
    let grp_count: i64 = conn.query_row("SELECT count(*) FROM groups WHERE event_id = 'e1'", [], |r| r.get(0)).unwrap();
    let part_count: i64 = conn.query_row("SELECT count(*) FROM participants WHERE event_id = 'e1'", [], |r| r.get(0)).unwrap();

    assert_eq!(act_count, 0);
    assert_eq!(grp_count, 0);
    assert_eq!(part_count, 0);
}

#[test]
fn test_group_delete_sets_participant_group_id_null() {
    let conn = setup_test_db();

    conn.execute(
        "INSERT INTO events (id, name, event_date, last_edited, location, settings) VALUES ('e1', 'Camp', '2026/07/01', 'now', 'Site A', '{}')",
        [],
    ).unwrap();

    conn.execute(
        "INSERT INTO groups (id, event_id, name, position) VALUES ('g1', 'e1', 'Alpha', 0)",
        [],
    ).unwrap();

    conn.execute(
        "INSERT INTO participants (id, event_id, group_id, name, role) VALUES ('p1', 'e1', 'g1', 'Bob', 'member')",
        [],
    ).unwrap();

    // Delete group 'g1'
    conn.execute("DELETE FROM groups WHERE id = 'g1'", []).unwrap();

    // Participant 'p1' should still exist, but group_id must be NULL
    let group_id: Option<String> = conn
        .query_row("SELECT group_id FROM participants WHERE id = 'p1'", [], |r| r.get(0))
        .unwrap();
    assert_eq!(group_id, None);
}

#[test]
fn test_participant_role_check_constraint() {
    let conn = setup_test_db();

    conn.execute(
        "INSERT INTO events (id, name, event_date, last_edited, location, settings) VALUES ('e1', 'Summit', '2026/09/01', 'now', 'Room 1', '{}')",
        [],
    ).unwrap();

    // Valid role 'leader' should succeed
    let res = conn.execute(
        "INSERT INTO participants (id, event_id, name, role) VALUES ('p1', 'e1', 'Charlie', 'leader')",
        [],
    );
    assert!(res.is_ok());

    // Invalid role 'admin' should fail CHECK constraint
    let invalid_res = conn.execute(
        "INSERT INTO participants (id, event_id, name, role) VALUES ('p2', 'e1', 'Dave', 'admin')",
        [],
    );
    assert!(invalid_res.is_err());
}
