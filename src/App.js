import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");
  const [downloadCode, setDownloadCode] = useState("");

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:5000/upload", formData);
    setCode(res.data.code);
  };

  const handleDownload = () => {
    window.location.href = `http://localhost:5000/download/${downloadCode}`;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>📤 AkashShare Se</h1>

      <h2>Upload File</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      {code && <h3>🔑 Share this code: {code}</h3>}

      <h2>Download File</h2>
      <input 
        type="text" 
        placeholder="Enter 4-digit code" 
        value={downloadCode} 
        onChange={(e) => setDownloadCode(e.target.value)} 
      />
      <button onClick={handleDownload}>Download</button>
    </div>
  );
}

export default App;
