import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationInfo {
  lat: number;
  lon: number;
  people_count: number;
  alert: boolean;
  timestamp: string;
}

function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);

  useEffect(() => {
    const fetchData = () => {
      fetch('https://crowd-map-api.onrender.com/crowd-data')
        .then((res) => res.json())
        .then((json) => setData(json))
        .catch((err) => console.error("Error fetching data:", err));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const heatmapPoints = data
    ? Object.values(data).map(loc => [loc.lat, loc.lon, loc.people_count])
    : [];

  return (
    <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      {/* Titel-overlay */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontWeight: 'bold',
          zIndex: 1000,
          fontSize: 'clamp(1rem, 2vw, 1.5rem)',
        }}
      >
        🇸🇪 Crowd Map Sverige
      </div>

      {/* Karta */}
      <MapContainer
        center={[62.0, 15.0]}
        zoom={5.5}
        style={{ height: '100vh', width: '100vw' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, © CartoDB'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Heatmap Layer */}
        {data && (
          <HeatmapLayer
            fitBoundsOnLoad
            fitBoundsOnUpdate
            points={heatmapPoints}
            longitudeExtractor={(m) => m[1]}
            latitudeExtractor={(m) => m[0]}
            intensityExtractor={(m) => m[2]}
            radius={25}
            blur={20}
            maxZoom={12}
          />
        )}

        {/* Markörer */}
        {data &&
          Object.entries(data).map(([location, info]) => (
            <Marker
              key={location}
              position={[info.lat, info.lon]}
              icon={L.icon({
                iconUrl: info.alert
                  ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                  : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                iconSize: [32, 32],
              })}
            >
              <Popup>
                <strong>{location}</strong><br />
                {info.people_count} personer<br />
                {info.alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

export default App;
