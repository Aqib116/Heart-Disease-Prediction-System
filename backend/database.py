import sqlite3
import json
import os
import time

DB_PATH = os.path.join(os.path.dirname(__file__), "app_data.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_conn()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            banned INTEGER NOT NULL DEFAULT 0
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            email TEXT PRIMARY KEY,
            name TEXT,
            age INTEGER,
            gender TEXT,
            FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            data TEXT NOT NULL,
            risk_level TEXT,
            date TEXT NOT NULL,
            FOREIGN KEY (email) REFERENCES users(email) ON DELETE CASCADE
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS admin_accounts (
            email TEXT PRIMARY KEY,
            name TEXT,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT NOT NULL
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    """)

    conn.commit()
    conn.close()


def now_ms():
    return int(time.time() * 1000)
