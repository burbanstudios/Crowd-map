import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-eva-icons/style.css';

interface LocationInfo {
  lat: number;
  lon: number;
  people_count: number;
  alert: boolean;
  timestamp: string;
}

function FlyToLocation({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 11);
  }, [lat, lon]);
  return null;
}

function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<LocationInfo | null>(null);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      fetch('https://crowd-map-api.onrender.com/crowd-data')
        .then(res => res.json())
        .then(json => setData(json))
        .catch(err => console.error('Error fetching data:', err));
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data || searchTerm.trim() === '') {
      setSearchResult(null);
      setSearchName(null);
      return;
    }
    const match = Object.entries(data).find(([name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (match) {
      const [name, info] = match;
      setSearchResult(info);
      setSearchName(name);
    } else {
      setSearchResult(null);
      setSearchName(null);
    }
  }, [searchTerm, data]);

  const heatmapPoints = data
    ? Object.values(data).map(loc => [loc.lat, loc.lon, loc.people_count])
    : [];

  const mapStyle = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif', height: '100vh', width: '100vw', position: 'relative' }}>
      {/* LOGO */}
      <div style={{ position: 'absolute', top: '1rem', left: 0, right: 0, textAlign: 'center', zIndex: 1000 }}>
        <span style={{ fontWeight: '900', fontSize: '1.5rem' }}>CROWDED</span>
      </div>

      {/* SÖKFÄLT */}
      <div style={{
        position: 'absolute', top: '3.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
        background: '#fff', padding: '0.75rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <span style={{ marginRight: '0.5rem' }}>🔍</span>
        <input
          type="text"
          placeholder="Sök plats, ex. ICA Maxi Luleå"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: 'none', outline: 'none', fontSize: '1rem', width: '200px' }}
        />
      </div>

      {/* SÖKRESULTAT */}
      {searchResult && searchName && (
        <div style={{
          position: 'absolute', top: '6.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
          background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'left'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{searchName}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{searchResult.people_count} personer</div>
          <div>{new Date(searchResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      )}

      {/* MAP */}
      <MapContainer center={[62.0, 15.0]} zoom={5.5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap & CartoDB' url={mapStyle} />

        {searchResult && <FlyToLocation lat={searchResult.lat} lon={searchResult.lon} />}

        {data && Object.entries(data).map(([location, info]) => (
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

      {/* BOTTOM MENU */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: '#fdfdfd',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #ddd', zIndex: 1000
      }}>
        <span onClick={() => setDarkMode(!darkMode)} style={{ fontSize: '1.4rem' }}>{darkMode ? '🌙' : '☀️'}</span>
        <span style={{ fontSize: '1.4rem' }}>👤</span>
        <span style={{ fontSize: '1.4rem' }}>📈</span>
        <span style={{ fontSize: '1.4rem' }}>☰</span>
      </div>
    </div>
  );
}

export default App;
