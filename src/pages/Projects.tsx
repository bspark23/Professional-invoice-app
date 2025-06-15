
import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NewDashboardSidebar from "@/components/NewDashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Search, Edit, Trash2, Calendar, DollarSign, 
  CheckCircle, Circle, FolderOpen, Users, Target, Clock
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useAuthLocal } from "@/hooks/useAuthLocal";
import { formatCurrency } from "@/utils/invoiceUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

type ProjectTask = {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  deadline?: string;
  estimatedHours?: number;
  hourlyRate?: number;
  createdAt: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  clientName: string;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  startDate: string;
  deadline?: string;
  budget?: number;
  tasks: ProjectTask[];
  createdAt: string;
};

const LOCAL_STORAGE_KEY = "invoicecraft-projects-v1";

const Projects: React.FC = () => {
  const { user } = useAuthLocal();
  const { toast } = useToast();
  const { clients } = useClients(null, user?.email || user?.profileName);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    clientName: '',
    status: 'active' as const,
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    budget: ''
  });

  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    deadline: '',
    estimatedHours: '',
    hourlyRate: '50'
  });

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch {
        setProjects([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProjectProgress = (project: Project) => {
    if (project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.completed).length;
    return (completedTasks / project.tasks.length) * 100;
  };

  const getProjectCost = (project: Project) => {
    return project.tasks.reduce((sum, task) => {
      if (task.estimatedHours && task.hourlyRate) {
        return sum + (task.estimatedHours * task.hourlyRate);
      }
      return sum;
    }, 0);
  };

  const getTotalHours = (project: Project) => {
    return project.tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  };

  const handleSaveProject = () => {
    if (!projectForm.name || !projectForm.clientName) {
      toast({
        title: "Error",
        description: "Please fill in project name and client.",
        variant: "destructive"
      });
      return;
    }

    const newProject: Project = {
      id: selectedProject?.id || Date.now().toString(),
      name: projectForm.name,
      description: projectForm.description,
      clientName: projectForm.clientName,
      status: projectForm.status,
      startDate: projectForm.startDate,
      deadline: projectForm.deadline || undefined,
      budget: projectForm.budget ? Number(projectForm.budget) : undefined,
      tasks: selectedProject?.tasks || [],
      createdAt: selectedProject?.createdAt || new Date().toISOString()
    };

    if (selectedProject) {
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? newProject : p));
    } else {
      setProjects(prev => [...prev, newProject]);
    }

    setIsProjectDialogOpen(false);
    setSelectedProject(null);
    setProjectForm({
      name: '',
      description: '',
      clientName: '',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      deadline: '',
      budget: ''
    });

    toast({
      title: "Success",
      description: selectedProject ? "Project updated successfully" : "Project created successfully"
    });
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setProjectForm({
      name: project.name,
      description: project.description,
      clientName: project.clientName,
      status: project.status,
      startDate: project.startDate,
      deadline: project.deadline || '',
      budget: project.budget?.toString() || ''
    });
    setIsProjectDialogOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject(null);
      setViewMode('list');
    }
    toast({
      title: "Success",
      description: "Project deleted successfully"
    });
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setViewMode('detail');
  };

  const handleSaveTask = () => {
    if (!taskForm.name || !selectedProject) {
      toast({
        title: "Error",
        description: "Please fill in task name.",
        variant: "destructive"
      });
      return;
    }

    const newTask: ProjectTask = {
      id: Date.now().toString(),
      name: taskForm.name,
      description: taskForm.description,
      completed: false,
      deadline: taskForm.deadline || undefined,
      estimatedHours: taskForm.estimatedHours ? Number(taskForm.estimatedHours) : undefined,
      hourlyRate: taskForm.hourlyRate ? Number(taskForm.hourlyRate) : undefined,
      createdAt: new Date().toISOString()
    };

    const updatedProject = {
      ...selectedProject,
      tasks: [...selectedProject.tasks, newTask]
    };

    setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);

    setIsTaskDialogOpen(false);
    setTaskForm({
      name: '',
      description: '',
      deadline: '',
      estimatedHours: '',
      hourlyRate: '50'
    });

    toast({
      title: "Success",
      description: "Task added successfully"
    });
  };

  const toggleTaskCompletion = (taskId: string) => {
    if (!selectedProject) return;

    const updatedProject = {
      ...selectedProject,
      tasks: selectedProject.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    };

    setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
  };

  const deleteTask = (taskId: string) => {
    if (!selectedProject) return;

    const updatedProject = {
      ...selectedProject,
      tasks: selectedProject.tasks.filter(task => task.id !== taskId)
    };

    setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);

    toast({
      title: "Success",
      description: "Task deleted successfully"
    });
  };

  const convertProjectToInvoice = (project: Project) => {
    const totalCost = getProjectCost(project);
    toast({
      title: "Convert to Invoice",
      description: `This would create an invoice for ${project.name} with total cost ${formatCurrency(totalCost)}.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (viewMode === 'detail' && selectedProject) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50">
          <NewDashboardSidebar />
          <div className="flex-1">
            <div className="p-4 border-b bg-white">
              <SidebarTrigger />
            </div>
            
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <Button variant="outline" onClick={() => setViewMode('list')} className="mb-2">
                    ← Back to Projects
                  </Button>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleEditProject(selectedProject)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Project
                  </Button>
                  <Button onClick={() => convertProjectToInvoice(selectedProject)} className="bg-blue-600 hover:bg-blue-700">
                    Convert to Invoice
                  </Button>
                </div>
              </div>

              {/* Project Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Progress</p>
                        <p className="text-2xl font-bold text-gray-900">{Math.round(getProjectProgress(selectedProject))}%</p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-100">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <Progress value={getProjectProgress(selectedProject)} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedProject.tasks.length}</p>
                      </div>
                      <div className="p-3 rounded-full bg-green-100">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Est. Hours</p>
                        <p className="text-2xl font-bold text-gray-900">{getTotalHours(selectedProject)}</p>
                      </div>
                      <div className="p-3 rounded-full bg-yellow-100">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Est. Cost</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(getProjectCost(selectedProject))}</p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-100">
                        <DollarSign className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Client</Label>
                      <p className="font-semibold">{selectedProject.clientName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Status</Label>
                      <div className="mt-1">
                        <Badge className={getStatusColor(selectedProject.status)}>
                          {selectedProject.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                      <p>{new Date(selectedProject.startDate).toLocaleDateString()}</p>
                    </div>
                    {selectedProject.deadline && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Deadline</Label>
                        <p>{new Date(selectedProject.deadline).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedProject.budget && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Budget</Label>
                        <p className="font-semibold text-green-600">{formatCurrency(selectedProject.budget)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Tasks */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Tasks ({selectedProject.tasks.length})</CardTitle>
                    <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Add New Task</DialogTitle>
                          <DialogDescription>
                            Add a task to {selectedProject.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div>
                            <Label htmlFor="taskName">Task Name *</Label>
                            <Input
                              id="taskName"
                              value={taskForm.name}
                              onChange={(e) => setTaskForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Design homepage"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="taskDescription">Description</Label>
                            <Textarea
                              id="taskDescription"
                              value={taskForm.description}
                              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Task description"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label htmlFor="taskDeadline">Deadline</Label>
                            <Input
                              id="taskDeadline"
                              type="date"
                              value={taskForm.deadline}
                              onChange={(e) => setTaskForm(prev => ({ ...prev, deadline: e.target.value }))}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="estimatedHours">Est. Hours</Label>
                              <Input
                                id="estimatedHours"
                                type="number"
                                value={taskForm.estimatedHours}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, estimatedHours: e.target.value }))}
                                min="0"
                                step="0.5"
                              />
                            </div>
                            <div>
                              <Label htmlFor="taskHourlyRate">Hourly Rate ($)</Label>
                              <Input
                                id="taskHourlyRate"
                                type="number"
                                value={taskForm.hourlyRate}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSaveTask}>
                            Add Task
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedProject.tasks.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
                      <p className="text-gray-500 mb-4">Add tasks to track progress and estimate costs</p>
                      <Button onClick={() => setIsTaskDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Task
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Task</TableHead>
                          <TableHead>Deadline</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProject.tasks.map((task) => (
                          <TableRow key={task.id}>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTaskCompletion(task.id)}
                              >
                                {task.completed ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-400" />
                                )}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className={task.completed ? 'line-through text-gray-500' : ''}>
                                <p className="font-medium">{task.name}</p>
                                {task.description && (
                                  <p className="text-sm text-gray-500">{task.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {task.deadline ? new Date(task.deadline).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell>{task.estimatedHours || '-'}</TableCell>
                            <TableCell>{task.hourlyRate ? formatCurrency(task.hourlyRate) + '/hr' : '-'}</TableCell>
                            <TableCell>
                              {task.estimatedHours && task.hourlyRate 
                                ? formatCurrency(task.estimatedHours * task.hourlyRate)
                                : '-'
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" title="Delete">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this task? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteTask(task.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <NewDashboardSidebar />
        <div className="flex-1">
          <div className="p-4 border-b bg-white">
            <SidebarTrigger />
          </div>
          
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <p className="text-gray-600">Manage projects, tasks, and track progress.</p>
              </div>
              <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{selectedProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
                    <DialogDescription>
                      {selectedProject ? 'Update project details' : 'Fill in the project details below'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="projectName">Project Name *</Label>
                      <Input
                        id="projectName"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Website Redesign"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="projectDescription">Description</Label>
                      <Textarea
                        id="projectDescription"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Project description"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="projectClient">Client *</Label>
                      <Select value={projectForm.clientName} onValueChange={(value) => setProjectForm(prev => ({ ...prev, clientName: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.name}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={projectForm.startDate}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={projectForm.deadline}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, deadline: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={projectForm.status} onValueChange={(value) => setProjectForm(prev => ({ ...prev, status: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="budget">Budget ($)</Label>
                        <Input
                          id="budget"
                          type="number"
                          value={projectForm.budget}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, budget: e.target.value }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsProjectDialogOpen(false);
                      setSelectedProject(null);
                      setProjectForm({
                        name: '',
                        description: '',
                        clientName: '',
                        status: 'active',
                        startDate: new Date().toISOString().split('T')[0],
                        deadline: '',
                        budget: ''
                      });
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProject}>
                      {selectedProject ? 'Update' : 'Create'} Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600">
                        {projects.filter(p => p.status === 'active').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-100">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {projects.filter(p => p.status === 'completed').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-100">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          projects.reduce((sum, project) => sum + getProjectCost(project), 0)
                        )}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-100">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search projects by name, client, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Projects Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Projects ({filteredProjects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? "No projects found" : "No projects yet"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm 
                        ? "Try adjusting your search terms" 
                        : "Start by creating your first project"
                      }
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setIsProjectDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Project
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Est. Cost</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{project.name}</p>
                              {project.description && (
                                <p className="text-sm text-gray-500">{project.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{project.clientName}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-full">
                              <div className="flex justify-between text-sm mb-1">
                                <span>{Math.round(getProjectProgress(project))}%</span>
                              </div>
                              <Progress value={getProjectProgress(project)} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            {project.tasks.filter(t => t.completed).length}/{project.tasks.length}
                          </TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatCurrency(getProjectCost(project))}
                          </TableCell>
                          <TableCell>
                            {project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewProject(project)}
                                title="View Details"
                              >
                                <FolderOpen className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProject(project)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" title="Delete">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete project "{project.name}"? This action cannot be undone and will delete all associated tasks.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Projects;
