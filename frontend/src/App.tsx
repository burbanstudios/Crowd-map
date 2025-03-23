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

function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('LULEÅ');

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

  const filteredData = data
    ? Object.fromEntries(
        Object.entries(data).filter(([_, loc]) => loc.city === selectedCity)
      )
    : {};

  const searchMatch = searchTerm && filteredData
    ? Object.entries(filteredData).find(([name]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : null;

  const mostCrowded = selectedCity
    ? Object.entries(filteredData).reduce<[string, LocationInfo] | null>((prev, curr) => {
        if (!prev || curr[1].people_count > prev[1].people_count) {
          return curr;
        }
        return prev;
      }, null)
    : null;

  const mapCenter = selectedCity === 'LULEÅ' ? [65.5848, 22.1547]
                  : selectedCity === 'STOCKHOLM' ? [59.3293, 18.0686]
                  : selectedCity === 'GÖTEBORG' ? [57.7089, 11.9746]
                  : [62.0, 15.0]; // fallback

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Menyrad med platsval */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: '1rem',
        borderRadius: '8px',
        color: 'white'
      }}>
        <div style={{ fontWeight: 'bold' }}>🇸🇪 Crowd Map Sverige</div>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px' }}
        >
          <option value="LULEÅ">Luleå</option>
          <option value="STOCKHOLM">Stockholm</option>
          <option value="GÖTEBORG">Göteborg</option>
        </select>

        <input
          type="text"
          placeholder="🔍 Sök plats i vald stad"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px' }}
        />
      </div>

      {/* Statistik – Mest folk just nu */}
      {mostCrowded && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '8px',
          maxWidth: '200px'
        }}>
          <strong>📊 Mest folk just nu</strong>
          <div>{mostCrowded[0]}</div>
          <div>👥 {mostCrowded[1].people_count} personer</div>
        </div>
      )}

      {/* Karta */}
      <MapContainer
        center={mapCenter as [number, number]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Markörer */}
        {filteredData &&
          Object.entries(filteredData).map(([location, info]) => (
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
                👥 {info.people_count} personer<br />
                🕒 {new Date(info.timestamp).toLocaleTimeString()}<br />
                {info.alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Sökresultat-popup */}
      {searchMatch && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)'
        }}>
          <strong>{searchMatch[0]}</strong><br />
          👥 {searchMatch[1].people_count} personer<br />
          🕒 {new Date(searchMatch[1].timestamp).toLocaleTimeString()}<br />
          {searchMatch[1].alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
        </div>
      )}
    </div>
  );
}

export default App;
