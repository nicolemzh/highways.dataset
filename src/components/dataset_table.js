import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from 'papaparse';

const GZ_DATASET_IDS = [
  '2025-06-03-18-21-02', '2025-06-06-06-56-41', '2025-06-10-07-03-48', '2025-06-10-20-31-56',
];

const GZ_DATASETS = new Set([
  '2025-06-03-18-21-02',
  '2025-06-06-06-56-41',
  '2025-06-10-07-03-48',
  '2025-06-10-20-31-56'
]);


// const fetchWithFallback = async (url) => {
//   try {
//     const response = await fetch(url);
//     if (response.ok) {
//       return response.text();
//     }
//     throw new Error('CSV not found');
//   } catch (error) {
//     if (url.endsWith('.csv')) {
//       const gzUrl = url + '.gz';
//       console.error(`CSV failed for ${url}. Trying GZ fallback: ${gzUrl}`);
//       const gzResponse = await fetch(gzUrl);
//       if (gzResponse.ok) {
//         return gzResponse.text();
//       }
//       throw new Error(`Failed to fetch both CSV and GZ for ${url}`);
//     }
//     throw error;
//   }
// };

function DatasetTable({ datasets }) {
  const [mapPoints, setMapPoints] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  
  const sortedDatasets = useMemo(
    () => [...datasets].sort((a, b) => b.id.localeCompare(a.id)),
    [datasets]
  );

  useEffect(() => {
    sortedDatasets.forEach((dataset) => {
      const fetchData = (fileKey, fileName) => {
        const useGz = GZ_DATASET_IDS.includes(dataset.id);
        const fileToFetch = useGz ? fileName.replace('.csv', '.csv.gz') : fileName;
        
        fetch(`${process.env.PUBLIC_URL}/data/${dataset.id}/${fileToFetch}`)
          .then((response) => response.text())
          .then((csvText) => {
            const parsedData = Papa.parse(csvText, { header: true }).data;
            const latLongPoints = parsedData
              .filter((row) => row.lat && row.long)
              .map((row) => ({
                lat: parseFloat(row.lat),
                long: parseFloat(row.long),
                id: dataset.id,
                type: fileKey,
                wave_id: row.wave_id || null,
              }));
            setMapPoints((prevPoints) => ({
              ...prevPoints,
              [dataset.id]: {
                ...prevPoints[dataset.id],
                [fileKey]: latLongPoints,
              },
            }));
          })
          .catch((error) => console.error(`Error fetching ${fileKey} data for dataset:`, error));
      };
      
      if (dataset.preprocessed) {
        fetchData('preprocessed', `${dataset.id}_preprocessed.csv`);
      }
      if (dataset.wave) {
        fetchData('wave', `${dataset.id}_waves.csv`);
      }
    });
  }, [sortedDatasets]);

  const createCustomIcon = (color) =>
    new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [0, -41],
    });

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closePopup = () => {
    setSelectedImage(null);
  };

  const getColorById = (id) => {
    const colors = ['red', 'blue', 'green', 'orange', 'yellow', 'violet', 'black', 'gold', 'grey'];
    return colors[id % colors.length];
  };

  // center map
  const calculateMiddleLatLong = (points) => {
    if (!points || points.length === 0) return [0, 0];
    const middleIndex = Math.floor(points.length / 2);
    return [points[middleIndex].lat, points[middleIndex].long];
  };

  function PreprocessedMap({ dataset, mapPoints, createCustomIcon }) {
    if (GZ_DATASETS.has(dataset.id)) {
      // Use your pre-rendered HTML if gz dataset
      return (
        <iframe
          src={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_preprocessed_map.html`}
          title={`${dataset.id} Preprocessed Map`}
          style={{ width: '100%', height: '200px', border: 'none' }}
        />
      );
    }

    // Normal Leaflet rendering for CSV datasets
    if (mapPoints[dataset.id]?.preprocessed?.length > 0) {
      return (
        <MapContainer
          center={[mapPoints[dataset.id].preprocessed[0].lat, mapPoints[dataset.id].preprocessed[0].long]}
          zoom={8}
          scrollWheelZoom
          style={{ height: '200px', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapPoints[dataset.id].preprocessed
            .filter((_, index) => index % 50 === 0)
            .map((point, index) => (
              <Marker
                key={index}
                position={[point.lat, point.long]}
                icon={createCustomIcon('blue')}
              >
                <Popup>
                  Lat: {point.lat}, Long: {point.long}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      );
    }

    return <p>No preprocessed GPS data available</p>;
  }


  function WaveMap({ dataset, mapPoints, createCustomIcon, getColorById }) {
    if (GZ_DATASETS.has(dataset.id)) {
      // Use your pre-rendered HTML if gz dataset
      return (
        <iframe
          src={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_wave_map.html`}
          title={`${dataset.id} Wave Map`}
          style={{ width: '100%', height: '200px', border: 'none' }}
        />
      );
    }

    // Normal Leaflet rendering for CSV datasets
    if (mapPoints[dataset.id]?.wave?.length > 0) {
      return (
        <MapContainer
          center={[mapPoints[dataset.id].wave[0].lat, mapPoints[dataset.id].wave[0].long]}
          zoom={8}
          scrollWheelZoom
          style={{ height: '200px', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {mapPoints[dataset.id].wave
            .filter((_, index) => index % 50 === 0)
            .map((wave, index) => {
              const color = getColorById(wave.wave_id);
              return (
                <Marker
                  key={index}
                  position={[wave.lat, wave.long]}
                  icon={createCustomIcon(color)}
                >
                  <Popup>
                    Lat: {wave.lat}, Long: {wave.long}, Wave ID: {wave.wave_id || 'N/A'}
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      );
    }

    return <p>No wave GPS data available</p>;
  }

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
          onClick={closePopup}
        >
          <img src={selectedImage} alt="Enlarged view" style={{ maxHeight: '90%', maxWidth: '90%' }} />
        </div>
      )}

      <table className="dataset-table" style={{ width: '100%', height: 'auto' }}>
        <thead>
          <tr>
            {/* columns */}
            <th>Dataset Name</th>
            <th>Preprocessed</th>
            <th>Wave Data</th>
            <th>Time Series</th>
          </tr>
        </thead>
        <tbody>
          {/* MINIMAL CHANGE: render the sorted copy */}
          {sortedDatasets.map((dataset) => {
            const useGz = GZ_DATASET_IDS.includes(dataset.id);
            const preprocessedExt = useGz ? '.csv.gz' : '.csv';
            const waveExt = useGz ? '.csv.gz' : '.csv';

            return (

            <tr key={dataset.id}>
              <td>{dataset.name}</td>

              <td style={{ width: '400px' }}>
                <a href={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_preprocessed${preprocessedExt}`} download>
                  Download Preprocessed Data
                </a>
                <div style={{ height: '200px', marginTop: '10px' }}>
                  {/* preprocessed data map */}
                  {/* {mapPoints[dataset.id]?.preprocessed?.length > 0 ? (
                    <MapContainer
                      center={calculateMiddleLatLong(mapPoints[dataset.id].preprocessed)}
                      zoom={8}
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {mapPoints[dataset.id].preprocessed
                        .filter((_, index) => index % 500 === 0) // graphs every 50th point
                        .map((point, index) => (
                          <Marker
                            key={index}
                            position={[point.lat, point.long]}
                            icon={createCustomIcon('blue')}
                          >
                            <Popup>
                              Lat: {point.lat}, Long: {point.long}
                            </Popup>
                          </Marker>
                        ))}
                    </MapContainer>
                  ) : (
                    <p>No preprocessed GPS data available</p>
                  )} */}
                  <PreprocessedMap
                    dataset={dataset}
                    mapPoints={mapPoints}
                    createCustomIcon={createCustomIcon}
                  />
                </div>
              </td>

              <td style={{ width: '400px' }}>
                <a href={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_waves${waveExt}`} download>
                  Download Wave Data
                </a>
                <div style={{ height: '200px', marginTop: '10px' }}>
                  {/* wave data map */}
                  {/* {mapPoints[dataset.id]?.wave?.length > 0 ? (
                    <MapContainer
                      center={calculateMiddleLatLong(mapPoints[dataset.id].wave)}
                      zoom={8}
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {mapPoints[dataset.id].wave
                        .filter((_, index) => index % 500 === 0) // graphs every 50th point
                        .map((wave, index) => {
                          const color = getColorById(wave.wave_id);
                          return (
                            <Marker
                              key={index}
                              position={[wave.lat, wave.long]}
                              icon={createCustomIcon(color)}
                            >
                              <Popup>
                                Lat: {wave.lat}, Long: {wave.long}, Wave ID: {wave.wave_id || 'N/A'}
                              </Popup>
                            </Marker>
                          );
                        })}
                    </MapContainer>
                  ) : (
                    <p>No wave GPS data available</p>
                  )} */}
                  <WaveMap
                    dataset={dataset}
                    mapPoints={mapPoints}
                    createCustomIcon={createCustomIcon}
                    getColorById={getColorById}
                  />
                </div>
              </td>

              {/* charts/graphs */}
              <td>
                {dataset.time_velocity_graph && (
                  <img
                    src={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_time_velocity_graph.png`}
                    alt={`${dataset.name} Velocity Graph`}
                    style={{ width: '250px', cursor: 'pointer' }}
                    onClick={() => handleImageClick(dataset.time_velocity_graph)}
                  />
                )}
                {dataset.time_acceleration_graph && (
                  <img
                    src={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_time_acceleration_graph.png`}
                    alt={`${dataset.name} Acceleration Graph`}
                    style={{ width: '250px', cursor: 'pointer' }}
                    onClick={() => handleImageClick(dataset.time_acceleration_graph)}
                  />
                )}
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default DatasetTable;
