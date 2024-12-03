import React from 'react';
import { Link } from 'react-router-dom';

function Introduction() {
  return (
    <>
    <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#222' }}>Welcome to the Traffic Wave Detection Website</h1>
    <div className="introduction" style={{ backgroundColor: 'white', 
    borderRadius: '10px', 
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)', 
    padding: '20px', 
    marginBottom: '30px' }}>
      
      
      <p>
        This website provides comprehensive insights into <strong>traffic stop-and-go wave data</strong> of vehicle trajectories
        recorded in the Bay Area using CANbus, providing internal vehicle measurements and additional GPS devices, offering visualizations, detailed metrics, 
        and downloadable files for further analysis for a variety of traffic prediction use-cases.
      </p>
      
      <p>
        Explore the <Link to="/downloads" style={{ color: '#007BFF', textDecoration: 'none' }}>Downloads Page</Link> to access
        preprocessed datasets, interactive maps, and time series visualizations. The data captures approximately <strong>one data point 
        per second</strong>, with columns including:
        <ul style={{ listStyleType: 'circle', marginLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>time</strong> recorded in UNIX format for accurate time tracking</li>
          <li><strong>date_time</strong> time recorded in <code>yyyy-mm-dd hh:mm:ss</code> format in PST for clearer representation</li>
          <li><strong>lat</strong> geographic latitude coordinates of the vehicle</li>
          <li><strong>long</strong> geographic longitude coordinates of the vehicle</li>
          <li><strong>vel</strong> vehicle velocity</li>
          <li><strong>acc</strong> vehicle accleration</li>
          <li><strong>rel_vel</strong> relative vehicle elocity to leading vehicle</li>
          <li><strong>rel_pos</strong> relative vehicle position to leading vehicle</li>
        </ul>
        Our datasets include preprocessed data and wave data.
      </p>
<p>
<strong>Preprocessed Data:</strong> Extracted from original raw bag file produced by ROS software with outlier detection, and handles null cases. Moreover, it filters out local roads to include only 
         highway/expressway points, both for the purpose of the use-case and privacy reasons. 
</p>
<p>
  <strong>Wave Data:</strong> Includes detected stop-and-go waves calculated using a unique oscillation detection algorithm. These datasets also include additional
      columns in their schema detailing more information about how they are calculated:

      {/* <ol style={{ listStyleType: 'decimal', marginLeft: '20px', lineHeight: '1.8' }}> */}
        <ul style={{ listStyleType: 'circle', marginLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>acc_change</strong> rolling change in absolute acceleration defined by a lookback parameter (default last 10 records)</li>
          <li><strong>vel_change</strong> rolling change in velocity defined by a lookback parameter (default last 10 records)</li>
          <li><strong>is_oscillating</strong> true if significant oscillation detected based on threshold values for absolute velocity change and absolute accleration change</li>
          <li><strong>is_wave</strong> true if any significant oscillation in the last 60 records </li>
          <li><strong>num_oscillations</strong> num oscillations in the last 60 records </li>
          <li><strong>wave_id</strong> wave id assigned to each group of data points detected as apart of a wave, wave_id increases in chronological order with respect to trip start time </li>
        </ul>
</p>
      

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Access all datasets and visualizations by clicking on the button below.
      </p>

      <Link to="/downloads">
        <button style={{ display: 'block', margin: '20px auto', padding: '10px 20px', fontSize: '16px',  border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Go to Downloads
        </button>
      </Link>
    </div>
    </>
  );
}

export default Introduction;

