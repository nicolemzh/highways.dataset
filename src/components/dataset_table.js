import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from 'papaparse';

function DatasetTable({ datasets }) {
  const [mapPoints, setMapPoints] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  datasets.sort((a, b) => b.id.localeCompare(a.id));

  useEffect(() => {
    datasets.forEach((dataset) => {
      const fetchData = (fileKey, fileName) => {
        fetch(`${process.env.PUBLIC_URL}/data/${dataset.id}/${fileName}`)
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
  }, [datasets]);

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
          {datasets.map((dataset) => (
            <tr key={dataset.id}>
              <td>{dataset.name}</td>

              <td style={{ width: '400px' }}>
                <a href={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_preprocessed.csv`} download>
                  Download Preprocessed Data
                </a>
                <div style={{ height: '200px', marginTop: '10px' }}>
                  {/* preprocessed data map */}
                  {mapPoints[dataset.id]?.preprocessed?.length > 0 ? (
                    <MapContainer
                      center={calculateMiddleLatLong(mapPoints[dataset.id].preprocessed)}
                      zoom={8}
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {mapPoints[dataset.id].preprocessed
                      .filter((_, index) => index % 50 === 0) // graphs every 50th point
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
                    <p>No preprocessed data available</p>
                  )}
                </div>
              </td>

              <td style={{ width: '400px' }}>
                <a href={`${process.env.PUBLIC_URL}/data/${dataset.id}/${dataset.id}_waves.csv`} download>
                  Download Wave Data
                </a>
                <div style={{ height: '200px', marginTop: '10px' }}>
                  {/* wave data map */}
                  {mapPoints[dataset.id]?.wave?.length > 0 ? (
                    <MapContainer
                      center={calculateMiddleLatLong(mapPoints[dataset.id].wave)}
                      zoom={8}
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {mapPoints[dataset.id].wave
                        .filter((_, index) => index % 50 === 0) // graphs every 50th point
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
                    <p>No wave data available</p>
                  )}
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
          ))}
        </tbody>
      </table>
    </>
  );
}

export default DatasetTable;
