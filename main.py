from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime
from collections import defaultdict

app = FastAPI()

# Tillåt frontend (Vercel) att anropa detta API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Byt ut * mot din Vercel-URL om du vill begränsa
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Platser
locations = {
    "Stockholm": {"lat": 59.3293, "lon": 18.0686},
    "Göteborg": {"lat": 57.7089, "lon": 11.9746},
    "Malmö": {"lat": 55.6050, "lon": 13.0038},
    "Uppsala": {"lat": 59.8586, "lon": 17.6389},
    "Luleå": {"lat": 65.5848, "lon": 22.1547},
    "Sundsvall": {"lat": 62.3908, "lon": 17.3069},
    "Visby": {"lat": 57.6348, "lon": 18.2948},
    "Östersund": {"lat": 63.1792, "lon": 14.6357}
}

# Historik
historical_data = defaultdict(list)

# Tröskel för notis
CRITICAL_THRESHOLD = 800

@app.get("/crowd-data")
def get_crowd_data():
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    data = {}

    for name, pos in locations.items():
        people = random.randint(5, 1000)
        data[name] = {
            "lat": pos["lat"],
            "lon": pos["lon"],
            "people_count": people,
            "timestamp": timestamp,
            "alert": people >= CRITICAL_THRESHOLD
        }
        historical_data[name].append({"timestamp": timestamp, "people_count": people})

    return data

@app.get("/history/{location}")
def get_history(location: str):
    return historical_data.get(location, [])


