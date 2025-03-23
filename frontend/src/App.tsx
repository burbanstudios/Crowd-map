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
  const [searchResult, setSearchResult] = useState<LocationInfo | null>(null);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [mostCrowdedEntry, setMostCrowdedEntry] = useState<[string, LocationInfo] | null>(null);

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

  useEffect(() => {
    if (!data || !selectedCity) {
      setMostCrowdedEntry(null);
      return;
    }

    const filteredEntries = Object.entries(data).filter(
      ([_, info]) => info.city.toLowerCase() === selectedCity.toLowerCase()
    );

    const mostCrowded =
      filteredEntries.length > 0
        ? filteredEntries.reduce<[string, LocationInfo]>((prev, curr) => {
            return curr[1].people_count > prev[1].people_count ? curr : prev;
          })
        : null;

    setMostCrowdedEntry(mostCrowded);
  }, [data, selectedCity]);

  const mapStyle = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Titel */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000 }}>
        <h1>🇸🇪 Crowd Map Sverige</h1>
      </div>

      {/* Sök och meny */}
      <div style={{ position: 'absolute', top: '4rem', left: '1rem', zIndex: 1000 }}>
        <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
          <option value="">Välj stad</option>
          <option value="Luleå">Luleå</option>
          <option value="Stockholm">Stockholm</option>
          <option value="Göteborg">Göteborg</option>
        </select>

        <input
          type="text"
          placeholder="🔍 Sök plats"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '6px' }}
        />

        {searchResult && searchName && (
          <div style={{ marginTop: '0.5rem', background: '#fff', padding: '0.5rem', borderRadius: '6px' }}>
            <strong>{searchName}</strong><br />
            👥 {searchResult.people_count} personer<br />
            🕒 {new Date(searchResult.timestamp).toLocaleTimeString()}<br />
            {searchResult.alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
          </div>
        )}

        {mostCrowdedEntry && (
          <div style={{ marginTop: '1rem', background: '#e0e0e0', padding: '0.5rem', borderRadius: '6px' }}>
            <strong>Mest folk just nu i {selectedCity}:</strong><br />
            📍 {mostCrowdedEntry[0]}<br />
            👥 {mostCrowdedEntry[1].people_count} personer
          </div>
        )}
      </div>

      <MapContainer
        center={[62.0, 15.0]}
        zoom={5.5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
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
    </div>
  );
}

export default App;
