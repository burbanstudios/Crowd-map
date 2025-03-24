import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

interface LocationInfo {
  lat: number;
  lon: number;
  people_count: number;
  alert: boolean;
  timestamp: string;
}

const cities = {
  "LULEÅ": [65.5848, 22.1547],
  "STOCKHOLM": [59.3342, 18.0675]
};

function App() {
  const [data, setData] = useState<Record<string, LocationInfo>>({});
  const [selectedCity, setSelectedCity] = useState<keyof typeof cities>("LULEÅ");
  const [mapCenter, setMapCenter] = useState<[number, number]>(cities["LULEÅ"]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = () => {
    fetch("https://crowd-map-api.onrender.com/crowd-data")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching data:", err));
  };

  useEffect(() => {
    const center = cities[selectedCity];
    if (center) setMapCenter(center);
  }, [selectedCity]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const suggestions = Object.keys(data).filter((place) =>
      place.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuggestions(suggestions);
  }, [searchTerm, data]);

  const mostCrowded = Object.entries(data)
    .filter(([name]) => name.toLowerCase().includes(selectedCity.toLowerCase()))
    .reduce((max, current) => (current[1].people_count > max[1].people_count ? current : max), ["", { people_count: 0 }] as [string, LocationInfo]);

  const tileURL = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Stadsväljare */}
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 1000 }}>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value as keyof typeof cities)}
          style={{ padding: '0.5rem', borderRadius: '6px' }}
        >
          {Object.keys(cities).map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Sökfält */}
      <div style={{ position: 'absolute', top: '4.2rem', left: '1rem', zIndex: 1000 }}>
        <input
          type="text"
          placeholder="🔍 Sök plats"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', width: '250px', borderRadius: '6px' }}
        />
        {filteredSuggestions.length > 0 && (
          <div style={{ background: '#fff', marginTop: '0.3rem', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto' }}>
            {filteredSuggestions.map((name) => (
              <div
                key={name}
                onClick={() => {
                  setSelectedLocation(name);
                  setSearchTerm(name);
                  setFilteredSuggestions([]);
                  const info = data[name];
                  setMapCenter([info.lat, info.lon]);
                }}
                style={{ padding: '0.3rem 0.5rem', cursor: 'pointer' }}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info-ruta för vald plats */}
      {selectedLocation && data[selectedLocation] && (
        <div style={{ position: 'absolute', top: '10rem', left: '1rem', background: 'white', padding: '0.5rem', borderRadius: '6px', zIndex: 1000 }}>
          <strong>{selectedLocation}</strong><br />
          👥 {data[selectedLocation].people_count} personer<br />
          🕒 {new Date(data[selectedLocation].timestamp).toLocaleTimeString()}<br />
          {data[selectedLocation].alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
        </div>
      )}

      {/* Mest folk just nu */}
      {mostCrowded[0] && (
        <div style={{ position: 'absolute', bottom: '5rem', left: '1rem', background: 'white', padding: '0.5rem', borderRadius: '6px', zIndex: 1000 }}>
          📊 Mest folk just nu i {selectedCity}:<br />
          <strong>{mostCrowded[0]}</strong><br />
          👥 {mostCrowded[1].people_count} personer
        </div>
      )}

      {/* Karta */}
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap & CartoDB' url={tileURL} />
        {Object.entries(data).map(([name, info]) => (
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

      {/* Bottom Navbar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        background: darkMode ? '#111' : '#eee',
        color: darkMode ? '#fff' : '#000',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '1rem 0',
        zIndex: 1000
      }}>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️' : '🌙'}
        </button>
        <button onClick={() => setSearchTerm('')}>
          🔍 Sök
        </button>
        <button onClick={() => window.location.reload()}>
          🔄 Uppdatera
        </button>
      </div>
    </div>
  );
}

export default App;
