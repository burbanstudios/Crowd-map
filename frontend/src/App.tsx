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
  connections?: string[];
}

const cityCenters: Record<string, [number, number]> = {
  "Luleå": [65.5848, 22.1547],
  "Stockholm": [59.3293, 18.0686],
  "Göteborg": [57.7089, 11.9746],
  "Malmö": [55.604981, 13.003822],
};

export default function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<LocationInfo | null>(null);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [zoomTo, setZoomTo] = useState<[number, number] | null>(null);
  const [city, setCity] = useState<string>('Stockholm');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    fetch('https://crowd-map-api.onrender.com/crowd-data')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  useEffect(() => {
    if (!data || searchTerm.trim() === '') {
      setSearchResult(null);
      setNotification(null);
      return;
    }
    const match = Object.entries(data).find(([name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (match) {
      const [name, info] = match;
      setSearchName(name);
      setSearchResult(info);
      setZoomTo([info.lat, info.lon]);

      if (name.toLowerCase().includes("ica maxi luleå")) {
        setNotification("Få 20% rabatt på \u2728 MJÖLK \u2728 \u2013 visa detta i kassan");
      } else {
        setNotification(null);
      }
    } else {
      setSearchResult(null);
      setNotification(null);
    }
  }, [searchTerm, data]);

  const flowLines = data
    ? Object.entries(data).flatMap(([, info]) => {
        if (!info.connections) return [];
        return info.connections.map(target => {
          const to = data[target];
          return to ? [[info.lat, info.lon], [to.lat, to.lon]] : null;
        }).filter(Boolean) as [number, number][][];
      })
    : [];

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* LOGO */}
      <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
        <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '900' }}>CROWDED</h1>
      </div>

      {/* Sökruta */}
      <div style={{ position: 'absolute', top: '4rem', left: '1rem', right: '1rem', zIndex: 1000 }}>
        <input
          type="text"
          placeholder="Sök plats, ex. ICA Maxi Luleå"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem', borderRadius: '2rem', border: '1px solid #ccc' }}
        />
      </div>

      {/* Notis */}
      {notification && (
        <div style={{ position: 'absolute', top: '8rem', left: '1rem', right: '1rem', background: 'white', padding: '1rem', borderRadius: '1rem', zIndex: 1000 }}>
          <strong>Du verkar vara på {searchName}</strong><br />
          {notification}
        </div>
      )}

      {/* Statistikruta */}
      {searchResult && searchName && (
        <div style={{ position: 'absolute', top: notification ? '14rem' : '8rem', left: '1rem', right: '1rem', background: 'white', padding: '1rem', borderRadius: '1rem', zIndex: 1000 }}>
          <strong>{searchName}</strong><br />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{searchResult.people_count}</span> personer<br />
          {new Date(searchResult.timestamp).toLocaleTimeString()}
        </div>
      )}

      {/* Karta */}
      <MapContainer
        center={zoomTo || cityCenters[city]}
        zoom={zoomTo ? 14 : 5.5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer url={darkMode ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} />

        {data && Object.entries(data).map(([name, info]) => (
          <Marker
            key={name}
            position={[info.lat, info.lon]}
            icon={L.icon({
              iconUrl: info.alert ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
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

        {/* Flow-lines */}
        {flowLines.map((line, idx) => (
          <Polyline key={idx} positions={line} pathOptions={{ color: 'blue', weight: 2, opacity: 0.6 }} />
        ))}
      </MapContainer>

      {/* Bottom navbar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fefefe', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #ddd', zIndex: 1000 }}>
        <button onClick={() => setDarkMode(!darkMode)}>🌗</button>
        <button onClick={() => setCity('Luleå')}>📍</button>
        <button onClick={() => setShowStats(!showStats)}>📊</button>
        <button onClick={() => alert('Meny öppnas...')}>☰</button>
      </div>
    </div>
  );
}
