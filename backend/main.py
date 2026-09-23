from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import pandas as pd
import json
import datetime
import os

import database as db

app = FastAPI()

db.init_db()

# Local dev origins + any origin(s) set via env var (comma separated), e.g.
# FRONTEND_ORIGIN=https://your-app.vercel.app
_default_origins = ["http://localhost:5173"]
_env_origins = [o.strip() for o in os.environ.get("FRONTEND_ORIGIN", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _env_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


models = {
    "random_forest": joblib.load("model_random_forest.joblib"),
    "logistic": joblib.load("model_logistic.joblib"),
    "decision_tree": joblib.load("model_decision_tree.joblib"),
    "svm": joblib.load("model_svm.joblib"),
}

scaler = joblib.load("scaler_logistic.joblib")


NEEDS_SCALING = {"logistic", "svm"}

FEATURES = ['age_years', 'gender', 'height', 'weight', 'ap_hi', 'ap_lo',
            'cholesterol', 'gluc', 'smoke', 'alco', 'active', 'bmi']

# Loading Training Accuracy 
with open("model_metrics.json") as f:
    model_metrics = json.load(f)

class PredictionInput(BaseModel):
    age_years: float
    gender: int
    height: float
    weight: float
    ap_hi: float
    ap_lo: float
    cholesterol: int
    gluc: int
    smoke: int
    alco: int
    active: int
    algorithm: str = "random_forest"

@app.get("/")
def read_root():
    return {"message": "Backend is running"}

@app.get("/model-metrics")
def get_model_metrics():
    return model_metrics

@app.post("/predict")
def predict(data: PredictionInput):
    if data.algorithm not in models:
        return {"error": f"Unknown algorithm: {data.algorithm}"}

    model = models[data.algorithm]

    bmi = data.weight / ((data.height / 100) ** 2)

    row = pd.DataFrame([{
        'age_years': data.age_years,
        'gender': data.gender,
        'height': data.height,
        'weight': data.weight,
        'ap_hi': data.ap_hi,
        'ap_lo': data.ap_lo,
        'cholesterol': data.cholesterol,
        'gluc': data.gluc,
        'smoke': data.smoke,
        'alco': data.alco,
        'active': data.active,
        'bmi': bmi,
    }])[FEATURES]

    if data.algorithm in NEEDS_SCALING:
        row = scaler.transform(row)

    prediction = model.predict(row)[0]
    probability = model.predict_proba(row)[0][1]

    risk_percent = round(probability * 100, 1)
    if risk_percent < 30:
        risk_level = "Low"
    elif risk_percent < 60:
        risk_level = "Moderate"
    else:
        risk_level = "High"

    return {
        "prediction": int(prediction),
        "risk_percent": risk_percent,
        "risk_level": risk_level,
        "bmi": round(bmi, 1),
        "algorithm_used": data.algorithm,
    }


# =====================================================================
# Database-backed models (replaces localStorage) — SQLite
# =====================================================================

class AuthInput(BaseModel):
    email: str
    password: str

class ProfileInput(BaseModel):
    name: str
    age: int
    gender: str

class PredictionInput2(BaseModel):
    height: Optional[str] = None
    weight: Optional[str] = None
    ap_hi: Optional[str] = None
    ap_lo: Optional[str] = None
    cholesterol: Optional[str] = None
    gluc: Optional[str] = None
    smoke: Optional[str] = None
    alco: Optional[str] = None
    active: Optional[str] = None
    age_years: Optional[float] = None
    gender: Optional[str] = None
    prediction: Optional[int] = None
    risk_percent: Optional[float] = None
    risk_level: Optional[str] = None
    bmi: Optional[float] = None
    algorithm_used: Optional[str] = None

class ChangePasswordInput(BaseModel):
    currentPassword: str
    newPassword: str

class AdminRegisterInput(BaseModel):
    name: str
    email: str
    password: str

class AdminLoginInput(BaseModel):
    email: str
    password: str
    expectedRole: Optional[str] = None

class AdminProfileUpdate(BaseModel):
    name: str

class SettingInput(BaseModel):
    value: str


def simple_hash(s: str) -> str:
    # Mirrors the frontend's old simpleHash() so existing admin password
    # semantics stay the same (basic, not intended as strong crypto).
    h = 0
    for ch in s:
        h = (31 * h + ord(ch)) & 0xFFFFFFFF
    if h >= 0x80000000:
        h -= 0x100000000
    # Convert to base36 like JS's toString(36)
    n = h
    neg = n < 0
    n = abs(n)
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    if n == 0:
        out = "0"
    else:
        out = ""
        while n:
            n, r = divmod(n, 36)
            out = digits[r] + out
    return ("-" + out) if neg else out


# ---- Users ----

@app.post("/api/register")
def api_register(data: AuthInput):
    conn = db.get_conn()
    row = conn.execute("SELECT email FROM users WHERE email = ?", (data.email,)).fetchone()
    if row:
        conn.close()
        return {"success": False, "error": "An account with this email already exists."}
    conn.execute("INSERT INTO users (email, password, banned) VALUES (?, ?, 0)", (data.email, data.password))
    conn.commit()
    conn.close()
    return {"success": True}


@app.post("/api/login")
def api_login(data: AuthInput):
    conn = db.get_conn()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (data.email,)).fetchone()
    conn.close()
    if not row or row["password"] != data.password:
        return {"success": False, "error": "Invalid email or password."}
    if row["banned"]:
        return {"success": False, "error": "Your account has been banned. Contact support."}
    return {"success": True}


@app.get("/api/users")
def api_get_users():
    conn = db.get_conn()
    rows = conn.execute("SELECT email, banned FROM users").fetchall()
    conn.close()
    return {r["email"]: {"banned": bool(r["banned"])} for r in rows}


@app.post("/api/users/{email}/ban")
def api_ban_user(email: str):
    conn = db.get_conn()
    conn.execute("UPDATE users SET banned = 1 WHERE email = ?", (email,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.post("/api/users/{email}/unban")
def api_unban_user(email: str):
    conn = db.get_conn()
    conn.execute("UPDATE users SET banned = 0 WHERE email = ?", (email,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.delete("/api/users/{email}")
def api_delete_user(email: str):
    conn = db.get_conn()
    conn.execute("DELETE FROM predictions WHERE email = ?", (email,))
    conn.execute("DELETE FROM profiles WHERE email = ?", (email,))
    conn.execute("DELETE FROM users WHERE email = ?", (email,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.post("/api/users/{email}/change-password")
def api_change_password(email: str, data: ChangePasswordInput):
    conn = db.get_conn()
    row = conn.execute("SELECT password FROM users WHERE email = ?", (email,)).fetchone()
    if not row or row["password"] != data.currentPassword:
        conn.close()
        return {"success": False, "error": "Current password is incorrect."}
    conn.execute("UPDATE users SET password = ? WHERE email = ?", (data.newPassword, email))
    conn.commit()
    conn.close()
    return {"success": True}


@app.delete("/api/account/{email}")
def api_delete_account(email: str):
    conn = db.get_conn()
    conn.execute("DELETE FROM predictions WHERE email = ?", (email,))
    conn.execute("DELETE FROM profiles WHERE email = ?", (email,))
    conn.execute("DELETE FROM users WHERE email = ?", (email,))
    conn.commit()
    conn.close()
    return {"success": True}


# ---- Profile ----

@app.get("/api/profile/{email}")
def api_get_profile(email: str):
    conn = db.get_conn()
    row = conn.execute("SELECT name, age, gender FROM profiles WHERE email = ?", (email,)).fetchone()
    conn.close()
    if not row:
        return None
    return {"name": row["name"], "age": row["age"], "gender": row["gender"]}


@app.post("/api/profile/{email}")
def api_save_profile(email: str, data: ProfileInput):
    conn = db.get_conn()
    conn.execute("""
        INSERT INTO profiles (email, name, age, gender) VALUES (?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET name = excluded.name, age = excluded.age, gender = excluded.gender
    """, (email, data.name, data.age, data.gender))
    conn.commit()
    conn.close()
    return {"success": True}


# ---- Predictions ----

@app.get("/api/predictions/{email}")
def api_get_predictions(email: str):
    conn = db.get_conn()
    rows = conn.execute("SELECT id, data FROM predictions WHERE email = ? ORDER BY id DESC", (email,)).fetchall()
    conn.close()
    out = []
    for r in rows:
        entry = json.loads(r["data"])
        entry["id"] = r["id"]
        out.append(entry)
    return out


@app.post("/api/predictions/{email}")
def api_add_prediction(email: str, data: dict):
    date_str = datetime.datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p")
    entry = dict(data)
    entry["date"] = date_str
    conn = db.get_conn()
    cur = conn.execute(
        "INSERT INTO predictions (email, data, risk_level, date) VALUES (?, ?, ?, ?)",
        (email, json.dumps(entry), entry.get("risk_level"), date_str),
    )
    new_id = cur.lastrowid
    conn.commit()
    conn.close()
    entry["id"] = new_id
    return entry


@app.delete("/api/predictions/{email}/{pred_id}")
def api_delete_prediction(email: str, pred_id: int):
    conn = db.get_conn()
    conn.execute("DELETE FROM predictions WHERE email = ? AND id = ?", (email, pred_id))
    conn.commit()
    conn.close()
    return {"success": True}


@app.delete("/api/predictions/{email}")
def api_delete_all_predictions(email: str):
    conn = db.get_conn()
    conn.execute("DELETE FROM predictions WHERE email = ?", (email,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.get("/api/stats")
def api_stats():
    conn = db.get_conn()
    rows = conn.execute("SELECT email, risk_level FROM predictions").fetchall()
    conn.close()
    total = len(rows)
    high_risk = sum(1 for r in rows if r["risk_level"] == "High")
    per_user = {}
    for r in rows:
        per_user[r["email"]] = per_user.get(r["email"], 0) + 1
    return {"total": total, "highRisk": high_risk, "perUser": per_user}


@app.get("/api/dataset")
def api_dataset():
    conn = db.get_conn()
    rows = conn.execute("SELECT email, data FROM predictions ORDER BY id").fetchall()
    conn.close()
    out = []
    for r in rows:
        entry = json.loads(r["data"])
        entry["email"] = r["email"]
        out.append(entry)
    return out


# ---- Admin accounts ----

@app.post("/api/admin/register")
def api_admin_register(data: AdminRegisterInput):
    conn = db.get_conn()
    row = conn.execute("SELECT email FROM admin_accounts WHERE email = ?", (data.email,)).fetchone()
    if row:
        conn.close()
        return {"success": False, "error": "An admin account with this email already exists."}
    count = conn.execute("SELECT COUNT(*) AS c FROM admin_accounts").fetchone()["c"]
    is_first = count == 0
    role = "superadmin" if is_first else "admin"
    status = "active" if is_first else "pending"
    conn.execute(
        "INSERT INTO admin_accounts (email, name, password_hash, role, status) VALUES (?, ?, ?, ?, ?)",
        (data.email, data.name, simple_hash(data.password), role, status),
    )
    conn.commit()
    conn.close()
    return {"success": True, "isFirst": is_first}


@app.post("/api/admin/login")
def api_admin_login(data: AdminLoginInput):
    conn = db.get_conn()
    row = conn.execute("SELECT * FROM admin_accounts WHERE email = ?", (data.email,)).fetchone()
    conn.close()
    if not row:
        return {"success": False, "error": "No admin account found with this email."}
    if row["password_hash"] != simple_hash(data.password):
        return {"success": False, "error": "Incorrect password."}
    if row["status"] == "pending":
        return {"success": False, "error": "Your account is awaiting approval from a Super Admin."}
    if data.expectedRole and row["role"] != data.expectedRole:
        return {"success": False, "error": f"This login is only for {data.expectedRole} accounts."}
    return {"success": True, "session": {"email": row["email"], "name": row["name"], "role": row["role"]}}


@app.get("/api/admin/accounts")
def api_admin_accounts():
    conn = db.get_conn()
    rows = conn.execute("SELECT email, name, role, status FROM admin_accounts").fetchall()
    conn.close()
    return {r["email"]: {"name": r["name"], "role": r["role"], "status": r["status"]} for r in rows}


@app.post("/api/admin/accounts/{email}/approve")
def api_admin_approve(email: str):
    conn = db.get_conn()
    conn.execute("UPDATE admin_accounts SET status = 'active' WHERE email = ?", (email,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.delete("/api/admin/accounts/{email}")
def api_admin_reject(email: str):
    conn = db.get_conn()
    conn.execute("DELETE FROM admin_accounts WHERE email = ?", (email,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.post("/api/admin/profile/{email}")
def api_admin_update_profile(email: str, data: AdminProfileUpdate):
    conn = db.get_conn()
    conn.execute("UPDATE admin_accounts SET name = ? WHERE email = ?", (data.name, email))
    row = conn.execute("SELECT email, name, role FROM admin_accounts WHERE email = ?", (email,)).fetchone()
    conn.commit()
    conn.close()
    return {"success": True, "session": {"email": row["email"], "name": row["name"], "role": row["role"]}}


@app.post("/api/admin/change-password/{email}")
def api_admin_change_password(email: str, data: ChangePasswordInput):
    conn = db.get_conn()
    row = conn.execute("SELECT password_hash FROM admin_accounts WHERE email = ?", (email,)).fetchone()
    if not row or row["password_hash"] != simple_hash(data.currentPassword):
        conn.close()
        return {"success": False, "error": "Current password is incorrect."}
    conn.execute("UPDATE admin_accounts SET password_hash = ? WHERE email = ?", (simple_hash(data.newPassword), email))
    conn.commit()
    conn.close()
    return {"success": True}


# ---- Settings (active algorithm) ----

@app.get("/api/settings/active-algorithm")
def api_get_active_algorithm():
    conn = db.get_conn()
    row = conn.execute("SELECT value FROM settings WHERE key = 'active_algorithm'").fetchone()
    conn.close()
    return {"value": row["value"] if row else "random_forest"}


@app.post("/api/settings/active-algorithm")
def api_set_active_algorithm(data: SettingInput):
    conn = db.get_conn()
    conn.execute("""
        INSERT INTO settings (key, value) VALUES ('active_algorithm', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    """, (data.value,))
    conn.commit()
    conn.close()
    return {"success": True}


# ---- Backup / Restore ----

@app.get("/api/backup")
def api_backup():
    conn = db.get_conn()
    users = {r["email"]: {"password": r["password"], "banned": bool(r["banned"])}
             for r in conn.execute("SELECT * FROM users").fetchall()}
    admin_accounts = {r["email"]: {"name": r["name"], "passwordHash": r["password_hash"], "role": r["role"], "status": r["status"]}
                       for r in conn.execute("SELECT * FROM admin_accounts").fetchall()}
    algo_row = conn.execute("SELECT value FROM settings WHERE key = 'active_algorithm'").fetchone()
    conn.close()

    predictions = {email: api_get_predictions(email) for email in users}
    profiles = {email: api_get_profile(email) for email in users}

    return {
        "users": users,
        "adminAccounts": admin_accounts,
        "activeAlgorithm": algo_row["value"] if algo_row else "random_forest",
        "predictions": predictions,
        "profiles": profiles,
        "backupDate": datetime.datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p"),
    }


@app.post("/api/restore")
def api_restore(payload: dict):
    conn = db.get_conn()
    conn.execute("DELETE FROM predictions")
    conn.execute("DELETE FROM profiles")
    conn.execute("DELETE FROM users")
    conn.execute("DELETE FROM admin_accounts")
    conn.execute("DELETE FROM settings")

    for email, u in (payload.get("users") or {}).items():
        conn.execute("INSERT INTO users (email, password, banned) VALUES (?, ?, ?)",
                     (email, u.get("password", ""), 1 if u.get("banned") else 0))

    for email, a in (payload.get("adminAccounts") or {}).items():
        conn.execute("INSERT INTO admin_accounts (email, name, password_hash, role, status) VALUES (?, ?, ?, ?, ?)",
                     (email, a.get("name"), a.get("passwordHash", ""), a.get("role", "admin"), a.get("status", "pending")))

    algo = payload.get("activeAlgorithm") or "random_forest"
    conn.execute("INSERT INTO settings (key, value) VALUES ('active_algorithm', ?)", (algo,))

    for email, plist in (payload.get("predictions") or {}).items():
        for p in (plist or []):
            entry = dict(p)
            entry.pop("id", None)
            conn.execute("INSERT INTO predictions (email, data, risk_level, date) VALUES (?, ?, ?, ?)",
                         (email, json.dumps(entry), entry.get("risk_level"), entry.get("date", "")))

    for email, prof in (payload.get("profiles") or {}).items():
        if prof:
            conn.execute("""
                INSERT INTO profiles (email, name, age, gender) VALUES (?, ?, ?, ?)
                ON CONFLICT(email) DO UPDATE SET name = excluded.name, age = excluded.age, gender = excluded.gender
            """, (email, prof.get("name"), prof.get("age"), prof.get("gender")))

    conn.commit()
    conn.close()
    return {"success": True}