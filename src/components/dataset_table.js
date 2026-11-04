import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from 'papaparse';

const GZ_DATASET_IDS = [
  '2025-06-03-18-21-02', '2025-06-06-06-56-41', '2025-06-10-07-03-48', '2025-06-10-20-31-56',
];

const GZ_DATASETS = new Set(GZ_DATASET_IDS);

// Start loading a row's map data when it is within this distance of the screen.
const PRELOAD_MARGIN = '800px';

// Marker icons are created once and reused (previously a new icon per marker per render).
const iconCache = {};
const createCustomIcon = (color) => {
  if (!iconCache[color]) {
    iconCache[color] = new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41],
    });
  }
  return iconCache[color];
};

const getColorById = (id) => {
  const colors = ['red', 'blue', 'green', 'orange', 'yellow', 'violet', 'black', 'gold', 'grey'];
  return colors[id % colors.length];
};

// Same parsing as before: keep rows that have lat/long.
const fetchPoints = (dataset, fileKey, fileName) =>
  fetch(`${process.env.PUBLIC_URL}/data/${dataset.id}/${fileName}`)
    .then((response) => response.text())
    .then((csvText) =>
      Papa.parse(csvText, { header: true }).data
        .filter((row) => row.lat && row.long)
        .map((row) => ({
          lat: parseFloat(row.lat),
          long: parseFloat(row.long),
          id: dataset.id,
          type: fileKey,
          wave_id: row.wave_id || null,
        }))
    )
    .catch((error) => {
      console.error(`Error fetching ${fileKey} data for dataset:`, error);
      return [];
    });

// Defined outside DatasetTable so the maps are not torn down and rebuilt on every
// state change (that rebuild is what caused the Leaflet "_leaflet_pos" error).
function PreprocessedMap({ dataset, points, loaded }) {
  if (GZ_DATASETS.has(dataset.id)) {
    // pre-rendered HTML for the gz datasets
    return (
      <iframe
        src={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_preprocessed_map.html`}
        title={`${dataset.id} Preprocessed Map`}
        loading="lazy"
        style={{ width: '100%', height: '200px', border: 'none' }}
      />
    );
  }

  if (points?.length > 0) {
    return (
      <MapContainer
        center={[points[0].lat, points[0].long]}
        zoom={8}
        scrollWheelZoom
        zoomAnimation={false}
        style={{ height: '200px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points
          .filter((_, index) => index % 50 === 0)
          .map((point, index) => (
            <Marker key={index} position={[point.lat, point.long]} icon={createCustomIcon('blue')}>
              <Popup>
                Lat: {point.lat}, Long: {point.long}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    );
  }

  return <p>{loaded ? 'No preprocessed GPS data available' : 'Loading map…'}</p>;
}

function WaveMap({ dataset, points, loaded }) {
  if (GZ_DATASETS.has(dataset.id)) {
    return (
      <iframe
        src={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_wave_map.html`}
        title={`${dataset.id} Wave Map`}
        loading="lazy"
        style={{ width: '100%', height: '200px', border: 'none' }}
      />
    );
  }

  if (points?.length > 0) {
    return (
      <MapContainer
        center={[points[0].lat, points[0].long]}
        zoom={8}
        scrollWheelZoom
        zoomAnimation={false}
        style={{ height: '200px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points
          .filter((_, index) => index % 50 === 0)
          .map((wave, index) => (
            <Marker key={index} position={[wave.lat, wave.long]} icon={createCustomIcon(getColorById(wave.wave_id))}>
              <Popup>
                Lat: {wave.lat}, Long: {wave.long}, Wave ID: {wave.wave_id || 'N/A'}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    );
  }

  return <p>{loaded ? 'No wave GPS data available' : 'Loading map…'}</p>;
}

// One table row. Its CSVs are only downloaded once the row is near the screen,
// so opening a year no longer downloads every trip's data up front.
function DatasetRow({ dataset, onImageClick }) {
  const rowRef = useRef(null);
  const [nearScreen, setNearScreen] = useState(false);
  const [points, setPoints] = useState({ preprocessed: null, wave: null });
  const [loaded, setLoaded] = useState({ preprocessed: false, wave: false });

  const useGz = GZ_DATASETS.has(dataset.id);
  const ext = useGz ? '.csv.gz' : '.csv';

  useEffect(() => {
    if (nearScreen || !rowRef.current) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setNearScreen(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNearScreen(true);
          observer.disconnect();
        }
      },
      { rootMargin: PRELOAD_MARGIN }
    );
    observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [nearScreen]);

  useEffect(() => {
    if (!nearScreen || useGz) return undefined; // gz datasets use the pre-rendered HTML maps
    let cancelled = false;
    const load = (fileKey, fileName) =>
      fetchPoints(dataset, fileKey, fileName).then((pts) => {
        if (cancelled) return;
        setPoints((prev) => ({ ...prev, [fileKey]: pts }));
        setLoaded((prev) => ({ ...prev, [fileKey]: true }));
      });
    if (dataset.preprocessed) load('preprocessed', `${dataset.id}_preprocessed.csv`);
    else setLoaded((prev) => ({ ...prev, preprocessed: true }));
    if (dataset.wave) load('wave', `${dataset.id}_waves.csv`);
    else setLoaded((prev) => ({ ...prev, wave: true }));
    return () => {
      cancelled = true;
    };
  }, [nearScreen, useGz, dataset]);

  return (
    <tr ref={rowRef}>
      <td>{dataset.name}</td>

      <td style={{ width: '400px' }}>
        <a href={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_preprocessed${ext}`} download>
          Download Preprocessed Data
        </a>
        <div style={{ height: '200px', marginTop: '10px' }}>
          <PreprocessedMap dataset={dataset} points={points.preprocessed} loaded={loaded.preprocessed} />
        </div>
      </td>

      <td style={{ width: '400px' }}>
        <a href={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_waves${ext}`} download>
          Download Wave Data
        </a>
        <div style={{ height: '200px', marginTop: '10px' }}>
          <WaveMap dataset={dataset} points={points.wave} loaded={loaded.wave} />
        </div>
      </td>

      {/* charts/graphs */}
      <td>
        {dataset.time_velocity_graph && (
          <img
            src={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_time_velocity_graph.png`}
            alt={`${dataset.name} Velocity Graph`}
            style={{ width: '250px', cursor: 'pointer' }}
            onClick={() => onImageClick(dataset.time_velocity_graph)}
          />
        )}
        {dataset.time_acceleration_graph && (
          <img
            src={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_time_acceleration_graph.png`}
            alt={`${dataset.name} Acceleration Graph`}
            style={{ width: '250px', cursor: 'pointer' }}
            onClick={() => onImageClick(dataset.time_acceleration_graph)}
          />
        )}
      </td>
    </tr>
  );
}

function DatasetTable({ datasets }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const sortedDatasets = useMemo(
    () => [...datasets].sort((a, b) => b.id.localeCompare(a.id)),
    [datasets]
  );

  return (
    <>
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img src={selectedImage} alt="Enlarged view" style={{ maxHeight: '90%', maxWidth: '90%' }} />
        </div>
      )}

      <table className="dataset-table" style={{ width: '100%', height: 'auto' }}>
        <thead>
          <tr>
            <th>Dataset Name</th>
            <th>Preprocessed</th>
            <th>Wave Data</th>
            <th>Time Series</th>
          </tr>
        </thead>
        <tbody>
          {sortedDatasets.map((dataset) => (
            <DatasetRow key={dataset.id} dataset={dataset} onImageClick={setSelectedImage} />
          ))}
        </tbody>
      </table>
    </>
  );
}

export default DatasetTable;
