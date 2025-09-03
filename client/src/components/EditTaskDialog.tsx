import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import { User } from '../App';
import { Task } from './SupervisorDashboard'; // Import the Task interface

// This is the data structure for the form submission
export interface EditTaskFormData {
  title: string;
  description: string;
  deadline: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignedTo: string;
}

interface EditTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, taskData: EditTaskFormData) => Promise<{ success: boolean; message?: string }>;
  operators: User[];
  task: Task | null; // The task to be edited
}

export default function EditTaskDialog({ isOpen, onClose, onSubmit, operators, task }: EditTaskDialogProps) {
  const [formData, setFormData] = useState<EditTaskFormData>({
    title: '',
    description: '',
    deadline: '',
    priority: 'Medium',
    assignedTo: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // When the dialog opens or the task prop changes, pre-fill the form
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        // The date needs to be formatted as YYYY-MM-DD for the input[type=date]
        deadline: new Date(task.deadline).toISOString().split('T')[0],
        priority: task.priority,
        assignedTo: task.assignedTo._id,
      });
    }
  }, [task]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePriorityChange = (value: EditTaskFormData['priority']) => {
    setFormData(prev => ({ ...prev, priority: value }));
  };

  const handleAssignToChange = (value: string) => {
    setFormData(prev => ({ ...prev, assignedTo: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return; // Should not happen if the form is open
    
    setError('');
    setIsLoading(true);

    try {
      const result = await onSubmit(task._id, formData);
      if (result.success) {
        onClose();
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
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of the task below.
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
                  {operators.map(op => <SelectItem key={op._id} value={op._id}>{op.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor="priority" className="text-right">Priority</Label>
                    <Select value={formData.priority} onValueChange={handlePriorityChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
