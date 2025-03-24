from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import pytz
import random

app = FastAPI()

# Tillåt CORS för Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lista över platser och tröskelvärden
places = [
    {"name": "ICA Maxi Luleå", "lat": 65.6099, "lon": 22.1460, "threshold": 60},
    {"name": "A.Ts Krog", "lat": 65.5838, "lon": 22.1531, "threshold": 30},
    {"name": "Mood Galleria", "lat": 59.3342, "lon": 18.0675, "threshold": 100},
    {"name": "Kungsträdgården", "lat": 59.3303, "lon": 18.0722, "threshold": 150},
    {"name": "Gallerian Stockholm", "lat": 59.3326, "lon": 18.0649, "threshold": 120},
    {"name": "Smedjan Galleria", "lat": 65.5848, "lon": 22.1547, "threshold": 70},
    {"name": "Shopping Galleria", "lat": 65.5840, "lon": 22.1543, "threshold": 65},
    {"name": "Strand Galleria", "lat": 65.5832, "lon": 22.1551, "threshold": 50},
    {"name": "Stadsparken Luleå", "lat": 65.5845, "lon": 22.1572, "threshold": 80},
    {"name": "Luleå Airport", "lat": 65.5436, "lon": 22.1225, "threshold": 90},
    {"name": "Clarion Hotel Sense", "lat": 65.5839, "lon": 22.1534, "threshold": 40},
]

@app.get("/crowd-data")
def get_crowd_data():
    sweden_tz = pytz.timezone("Europe/Stockholm")
    now = datetime.now(sweden_tz).isoformat()
    response = {}

    for place in places:
        people_count = random.randint(0, place["threshold"] + 40)
        response[place["name"]] = {
            "lat": place["lat"],
            "lon": place["lon"],
            "people_count": people_count,
            "alert": people_count >= place["threshold"],
            "timestamp": now
        }

    return response
