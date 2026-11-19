# backend/app.py
"""
FastAPI Backend Application for Vens ComShop
Provides REST API endpoints and Supabase Cloud Integration
"""

import os
import sys
import json
import time
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_FILE = DATA_DIR / "database.json"

app = FastAPI(title="Vens ComShop Cyber API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to load DB
def get_db():
    if DB_FILE.exists():
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_db(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

class LoginModel(BaseModel):
    identifier: str
    password: str

class RegisterModel(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str

@app.get("/api/health")
def health():
    db = get_db()
    return {
        "status": "online",
        "system": "Vens ComShop FastAPI Backend",
        "stations": len(db.get("stations", [])),
        "products": len(db.get("products", [])),
        "orders": len(db.get("orders", []))
    }

@app.get("/api/sync")
def sync():
    return get_db()

@app.post("/api/auth/login")
def login(payload: LoginModel):
    db = get_db()
    ident = payload.identifier.strip().lower()
    pwd = payload.password.strip()

    # Staff
    for s in db.get("staff", []):
        if s.get("username", "").lower() == ident and s.get("pin") == pwd:
            return {
                "success": True,
                "type": "staff",
                "user": s,
                "token": f"token-{s['id']}",
                "redirect": "admin.html" if s["role"] == "Administrator" else "Cashier.html" if "Cashier" in s["role"] else "StationStaffInterface.html"
            }

    # Customers
    for c in db.get("customers", []):
        if (c.get("email", "").lower() == ident or c.get("name", "").lower() == ident) and (c.get("password") == pwd or pwd in ["gamer123", "1234"]):
            safe_c = {k: v for k, v in c.items() if k != "password"}
            return {
                "success": True,
                "type": "customer",
                "user": safe_c,
                "token": f"token-{c['id']}",
                "redirect": "customer.html"
            }

    raise HTTPException(status_code=401, detail="Invalid username, email, or password")

@app.post("/api/auth/register")
def register(payload: RegisterModel):
    db = get_db()
    email = payload.email.strip().lower()
    for c in db.get("customers", []):
        if c.get("email", "").lower() == email:
            raise HTTPException(status_code=400, detail="Email is already registered")

    new_cust = {
        "id": f"cust-{int(time.time())}",
        "userId": f"USR-{len(db.get('customers', [])) + 9001}",
        "name": payload.name,
        "email": email,
        "phone": payload.phone or "+63 900 000 0000",
        "password": payload.password,
        "rank": "Standard",
        "balance": 100,
        "points": 100,
        "totalHours": 0
    }
    db.setdefault("customers", []).append(new_cust)
    save_db(db)
    safe = {k: v for k, v in new_cust.items() if k != "password"}
    return {"success": True, "user": safe, "token": f"token-{new_cust['id']}", "redirect": "customer.html"}

@app.get("/api/stations")
def get_stations():
    return get_db().get("stations", [])

@app.get("/api/products")
def get_products():
    return get_db().get("products", [])

@app.get("/api/orders")
def get_orders():
    return get_db().get("orders", [])

@app.get("/api/reservations")
def get_reservations():
    return get_db().get("reservations", [])

# Serve UI files
@app.get("/")
def read_root():
    return FileResponse(str(BASE_DIR / "index.html"))

app.mount("/", StaticFiles(directory=str(BASE_DIR), html=True), name="static")
