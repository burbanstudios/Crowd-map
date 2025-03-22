import { useEffect, useState } from 'react';
import './App.css';

interface LocationInfo {
  lat: number;
  lon: number;
  people_count: number;
  alert: boolean;
  timestamp: string;
}

function App() {
  const [data, setData] = useState<Record<string, LocationInfo> | null>(null);

  useEffect(() => {
    fetch('https://crowd-map-api.onrender.com/crowd-data')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Crowd Map</h1>
      {!data ? (
        <p>Laddar data...</p>
      ) : (
        <ul>
          {Object.entries(data).map(([location, info]) => (
            <li key={location}>
              <strong>{location}</strong>: {info.people_count} personer
              {info.alert && <span style={{ color: 'red' }}> ⚠️ Tröskel nådd!</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
