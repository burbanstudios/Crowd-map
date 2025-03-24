import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationInfo {
  lat: number;
  lon: number;
  people_count: number;
  alert: boolean;
  timestamp: string;
  previous?: [number, number];
}

function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);
  const [selectedCity, setSelectedCity] = useState('LULEÅ');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<LocationInfo | null>(null);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [center, setCenter] = useState<[number, number]>([65.5848, 22.1547]);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);

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
      setCenter([info.lat, info.lon]);
    } else {
      setSearchResult(null);
    }
  }, [searchTerm, data]);

  const getMostCrowded = (): [string, LocationInfo] | null => {
    if (!data) return null;
    return Object.entries(data).reduce<[string, LocationInfo] | null>((max, entry) => {
      if (!max || entry[1].people_count > max[1].people_count) {
        return entry as [string, LocationInfo];
      }
      return max;
    }, null);
  };

  const mostCrowded = getMostCrowded();

  const getTrafficLines = () => {
    if (!data || !showTraffic) return null;
    return Object.values(data)
      .filter(loc => loc.previous)
      .map((loc, index) => (
        <Polyline
          key={index}
          positions={[loc.previous!, [loc.lat, loc.lon]]}
          color={loc.alert ? 'red' : 'blue'}
        />
      ));
  };

  const mapStyle = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 1000,
        background: 'white',
        borderRadius: '8px',
        padding: '0.5rem 1rem',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        fontWeight: 'bold'
      }}>
        🇸🇪 Crowd Map Sverige
      </div>

      {/* Search */}
      <div style={{ position: 'absolute', top: '4rem', left: '1rem', zIndex: 1000 }}>
        <input
          type="text"
          placeholder="🔍 Sök plats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', width: '220px' }}
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

      {/* Bottom nav */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        background: 'white',
        padding: '0.5rem 0',
        zIndex: 1000,
        boxShadow: '0 -2px 6px rgba(0,0,0,0.1)'
      }}>
        <button onClick={() => setShowTraffic(!showTraffic)}>
          {showTraffic ? '🚦 Dölj Trafikflöde' : '🚦 Visa Trafikflöde'}
        </button>
        {mostCrowded && (
          <div>
            🔝 Mest folk: <strong>{mostCrowded[0]}</strong> ({mostCrowded[1].people_count})
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer url={mapStyle} />

        {getTrafficLines()}

        {data && Object.entries(data).map(([name, info]) => (
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
