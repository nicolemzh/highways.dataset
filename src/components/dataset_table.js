// import React, { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import Papa from 'papaparse';


// function DatasetTable({ datasets }) {
//   const [waveData, setWaveData] = useState({});
//   const [preprocessedData, setPreprocessedData] = useState({});
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [mapPoints, setMapPoints] = useState([]);

//   datasets.sort((a, b) => b.id.localeCompare(a.id));

//   // gets data from backend (now using relative URLs)
//   useEffect(() => {
//     datasets.forEach((dataset) => {
//       if (dataset.wave) {
//         fetch(`/data/${dataset.id}/${dataset.id}_waves.csv`)
//           .then((response) => response.text())
//           .then((csvText) => {
//             const parsedData = Papa.parse(csvText, { header: true });
//             setWaveData((prevData) => ({
//               ...prevData,
//               [dataset.id]: parsedData.data,
//             }));
//           })
//           .catch((error) => {
//             console.error('Error fetching wave data for dataset:', error);
//           });
//       }

//       if (dataset.preprocessed) {
//         fetch(`/data/${dataset.id}/${dataset.id}_preprocessed.csv`)
//           .then((response) => response.text())
//           .then((csvText) => {
//             const parsedData = Papa.parse(csvText, { header: true });
//             const latLongPoints = parsedData.data
//               .filter((row) => row.lat && row.long)
//               .map((row) => ({
//                 lat: parseFloat(row.lat),
//                 long: parseFloat(row.long),
//                 id: dataset.id,
//               }));
//             setMapPoints((prevPoints) => [...prevPoints, ...latLongPoints]);
//             setPreprocessedData((prevData) => ({
//               ...prevData,
//               [dataset.id]: parsedData.data,
//             }));
//           })
//           .catch((error) => {
//             console.error('Error fetching preprocessed data for dataset:', error);
//           });
//       }
//     });
//   }, [datasets]);
//   // useEffect(() => {
//   //   datasets.forEach((dataset) => {
//   //     if (dataset.wave) {
//   //       fetch(`/data/${dataset.id}/${dataset.id}_waves.csv`)  // Assuming CSV files are in public/data
//   //         .then((response) => response.text()) // Fetch CSV as text
//   //         .then((csvText) => {
//   //           // Parse the CSV (you can use a library like PapaParse if needed)
//   //           const parsedData = Papa.parse(csvText, { header: true });
//   //           console.log('Parsed wave data:', parsedData.data);
//   //           setWaveData((prevData) => ({
//   //             ...prevData,
//   //             [dataset.id]: parsedData.data,
//   //           }));
//   //         })
//   //         .catch((error) => {
//   //           console.error('Error fetching wave data for dataset:', error);
//   //         });
//   //     }

//   //     if (dataset.preprocessed) {
//   //       fetch(`/data/${dataset.id}/${dataset.id}_preprocessed.csv`)  // Assuming CSV files are in public/data
//   //         .then((response) => response.text()) // Fetch CSV as text
//   //         .then((csvText) => {
//   //           // Parse the CSV (you can use a library like PapaParse if needed)
//   //           const parsedData = Papa.parse(csvText, { header: true });
//   //           const latLongPoints = parsedData.data
//   //             .filter((row) => row.lat && row.long) // Ensure lat/long exists
//   //             .map((row) => ({
//   //               lat: parseFloat(row.lat),
//   //               long: parseFloat(row.long),
//   //               id: dataset.id,
//   //               additionalInfo: row.additionalInfo || '', // Optional additional info
//   //             }));
//   //           setMapPoints((prevPoints) => [...prevPoints, ...latLongPoints]);

//   //           setPreprocessedData((prevData) => ({
//   //             ...prevData,
//   //             [dataset.id]: parsedData.data,
//   //           }));
//   //         })
//   //         .catch((error) => {
//   //           console.error('Error fetching preprocessed data for dataset:', error);
//   //         });
//   //         //   console.log('Parsed wave data:', parsedData.data);
//   //         //   setPreprocessedData((prevData) => ({
//   //         //     ...prevData,
//   //         //     [dataset.id]: parsedData.data,
//   //         //   }));
//   //         // })
//   //         // .catch((error) => {
//   //         //   console.error('Error fetching preprocessed data for dataset:', error);
//   //         // });
//   //     }
//   //   });
//   // }, [datasets]);

//   const getColorById = (id) => {
//     const colors = ['red', 'blue', 'green', 'orange', 'yellow', 'violet', 'black', 'gold', 'grey'];
//     return colors[id % colors.length];
//   };

//   const createCustomIcon = (color) =>
//     new L.Icon({
//       iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
//       iconSize: [25, 41],
//       iconAnchor: [12, 41],
//       popupAnchor: [0, -41],
//     });

//   const handleImageClick = (image) => {
//     setSelectedImage(image);
//   };

//   const closePopup = () => {
//     setSelectedImage(null);
//   };

//   return (
//     <>
//       {/* Image Popup */}
//       {selectedImage && (
//         <div
//           style={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             width: '100vw',
//             height: '100vh',
//             backgroundColor: 'rgba(0, 0, 0, 0.8)',
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             zIndex: 1000,
//           }}
//           onClick={closePopup}
//         >
//           <img src={selectedImage} alt="Enlarged view" style={{ maxHeight: '90%', maxWidth: '90%' }} />
//         </div>
//       )}

//       <table className="dataset-table" style={{ width: '100%', height: 'auto' }}>
//         <thead>
//           <tr>
//             <th>Dataset Name</th>
//             <th>Preprocessed</th>
//             <th>Wave Data</th>
//             <th>Time Series</th>
//           </tr>
//         </thead>
//         {
//         // <tbody>
//         //   {datasets.map((dataset) => (
//         //     <tr key={dataset.id}>
//         //       <td>{dataset.name}</td>

//         //       {/* Preprocessed Map Column */}
//         //       <td style={{ position: 'relative', width: '400px' }}>
//         //         <a href={`/data/${dataset.id}/${dataset.id}_preprocessed.csv`} download>
//         //           Download Preprocessed Data
//         //         </a>
//         //         <div style={{ margin: '10px 0' }}></div>
//         //         <div style={{ height: 'auto', width: '100%', overflow: 'hidden' }}>
//         //           {/* {preprocessedData[dataset.id] && preprocessedData[dataset.id].length > 0 ? (
//         //             <MapContainer
//         //               center={[
//         //                 preprocessedData[dataset.id][Math.floor(preprocessedData[dataset.id].length / 2)].lat,
//         //                 preprocessedData[dataset.id][Math.floor(preprocessedData[dataset.id].length / 2)].long,
//         //               ]}
//         //               zoom={8}
//         //               scrollWheelZoom={true}
//         //               style={{ height: '200px', width: '100%' }}
//         //             >
//         //               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//         //               {preprocessedData[dataset.id]
//         //                 .filter((_, index) => index % 20 === 0)
//         //                 .map((data, index) => (
//         //                   <Marker
//         //                     key={index}
//         //                     position={[data.lat, data.long]}
//         //                     icon={new L.Icon({
//         //                       iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png`,
//         //                       iconSize: [25, 41],
//         //                       iconAnchor: [12, 41],
//         //                       popupAnchor: [0, -41],
//         //                     })}
//         //                   >
//         //                     <Popup>
//         //                       Lat: {data.lat}, Lon: {data.long}
//         //                     </Popup>
//         //                   </Marker>
//         //                 ))}
//         //             </MapContainer>
//         //           ) : (
//         //             <p>No valid wave data available</p>
//         //           )} */}
//         //         </div>
//         //       </td>

//         //       {/* Wave Map Column */}
//         //       <td style={{ position: 'relative', width: '400px' }}>
//         //         <a href={`/data/${dataset.id}/${dataset.id}_waves.csv`} download>
//         //           Download Wave Data
//         //         </a>
//         //         <div style={{ margin: '10px 0' }}></div>
//         //         <div style={{ height: 'auto', width: '100%', overflow: 'hidden' }}>
//         //           {/* {
//         //             waveData[dataset.id] && waveData[dataset.id].length > 0 ? (
//         //               <MapContainer
//         //                 center={[
//         //                   waveData[dataset.id][Math.floor(waveData[dataset.id].length / 2)].lat,
//         //                   waveData[dataset.id][Math.floor(waveData[dataset.id].length / 2)].long,
//         //                 ]}
//         //                 zoom={8}
//         //                 scrollWheelZoom={true}
//         //                 style={{ height: '200px', width: '100%' }}
//         //               >
//         //                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//         //                 {waveData[dataset.id]
//         //                   .filter((_, index) => index % 10 === 0)
//         //                   .map((wave, index) => {
//         //                     const color = getColorById(wave.wave_id);
//         //                     return (
//         //                       <Marker
//         //                         key={index}
//         //                         position={[wave.lat, wave.long]}
//         //                         icon={createCustomIcon(color)}
//         //                       >
//         //                         <Popup>
//         //                           Lat: {wave.lat}, Lon: {wave.long}, Wave ID: {wave.wave_id}
//         //                         </Popup>
//         //                       </Marker>
//         //                     );
//         //                   })} */}
//         //               {/* </MapContainer>
//         //             ) : (
//         //               <p>No valid wave data available</p>
//         //             )
//         //           } */}

//         //         </div>
//         //       </td>

//         //       {/* Time Series Images */}
//         //       <td>
//         //         {dataset.time_velocity_graph && (
//         //           <>
//         //             {console.log('Velocity Graph src:', dataset.time_velocity_graph)} {/* Log the source URL */}
//         //             <img
//         //               src={dataset.time_velocity_graph}
//         //               alt={`${dataset.name} Velocity Graph`}
//         //               style={{ width: '250px', height: 'auto', cursor: 'pointer' }}
//         //               onClick={() => handleImageClick(dataset.time_velocity_graph)}
//         //             />
//         //           </>
//         //         )}
//         //         {dataset.time_acceleration_graph && (
//         //           <>
//         //             {console.log('Acceleration Graph src:', dataset.time_acceleration_graph)} {/* Log the source URL */}
//         //             <img
//         //               src={dataset.time_acceleration_graph}
//         //               alt={`${dataset.name} Acceleration Graph`}
//         //               style={{ width: '250px', height: 'auto', cursor: 'pointer' }}
//         //               onClick={() => handleImageClick(dataset.time_acceleration_graph)}
//         //             />
//         //           </>
//         //         )}
//         //       </td>
//         //     </tr>
//         //   ))}
//         // </tbody>
//         }
//         <tbody>
//           {datasets.map((dataset) => (
//             <tr key={dataset.id}>
//               <td>{dataset.name}</td>

//               <td style={{ position: 'relative', width: '400px' }}>
//                 <a href={`/data/${dataset.id}/${dataset.id}_preprocessed.csv`} download>
//                   Download Preprocessed Data
//                 </a>
//                 <div style={{ height: '200px', marginTop: '10px' }}>
//                   {preprocessedData[dataset.id] && preprocessedData[dataset.id].length > 0 ? (
//                     <MapContainer
//                       center={[
//                         preprocessedData[dataset.id][0]?.lat || 0,
//                         preprocessedData[dataset.id][0]?.long || 0,
//                       ]}
//                       zoom={8}
//                       scrollWheelZoom={true}
//                       style={{ height: '100%', width: '100%' }}
//                     >
//                       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                       {preprocessedData[dataset.id].map((data, index) => (
//                         <Marker
//                           key={index}
//                           position={[data.lat, data.long]}
//                           icon={createCustomIcon('blue')}
//                         >
//                           <Popup>
//                             Lat: {data.lat}, Long: {data.long}
//                           </Popup>
//                         </Marker>
//                       ))}
//                     </MapContainer>
//                   ) : (
//                     <p>No preprocessed data available</p>
//                   )}
//                 </div>
//               </td>

//               <td style={{ position: 'relative', width: '400px' }}>
//                 <a href={`/data/${dataset.id}/${dataset.id}_waves.csv`} download>
//                   Download Wave Data
//                 </a>
//                 <div style={{ height: '200px', marginTop: '10px' }}>
//                   {waveData[dataset.id] && waveData[dataset.id].length > 0 ? (
//                     <MapContainer
//                       center={[
//                         waveData[dataset.id][0]?.lat || 0,
//                         waveData[dataset.id][0]?.long || 0,
//                       ]}
//                       zoom={8}
//                       scrollWheelZoom={true}
//                       style={{ height: '100%', width: '100%' }}
//                     >
//                       <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                       {waveData[dataset.id].map((wave, index) => (
//                         <Marker
//                           key={index}
//                           position={[wave.lat, wave.long]}
//                           icon={createCustomIcon('red')}
//                         >
//                           <Popup>
//                             Lat: {wave.lat}, Long: {wave.long}, Wave ID: {wave.wave_id || 'N/A'}
//                           </Popup>
//                         </Marker>
//                       ))}
//                     </MapContainer>
//                   ) : (
//                     <p>No wave data available</p>
//                   )}
//                 </div>
//               </td>

//               <td>
//                 {dataset.time_velocity_graph && (
//                   <img
//                     src={dataset.time_velocity_graph}
//                     alt={`${dataset.name} Velocity Graph`}
//                     style={{ width: '250px', cursor: 'pointer' }}
//                     onClick={() => handleImageClick(dataset.time_velocity_graph)}
//                   />
//                 )}
//                 {dataset.time_acceleration_graph && (
//                   <img
//                     src={dataset.time_acceleration_graph}
//                     alt={`${dataset.name} Acceleration Graph`}
//                     style={{ width: '250px', cursor: 'pointer' }}
//                     onClick={() => handleImageClick(dataset.time_acceleration_graph)}
//                   />
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </>
//   );
// }

// export default DatasetTable;


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

  const calculateMiddleLatLong = (points) => {
    if (!points || points.length === 0) return [0, 0]; // Fallback center if no points exist
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
                  {mapPoints[dataset.id]?.preprocessed?.length > 0 ? (
                    <MapContainer
                      center={calculateMiddleLatLong(mapPoints[dataset.id].preprocessed)}
                      zoom={8}
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {mapPoints[dataset.id].preprocessed
                      .filter((_, index) => index % 10 === 0)
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
                  {mapPoints[dataset.id]?.wave?.length > 0 ? (
                    <MapContainer
                      center={calculateMiddleLatLong(mapPoints[dataset.id].wave)}
                      zoom={8}
                      scrollWheelZoom={true}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {mapPoints[dataset.id].wave
                        .filter((_, index) => index % 10 === 0) // Filter every 10th point
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
