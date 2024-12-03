import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Papa from 'papaparse';


function DatasetTable({ datasets }) {
  const [waveData, setWaveData] = useState({});
  const [preprocessedData, setPreprocessedData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  datasets.sort((a, b) => b.id.localeCompare(a.id));

  // gets data from backend (now using relative URLs)
  useEffect(() => {
    datasets.forEach((dataset) => {
      if (dataset.wave) {
        fetch(`/data/${dataset.id}/${dataset.id}_waves.csv`)  // Assuming CSV files are in public/data
          .then((response) => response.text()) // Fetch CSV as text
          .then((csvText) => {
            // Parse the CSV (you can use a library like PapaParse if needed)
            const parsedData = Papa.parse(csvText, { header: true });
            console.log('Parsed wave data:', parsedData.data);
            setWaveData((prevData) => ({
              ...prevData,
              [dataset.id]: parsedData.data,
            }));
          })
          .catch((error) => {
            console.error('Error fetching wave data for dataset:', error);
          });
      }

      if (dataset.preprocessed) {
        fetch(`/data/${dataset.id}/${dataset.id}_preprocessed.csv`)  // Assuming CSV files are in public/data
          .then((response) => response.text()) // Fetch CSV as text
          .then((csvText) => {
            // Parse the CSV (you can use a library like PapaParse if needed)
            const parsedData = Papa.parse(csvText, { header: true });
            console.log('Parsed wave data:', parsedData.data);
            setPreprocessedData((prevData) => ({
              ...prevData,
              [dataset.id]: parsedData.data,
            }));
          })
          .catch((error) => {
            console.error('Error fetching preprocessed data for dataset:', error);
          });
      }
    });
  }, [datasets]);

  const getColorById = (id) => {
    const colors = ['red', 'blue', 'green', 'orange', 'yellow', 'violet', 'black', 'gold', 'grey'];
    return colors[id % colors.length];
  };

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

  return (
    <>
      {/* Image Popup */}
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

              {/* Preprocessed Map Column */}
              <td style={{ position: 'relative', width: '400px' }}>
                <a href={`/data/${dataset.id}/${dataset.id}_preprocessed.csv`} download>
                  Download Preprocessed Data
                </a>
                <div style={{ margin: '10px 0' }}></div>
                <div style={{ height: 'auto', width: '100%', overflow: 'hidden' }}>
                  {/* {preprocessedData[dataset.id] && preprocessedData[dataset.id].length > 0 ? (
                    <MapContainer
                      center={[
                        preprocessedData[dataset.id][Math.floor(preprocessedData[dataset.id].length / 2)].lat,
                        preprocessedData[dataset.id][Math.floor(preprocessedData[dataset.id].length / 2)].long,
                      ]}
                      zoom={8}
                      scrollWheelZoom={true}
                      style={{ height: '200px', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {preprocessedData[dataset.id]
                        .filter((_, index) => index % 20 === 0)
                        .map((data, index) => (
                          <Marker
                            key={index}
                            position={[data.lat, data.long]}
                            icon={new L.Icon({
                              iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png`,
                              iconSize: [25, 41],
                              iconAnchor: [12, 41],
                              popupAnchor: [0, -41],
                            })}
                          >
                            <Popup>
                              Lat: {data.lat}, Lon: {data.long}
                            </Popup>
                          </Marker>
                        ))}
                    </MapContainer>
                  ) : (
                    <p>No valid wave data available</p>
                  )} */}
                </div>
              </td>

              {/* Wave Map Column */}
              <td style={{ position: 'relative', width: '400px' }}>
                <a href={`/data/${dataset.id}/${dataset.id}_waves.csv`} download>
                  Download Wave Data
                </a>
                <div style={{ margin: '10px 0' }}></div>
                <div style={{ height: 'auto', width: '100%', overflow: 'hidden' }}>
                  {/* {
                    waveData[dataset.id] && waveData[dataset.id].length > 0 ? (
                      <MapContainer
                        center={[
                          waveData[dataset.id][Math.floor(waveData[dataset.id].length / 2)].lat,
                          waveData[dataset.id][Math.floor(waveData[dataset.id].length / 2)].long,
                        ]}
                        zoom={8}
                        scrollWheelZoom={true}
                        style={{ height: '200px', width: '100%' }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {waveData[dataset.id]
                          .filter((_, index) => index % 10 === 0)
                          .map((wave, index) => {
                            const color = getColorById(wave.wave_id);
                            return (
                              <Marker
                                key={index}
                                position={[wave.lat, wave.long]}
                                icon={createCustomIcon(color)}
                              >
                                <Popup>
                                  Lat: {wave.lat}, Lon: {wave.long}, Wave ID: {wave.wave_id}
                                </Popup>
                              </Marker>
                            );
                          })} */}
                      {/* </MapContainer>
                    ) : (
                      <p>No valid wave data available</p>
                    )
                  } */}

                </div>
              </td>

              {/* Time Series Images */}
              <td>
                {dataset.time_velocity_graph && (
                  <>
                    {console.log('Velocity Graph src:', dataset.time_velocity_graph)} {/* Log the source URL */}
                    <img
                      src={dataset.time_velocity_graph}
                      alt={`${dataset.name} Velocity Graph`}
                      style={{ width: '250px', height: 'auto', cursor: 'pointer' }}
                      onClick={() => handleImageClick(dataset.time_velocity_graph)}
                    />
                  </>
                )}
                {dataset.time_acceleration_graph && (
                  <>
                    {console.log('Acceleration Graph src:', dataset.time_acceleration_graph)} {/* Log the source URL */}
                    <img
                      src={dataset.time_acceleration_graph}
                      alt={`${dataset.name} Acceleration Graph`}
                      style={{ width: '250px', height: 'auto', cursor: 'pointer' }}
                      onClick={() => handleImageClick(dataset.time_acceleration_graph)}
                    />
                  </>
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
