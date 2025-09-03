import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { User } from '../App'; // Assuming User interface is exported from App.tsx

// Defines the structure of the data the form collects
export interface NewTaskFormData {
  title: string;
  description: string;
  deadline: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo: string; // This will be the user's _id
}

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: NewTaskFormData) => Promise<{ success: boolean; message?: string }>;
  operators: User[]; // Pass the list of available operators as a prop
}

export default function CreateTaskDialog({ isOpen, onClose, onSubmit, operators }: CreateTaskDialogProps) {
  // Initialize form state with default values
  const [formData, setFormData] = useState<NewTaskFormData>({
    title: '',
    description: '',
    deadline: '',
    priority: 'Medium',
    assignedTo: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // A single handler for updating form data
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Handlers for the select dropdowns
  const handlePriorityChange = (value: NewTaskFormData['priority']) => {
    setFormData(prev => ({ ...prev, priority: value }));
  };

  const handleAssignToChange = (value: string) => {
    setFormData(prev => ({ ...prev, assignedTo: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        onClose(); // Close the dialog on a successful submission
        // Reset form for next time
        setFormData({ title: '', description: '', deadline: '', priority: 'Medium', assignedTo: '' });
      } else {
        setError(result.message || 'An unknown error occurred.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create and assign a new task.
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input id="title" value={formData.title} onChange={handleInputChange} className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea id="description" value={formData.description} onChange={handleInputChange} className="col-span-3" required />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedTo" className="text-right">Assign To</Label>
              <Select value={formData.assignedTo} onValueChange={handleAssignToChange} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an operator" />
                </SelectTrigger>
                <SelectContent>
                  {operators.length > 0 ? (
                    operators.map(op => <SelectItem key={op._id} value={op._id}>{op.name}</SelectItem>)
                  ) : (
                    <div className="p-2 text-sm text-slate-500">No operators found</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">Priority</Label>
                    <Select value={formData.priority} onValueChange={handlePriorityChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="deadline" className="text-right">Deadline</Label>
                    <Input id="deadline" type="date" value={formData.deadline} onChange={handleInputChange} className="col-span-1" required />
                </div>
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

