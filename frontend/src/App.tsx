""import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationInfo {
  lat: number;
  lon: number;
  people_count: number;
  alert: boolean;
  timestamp: string;
  city: string;
}

const cities = ["Luleå", "Stockholm", "Göteborg", "Malmö"];

function FlyToCity({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center]);
  return null;
}

function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);
  const [city, setCity] = useState<string>('Luleå');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<[string, LocationInfo] | null>(null);

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

  useEffect(() => {
    if (!data || searchTerm.trim() === '') {
      setSearchResult(null);
      return;
    }
    const match = Object.entries(data).find(
      ([name, info]) => name.toLowerCase().includes(searchTerm.toLowerCase()) && info.city === city
    );
    setSearchResult(match || null);
  }, [searchTerm, data, city]);

  const locationsInCity = data
    ? Object.entries(data).filter(([_, info]) => info.city === city)
    : [];

  const mostCrowded = locationsInCity.reduce<[string, LocationInfo] | null>((max, curr) => {
    if (!max || curr[1].people_count > max[1].people_count) return curr;
    return max;
  }, null);

  const cityCenters: Record<string, [number, number]> = {
    Luleå: [65.5848, 22.1547],
    Stockholm: [59.3293, 18.0686],
    Göteborg: [57.7089, 11.9746],
    Malmö: [55.604981, 13.003822],
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', fontFamily: 'Roboto, sans-serif' }}>

      {/* Rubrik och meny */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000 }}>
        <div style={{ backgroundColor: '#111', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.2rem' }}>
          🇸🇪 Crowd Map
        </div>

        <select value={city} onChange={(e) => setCity(e.target.value)} style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '8px' }}>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 Sök plats"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '8px', width: '220px' }}
        />

        {searchResult && (
          <div style={{ marginTop: '0.5rem', background: '#fff', padding: '0.5rem', borderRadius: '8px' }}>
            <strong>{searchResult[0]}</strong><br />
            👥 {searchResult[1].people_count} personer<br />
            🕒 {new Date(searchResult[1].timestamp).toLocaleTimeString()}<br />
            {searchResult[1].alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
          </div>
        )}

        {mostCrowded && (
          <div style={{ marginTop: '1rem', background: '#f1f1f1', padding: '0.5rem', borderRadius: '8px' }}>
            📊 Mest folk i {city}:<br />
            <strong>{mostCrowded[0]}</strong> – {mostCrowded[1].people_count} personer
          </div>
        )}
      </div>

      <MapContainer
        center={cityCenters[city]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FlyToCity center={cityCenters[city]} />

        {locationsInCity.map(([name, info]) => (
          <Marker
            key={name}
            position={[info.lat, info.lon]}
            icon={L.icon({
              iconUrl: info.alert
                ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              iconSize: [32, 32],
            })}
          >
            <Popup>
              <strong>{name}</strong><br />
              👥 {info.people_count} personer<br />
              🕒 {new Date(info.timestamp).toLocaleTimeString()}<br />
              {info.alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Bottom nav */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        background: 'rgba(255,255,255,0.9)',
        padding: '0.5rem 1rem',
        display: 'flex',
        justifyContent: 'space-around',
        zIndex: 1000,
        borderTop: '1px solid #ddd',
      }}>
        <div>🏠 Start</div>
        <div>📍 Platser</div>
        <div>📊 Statistik</div>
        <div>⚙️ Inställningar</div>
      </div>
    </div>
  );
}

export default App;