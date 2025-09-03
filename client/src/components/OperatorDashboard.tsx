import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  Clock, 
  Pause, 
  Calendar,
  AlertTriangle,
  Play,
  CheckSquare,
  FileText
} from 'lucide-react';
import { User } from '../App';
import apiClient from '../apiClient';
import CompleteTaskDialog from './CompleteTaskDialog';

// --- Document Interface ---
interface Document {
  _id: string;
  title: string;
  version: string;
  filePath: string;
  fileType: string;
  uploadedBy: User;
  createdAt: string;
}

interface Comment {
  _id: string;
  text: string;
  user: User;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: User; 
  status: 'Todo' | 'In-Progress' | 'On-Hold' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  deadline: string; 
  createdBy: User;
  comments: Comment[];
}

interface OperatorDashboardProps {
  user: User;
}

export function OperatorDashboard({ user }: OperatorDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [isCompleteTaskOpen, setIsCompleteTaskOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [tasksRes, docsRes] = await Promise.all([
          apiClient.get('/tasks'),
          apiClient.get('/documents')
        ]);

        setTasks(tasksRes.data.tasks || []);
        setDocuments(docsRes.data.documents || []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Could not load your assigned tasks or documents.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = (task: Task, newStatus: Task['status']) => {
    if (newStatus === 'Completed') {
      setCompletingTask(task);
      setIsCompleteTaskOpen(true);
    } else {
      updateTaskStatus(task._id, newStatus);
    }
  };

  const handleCompleteTaskSubmit = (comment: string) => {
    if (completingTask) {
      updateTaskStatus(completingTask._id, 'Completed', comment);
    }
  };
  
  const updateTaskStatus = async (taskId: string, newStatus: Task['status'], comment?: string) => {
    const originalTasks = tasks;
    setTasks(prevTasks => prevTasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

    try {
      const payload: { status: string; comment?: string } = { status: newStatus };
      if (comment) payload.comment = comment;

      const response = await apiClient.put(`/tasks/${taskId}/status`, payload);
      setTasks(prevTasks => prevTasks.map(t => t._id === taskId ? response.data.task : t));
    } catch (error) {
      console.error('Failed to update task status:', error);
      setTasks(originalTasks);
      alert("Failed to update task status. Please try again.");
    }
  };

  // ✅ FIXED: Accept doc object instead of docId
  const viewDocument = (doc: Document) => {
    window.open(`http://localhost:5000${doc.filePath}`, "_blank");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo': return 'bg-slate-100 text-slate-800';
      case 'In-Progress': return 'bg-blue-100 text-blue-800';
      case 'On-Hold': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-slate-100 text-slate-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Todo': return Clock;
      case 'In-Progress': return Play;
      case 'On-Hold': return Pause;
      case 'Completed': return CheckCircle;
      default: return Clock;
    }
  };

  const overdueTasks = tasks.filter(task => 
    new Date(task.deadline) < new Date() && task.status !== 'Completed'
  );

  const stats = [
    { title: 'My Tasks', value: tasks.length.toString(), icon: CheckSquare, color: 'bg-blue-500' },
    { title: 'In Progress', value: tasks.filter(t => t.status === 'In-Progress').length.toString(), icon: Play, color: 'bg-orange-500' },
    { title: 'Completed', value: tasks.filter(t => t.status === 'Completed').length.toString(), icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Overdue', value: overdueTasks.length.toString(), icon: AlertTriangle, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      <CompleteTaskDialog 
        isOpen={isCompleteTaskOpen}
        onClose={() => setIsCompleteTaskOpen(false)}
        onSubmit={handleCompleteTaskSubmit}
      />

      {/* Welcome Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {user.name}!</h2>
        <p className="text-slate-600">You have {tasks.filter(t => t.status !== 'Completed').length} active tasks.</p>
        {overdueTasks.length > 0 && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              You have {overdueTasks.length} overdue task(s).
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Tasks</CardTitle>
          <CardDescription>View and update your assigned tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-center text-slate-500 py-8">Loading...</p>
          : error ? <p className="text-center text-red-500 py-8">{error}</p>
          : tasks.length === 0 ? <p className="text-center text-slate-500 py-8">You have no tasks assigned to you.</p>
          : (
            <div className="space-y-4">
              {tasks.map((task) => {
                const StatusIcon = getStatusIcon(task.status);
                const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Completed';
                return (
                  <div key={task._id} className={`border rounded-lg p-4 hover:bg-slate-50 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <StatusIcon className="w-4 h-4 text-slate-600" />
                          <h3 className="font-medium text-slate-900">{task.title}</h3>
                          {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                        <p className="text-xs text-slate-500">Assigned by: {task.createdBy?.name || 'N/A'}</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTask(task)}>View Details</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedTask?.title}</DialogTitle>
                            <DialogDescription>Task details and communication</DialogDescription>
                          </DialogHeader>
                          {selectedTask && (
                            <div className="space-y-4 py-4">
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-slate-600">{selectedTask.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Update Status</h4>
                                  <select 
                                    value={selectedTask.status} 
                                    onChange={(e) => handleStatusChange(selectedTask, e.target.value as Task['status'])}
                                    className="w-full border border-slate-200 rounded-md px-3 py-2"
                                  >
                                    <option value="Todo">To Do</option>
                                    <option value="In-Progress">In Progress</option>
                                    <option value="On-Hold">On Hold</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Priority</h4>
                                  <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Comment History</h4>
                                {selectedTask.comments && selectedTask.comments.length > 0 ? (
                                  <div className="space-y-3 max-h-40 overflow-y-auto border p-3 rounded-md">
                                    {selectedTask.comments.map((comment) => (
                                      <div key={comment._id} className="bg-slate-50 p-2 rounded-lg">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-sm font-medium">{comment.user.name} ({comment.user.role})</span>
                                          <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-700">{comment.text}</p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500">No comments yet.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(task.status)}>{task.status.replace('-', ' ')}</Badge>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        Due: {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Section */}
      <Card>
        <CardHeader>
          <CardTitle>Available Documents</CardTitle>
          <CardDescription>View documents uploaded by supervisors/admins</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-sm text-slate-500">No documents available.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc._id} className="flex justify-between items-center border p-3 rounded-md hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">{doc.title} (v{doc.version})</p>
                    <p className="text-xs text-slate-500">
                      Uploaded by {doc.uploadedBy?.name || 'N/A'} on {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => viewDocument(doc)}>
                    <FileText className="w-4 h-4 mr-1" /> View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
