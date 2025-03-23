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
  city: string;
}

const cities = ['LULEÅ', 'STOCKHOLM', 'GÖTEBORG'];

function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);
  const [selectedCity, setSelectedCity] = useState('LULEÅ');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<LocationInfo | null>(null);
  const [searchName, setSearchName] = useState<string | null>(null);

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
    const match = Object.entries(data).find(([name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      data[name].city === selectedCity
    );
    if (match) {
      const [name, info] = match;
      setSearchName(name);
      setSearchResult(info);
    } else {
      setSearchResult(null);
    }
  }, [searchTerm, data, selectedCity]);

  const mostCrowded = data
    ? Object.entries(data)
        .filter(([_, info]) => info.city === selectedCity)
        .reduce<[string, LocationInfo] | null>((max, entry) => {
          if (!max || entry[1].people_count > max[1].people_count) return entry;
          return max;
        }, null)
    : null;

  const cityCenter: Record<string, [number, number]> = {
    LULEÅ: [65.5848, 22.1547],
    STOCKHOLM: [59.3293, 18.0686],
    GÖTEBORG: [57.7089, 11.9746]
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', fontFamily: 'Roboto, sans-serif' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, width: '100%', background: '#111', color: '#fff',
        padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000
      }}>
        <strong>🇸🇪 Crowd Map</strong>
        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={{ padding: '0.4rem', borderRadius: 6 }}>
          {cities.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
      </div>

      {/* Sökfält */}
      <div style={{
        position: 'absolute', top: '3.2rem', width: '100%', padding: '0.5rem 1rem',
        background: 'rgba(255, 255, 255, 0.95)', zIndex: 1000
      }}>
        <input
          type="text"
          placeholder="🔍 Sök plats i vald stad"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: 6, border: '1px solid #ccc' }}
        />
        {searchResult && searchName && (
          <div style={{ marginTop: '0.5rem', background: '#fff', padding: '0.5rem', borderRadius: 6 }}>
            <strong>{searchName}</strong><br />
            👥 {searchResult.people_count} personer<br />
            🕒 {new Date(searchResult.timestamp).toLocaleTimeString()}<br />
            {searchResult.alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
          </div>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={cityCenter[selectedCity]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap & CartoDB'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data &&
          Object.entries(data)
            .filter(([_, info]) => info.city === selectedCity)
            .map(([name, info]) => (
              <Marker
                key={name}
                position={[info.lat, info.lon]}
                icon={L.icon({
                  iconUrl: info.alert
                    ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  iconSize: [32, 32]
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

      {/* Bottom nav-bar */}
      <div style={{
        position: 'absolute', bottom: 0, width: '100%', background: '#111', color: '#fff',
        display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0', zIndex: 1000
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>📍</div>
          <small>Karta</small>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div>📊</div>
          <small>
            Mest folk: {mostCrowded ? `${mostCrowded[0]} (${mostCrowded[1].people_count})` : '–'}
          </small>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div>⚙️</div>
          <small>Inställn.</small>
        </div>
      </div>
    </div>
  );
}

export default App;
