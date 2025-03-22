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
    "Central Park": {"lat": 40.785091, "lon": -73.968285},
    "Times Square": {"lat": 40.758896, "lon": -73.985130},
    "Brooklyn Bridge": {"lat": 40.706086, "lon": -73.996864}
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


