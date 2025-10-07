import { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { goalService } from '../services/goalService';
import { documentService } from '../services/documentService';

export function useSupabaseProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProjects();

    const subscription = projectService.subscribeToProjects((payload) => {
      if (payload.eventType === 'INSERT') {
        setProjects(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
      } else if (payload.eventType === 'DELETE') {
        setProjects(prev => prev.filter(p => p.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadProjects() {
    setLoading(true);
    const { data, error } = await projectService.getAll();
    if (error) {
      setError(error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }

  async function createProject(project: any) {
    const { data, error } = await projectService.create(project);
    if (error) throw error;
    return data;
  }

  async function updateProject(id: string, updates: any) {
    const { data, error } = await projectService.update(id, updates);
    if (error) throw error;
    return data;
  }

  async function deleteProject(id: string) {
    const { error } = await projectService.delete(id);
    if (error) throw error;
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refresh: loadProjects
  };
}

export function useSupabaseTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadTasks();

    const subscription = taskService.subscribeToTasks((payload) => {
      if (payload.eventType === 'INSERT') {
        setTasks(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
      } else if (payload.eventType === 'DELETE') {
        setTasks(prev => prev.filter(t => t.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadTasks() {
    setLoading(true);
    const { data, error } = await taskService.getAll();
    if (error) {
      setError(error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }

  async function createTask(task: any) {
    const { data, error } = await taskService.create(task);
    if (error) throw error;
    return data;
  }

  async function updateTask(id: string, updates: any) {
    const { data, error } = await taskService.update(id, updates);
    if (error) throw error;
    return data;
  }

  async function deleteTask(id: string) {
    const { error } = await taskService.delete(id);
    if (error) throw error;
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh: loadTasks
  };
}

export function useSupabaseUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadUsers();

    const subscription = userService.subscribeToUsers((payload) => {
      if (payload.eventType === 'INSERT') {
        setUsers(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new : u));
      } else if (payload.eventType === 'DELETE') {
        setUsers(prev => prev.filter(u => u.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadUsers() {
    setLoading(true);
    const { data, error } = await userService.getAll();
    if (error) {
      setError(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  async function createUser(user: any) {
    const { data, error } = await userService.create(user);
    if (error) throw error;
    return data;
  }

  async function updateUser(id: string, updates: any) {
    const { data, error } = await userService.update(id, updates);
    if (error) throw error;
    return data;
  }

  async function deleteUser(id: string) {
    const { error } = await userService.delete(id);
    if (error) throw error;
  }

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refresh: loadUsers
  };
}

export function useSupabaseGoals() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadGoals();

    const subscription = goalService.subscribeToGoals((payload) => {
      if (payload.eventType === 'INSERT') {
        setGoals(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setGoals(prev => prev.map(g => g.id === payload.new.id ? payload.new : g));
      } else if (payload.eventType === 'DELETE') {
        setGoals(prev => prev.filter(g => g.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadGoals() {
    setLoading(true);
    const { data, error } = await goalService.getAll();
    if (error) {
      setError(error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  }

  async function createGoal(goal: any) {
    const { data, error } = await goalService.create(goal);
    if (error) throw error;
    return data;
  }

  async function updateGoal(id: string, updates: any) {
    const { data, error} = await goalService.update(id, updates);
    if (error) throw error;
    return data;
  }

  async function deleteGoal(id: string) {
    const { error } = await goalService.delete(id);
    if (error) throw error;
  }

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refresh: loadGoals
  };
}
