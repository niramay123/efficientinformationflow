import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    version: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    filePath: { type: String, required: true }, // Path to the stored file
    fileType: { type: String, required: true }, // e.g., 'application/pdf', 'image/png'
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // For version history, we can add a link to a parent document
    parentDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", documentSchema);
