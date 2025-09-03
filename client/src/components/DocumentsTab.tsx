import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileText, Trash2, Download } from 'lucide-react';
import apiClient from '../apiClient';

interface Document {
  _id: string;
  filename: string;
  uploadedBy: { name: string };
  createdAt: string;
  url: string; // backend should send file URL
}

export default function DocumentsTab() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await apiClient.get('/documents');
        setDocuments(res.data.documents || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load documents.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // Handle upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocuments(prev => [res.data.document, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Delete this document?');
    if (!confirm) return;
    try {
      await apiClient.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(doc => doc._id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete failed.');
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Document Repository</CardTitle>
        <label>
          <input type="file" className="hidden" onChange={handleUpload} />
          <Button asChild>
            <span className="flex items-center">
              <Upload className="w-4 h-4 mr-2" /> Upload
            </span>
          </Button>
        </label>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-slate-500 py-8">Loading documents...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : documents.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No documents uploaded.</p>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div key={doc._id} className="flex justify-between items-center border p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-900">{doc.filename}</p>
                    <p className="text-xs text-slate-500">
                      Uploaded by {doc.uploadedBy?.name || 'Unknown'} on{' '}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                  </a>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(doc._id)}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
