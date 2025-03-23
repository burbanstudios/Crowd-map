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

# Utökad lista med svenska platser (gallerior, knutpunkter, centrum, restauranger)
places = {
    # Stockholm
    "Mall of Scandinavia, Stockholm": {"lat": 59.3708, "lon": 18.0034, "threshold": 120},
    "Gallerian, Stockholm": {"lat": 59.3319, "lon": 18.0634, "threshold": 100},
    "Stureplan, Stockholm": {"lat": 59.3362, "lon": 18.0736, "threshold": 110},
    "Mood Stockholm": {"lat": 59.3327, "lon": 18.0669, "threshold": 90},

    # Göteborg
    "Nordstan, Göteborg": {"lat": 57.7089, "lon": 11.9706, "threshold": 100},
    "Avenyn, Göteborg": {"lat": 57.7005, "lon": 11.9746, "threshold": 90},
    "Frölunda Torg, Göteborg": {"lat": 57.6526, "lon": 11.9111, "threshold": 95},

    # Malmö
    "Emporia, Malmö": {"lat": 55.5656, "lon": 12.9874, "threshold": 90},
    "Mobilia, Malmö": {"lat": 55.5826, "lon": 13.0005, "threshold": 85},
    "Möllevångstorget, Malmö": {"lat": 55.5916, "lon": 13.0049, "threshold": 75},

    # Uppsala
    "Gränbystaden, Uppsala": {"lat": 59.8815, "lon": 17.6784, "threshold": 80},
    "Forumgallerian, Uppsala": {"lat": 59.8597, "lon": 17.6406, "threshold": 70},

    # Umeå
    "Väven, Umeå": {"lat": 63.8255, "lon": 20.2627, "threshold": 70},
    "Avion Shopping, Umeå": {"lat": 63.8133, "lon": 20.2659, "threshold": 75},

    # Luleå
    "Strand Galleria, Luleå": {"lat": 65.5848, "lon": 22.1547, "threshold": 60},
    "Shopping Galleria, Luleå": {"lat": 65.5843, "lon": 22.1516, "threshold": 65},
    "Clarion Sense, Luleå": {"lat": 65.5840, "lon": 22.1531, "threshold": 40},
    "ICA Maxi, Luleå": {"lat": 65.5993, "lon": 22.1352, "threshold": 80},
    "A.Ts Krog, Luleå": {"lat": 65.5840, "lon": 22.1537, "threshold": 50},
}

@app.get("/crowd-data")
def get_crowd_data():
    response = {}
    for name, info in places.items():
        people_count = random.randint(20, 150)
        response[name] = {
            "lat": info["lat"],
            "lon": info["lon"],
            "people_count": people_count,
            "alert": people_count >= info["threshold"],
            "timestamp": datetime.now().isoformat()
        }
    return response
