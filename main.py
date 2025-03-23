from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulerade platser med Luleå, Stockholm etc.
crowd_data = {
    "ICA Maxi Luleå": {
        "lat": 65.5848,
        "lon": 22.1739,
        "people_count": 74,
        "alert": False,
        "timestamp": datetime.utcnow().isoformat()
    },
    "A.Ts Krog": {
        "lat": 65.583,
        "lon": 22.1545,
        "people_count": 42,
        "alert": False,
        "timestamp": datetime.utcnow().isoformat()
    },
    "Mood Gallerian": {
        "lat": 59.3354,
        "lon": 18.0703,
        "people_count": 88,
        "alert": True,
        "timestamp": datetime.utcnow().isoformat()
    },
    "Smedjan Galleria": {
        "lat": 65.5845,
        "lon": 22.1552,
        "people_count": 52,
        "alert": False,
        "timestamp": datetime.utcnow().isoformat()
    },
    "Shopping Galleria": {
        "lat": 65.5839,
        "lon": 22.1550,
        "people_count": 61,
        "alert": False,
        "timestamp": datetime.utcnow().isoformat()
    },
    "Strand Galleria": {
        "lat": 65.8314,
        "lon": 21.6896,
        "people_count": 45,
        "alert": False,
        "timestamp": datetime.utcnow().isoformat()
    }
}

@app.get("/crowd-data")
def get_crowd_data():
    # Simulera förändringar av mängd folk över tid
    for key, location in crowd_data.items():
        change = random.randint(-5, 5)
        location["people_count"] = max(0, location["people_count"] + change)
        location["alert"] = location["people_count"] > 80
        location["timestamp"] = datetime.utcnow().isoformat()
    return crowd_data
# Testar auto-deploy