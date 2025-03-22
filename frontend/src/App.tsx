import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

  return (
    <div style={{ height: '100vh', width: '100vw', margin: 0, padding: 0, position: 'relative' }}>
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
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}
      >
        🇸🇪 Crowd Map Sverige
      </div>

      {/* Karta */}
      <MapContainer
        center={[62.0, 15.0]} // Sverige i fokus
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Dark mode-karta */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>, © CartoDB'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

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
