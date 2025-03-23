import { useEffect, useState, useRef } from 'react';
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const mapRef = useRef<L.Map | null>(null);

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

  const heatmapPoints = data
    ? Object.values(data).map((loc) => [loc.lat, loc.lon, loc.people_count])
    : [];

  const mapStyle = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  // Sökresultat
  const filteredLocations = data
    ? Object.entries(data).filter(([location]) =>
        location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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
          fontSize: 'clamp(1rem, 2vw, 1.5rem)',
        }}
      >
        🇸🇪 Crowd Map Sverige
      </div>

      {/* Sökfält */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}
      >
        <input
          type="text"
          placeholder="🔍 Sök plats, t.ex. 'ICA Maxi Luleå' eller 'A.Ts Krog'"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '300px',
          }}
        />
      </div>

      {/* Toggle-knappar */}
      <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 1000 }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            marginRight: '0.5rem',
            padding: '0.5rem 0.8rem',
            borderRadius: '6px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
          }}
        >
          {darkMode ? '☀️ Ljust' : '🌙 Mörkt'}
        </button>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          style={{
            padding: '0.5rem 0.8rem',
            borderRadius: '6px',
            backgroundColor: showHeatmap ? '#eee' : '#fff',
            border: '1px solid #ccc',
          }}
        >
          {showHeatmap ? '🔵 Dölj Heatmap' : '🔥 Visa Heatmap'}
        </button>
      </div>

      <MapContainer
        center={[62.0, 15.0]}
        zoom={5.5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        whenCreated={(mapInstance: L.Map) => (mapRef.current = mapInstance)}
      >
        <TileLayer attribution="&copy; OpenStreetMap & CartoDB" url={mapStyle} />

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
              1.0: '#f00',
            }}
          />
        )}

        {/* Markörer */}
        {filteredLocations &&
          filteredLocations.map(([location, info]) => (
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
                <strong>{location}</strong>
                <br />
                👥 {info.people_count} personer
                <br />
                🕒 {new Date(info.timestamp).toLocaleTimeString()}
                <br />
                {info.alert && <span style={{ color: 'red' }}>⚠️ Tröskel nådd!</span>}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

export default App;
