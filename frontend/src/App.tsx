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

const CITY_OPTIONS = ["Luleå", "Stockholm", "Göteborg"];

function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<LocationInfo | null>(null);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('Luleå');
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

  useEffect(() => {
    if (!data || searchTerm.trim() === '') {
      setSearchResult(null);
      return;
    }

    const match = Object.entries(data).find(
      ([name, loc]) =>
        name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        loc.city === selectedCity
    );

    if (match) {
      const [name, info] = match;
      setSearchName(name);
      setSearchResult(info);
    } else {
      setSearchResult(null);
    }
  }, [searchTerm, data, selectedCity]);

  const filteredData = data
    ? Object.fromEntries(
        Object.entries(data).filter(([_, loc]) => loc.city === selectedCity)
      )
    : {};

  const mostCrowded = Object.entries(filteredData).reduce(
    (acc, [name, loc]) =>
      !acc || loc.people_count > acc[1].people_count ? [name, loc] : acc,
    null as [string, LocationInfo] | null
  );

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Meny Toggle */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          zIndex: 1000,
        }}
      >
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✖️' : '☰'}
        </button>
      </div>

      {/* Sidomeny */}
      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '3.5rem',
            left: '1rem',
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            zIndex: 1000,
          }}
        >
          <label>
            Välj stad:
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              {CITY_OPTIONS.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="🔍 Sök plats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', width: '100%' }}
            />
            {searchResult && searchName && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>{searchName}</strong><br />
                👥 {searchResult.people_count} personer<br />
                🕒 {new Date(searchResult.timestamp).toLocaleTimeString()}<br />
                {searchResult.alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
              </div>
            )}
          </div>

          {mostCrowded && (
            <div style={{ marginTop: '1rem' }}>
              <strong>📊 Mest folk just nu</strong><br />
              {mostCrowded[0]}<br />
              👥 {mostCrowded[1].people_count} personer
            </div>
          )}
        </div>
      )}

      {/* Karta */}
      <MapContainer
        center={[65.5848, 22.1567]} // Luleå default
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {Object.entries(filteredData).map(([name, info]) => (
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
    </div>
  );
}

export default App;
