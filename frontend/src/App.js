import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");
  const [downloadCode, setDownloadCode] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData);
      setCode(res.data.code);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const handleDownload = () => {
    if (!downloadCode) return alert("Enter code");
    window.location.href = `${API_URL}/download/${downloadCode}`;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>📤 AkashShare SE</h1>

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