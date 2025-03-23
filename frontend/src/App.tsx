cat > frontend/src/App.tsx << 'EOF'
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationInfo {
  lat: number;
  lon: number;
  people_count: number;
  alert: boolean;
  timestamp: string;
}

function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
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

  const heatmapPoints = data
    ? Object.values(data).map(loc => [loc.lat, loc.lon, loc.people_count])
    : [];

  const mapStyle = darkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Titel */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontWeight: 'bold',
          zIndex: 1000,
          fontSize: 'clamp(1rem, 2vw, 1.5rem)'
        }}
      >
        🇸🇪 Crowd Map Sverige
      </div>

      {/* Sökfält */}
      <div style={{ position: 'absolute', top: '4.5rem', left: '1rem', zIndex: 1000 }}>
        <input
          type="text"
          placeholder="🔍 Sök plats ex. ICA Maxi Luleå"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '250px'
          }}
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

      {/* Knapp-panel */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        zIndex: 1000,
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Ljust' : '🌙 Mörkt'}
        </button>
        <button onClick={() => setShowHeatmap(!showHeatmap)}>
          {showHeatmap ? '🔵 Dölj Heatmap' : '🔥 Visa Heatmap'}
        </button>
      </div>

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

        {/* Heatmap */}
        {showHeatmap && data && (
          <HeatmapLayer
            fitBoundsOnLoad
            fitBoundsOnUpdate
            points={heatmapPoints}
            longitudeExtractor={(m: any) => m[1]}
            latitudeExtractor={(m: any) => m[0]}
            intensityExtractor={(m: any) => m[2]}
            radius={30}
            blur={25}
            maxZoom={11}
            gradient={{
              0.2: '#00f',
              0.4: '#0f0',
              0.6: '#ff0',
              0.8: '#f90',
              1.0: '#f00'
            }}
          />
        )}

        {/* Markörer */}
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
EOF
