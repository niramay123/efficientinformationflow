import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // The handler now expects FormData, which is necessary for file uploads
  onUpload: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
}

export default function UploadDocumentDialog({ isOpen, onClose, onUpload }: UploadDocumentDialogProps) {
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsLoading(true);
    
    // FormData is the standard way to send files to a backend server.
    const formData = new FormData();
    formData.append('title', title);
    formData.append('version', version);
    formData.append('tags', tags);
    // The field name 'file' must match what your multer middleware expects.
    formData.append('file', file);

    const result = await onUpload(formData);

    if (result.success) {
      onClose(); // Close the dialog on a successful upload
      // Reset the form fields for the next time it's opened
      setTitle('');
      setVersion('');
      setTags('');
      setFile(null);
      // We also need to clear the file input visually
      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
    
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogDescription>
            Add a new document, manual, or instruction sheet to the repository.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Document Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g., v1.0, 2024-Q3" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., safety, manual, assembly" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload-input">File</Label>
              <Input id="file-upload-input" type="file" onChange={handleFileChange} required />
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

