// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Badge } from './ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { 
//   Plus, 
//   Calendar, 
//   Users, 
//   Clock,
//   CheckCircle,
//   AlertTriangle,
//   MoreHorizontal,
//   MessageSquare // Import icon for comments
// } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
//   DropdownMenuSeparator
// } from './ui/dropdown-menu';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from './ui/dialog';
// import apiClient from '../apiClient';
// import { User } from '../App'; 
// import CreateTaskDialog, { NewTaskFormData } from './CreateTaskDialog';
// import EditTaskDialog, { EditTaskFormData } from './EditTaskDialog';

// // --- UPDATED: Comment interface to match backend schema ---
// interface Comment {
//   _id: string;
//   text: string;
//   user: User;
//   createdAt: string;
// }
// export interface Task {
//   _id: string;
//   title: string;
//   description: string;
//   assignedTo: User; 
//   status: 'Todo' | 'In-Progress' | 'On-Hold' | 'Completed';
//   priority: 'Low' | 'Medium' | 'High' | 'Urgent';
//   deadline: string; 
//   createdBy: User;
//   comments: Comment[];
// }

// interface SupervisorDashboardProps {
//   user: User;
// }

// export function SupervisorDashboard({ user }: SupervisorDashboardProps) {
//   const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
//   const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   // --- NEW: State for the comments dialog ---
//   const [viewingTask, setViewingTask] = useState<Task | null>(null);

//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [operators, setOperators] = useState<User[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
//         const params = statusFilter === 'all' ? {} : { status: statusFilter };
//         const tasksPromise = apiClient.get('/tasks', { params });

//         if (operators.length === 0) {
//             const operatorsPromise = apiClient.get('/users/operators');
//             const [tasksResponse, operatorsResponse] = await Promise.all([tasksPromise, operatorsPromise]);
//             setTasks(tasksResponse.data.tasks || []);
//             setOperators(operatorsResponse.data.operators || []);
//         } else {
//             const tasksResponse = await tasksPromise;
//             setTasks(tasksResponse.data.tasks || []);
//         }
//       } catch (err) {
//         console.error("Failed to fetch dashboard data:", err);
//         setError("Failed to load dashboard data. Please try again.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();
//   }, [statusFilter]);

//   const handleCreateTask = async (newTaskData: NewTaskFormData) => {
//     try {
//       const response = await apiClient.post('/tasks', newTaskData);
//       const assignedOperator = operators.find(op => op._id === newTaskData.assignedTo);
//       const newTaskForState: Task = { ...response.data.task, assignedTo: assignedOperator!, createdBy: user };
//       setTasks(prevTasks => [newTaskForState, ...prevTasks]);
//       if (statusFilter !== 'all' && newTaskForState.status !== statusFilter) {
//         setStatusFilter('all');
//       }
//       return { success: true };
//     } catch (error: any) {
//       const message = error.response?.data?.message || "An error occurred while creating the task.";
//       return { success: false, message };
//     }
//   };

//   const handleOpenEditDialog = (task: Task) => {
//     setEditingTask(task);
//     setIsEditTaskOpen(true);
//   };

//   const handleEditTask = async (taskId: string, taskData: EditTaskFormData) => {
//     try {
//       const response = await apiClient.put(`/tasks/${taskId}`, taskData);
//       const assignedOperator = operators.find(op => op._id === taskData.assignedTo);
//       const updatedTaskForState: Task = { ...response.data.task, assignedTo: assignedOperator! };
//       setTasks(prevTasks => prevTasks.map(task => task._id === taskId ? updatedTaskForState : task));
//       return { success: true };
//     } catch (error: any) {
//       const message = error.response?.data?.message || "An error occurred while updating the task.";
//       return { success: false, message };
//     }
//   };

//   const handleDeleteTask = async (taskId: string) => {
//     const isConfirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
//     if (isConfirmed) {
//       try {
//         await apiClient.delete(`/tasks/${taskId}`);
//         setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
//       } catch (error) {
//         alert('Failed to delete the task.');
//       }
//     }
//   };

//   const stats = [
//     { title: 'Total Tasks', value: tasks.length, icon: Clock, color: 'bg-blue-500' },
//     { title: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, icon: CheckCircle, color: 'bg-green-500' },
//     { title: 'Overdue', value: tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'Completed').length, icon: AlertTriangle, color: 'bg-red-500' },
//     { title: 'Team Members', value: operators.length, icon: Users, color: 'bg-purple-500' }
//   ];

//   const getStatusColor = (status: Task['status']) => {
//     switch (status) {
//       case 'Todo': return 'bg-slate-100 text-slate-800';
//       case 'In-Progress': return 'bg-blue-100 text-blue-800';
//       case 'On-Hold': return 'bg-orange-100 text-orange-800';
//       case 'Completed': return 'bg-green-100 text-green-800';
//       default: return 'bg-slate-100 text-slate-800';
//     }
//   };

//   const getPriorityColor = (priority: Task['priority']) => {
//     switch (priority) {
//       case 'Low': return 'bg-slate-100 text-slate-800';
//       case 'Medium': return 'bg-blue-100 text-blue-800';
//       case 'High': return 'bg-orange-100 text-orange-800';
//       case 'Urgent': return 'bg-red-100 text-red-800';
//       default: return 'bg-slate-100 text-slate-800';
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <CreateTaskDialog isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} onSubmit={handleCreateTask} operators={operators} />
//       <EditTaskDialog isOpen={isEditTaskOpen} onClose={() => setIsEditTaskOpen(false)} onSubmit={handleEditTask} operators={operators} task={editingTask} />

//       {/* --- NEW: Dialog for Viewing Comments --- */}
//       <Dialog open={!!viewingTask} onOpenChange={(isOpen) => !isOpen && setViewingTask(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Comment History for "{viewingTask?.title}"</DialogTitle>
//             <DialogDescription>
//               A log of all comments submitted for this task.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="max-h-80 overflow-y-auto space-y-4 py-4">
//             {viewingTask?.comments && viewingTask.comments.length > 0 ? (
//               viewingTask.comments.map(comment => (
//                 <div key={comment._id} className="bg-slate-50 p-3 rounded-lg">
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="text-sm font-medium">{comment.user.name} ({comment.user.role})</span>
//                     <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
//                   </div>
//                   <p className="text-sm text-slate-700">{comment.text}</p>
//                 </div>
//               ))
//             ) : (
//               <p className="text-sm text-slate-500 text-center">No comments have been left for this task.</p>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>


//       <div className="bg-white rounded-lg border border-slate-200 p-6">
//         <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {user.name}!</h2>
//         <p className="text-slate-600">Manage your team and track progress efficiently.</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => (
//           <Card key={index}><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-600">{stat.title}</p><p className="text-2xl font-bold text-slate-900">{stat.value}</p></div><div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}><stat.icon className="w-6 h-6 text-white" /></div></div></CardContent></Card>
//         ))}
//       </div>

//       <Tabs defaultValue="tasks" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="tasks">Task Management</TabsTrigger>
//             <TabsTrigger value="team" disabled>Team Overview</TabsTrigger>
//             <TabsTrigger value="documents">Documents</TabsTrigger>
//             <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
//         </TabsList>

//         <TabsContent value="tasks" className="space-y-6">
  
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <div>
//                   <CardTitle>Task Management</CardTitle>
//                   <CardDescription>Create, assign, and monitor tasks</CardDescription>
//                 </div>
//                 <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateTaskOpen(true)}>
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create Task
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="flex space-x-2 pb-4 border-b mb-4">
//                 <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>All</Button>
//                 <Button variant={statusFilter === 'Todo' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('Todo')}>To Do</Button>
//                 <Button variant={statusFilter === 'In-Progress' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('In-Progress')}>In Progress</Button>
//                 <Button variant={statusFilter === 'On-Hold' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('On-Hold')}>On Hold</Button>
//                 <Button variant={statusFilter === 'Completed' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('Completed')}>Completed</Button>
//               </div>

//               {isLoading ? (
//                 <p className="text-center text-slate-500 py-8">Loading tasks...</p>
//               ) : error ? (
//                 <p className="text-center text-red-500 py-8">{error}</p>
//               ) : tasks.length === 0 ? (
//                 <p className="text-center text-slate-500 py-8">No tasks found for the selected filter.</p>
//               ) : (
//                 <div className="space-y-4">
//                     {tasks.map((task) => (
//                       <div key={task._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
//                         <div className="flex justify-between items-start mb-3">
//                           <div className="flex-1">
//                             <h3 className="font-medium text-slate-900">{task.title}</h3>
//                             <p className="text-sm text-slate-600 mt-1">{task.description}</p>
//                           </div>
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                                 <MoreHorizontal className="w-4 h-4" />
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuItem onClick={() => handleOpenEditDialog(task)}>Edit / Reassign</DropdownMenuItem>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem onClick={() => handleDeleteTask(task._id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">Delete Task</DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </div>
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-4">
//                             <Badge className={getStatusColor(task.status)}>{task.status.replace('-', ' ')}</Badge>
//                             <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
//                             <div className="flex items-center text-sm text-slate-600"><Users className="w-4 h-4 mr-1" />{task.assignedTo?.name || 'Unassigned'}</div>
//                           </div>
//                           <div className="flex items-center space-x-2 text-sm text-slate-600">
//                               {/* --- NEW: Button to view comments --- */}
//                               <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setViewingTask(task)}>
//                                 <MessageSquare className="w-3 h-3 mr-1" />
//                                 Comments ({task.comments?.length || 0})
//                               </Button>
//                             <div className="flex items-center">
//                                 <Calendar className="w-4 h-4 mr-1" />
//                                 Due: {new Date(task.deadline).toLocaleDateString()}
//                               </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }



import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Calendar, 
  Users, 
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  MessageSquare,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import apiClient from '../apiClient';
import { User } from '../App'; 
import CreateTaskDialog, { NewTaskFormData } from './CreateTaskDialog';
import EditTaskDialog, { EditTaskFormData } from './EditTaskDialog';
import UploadDocumentDialog from './UploadDocumentDialog';

// --- Comment interface ---
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

// --- Document interface ---
interface Document {
  _id: string;
  title: string;
  version: string;
  tags: string[];
  filePath: string;
  fileType: string;
  uploadedBy: User;
  createdAt: string;
}

interface SupervisorDashboardProps {
  user: User;
}

export function SupervisorDashboard({ user }: SupervisorDashboardProps) {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [operators, setOperators] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Task['status'] | 'all'>('all');

  // --- Documents state ---
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // === Fetch tasks + operators ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const params = statusFilter === 'all' ? {} : { status: statusFilter };
        const tasksPromise = apiClient.get('/tasks', { params });

        if (operators.length === 0) {
          const operatorsPromise = apiClient.get('/users/operators');
          const [tasksResponse, operatorsResponse] = await Promise.all([tasksPromise, operatorsPromise]);
          setTasks(tasksResponse.data.tasks || []);
          setOperators(operatorsResponse.data.operators || []);
        } else {
          const tasksResponse = await tasksPromise;
          setTasks(tasksResponse.data.tasks || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [statusFilter]);

  // === Fetch documents ===
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await apiClient.get('/documents');
        setDocuments(response.data.documents || []);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      }
    };
    fetchDocuments();
  }, []);

  // === Handle document upload ===
  const handleUploadDocument = async (formData: FormData) => {
    try {
      const response = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocuments(prev => [response.data.document, ...prev]);
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "An error occurred while uploading.";
      return { success: false, message };
    }
  };

  // === Handle document delete ===
  const handleDeleteDocument = async (docId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this document?");
    if (!isConfirmed) return;

    try {
      await apiClient.delete(`/documents/${docId}`);
      setDocuments(prev => prev.filter(doc => doc._id !== docId));
    } catch (error) {
      alert("Failed to delete the document. Please try again.");
    }
  };

  // === Task functions ===
  const handleCreateTask = async (newTaskData: NewTaskFormData) => {
    try {
      const response = await apiClient.post('/tasks', newTaskData);
      const assignedOperator = operators.find(op => op._id === newTaskData.assignedTo);
      const newTaskForState: Task = { ...response.data.task, assignedTo: assignedOperator!, createdBy: user };
      setTasks(prevTasks => [newTaskForState, ...prevTasks]);
      if (statusFilter !== 'all' && newTaskForState.status !== statusFilter) {
        setStatusFilter('all');
      }
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "An error occurred while creating the task.";
      return { success: false, message };
    }
  };

  const handleOpenEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsEditTaskOpen(true);
  };

  const handleEditTask = async (taskId: string, taskData: EditTaskFormData) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, taskData);
      const assignedOperator = operators.find(op => op._id === taskData.assignedTo);
      const updatedTaskForState: Task = { ...response.data.task, assignedTo: assignedOperator! };
      setTasks(prevTasks => prevTasks.map(task => task._id === taskId ? updatedTaskForState : task));
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "An error occurred while updating the task.";
      return { success: false, message };
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
    if (isConfirmed) {
      try {
        await apiClient.delete(`/tasks/${taskId}`);
        setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      } catch (error) {
        alert('Failed to delete the task.');
      }
    }
  };

  const stats = [
    { title: 'Total Tasks', value: tasks.length, icon: Clock, color: 'bg-blue-500' },
    { title: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Overdue', value: tasks.filter(t => new Date(t.deadline) < new Date() && t.status !== 'Completed').length, icon: AlertTriangle, color: 'bg-red-500' },
    { title: 'Team Members', value: operators.length, icon: Users, color: 'bg-purple-500' }
  ];

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Todo': return 'bg-slate-100 text-slate-800';
      case 'In-Progress': return 'bg-blue-100 text-blue-800';
      case 'On-Hold': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Low': return 'bg-slate-100 text-slate-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <CreateTaskDialog isOpen={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} onSubmit={handleCreateTask} operators={operators} />
      <EditTaskDialog isOpen={isEditTaskOpen} onClose={() => setIsEditTaskOpen(false)} onSubmit={handleEditTask} operators={operators} task={editingTask} />
      <UploadDocumentDialog isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={handleUploadDocument} />

      {/* Comments dialog */}
      <Dialog open={!!viewingTask} onOpenChange={(isOpen) => !isOpen && setViewingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comment History for "{viewingTask?.title}"</DialogTitle>
            <DialogDescription>A log of all comments submitted for this task.</DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-4 py-4">
            {viewingTask?.comments && viewingTask.comments.length > 0 ? (
              viewingTask.comments.map(comment => (
                <div key={comment._id} className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{comment.user.name} ({comment.user.role})</span>
                    <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-700">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center">No comments have been left for this task.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Welcome Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {user.name}!</h2>
        <p className="text-slate-600">Manage your team and track progress efficiently.</p>
      </div>

      {/* Stats */}
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

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="team" disabled>Team Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
        </TabsList>

        {/* === TASK TAB === */}
        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Task Management</CardTitle>
                  <CardDescription>Create, assign, and monitor tasks</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateTaskOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 pb-4 border-b mb-4">
                <Button variant={statusFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('all')}>All</Button>
                <Button variant={statusFilter === 'Todo' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('Todo')}>To Do</Button>
                <Button variant={statusFilter === 'In-Progress' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('In-Progress')}>In Progress</Button>
                <Button variant={statusFilter === 'On-Hold' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('On-Hold')}>On Hold</Button>
                <Button variant={statusFilter === 'Completed' ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter('Completed')}>Completed</Button>
              </div>

              {isLoading ? (
                <p className="text-center text-slate-500 py-8">Loading tasks...</p>
              ) : error ? (
                <p className="text-center text-red-500 py-8">{error}</p>
              ) : tasks.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No tasks found for the selected filter.</p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task._id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900">{task.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(task)}>Edit / Reassign</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteTask(task._id)} className="text-red-500 focus:text-red-500 focus:bg-red-50">Delete Task</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(task.status)}>{task.status.replace('-', ' ')}</Badge>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <div className="flex items-center text-sm text-slate-600"><Users className="w-4 h-4 mr-1" />{task.assignedTo?.name || 'Unassigned'}</div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setViewingTask(task)}>
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Comments ({task.comments?.length || 0})
                          </Button>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === DOCUMENTS TAB === */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Document Repository</CardTitle>
                  <CardDescription>Upload and manage manuals, instructions, and resources</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsUploadOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {doc.title} <span className="text-slate-500">({doc.version})</span>
                        </h3>
                        <p className="text-sm text-slate-600">
                          Uploaded by {doc.uploadedBy?.name} on{" "}
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          {doc.tags.map((tag, i) => (
                            <Badge key={i} className="bg-slate-100 text-slate-700">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* View Document */}
                        <a
                          href={`${"http://localhost:5000"}${doc.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          <FileText className="w-4 h-4 mr-1" /> View
                        </a>

                        {/* Delete Document */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeleteDocument(doc._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
