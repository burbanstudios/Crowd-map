import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css'; // Om du vill ha extern CSS (kan ignoreras om ej används)

interface LocationInfo {
  lat: number;
  lon: number;
  people_count: number;
  alert: boolean;
  timestamp: string;
}

function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<LocationInfo | null>(null);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

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
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (match) {
      const [name, info] = match;
      setSearchName(name);
      setSearchResult(info);
    } else {
      setSearchResult(null);
    }
  }, [searchTerm, data]);

  const mapStyle = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', fontFamily: 'Roboto, sans-serif' }}>
      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        fontWeight: 900,
        fontSize: '1.5rem',
        zIndex: 1000,
        color: '#000'
      }}>
        CROWDED
      </div>

      {/* Sökfält */}
      <div style={{
        position: 'absolute',
        top: '3.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        borderRadius: '2rem',
        padding: '0.5rem 1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1000,
        width: '80%'
      }}>
        <span style={{ marginRight: '0.5rem' }}>🔍</span>
        <input
          type="text"
          placeholder="Sök plats, ex. ICA Maxi Luleå"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '1rem',
            background: 'transparent'
          }}
        />
      </div>

      {/* Sökresultat */}
      {searchResult && searchName && (
        <div style={{
          position: 'absolute',
          top: '7rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          padding: '1rem',
          borderRadius: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          textAlign: 'left',
          zIndex: 1000,
          width: '80%'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{searchName}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {searchResult.people_count} <span style={{ fontWeight: 400 }}>personer</span>
          </div>
          <div>{new Date(searchResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      )}

      {/* Karta */}
      <MapContainer
        center={[62.0, 15.0]}
        zoom={5.5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap & CartoDB'
          url={mapStyle}
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
                👥 {info.people_count} personer<br />
                🕒 {new Date(info.timestamp).toLocaleTimeString()}<br />
                {info.alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Ikoner längst ner */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '1rem',
        background: 'white',
        zIndex: 1000
      }}>
        <span>🌙</span>
        <span>👤</span>
        <span>📊</span>
        <span>☰</span>
      </div>
    </div>
  );
}

export default App;
