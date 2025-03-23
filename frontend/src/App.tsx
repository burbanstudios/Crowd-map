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
  const [selectedCity, setSelectedCity] = useState<string>('Alla');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<{ name: string; info: LocationInfo } | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

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
    ? Object.entries(data).filter(([, info]) =>
        selectedCity === 'Alla' || info.city.toLowerCase() === selectedCity.toLowerCase()
      )
    : [];

  useEffect(() => {
    if (!data || searchTerm.trim() === '') {
      setSearchResult(null);
      return;
    }
    const match = Object.entries(data).find(([name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCity === 'Alla' || data[name].city.toLowerCase() === selectedCity.toLowerCase())
    );
    if (match) {
      const [name, info] = match;
      setSearchResult({ name, info });
    } else {
      setSearchResult(null);
    }
  }, [searchTerm, selectedCity, data]);

  const mostCrowded = filteredData.reduce((prev, curr) =>
    curr[1].people_count > prev[1].people_count ? curr : prev,
    filteredData[0] || ['', { lat: 0, lon: 0, people_count: 0, alert: false, timestamp: '', city: '' }]
  );

  const mapStyle = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', fontFamily: 'Roboto, sans-serif' }}>
      {/* Top Bar */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ padding: '0.5rem', fontSize: '1rem' }}>☰ Meny</button>
      </div>

      {/* Sidebar Menu */}
      {menuOpen && (
        <div style={{ position: 'absolute', top: 50, left: 10, zIndex: 1000, background: '#222', color: '#fff', padding: '1rem', borderRadius: '8px' }}>
          <label>Välj stad:</label><br />
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            <option>Alla</option>
            <option>Luleå</option>
            <option>Stockholm</option>
            <option>Uppsala</option>
            <option>Malmö</option>
            <option>Göteborg</option>
          </select>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
        <input
          type="text"
          placeholder="🔍 Sök plats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', width: '250px' }}
        />
        {searchResult && (
          <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '6px', marginTop: '0.5rem' }}>
            <strong>{searchResult.name}</strong><br />
            👥 {searchResult.info.people_count} personer<br />
            🕒 {new Date(searchResult.info.timestamp).toLocaleTimeString()}<br />
            {searchResult.info.alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
          </div>
        )}
      </div>

      {/* Statistikpanel */}
      <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 1000, background: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 500 }}>
        📊 Mest folk just nu i {selectedCity === 'Alla' ? 'Sverige' : selectedCity}:<br />
        {mostCrowded[0] ? (
          <span><strong>{mostCrowded[0]}</strong> – {mostCrowded[1].people_count} personer</span>
        ) : (
          <span>Ingen data</span>
        )}
      </div>

      {/* Map */}
      <MapContainer center={[62.0, 15.0]} zoom={5.5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer attribution='&copy; OpenStreetMap & CartoDB' url={mapStyle} />
        {filteredData.map(([location, info]) => (
          <Marker
            key={location}
            position={[info.lat, info.lon]}
            icon={L.icon({
              iconUrl: info.alert ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
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
    </div>
  );
}

export default App;git add frontend/src/App.tsx

