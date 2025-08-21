// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// File Schema
const FileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  code: String,
  uploadedAt: { type: Date, default: Date.now }
});
const File = mongoose.model("File", FileSchema);

// Storage (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Upload Route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
    const newFile = new File({
      filename: req.file.filename,
      path: req.file.path,
      code: randomCode,
    });
    await newFile.save();
    res.json({ code: randomCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Download Route
app.get("/download/:code", async (req, res) => {
  try {
    const file = await File.findOne({ code: req.params.code });
    if (!file) return res.status(404).json({ error: "Invalid Code" });

    res.download(file.path, file.filename);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Download failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));