import { Document } from '../models/document.models.js';
import fs from 'fs';
import path from 'path';


export const uploadDocument = async (req, res) => {
  try {
    const { title, version, tags } = req.body;
    const user = req.user;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file was uploaded." });
    }
    if (!title || !version) {
      return res.status(400).json({ success: false, message: "Title and version are required." });
    }

    const document = await Document.create({
      title,
      version,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      filePath: `/public/${req.file.filename}`, // ✅ always relative to backend
      fileType: req.file.mimetype,
      uploadedBy: user._id,
    });

    await document.populate("uploadedBy", "name email");

    res.status(201).json({ success: true, message: "Document uploaded successfully", document });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


// Controller to get all documents
export const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find()
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, documents });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
export const viewDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const filePath = path.join(process.cwd(), doc.filePath.replace('/public', 'uploads'));
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found on server" });
    }

    res.setHeader("Content-Type", doc.fileType);
    return res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Controller to delete a document
export const deleteDocument = async (req, res) => {
  try {
    console.log("🔹 Delete request received for ID:", req.params.id);

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      console.log("❌ Document not found in DB");
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    console.log("✅ Document found:", doc);

    // Build absolute file path
    const filePath = path.join(process.cwd(), doc.filePath);

    console.log("📂 File path to delete:", filePath);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("🗑️ File deleted from server");
      } else {
        console.log("⚠️ File not found on disk, skipping unlink");
      }
    } catch (err) {
      console.error("❌ File deletion error:", err.message);
    }

    await doc.deleteOne();
    console.log("✅ Document removed from MongoDB");

    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("🔥 Delete error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
