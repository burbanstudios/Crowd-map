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
  const [selectedCity, setSelectedCity] = useState('');
  const [mostCrowded, setMostCrowded] = useState<{ name: string; info: LocationInfo } | null>(null);

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
    if (!data || searchTerm.trim() === '' || !selectedCity) {
      setSearchResult(null);
      return;
    }
    const filtered = Object.entries(data).filter(
      ([, info]) => info.city.toLowerCase() === selectedCity.toLowerCase()
    );
    const match = filtered.find(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (match) {
      const [name, info] = match;
      setSearchName(name);
      setSearchResult(info);
    } else {
      setSearchResult(null);
    }
  }, [searchTerm, data, selectedCity]);

  useEffect(() => {
    if (!data || !selectedCity) {
      setMostCrowded(null);
      return;
    }
    const cityPlaces = Object.entries(data).filter(([, info]) => info.city.toLowerCase() === selectedCity.toLowerCase());
    const sorted = cityPlaces.sort((a, b) => b[1].people_count - a[1].people_count);
    if (sorted.length > 0) {
      setMostCrowded({ name: sorted[0][0], info: sorted[0][1] });
    }
  }, [data, selectedCity]);

  const filteredData = data
    ? Object.fromEntries(
        Object.entries(data).filter(
          ([, info]) => info.city.toLowerCase() === selectedCity.toLowerCase()
        )
      )
    : null;

  const mapCenter = filteredData
    ? Object.values(filteredData)[0]
      ? [Object.values(filteredData)[0].lat, Object.values(filteredData)[0].lon]
      : [62.0, 15.0]
    : [62.0, 15.0];

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative', fontFamily: 'Roboto, sans-serif' }}>
      {/* Header */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000 }}>
        <h1 style={{ fontSize: '1.5rem', color: '#fff', background: '#222', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          🇸🇪 Crowd Map Sverige
        </h1>
      </div>

      {/* Stadsväljare */}
      <div style={{ position: 'absolute', top: '5rem', left: '1rem', zIndex: 1000 }}>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', width: '250px' }}
        >
          <option value="">🌍 Välj plats</option>
          <option value="Luleå">Luleå</option>
          <option value="Umeå">Umeå</option>
          <option value="Stockholm">Stockholm</option>
        </select>
      </div>

      {/* Sökfält */}
      {selectedCity && (
        <div style={{ position: 'absolute', top: '9rem', left: '1rem', zIndex: 1000 }}>
          <input
            type="text"
            placeholder="🔍 Sök plats i {selectedCity}"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc', width: '250px' }}
          />
          {searchResult && searchName && (
            <div style={{ marginTop: '0.5rem', background: '#fff', padding: '0.5rem', borderRadius: '6px' }}>
              <strong>{searchName}</strong><br />
              👥 {searchResult.people_count} personer<br />
              🕒 {new Date(searchResult.timestamp).toLocaleTimeString()}<br />
              {searchResult.alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
            </div>
          )}
        </div>
      )}

      {/* Statistik-panel */}
      {mostCrowded && (
        <div style={{ position: 'absolute', top: '15rem', left: '1rem', zIndex: 1000, background: '#fff', padding: '0.5rem', borderRadius: '6px' }}>
          📊 Mest folk just nu i {selectedCity}:<br />
          <strong>{mostCrowded.name}</strong><br />
          👥 {mostCrowded.info.people_count} personer
        </div>
      )}

      <MapContainer
        center={mapCenter as [number, number]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

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
    </div>
  );
}

export default App;
