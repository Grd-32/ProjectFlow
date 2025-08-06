import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  initials: string;
  role: 'Admin' | 'Manager' | 'Member' | 'Viewer';
  department: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
  createdAt: string;
}

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  manage_users: boolean;
  manage_settings: boolean;
  view_analytics: boolean;
}

interface UserContextType {
  currentUser: User;
  users: User[];
  permissions: Permission;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  setCurrentUser: (user: User) => void;
  hasPermission: (action: keyof Permission) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const getRolePermissions = (role: User['role']): Permission => {
  switch (role) {
    case 'Admin':
      return {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage_users: true,
        manage_settings: true,
        view_analytics: true
      };
    case 'Manager':
      return {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage_users: false,
        manage_settings: false,
        view_analytics: true
      };
    case 'Member':
      return {
        create: true,
        read: true,
        update: true,
        delete: false,
        manage_users: false,
        manage_settings: false,
        view_analytics: false
      };
    case 'Viewer':
      return {
        create: false,
        read: true,
        update: false,
        delete: false,
        manage_users: false,
        manage_settings: false,
        view_analytics: false
      };
    default:
      return {
        create: false,
        read: true,
        update: false,
        delete: false,
        manage_users: false,
        manage_settings: false,
        view_analytics: false
      };
  }
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      avatar: '',
      initials: 'JD',
      role: 'Admin',
      department: 'Engineering',
      status: 'Active',
      lastLogin: '2024-12-11T10:30:00Z',
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      avatar: '',
      initials: 'SC',
      role: 'Manager',
      department: 'Design',
      status: 'Active',
      lastLogin: '2024-12-11T14:20:00Z',
      createdAt: '2024-02-01T09:00:00Z'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      avatar: '',
      initials: 'MJ',
      role: 'Member',
      department: 'Engineering',
      status: 'Active',
      lastLogin: '2024-12-11T09:15:00Z',
      createdAt: '2024-03-10T09:00:00Z'
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@company.com',
      avatar: '',
      initials: 'AR',
      role: 'Member',
      department: 'Documentation',
      status: 'Active',
      lastLogin: '2024-12-10T16:45:00Z',
      createdAt: '2024-04-05T09:00:00Z'
    },
    {
      id: '5',
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      avatar: '',
      initials: 'ED',
      role: 'Manager',
      department: 'DevOps',
      status: 'Active',
      lastLogin: '2024-12-11T11:30:00Z',
      createdAt: '2024-05-20T09:00:00Z'
    },
    {
      id: '6',
      name: 'Lisa Wang',
      email: 'lisa.wang@company.com',
      avatar: '',
      initials: 'LW',
      role: 'Member',
      department: 'Engineering',
      status: 'Active',
      lastLogin: '2024-12-11T13:00:00Z',
      createdAt: '2024-06-15T09:00:00Z'
    }
  ]);

  const [currentUser, setCurrentUser] = useState<User>(users[0]); // Default to first user (Admin)

  const permissions = getRolePermissions(currentUser.role);

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
    
    // Update current user if it's being modified
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const hasPermission = (action: keyof Permission): boolean => {
    return permissions[action];
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      permissions,
      addUser,
      updateUser,
      deleteUser,
      setCurrentUser,
      hasPermission
    }}>
      {children}
    </UserContext.Provider>
  );
};