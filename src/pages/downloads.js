import React, { useState, useEffect, useMemo } from 'react';
import DatasetTable from '../components/dataset_table';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';

const GZ_DATASET_IDS = [
  '2025-06-03-18-21-02', '2025-06-06-06-56-41', '2025-06-10-07-03-48', '2025-06-10-20-31-56',
];

function Downloads() {
  const [datasets, setDatasets] = useState([]);
  const [waveData, setWaveData] = useState({});
  const [preprocessedData, setPreprocessedData] = useState({});
  const [yearFilter, setYearFilter] = useState('2025'); // 'all' | '2024' | '2025'

  // fetch from datasets folder
  useEffect(() => {
    const fetchDatasets = () => {
      const datasetNames = [
        // 2024
        // without gps
        '2024-05-12-19-35-48', '2024-05-15-17-17-41', '2024-05-29-15-13-06', '2024-06-04-10-46-38', '2024-06-05-20-01-41', 
        '2024-07-03-16-49-35', '2024-07-05-19-58-42', 
        
        // with gps
        '2024-07-05-20-21-22', '2024-07-11-15-12-35', '2024-07-12-14-40-12', '2024-08-22-14-35-44', '2024-08-25-15-02-08', 
        '2024-09-20-13-00-40', '2024-09-20-21-02-37', 
        
        // 2025
        // without gps
        '2025-07-01-19-49-15', '2025-07-01-19-49-30', '2025-07-01-19-50-01', '2025-07-01-19-50-22', '2025-07-01-19-51-48', 
        '2025-07-17-06-50-19', '2025-07-22-06-48-15', '2025-08-06-07-41-08', '2025-08-06-07-41-53', 

        // with gps
        // '2025-06-03-15-39-55', '2025-06-03-16-05-04', '2025-06-03-15-53-45', '2025-06-03-15-28-15',
        '2025-06-03-18-21-02', '2025-06-06-06-56-41', '2025-06-10-07-03-48', '2025-06-10-20-31-56',
        '2025-06-16-18-03-44', '2025-06-24-19-20-01', '2025-06-27-17-12-53', '2025-07-01-19-18-52', 
      ]; // List dataset names in public/data folder
      
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

  useEffect(() => {
    datasets.forEach((dataset) => {
      const useGz = GZ_DATASET_IDS.includes(dataset.id);
      
      // fetch wave data
      if (dataset.waveBase) {
        const waveFile = useGz 
          ? dataset.waveBase.replace('.csv', '.csv.gz')
          : dataset.waveBase;
          
        fetch(waveFile)
          .then((response) => response.text())
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

      // fetch preprocessed data
      if (dataset.preprocessedBase) {
        const preprocessedFile = useGz
          ? dataset.preprocessedBase.replace('.csv', '.csv.gz')
          : dataset.preprocessedBase;
          
        fetch(preprocessedFile)
          .then((response) => response.text())
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

  const filteredDatasets = useMemo(() => {
    if (yearFilter === 'all') return datasets;
    return datasets.filter((d) => d.id.startsWith(yearFilter));
  }, [datasets, yearFilter]);

  const tabBtn = (active) => ({
    padding: '6px 12px',
    borderRadius: '999px',
    border: '1px solid #e5e7eb',
    background: active ? '#ffffff' : '#f3f4f6',
    fontWeight: 600,
    cursor: 'pointer',
  });

  return (
    <div className="downloads">
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }} >
        <Link to="/">
        <button>Go to Introduction</button>
      </Link>
      </div>

      {/* Intro */}
      <h1>Downloads Page</h1>
      <div style={{ margin: '0 auto', maxWidth: '1300px', textAlign: 'left', lineHeight: '1.6', color: '#555', fontSize: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          ‼️ Dataset names follow the format <code>yyyy-mm-dd-hh-mm-ss</code>, indicating the date and time the ROS device was turned on.
        </div>
        <p>
          <strong>Download Links:</strong> Use the "Download Preprocessed Data" or "Download Wave Data" links for each dataset to save the data as a CSV. 
          Some longer trajectories may download as &nbsp;&nbsp;&nbsp;.csv.gz, and can be uncompressed.<br />
          <strong>Maps:</strong> Below the links are interactive maps created with Leaflet, visualizing the trajectory of each trip. The wave map uses different 
          colors to distinguish between waves.<br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ⚠️ We only started collecting GPS data at the beginning on July, 2024. Some downloadable datasets 
          do not have GPS coordinates and map visualizations may not be available. <br />
          <strong>Time Series:</strong> Click on the images in the "Time Series" column to view detailed velocity and acceleration 
          plots. These time series also highlight portions categorized as waves by our algorithm and pinpoint specific points with significant oscillations.
        </p>
      </div>

      {/* Filter buttons */}
      <div className="year-buttons">
        <button
          className={`year-button ${yearFilter === '2025' ? 'active' : ''}`}
          onClick={() => setYearFilter('2025')}
        >
          2025
        </button>
        <button
          className={`year-button ${yearFilter === '2024' ? 'active' : ''}`}
          onClick={() => setYearFilter('2024')}
        >
          2024
        </button>
        <button
          className={`year-button ${yearFilter === 'all' ? 'active' : ''}`}
          onClick={() => setYearFilter('all')}
        >
          All
        </button>
      </div>


      {/* pass the filtered list into the unchanged table */}
      <DatasetTable datasets={filteredDatasets} />

      <div style={{ textAlign: 'center', marginBottom: '10px' }} > Return to the Home Page by clicking on the button below. 
        <Link to="/">
        <button>Go to Introduction</button>
      </Link>
      </div>
    </div>
  );
}

export default Downloads;
