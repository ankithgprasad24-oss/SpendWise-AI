import sqlite3
from pathlib import Path
from typing import Generator
from app.core.config import get_settings

settings = get_settings()


def get_db_path() -> Path:
    current_settings = get_settings()
    raw_path = Path(current_settings.DATABASE_PATH)
    if raw_path.is_absolute():
        return raw_path
    backend_dir = Path(__file__).resolve().parent.parent.parent
    backend_db = backend_dir / current_settings.DATABASE_PATH
    if backend_db.exists():
        return backend_db
    root_db = backend_dir.parent / current_settings.DATABASE_PATH
    if root_db.exists():
        return root_db
    return backend_db


def get_db_connection() -> sqlite3.Connection:
    """Provides a SQLite connection with row factory enabled."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initializes database schema, tables, and applies column migrations."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            payment_method TEXT DEFAULT 'UPI / Card',
            notes TEXT,
            is_recurring INTEGER DEFAULT 0,
            original_amount REAL,
            original_currency TEXT DEFAULT 'USD',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL UNIQUE,
            monthly_limit REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS savings_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            target_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0.0,
            target_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Check and apply migrations for existing SQLite databases
    cursor.execute("PRAGMA table_info(expenses)")
    existing_cols = [row["name"] for row in cursor.fetchall()]

    if "original_amount" not in existing_cols:
        cursor.execute("ALTER TABLE expenses ADD COLUMN original_amount REAL")
        cursor.execute("UPDATE expenses SET original_amount = amount WHERE original_amount IS NULL")

    if "original_currency" not in existing_cols:
        cursor.execute("ALTER TABLE expenses ADD COLUMN original_currency TEXT DEFAULT 'USD'")
        cursor.execute("UPDATE expenses SET original_currency = 'USD' WHERE original_currency IS NULL")

    conn.commit()
    conn.close()
