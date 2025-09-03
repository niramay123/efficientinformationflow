import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Users, BarChart3, Settings, UserPlus, Download, Search, Filter, MoreHorizontal,
  TrendingUp, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';
import apiClient from '../apiClient';
// The import for AddUserDialog is default (without curly braces), matching the 'export default'.
import AddUserDialog, { NewUserFormData } from './AddUserDialog';

// Updated User interface to better match the backend model
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operator';
  skills?: string[];
  availability?: 'available' | 'busy' | 'offline';
  lastActive?: string;
}

interface AdminDashboardProps {
  user: User; // The currently logged-in admin
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // --- FETCH ALL USERS FROM BACKEND ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await apiClient.get('/user/all');
        setAllUsers(response.data.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // --- HANDLE ADDING A NEW USER ---
  const handleAddUser = async (newUserData: NewUserFormData) => {
    try {
      const skillsArray = newUserData.skills && newUserData.skills.trim() !== '' 
        ? newUserData.skills.split(',').map(s => s.trim()) 
        : [];
      const payload = { ...newUserData, skills: skillsArray };

      const response = await apiClient.post('/user/admin/create-user', payload);
      
      setAllUsers(prevUsers => [...prevUsers, response.data.user]);
      
      return { success: true };
    } catch (error: any) {
      console.error("Failed to create user:", error);
      const message = error.response?.data?.message || "An error occurred while creating the user.";
      return { success: false, message };
    }
  };

  // --- STATS (uses live data for total users) ---
  const stats = [
    { title: 'Total Users', value: allUsers.length, change: '', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Tasks', value: '128', change: '+8%', icon: Clock, color: 'bg-orange-500' },
    { title: 'Completed Today', value: '32', change: '+15%', icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Overdue Tasks', value: '7', change: '-25%', icon: AlertTriangle, color: 'bg-red-500' }
  ];

  // --- FILTERING LOGIC (works on real data) ---
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // --- HELPER FUNCTIONS for styling ---
  const getAvailabilityColor = (availability?: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'supervisor': return 'bg-blue-100 text-blue-800';
      case 'operator': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <AddUserDialog 
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSubmit={handleAddUser}
      />
      {/* Welcome Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back, {user.name}!</h2>
        <p className="text-slate-600">Here's what's happening in your organization today.</p>
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
                  {stat.change && <p className="text-sm text-slate-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                    {stat.change} from last week
                  </p>}
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage users, roles, and permissions</CardDescription>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddUserOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="space-y-4">
                {isLoadingUsers ? (
                  <p className="text-center text-slate-500">Loading users...</p>
                ) : (
                  filteredUsers.map((u) => (
                    <div key={u._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm font-medium">
                              {u.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getAvailabilityColor(u.availability)} rounded-full border-2 border-white`}></div>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{u.name}</p>
                          <p className="text-sm text-slate-500">{u.email}</p>
                          {u.skills && u.skills.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {u.skills.slice(0, 2).map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getRoleBadgeColor(u.role)}>
                          {u.role}
                        </Badge>
                        <span className="text-sm text-slate-500">Last active: {u.lastActive || 'N/A'}</span>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics and Settings Tabs */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                This section is under development.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics charts and reports will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                This section is under development.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Global system settings will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

