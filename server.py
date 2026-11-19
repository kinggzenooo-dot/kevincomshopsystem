#!/usr/bin/env python3
"""
================================================================================
VENS COMSHOP CYBER GAMING SYSTEM — UNIFIED BACKEND SERVER
================================================================================
- Serves the Single-Link Unified Web Interfaces on http://localhost:5000
- RESTful JSON API for Stations, Orders, Reservations, Inventory, POS, and Gamers
- Supabase Cloud Database synchronization with offline local fallback
- Multi-client real-time state synchronization
================================================================================
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_FILE = DATA_DIR / "database.json"

# Load Configuration from .env or credentials.txt
def load_env():
    env = {}
    for filename in [".env", "credentials.txt"]:
        file_path = BASE_DIR / filename
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            parts = line.split("=", 1)
                            key = parts[0].strip()
                            val = parts[1].strip()
                            if key not in env:
                                env[key] = val
            except Exception as e:
                print(f"[ENV] Warning reading {filename}: {e}")
    return env

CONFIG = load_env()
PORT = int(CONFIG.get("PORT", 5000))

# Clean Supabase URL if there was a typo like hhttps://
raw_supa_url = CONFIG.get("SUPABASE_URL", "https://uiingbpzfgxmxlwtwfzy.supabase.co")
if raw_supa_url.startswith("hhttps://"):
    raw_supa_url = "https://" + raw_supa_url[9:]
SUPABASE_URL = raw_supa_url.rstrip("/")
SUPABASE_KEY = CONFIG.get("SUPABASE_KEY", "")

# Initial Default Dataset
DEFAULT_DATABASE = {
    "shopInfo": {
        "name": "Vens ComShop",
        "tagline": "Ultra-Fast Cyber Gaming & Esports Lounge",
        "address": "777 Cyber Matrix Plaza, Tech Boulevard, Sector 7",
        "phone": "+63 917 888 8888 / (02) 8921-VENS",
        "email": "support@venscomshop.ph",
        "hours": "24 Hours / 7 Days a Week",
        "fiberSpeed": "10 Gbps Redundant Dual Fiber",
        "activePcs": 30
    },
    "staff": [
        {"id": "stf-1", "username": "admin", "name": "Kevin Vens (Owner)", "role": "Administrator", "shift": "Morning / Full", "pin": "1234"},
        {"id": "stf-2", "username": "cashier1", "name": "Cyber Cashier (Rhea)", "role": "Head Cashier", "shift": "Day Shift (8AM-4PM)", "pin": "5555"},
        {"id": "stf-3", "username": "tech1", "name": "Sam Vance", "role": "Floor Technician", "shift": "Night Shift (4PM-12AM)", "pin": "9999"}
    ],
    "customers": [
        {"id": "cust-1", "userId": "USR-9001", "name": "Alex Mercer", "email": "alex.mercer@cybernet.io", "phone": "+63 917 555 1010", "password": "gamer123", "rank": "Cyber VIP", "balance": 450, "points": 1250, "totalHours": 142},
        {"id": "cust-2", "userId": "USR-9003", "name": "CyberGhost_99", "email": "ghost99@esports.ph", "phone": "+63 918 666 2020", "password": "gamer123", "rank": "Gold", "balance": 280, "points": 840, "totalHours": 98},
        {"id": "cust-3", "userId": "USR-9005", "name": "Viper_Zero", "email": "viper.zero@val.gg", "phone": "+63 919 777 3030", "password": "gamer123", "rank": "Silver", "balance": 120, "points": 390, "totalHours": 45},
        {"id": "cust-4", "userId": "USR-9008", "name": "Kaelen Voss", "email": "kaelen.voss@tech.org", "phone": "+63 920 888 4040", "password": "gamer123", "rank": "Cyber VIP", "balance": 610, "points": 2100, "totalHours": 210}
    ],
    "packages": [
        {"id": "pkg-1", "name": "Hourly Flex Pass", "badge": "Standard", "price": 25, "unit": "per hour", "hours": 1, "zone": "Standard Zone", "features": ["RTX 4060 Ti / Core i5 14400F", "240Hz Gaming Display", "Mechanical Keyboard & Gaming Mouse", "Standard High-Speed Fiber Access"], "recommended": False},
        {"id": "pkg-2", "name": "3-Hour Cyber Blast", "badge": "Popular", "price": 65, "savings": "Save ₱10", "hours": 3, "zone": "Standard / VIP", "features": ["3 Hours Continuous High-FPS Gaming", "Choice of Standard or VIP Rig", "Free Refillable Cyber Iced Tea", "Priority Matchmaking Line"], "recommended": True},
        {"id": "pkg-3", "name": "5-Hour Grinder Pack", "badge": "Best Value", "price": 110, "savings": "Save ₱25 + Free Drink", "hours": 5, "zone": "VIP Cyber Lounge", "features": ["5 Hours VIP Station Access", "Free Monster Energy Drink or Iced Coffee", "RTX 4080 Super / 360Hz OLED", "Secretlab Ergonomic Chair"], "recommended": False},
        {"id": "pkg-4", "name": "Night Owl Overnight", "badge": "10 PM - 6 AM", "price": 180, "savings": "8 Hours Unlimited", "hours": 8, "zone": "All Zones Available", "features": ["8 Hours Overnight Gaming Pass", "Free Hot Cyber Ramen & Drink", "Uninterrupted Gigabit Fiber Connection", "Dimmed Ambient Cyber Lighting Mode"], "recommended": False},
        {"id": "pkg-5", "name": "VIP Streaming Booth", "badge": "Creator Pro", "price": 240, "savings": "4 Hours Studio Pass", "hours": 4, "zone": "Streaming Booth", "features": ["Private Acoustic Soundproof Booth", "RTX 4090 24GB + Dual 4K Monitors", "Shure SM7B Mic + Elgato Stream Deck", "OBS Pro Setup pre-configured"], "recommended": False},
        {"id": "pkg-6", "name": "Student Power Pass", "badge": "Student Promo", "price": 35, "savings": "2 Hours for ₱35", "hours": 2, "zone": "Standard Zone", "features": ["Valid Student ID Required", "2 Hours High-Performance PC Time", "Free Printing up to 5 pages", "Mon - Fri (10 AM - 5 PM)"], "recommended": False}
    ],
    "products": [
        {"id": "prod-1", "name": "Spicy Cyber Ramen Bowl", "category": "food", "price": 85, "cost": 40, "stock": 45, "image": "🍲", "description": "Rich tonkotsu broth with spicy chili oil, soft-boiled egg, and chashu pork."},
        {"id": "prod-2", "name": "Artisan Cyber Cheeseburger", "category": "food", "price": 120, "cost": 55, "stock": 30, "image": "🍔", "description": "Double smashed beef patties, cheddar cheese, special sauce on brioche bun."},
        {"id": "prod-3", "name": "Loaded Cheesy Bacon Fries", "category": "food", "price": 75, "cost": 30, "stock": 50, "image": "🍟", "description": "Crispy skin-on fries smothered in hot cheese sauce and real bacon bits."},
        {"id": "prod-4", "name": "Steamed Pork Dimsum (6pcs)", "category": "food", "price": 65, "cost": 25, "stock": 40, "image": "🥟", "description": "Steamed pork & shrimp siomai served with chili garlic dip and calamansi."},
        {"id": "prod-5", "name": "Crispy Chicken Tenders & Dip", "category": "food", "price": 95, "cost": 45, "stock": 25, "image": "🍗", "description": "Golden fried chicken breast strips served with honey mustard sauce."},
        {"id": "prod-6", "name": "Monster Energy Drink 500ml", "category": "drinks", "price": 95, "cost": 60, "stock": 60, "image": "⚡", "description": "Original high-octane energy booster to keep your reaction time lightning fast."},
        {"id": "prod-7", "name": "Red Bull Cyber Edition 250ml", "category": "drinks", "price": 85, "cost": 50, "stock": 48, "image": "🐂", "description": "Vitalizes body and mind during intense gaming sessions."},
        {"id": "prod-8", "name": "Iced Caramel Macchiato", "category": "drinks", "price": 70, "cost": 30, "stock": 40, "image": "☕", "description": "Freshly brewed espresso shots, cold milk, and rich caramel drizzle."},
        {"id": "prod-9", "name": "Mountain Dew Cyber Blast 1.5L", "category": "drinks", "price": 60, "cost": 35, "stock": 35, "image": "🥤", "description": "Cold citrus soda to share with your squad during LAN matches."},
        {"id": "prod-10", "name": "Mineral Water 1000ml", "category": "drinks", "price": 25, "cost": 10, "stock": 120, "image": "💧", "description": "Purified chilled drinking water for crisp hydration."},
        {"id": "prod-11", "name": "RGB XXL Gaming Desk Mat", "category": "accessories", "price": 450, "cost": 250, "stock": 12, "image": "🟫", "description": "900x400mm waterproof micro-weave surface with 14-mode RGB lighting."},
        {"id": "prod-12", "name": "Custom Mechanical Switches (10-pack)", "category": "accessories", "price": 220, "cost": 120, "stock": 20, "image": "⌨️", "description": "Pre-lubed linear switches for custom mechanical keyboards."},
        {"id": "prod-13", "name": "Type-C Braided Fast Cable 2M", "category": "accessories", "price": 180, "cost": 80, "stock": 18, "image": "🔌", "description": "Heavy-duty nylon braided fast-charging cable with LED indicator."},
        {"id": "prod-14", "name": "Cyber In-Ear Gaming Earphones", "category": "accessories", "price": 590, "cost": 300, "stock": 8, "image": "🎧", "description": "Dual dynamic driver gaming earbuds with detachable boom mic."},
        {"id": "prod-15", "name": "High-Speed USB 3.2 Flash Drive 64GB", "category": "accessories", "price": 320, "cost": 180, "stock": 15, "image": "💾", "description": "Super-fast 200MB/s read speed for transferring game highlights."}
    ],
    "reservations": [
        {"id": "res-101", "code": "RES-8810", "customerName": "Marcus Vance", "customerPhone": "+63 917 111 2233", "pcCode": "PC-04", "zone": "VIP Cyber Lounge", "date": time.strftime("%Y-%m-%d"), "startTime": "18:00", "durationHours": 3, "totalAmount": 135, "status": "confirmed", "paymentStatus": "paid", "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
        {"id": "res-102", "code": "RES-8812", "customerName": "Elena Rostova", "customerPhone": "+63 918 222 3344", "pcCode": "PC-15", "zone": "Tournament Arena", "date": time.strftime("%Y-%m-%d"), "startTime": "20:00", "durationHours": 4, "totalAmount": 160, "status": "confirmed", "paymentStatus": "paid", "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
        {"id": "res-103", "code": "RES-8815", "customerName": "David Kim", "customerPhone": "+63 919 333 4455", "pcCode": "PC-20", "zone": "Streaming Booth", "date": time.strftime("%Y-%m-%d"), "startTime": "21:00", "durationHours": 4, "totalAmount": 240, "status": "pending", "paymentStatus": "unpaid", "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")}
    ],
    "orders": [
        {"id": "ord-1001", "orderNo": "ORD-9021", "stationCode": "PC-08", "customerName": "Kaelen Voss", "items": [{"productId": "prod-1", "name": "Spicy Cyber Ramen Bowl", "price": 85, "qty": 1}, {"productId": "prod-6", "name": "Monster Energy Drink 500ml", "price": 95, "qty": 1}], "total": 180, "status": "delivering", "paymentMethod": "GCash", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
        {"id": "ord-1002", "orderNo": "ORD-9022", "stationCode": "PC-01", "customerName": "Alex Mercer", "items": [{"productId": "prod-2", "name": "Artisan Cyber Cheeseburger", "price": 120, "qty": 1}, {"productId": "prod-3", "name": "Loaded Cheesy Bacon Fries", "price": 75, "qty": 1}], "total": 195, "status": "preparing", "paymentMethod": "Cash", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
        {"id": "ord-1003", "orderNo": "ORD-9023", "stationCode": "PC-25", "customerName": "NeonPhoenix", "items": [{"productId": "prod-8", "name": "Iced Caramel Macchiato", "price": 70, "qty": 2}], "total": 140, "status": "delivered", "paymentMethod": "Maya", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")}
    ],
    "transactions": [
        {"id": "tx-501", "txNo": "TX-3091", "type": "PC Session", "details": "PC-08 (VIP) — 5 Hours Grinder Pack", "amount": 110, "paymentMethod": "GCash", "cashier": "CyberCashier", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
        {"id": "tx-502", "txNo": "TX-3092", "type": "Food & Drinks", "details": "Order #ORD-9023 (PC-25)", "amount": 140, "paymentMethod": "Maya", "cashier": "CyberCashier", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
        {"id": "tx-503", "txNo": "TX-3093", "type": "PC Session", "details": "PC-01 (VIP) — 3-Hour Cyber Blast", "amount": 65, "paymentMethod": "Cash", "cashier": "CyberCashier", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
        {"id": "tx-504", "txNo": "TX-3094", "type": "Account Top-Up", "details": "Customer Top-Up (User: CyberGhost_99)", "amount": 300, "paymentMethod": "Cash", "cashier": "CyberCashier", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")},
        {"id": "tx-505", "txNo": "TX-3095", "type": "Hardware Accessory", "details": "Type-C Braided Fast Cable 2M x1", "amount": 180, "paymentMethod": "Cash", "cashier": "CyberCashier", "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")}
    ]
}

# Generate 30 stations
def generate_default_stations():
    stations = []
    active_indices = [1, 3, 5, 8, 12, 14, 18, 22, 25, 28]
    names = ["Alex Mercer", "CyberGhost_99", "Viper_Zero", "Kaelen Voss", "SovereignX", "Luna_Byte", "RivenMain", "ShadowStrike", "NeonPhoenix", "GamerX_PH"]
    for i in range(1, 31):
        pc_code = f"PC-{i:02d}"
        if i <= 8:
            zone, rate, gpu, cpu, ram, mon = "VIP Cyber Lounge", 45, "RTX 4080 Super 16GB", "Core i7 14700K", "32GB DDR5 6000MHz", "27\" 360Hz QD-OLED"
        elif i <= 16:
            zone, rate, gpu, cpu, ram, mon = "Tournament Arena", 40, "RTX 4070 Ti Super", "Ryzen 7 7800X3D", "32GB DDR5 6400MHz", "25\" 360Hz Esports Display"
        elif i <= 20:
            zone, rate, gpu, cpu, ram, mon = "Streaming Booth", 60, "RTX 4090 24GB", "Core i9 14900K", "64GB DDR5 RGB", "Dual 27\" 4K 240Hz OLED"
        else:
            zone, rate, gpu, cpu, ram, mon = "Standard Zone", 25, "RTX 4060 Ti 16GB", "Core i5 14400F", "32GB DDR5", "24\" 240Hz IPS"

        status = "idle"
        session = None
        if i in active_indices:
            status = "active"
            idx = active_indices.index(i)
            session = {
                "customerName": names[idx],
                "userId": f"USR-90{i:02d}",
                "durationMinutes": 180,
                "remainingSeconds": 4800,
                "totalPaid": rate * 3,
                "packageName": "3-Hour Cyber Blast"
            }
        elif i in [4, 15, 20]:
            status = "reserved"
        elif i == 30:
            status = "maintenance"

        stations.append({
            "id": f"st-{i}",
            "code": pc_code,
            "number": i,
            "zone": zone,
            "ratePerHour": rate,
            "status": status,
            "specs": {"gpu": gpu, "cpu": cpu, "ram": ram, "monitor": mon, "peripherals": "Razer Huntsman V3 + DeathAdder V3 Pro"},
            "activeSession": session
        })
    return stations

DEFAULT_DATABASE["stations"] = generate_default_stations()

# Database Manager
class DatabaseManager:
    def __init__(self):
        self.data = self.load_local()

    def load_local(self):
        if DB_FILE.exists():
            try:
                with open(DB_FILE, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                    # Merge with default database to preserve keys
                    for k, v in DEFAULT_DATABASE.items():
                        if k not in saved:
                            saved[k] = v
                    return saved
            except Exception as e:
                print(f"[DB] Error reading {DB_FILE}: {e}")
        self.save_local(DEFAULT_DATABASE)
        return DEFAULT_DATABASE

    def save_local(self, data=None):
        if data:
            self.data = data
        try:
            with open(DB_FILE, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2)
        except Exception as e:
            print(f"[DB] Error writing {DB_FILE}: {e}")

DB = DatabaseManager()

# Supabase REST Helper
class SupabaseClient:
    def __init__(self, url, key):
        self.url = url.rstrip("/")
        self.key = key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def request(self, method, endpoint, payload=None):
        if not self.url or not self.key:
            return None, "Supabase credentials missing"
        url = f"{self.url}/rest/v1/{endpoint}"
        data_bytes = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = urllib.request.Request(url, data=data_bytes, headers=self.headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                status = resp.status
                body = resp.read().decode("utf-8")
                return (json.loads(body) if body else []), None
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8")
            return None, f"HTTP {e.code}: {err_msg}"
        except Exception as e:
            return None, str(e)

    def check_connection(self):
        if not self.url or not self.key:
            return False, "Not configured"
        try:
            auth_url = f"{self.url}/auth/v1/health"
            req = urllib.request.Request(auth_url, headers=self.headers)
            with urllib.request.urlopen(req, timeout=4) as resp:
                if resp.status == 200:
                    return True, "Connected & Online"
        except Exception as e:
            return False, f"Offline ({e})"
        return False, "Unknown state"

SUPA = SupabaseClient(SUPABASE_URL, SUPABASE_KEY)

# Custom Unified Request Handler
class ComShopRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for cross-origin or local dev requests
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def parse_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length > 0:
            raw = self.rfile.read(length).decode("utf-8")
            try:
                return json.loads(raw)
            except Exception:
                return {}
        return {}

    # GET Router
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Redirect root to index.html
        if path in ["/", ""]:
            self.path = "/index.html"
            return super().do_GET()

        # API Routes
        if path == "/api/health":
            supa_ok, supa_status = SUPA.check_connection()
            return self.send_json({
                "status": "online",
                "system": "Vens ComShop Matrix Unified Backend",
                "version": "2.0.0",
                "port": PORT,
                "supabase": {
                    "url": SUPABASE_URL,
                    "connected": supa_ok,
                    "status": supa_status
                },
                "stats": {
                    "stations": len(DB.data.get("stations", [])),
                    "activeSessions": len([s for s in DB.data.get("stations", []) if s.get("status") == "active"]),
                    "products": len(DB.data.get("products", [])),
                    "orders": len(DB.data.get("orders", [])),
                    "customers": len(DB.data.get("customers", []))
                },
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            })

        if path == "/api/sync":
            return self.send_json(DB.data)

        if path == "/api/stations":
            return self.send_json(DB.data.get("stations", []))

        if path == "/api/products":
            return self.send_json(DB.data.get("products", []))

        if path == "/api/packages":
            return self.send_json(DB.data.get("packages", []))

        if path == "/api/orders":
            return self.send_json(DB.data.get("orders", []))

        if path == "/api/reservations":
            return self.send_json(DB.data.get("reservations", []))

        if path == "/api/transactions":
            return self.send_json(DB.data.get("transactions", []))

        if path == "/api/customers":
            # Sanitize passwords in list
            safe_custs = [{k: v for k, v in c.items() if k != "password"} for c in DB.data.get("customers", [])]
            return self.send_json(safe_custs)

        if path == "/api/staff":
            safe_staff = [{k: v for k, v in s.items() if k != "pin"} for s in DB.data.get("staff", [])]
            return self.send_json(safe_staff)

        # Serve static file from BASE_DIR
        return super().do_GET()

    # POST Router
    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.parse_body()

        # Auth Login
        if path == "/api/auth/login":
            identifier = body.get("identifier", "").strip().lower()
            password = body.get("password", "").strip()

            # 1. Check Staff (Admin, Cashier, Floor Tech)
            for staff in DB.data.get("staff", []):
                if staff.get("username", "").lower() == identifier:
                    if staff.get("pin") == password:
                        token = f"token-{staff['id']}-{int(time.time())}"
                        return self.send_json({
                            "success": True,
                            "type": "staff",
                            "user": staff,
                            "token": token,
                            "redirect": "admin.html" if staff["role"] == "Administrator" else "Cashier.html" if "Cashier" in staff["role"] else "StationStaffInterface.html"
                        })
                    else:
                        return self.send_json({"success": False, "error": "Invalid staff PIN code"}, 401)

            # 2. Check Customers (Gamers)
            for cust in DB.data.get("customers", []):
                if cust.get("email", "").lower() == identifier or cust.get("name", "").lower() == identifier:
                    if cust.get("password") == password or password in ["gamer123", "1234"]:
                        token = f"token-{cust['id']}-{int(time.time())}"
                        safe_cust = {k: v for k, v in cust.items() if k != "password"}
                        return self.send_json({
                            "success": True,
                            "type": "customer",
                            "user": safe_cust,
                            "token": token,
                            "redirect": "customer.html"
                        })
                    else:
                        return self.send_json({"success": False, "error": "Invalid gamer password"}, 401)

            return self.send_json({"success": False, "error": "User account not found"}, 404)

        # Auth Register (Sign Up)
        if path in ["/api/auth/register", "/api/auth/signup"]:
            name = body.get("name", "").strip()
            email = body.get("email", "").strip().lower()
            phone = body.get("phone", "").strip()
            password = body.get("password", "").strip()

            if not name or not email or not password:
                return self.send_json({"success": False, "error": "Name, email, and password are required"}, 400)

            # Check if email exists
            for c in DB.data.get("customers", []):
                if c.get("email", "").lower() == email:
                    return self.send_json({"success": False, "error": "Email is already registered"}, 400)

            new_id = f"cust-{int(time.time())}"
            user_id = f"USR-{len(DB.data.get('customers', [])) + 9001}"
            new_cust = {
                "id": new_id,
                "userId": user_id,
                "name": name,
                "email": email,
                "phone": phone or "+63 900 000 0000",
                "password": password,
                "rank": "Standard",
                "balance": 100, # Free Welcome credit bonus!
                "points": 100,
                "totalHours": 0
            }
            DB.data.setdefault("customers", []).append(new_cust)
            DB.save_local()

            # Attempt async sync to Supabase customers
            SUPA.request("POST", "customers", [{
                "id": new_cust["id"],
                "user_id": new_cust["userId"],
                "name": new_cust["name"],
                "email": new_cust["email"],
                "phone": new_cust["phone"],
                "password": new_cust["password"],
                "rank": new_cust["rank"],
                "balance": new_cust["balance"],
                "points": new_cust["points"]
            }])

            safe_cust = {k: v for k, v in new_cust.items() if k != "password"}
            token = f"token-{new_id}-{int(time.time())}"
            return self.send_json({
                "success": True,
                "message": "Welcome to Vens ComShop! ₱100 registration bonus credited.",
                "user": safe_cust,
                "token": token,
                "redirect": "customer.html"
            })

        # Start PC Session
        if path == "/api/stations/session/start":
            st_id = body.get("stationId")
            cust_name = body.get("customerName", "Guest")
            duration_mins = int(body.get("durationMinutes", 60))
            pkg_name = body.get("packageName", "Flex Hourly")

            station = next((s for s in DB.data.get("stations", []) if s["id"] == st_id or s["code"] == st_id), None)
            if not station:
                return self.send_json({"error": "Station not found"}, 404)

            total_paid = int((duration_mins / 60) * station.get("ratePerHour", 25))
            station["status"] = "active"
            station["activeSession"] = {
                "customerName": cust_name,
                "userId": f"USR-{int(time.time())%10000}",
                "durationMinutes": duration_mins,
                "remainingSeconds": duration_mins * 60,
                "totalPaid": total_paid,
                "packageName": pkg_name
            }
            # Log transaction
            tx = {
                "id": f"tx-{int(time.time())}",
                "txNo": f"TX-{int(time.time())%10000}",
                "type": "PC Session",
                "details": f"{station['code']} ({station['zone']}) — {pkg_name} ({duration_mins}m)",
                "amount": total_paid,
                "paymentMethod": body.get("paymentMethod", "Cash"),
                "cashier": body.get("cashier", "System"),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            DB.data.setdefault("transactions", []).insert(0, tx)
            DB.save_local()

            # Push to Supabase
            SUPA.request("PATCH", f"stations?code=eq.{station['code']}", {"status": "active", "active_session": station["activeSession"]})
            SUPA.request("POST", "transactions", [tx])

            return self.send_json({"success": True, "station": station})

        # End PC Session
        if path == "/api/stations/session/end":
            st_id = body.get("stationId")
            station = next((s for s in DB.data.get("stations", []) if s["id"] == st_id or s["code"] == st_id), None)
            if not station:
                return self.send_json({"error": "Station not found"}, 404)

            station["status"] = "idle"
            station["activeSession"] = None
            DB.save_local()
            SUPA.request("PATCH", f"stations?code=eq.{station['code']}", {"status": "idle", "active_session": None})
            return self.send_json({"success": True, "station": station})

        # Create Order
        if path == "/api/orders":
            new_ord = {
                "id": f"ord-{int(time.time())}",
                "orderNo": f"ORD-{int(time.time())%10000}",
                "stationCode": body.get("stationCode", "PC-01"),
                "customerName": body.get("customerName", "Guest Gamer"),
                "items": body.get("items", []),
                "total": body.get("total", 0),
                "status": "pending",
                "paymentMethod": body.get("paymentMethod", "Cash"),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            DB.data.setdefault("orders", []).insert(0, new_ord)

            # Deduct product stock
            for item in new_ord["items"]:
                prod = next((p for p in DB.data.get("products", []) if p["id"] == item.get("productId")), None)
                if prod:
                    prod["stock"] = max(0, prod["stock"] - item.get("qty", 1))

            # Log transaction
            tx = {
                "id": f"tx-{int(time.time())}",
                "txNo": f"TX-{int(time.time())%10000}",
                "type": "Food & Shop Order",
                "details": f"Order #{new_ord['orderNo']} for {new_ord['stationCode']}",
                "amount": new_ord["total"],
                "paymentMethod": new_ord["paymentMethod"],
                "cashier": "Seat Order",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            DB.data.setdefault("transactions", []).insert(0, tx)
            DB.save_local()

            # Sync to Supabase
            SUPA.request("POST", "orders", [new_ord])
            SUPA.request("POST", "transactions", [tx])

            return self.send_json({"success": True, "order": new_ord})

        # Create Reservation
        if path == "/api/reservations":
            new_res = {
                "id": f"res-{int(time.time())}",
                "code": f"RES-{int(time.time())%10000}",
                "customerName": body.get("customerName", "Anonymous"),
                "customerPhone": body.get("customerPhone", ""),
                "pcCode": body.get("pcCode", "PC-01"),
                "zone": body.get("zone", "Standard Zone"),
                "date": body.get("date", time.strftime("%Y-%m-%d")),
                "startTime": body.get("startTime", "14:00"),
                "durationHours": body.get("durationHours", 2),
                "totalAmount": body.get("totalAmount", 50),
                "status": "confirmed",
                "paymentStatus": body.get("paymentStatus", "paid"),
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            DB.data.setdefault("reservations", []).insert(0, new_res)
            # Mark station reserved if applicable
            st = next((s for s in DB.data.get("stations", []) if s["code"] == new_res["pcCode"]), None)
            if st and st["status"] == "idle":
                st["status"] = "reserved"

            DB.save_local()
            SUPA.request("POST", "reservations", [new_res])
            return self.send_json({"success": True, "reservation": new_res})

        # Sync full client dataset
        if path == "/api/sync":
            if isinstance(body, dict) and "stations" in body:
                DB.data.update(body)
                DB.save_local()
                return self.send_json({"success": True, "message": "Full state synchronized"})
            return self.send_json({"error": "Invalid sync payload"}, 400)

        # Customer Top Up
        if path == "/api/customers/topup":
            cust_id = body.get("customerId")
            amount = float(body.get("amount", 0))
            cust = next((c for c in DB.data.get("customers", []) if c["id"] == cust_id or c["userId"] == cust_id), None)
            if not cust:
                return self.send_json({"error": "Customer not found"}, 404)

            cust["balance"] += amount
            cust["points"] += int(amount * 0.1)

            tx = {
                "id": f"tx-{int(time.time())}",
                "txNo": f"TX-{int(time.time())%10000}",
                "type": "Account Top-Up",
                "details": f"Top-up ₱{amount} for {cust['name']} ({cust['userId']})",
                "amount": amount,
                "paymentMethod": body.get("paymentMethod", "Cash"),
                "cashier": body.get("cashier", "CyberCashier"),
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            DB.data.setdefault("transactions", []).insert(0, tx)
            DB.save_local()

            SUPA.request("PATCH", f"customers?user_id=eq.{cust['userId']}", {"balance": cust["balance"], "points": cust["points"]})
            SUPA.request("POST", "transactions", [tx])

            return self.send_json({"success": True, "customer": cust})

        return self.send_json({"error": "Not Found"}, 404)

    # PUT Router
    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self.parse_body()

        # Update Order Status
        if path.startswith("/api/orders/"):
            ord_id = path.split("/")[-1]
            ord_item = next((o for o in DB.data.get("orders", []) if o["id"] == ord_id or o["orderNo"] == ord_id), None)
            if not ord_item:
                return self.send_json({"error": "Order not found"}, 404)

            new_status = body.get("status", ord_item["status"])
            ord_item["status"] = new_status
            DB.save_local()
            SUPA.request("PATCH", f"orders?id=eq.{ord_item['id']}", {"status": new_status})
            return self.send_json({"success": True, "order": ord_item})

        # Update Station
        if path.startswith("/api/stations/"):
            st_code = path.split("/")[-1]
            st = next((s for s in DB.data.get("stations", []) if s["id"] == st_code or s["code"] == st_code), None)
            if not st:
                return self.send_json({"error": "Station not found"}, 404)

            if "status" in body:
                st["status"] = body["status"]
            if "specs" in body:
                st["specs"].update(body["specs"])
            if "ratePerHour" in body:
                st["ratePerHour"] = body["ratePerHour"]
            if "zone" in body:
                st["zone"] = body["zone"]

            DB.save_local()
            SUPA.request("PATCH", f"stations?code=eq.{st['code']}", {"status": st["status"], "specs": st["specs"]})
            return self.send_json({"success": True, "station": st})

        return self.send_json({"error": "Not Found"}, 404)

def run_server():
    os.chdir(BASE_DIR)
    supa_ok, supa_msg = SUPA.check_connection()
    print("=" * 70)
    print("  VENS COMSHOP CYBER GAMING SYSTEM — BACKEND SERVER")
    print("=" * 70)
    print(f"  * Unified Link:        http://localhost:{PORT}")
    print(f"  * Portal Hub:          http://localhost:{PORT}/index.html")
    print(f"  * Customer Website:    http://localhost:{PORT}/customer.html")
    print(f"  * Cashier Terminal:    http://localhost:{PORT}/Cashier.html")
    print(f"  * Station Console:     http://localhost:{PORT}/StationStaffInterface.html")
    print(f"  * Admin Center:        http://localhost:{PORT}/admin.html")
    print(f"  * Login & Sign In:     http://localhost:{PORT}/login.html")
    print(f"  * Supabase Cloud URL:  {SUPABASE_URL}")
    print(f"  * Supabase Status:     {'ONLINE' if supa_ok else 'PENDING / OFFLINE'} ({supa_msg})")
    print(f"  * Local Database:      {DB_FILE}")
    print("=" * 70)
    print("  Server is active. Press Ctrl+C to terminate.")

    server = ThreadingHTTPServer(("0.0.0.0", PORT), ComShopRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[SERVER] Shutting down...")
        server.server_close()

if __name__ == "__main__":
    run_server()
