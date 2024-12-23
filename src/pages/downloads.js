import React, { useState, useEffect } from 'react';
import DatasetTable from '../components/dataset_table';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';

// function Downloads() {
//   const [datasets, setDatasets] = useState([]);

//   useEffect(() => {
//     fetch('http://localhost:5001/api/datasets')
//       .then((res) => {
//         if (!res.ok) {
//           throw new Error(`HTTP error! status: ${res.status}`);
//         }
//         return res.json();
//       })
//       .then((data) => {
//         console.log("Datasets fetched:", data);
//         setDatasets(data);
//       })
//       .catch((err) => {
//         console.error("Error fetching datasets:", err);
//       });
  // }, []);  

  // useEffect(() => {
  //   axios
  //     .get('/datasets.json')
  //     .then((response) => {
  //       setDatasets(response.data);
  //     })
  //     .catch((error) => {
  //       console.error('Error fetching datasets:', error);
  //     });
  // }, []);

  function Downloads() {
  const [datasets, setDatasets] = useState([]);
  const [waveData, setWaveData] = useState({});
  const [preprocessedData, setPreprocessedData] = useState({});

  // Fetch datasets from public/data folder
  useEffect(() => {
    const fetchDatasets = () => {
      const datasetNames = [
        '2024-05-12-19-35-48', '2024-05-15-17-17-41', '2024-05-29-15-13-06', '2024-06-04-10-46-38', '2024-06-05-20-01-41', 
        '2024-07-03-16-49-35', '2024-07-05-19-58-42', '2024-07-05-20-21-22', '2024-07-11-15-12-35', '2024-07-12-14-40-12', 
        '2024-08-22-14-35-44', '2024-08-25-15-02-08', '2024-09-20-13-00-40', '2024-09-20-21-02-37']; // List dataset names in public/data folder
      const newDatasets = datasetNames.map((datasetName) => ({
        id: datasetName,
        name: datasetName,
        preprocessed: `${process.env.PUBLIC_URL}/data/${datasetName}/${datasetName}_preprocessed.csv`,
        wave: `${process.env.PUBLIC_URL}/data/${datasetName}/${datasetName}_waves.csv`,
        time_velocity_graph: `${process.env.PUBLIC_URL}/data/${datasetName}/${datasetName}_time_velocity_graph.png`,
        time_acceleration_graph: `${process.env.PUBLIC_URL}/data/${datasetName}/${datasetName}_time_acceleration_graph.png`,
      }));
      setDatasets(newDatasets);
    };

    fetchDatasets();
  }, []);

  // Fetch and parse CSV data
  useEffect(() => {
    datasets.forEach((dataset) => {
      // Fetch wave data
      if (dataset.wave) {
        fetch(dataset.wave)
          .then((response) => response.text()) // Get raw CSV text
          .then((csvText) => {
            const parsedData = Papa.parse(csvText, { header: true });
            setWaveData((prevData) => ({
              ...prevData,
              [dataset.id]: parsedData.data,
            }));
          })
          .catch((error) => {
            console.error('Error fetching wave data for dataset:', error);
          });
      }

      // Fetch preprocessed data
      if (dataset.preprocessed) {
        fetch(dataset.preprocessed)
          .then((response) => response.text()) // Get raw CSV text
          .then((csvText) => {
            const parsedData = Papa.parse(csvText, { header: true });
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

  return (
    <div className="downloads">
      <h1>Downloads Page</h1>
      <div style={{ margin: '0 auto', maxWidth: '1300px', textAlign: 'left', lineHeight: '1.6', color: '#555', fontSize: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          ‼️ Dataset names follow the format <code>yyyy-mm-dd-hh-mm-ss</code>, indicating the date and time the ROS device was turned on.
        </div>
        <p>
          <strong>Download Links:</strong> Use the "Download Preprocessed Data" or "Download Wave Data" links for each dataset to save the data as a CSV.<br />
          <strong>Maps:</strong> Below the links are interactive maps created with Leaflet, visualizing the trajectory of each trip. The wave map uses different 
          colors to distinguish between waves.<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ⚠️ We only started collecting GPS data at the beginning on July, 2024. Some downloadable datasets 
          do not have GPS coordinates and map visualizations may not be available. <br />
          <strong>Time Series:</strong> Click on the images in the "Time Series" column to view detailed velocity and acceleration 
          plots. These time series also highlight portions categorized as waves by our algorithm and pinpoint specific points with significant oscillations.
        </p>
      </div>

      <DatasetTable datasets={datasets} />
      <div style={{ textAlign: 'center', marginBottom: '10px' }} > Return to the Home Page by clicking on the button below. 
        <Link to="/">
        <button>Go to Introduction</button>
      </Link>
      </div>
    </div>
  );
}

export default Downloads;
