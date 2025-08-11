import React, { useState, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Share2,
  Folder,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Star,
  Clock,
  User,
  FolderPlus,
  Move,
  Copy,
  Archive,
  Lock,
  Unlock
} from 'lucide-react';
import { format } from 'date-fns';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  mimeType?: string;
  size?: number;
  url?: string;
  thumbnail?: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  starred: boolean;
  shared: boolean;
  parentId?: string;
  tags: string[];
  version: number;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canShare: boolean;
  };
  versions: Array<{
    id: string;
    version: number;
    uploadedAt: string;
    uploadedBy: string;
    size: number;
    url: string;
    comment?: string;
  }>;
}

interface FileManagerProps {
  projectId?: string;
  taskId?: string;
  isModal?: boolean;
  onClose?: () => void;
  onFileSelect?: (file: FileItem) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ 
  projectId, 
  taskId, 
  isModal = false, 
  onClose, 
  onFileSelect 
}) => {
  const { addNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'Project Requirements.pdf',
      type: 'file',
      mimeType: 'application/pdf',
      size: 2048000,
      url: '#',
      uploadedBy: 'Sarah Chen',
      uploadedAt: '2024-12-10T10:30:00Z',
      lastModified: '2024-12-10T10:30:00Z',
      starred: true,
      shared: false,
      tags: ['requirements', 'planning'],
      version: 1,
      permissions: { canEdit: true, canDelete: true, canShare: true },
      versions: []
    },
    {
      id: '2',
      name: 'Design Assets',
      type: 'folder',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-12-08T14:20:00Z',
      lastModified: '2024-12-11T16:45:00Z',
      starred: false,
      shared: true,
      tags: ['design'],
      version: 1,
      permissions: { canEdit: true, canDelete: false, canShare: true },
      versions: []
    },
    {
      id: '3',
      name: 'hero-mockup.png',
      type: 'file',
      mimeType: 'image/png',
      size: 1536000,
      url: '#',
      thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400',
      uploadedBy: 'Alex Rodriguez',
      uploadedAt: '2024-12-09T16:45:00Z',
      lastModified: '2024-12-09T16:45:00Z',
      starred: false,
      shared: true,
      parentId: '2',
      tags: ['mockup', 'hero'],
      version: 2,
      permissions: { canEdit: true, canDelete: true, canShare: true },
      versions: [
        {
          id: '3-v1',
          version: 1,
          uploadedAt: '2024-12-08T16:45:00Z',
          uploadedBy: 'Alex Rodriguez',
          size: 1024000,
          url: '#',
          comment: 'Initial mockup version'
        }
      ]
    }
  ]);

  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'files' | 'folders' | 'images' | 'documents'>('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFileActions, setShowFileActions] = useState<string | null>(null);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'files' && file.type === 'file') ||
                         (filterType === 'folders' && file.type === 'folder') ||
                         (filterType === 'images' && file.mimeType?.startsWith('image/')) ||
                         (filterType === 'documents' && file.mimeType?.includes('pdf'));
    const matchesFolder = file.parentId === currentFolder;
    
    return matchesSearch && matchesFilter && matchesFolder;
  });

  const handleFileUpload = (uploadedFiles: FileList) => {
    Array.from(uploadedFiles).forEach(file => {
      const newFile: FileItem = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: 'file',
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedBy: 'John Doe',
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        starred: false,
        shared: false,
        parentId: currentFolder || undefined,
        tags: [],
        version: 1,
        permissions: { canEdit: true, canDelete: true, canShare: true },
        versions: []
      };

      setFiles(prev => [...prev, newFile]);

      addNotification({
        type: 'success',
        title: 'File Uploaded',
        message: `File "${file.name}" uploaded successfully`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: projectId || taskId || 'files',
          name: file.name
        }
      });
    });
  };

  const createFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FileItem = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        type: 'folder',
        uploadedBy: 'John Doe',
        uploadedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        starred: false,
        shared: false,
        parentId: currentFolder || undefined,
        tags: [],
        version: 1,
        permissions: { canEdit: true, canDelete: true, canShare: true },
        versions: []
      };

      setFiles(prev => [...prev, newFolder]);
      setNewFolderName('');
      setShowNewFolderModal(false);

      addNotification({
        type: 'info',
        title: 'Folder Created',
        message: `Folder "${newFolder.name}" created successfully`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'files',
          name: newFolder.name
        }
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
    setShowUploadArea(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setShowUploadArea(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setShowUploadArea(false);
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return <Folder className="h-8 w-8 text-blue-500" />;
    if (file.mimeType?.startsWith('image/')) return <Image className="h-8 w-8 text-green-500" />;
    if (file.mimeType?.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />;
    if (file.mimeType?.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleStar = (fileId: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, starred: !file.starred } : file
    ));
    
    const file = files.find(f => f.id === fileId);
    if (file) {
      addNotification({
        type: 'info',
        title: file.starred ? 'Removed from Favorites' : 'Added to Favorites',
        message: `File "${file.name}" ${file.starred ? 'removed from' : 'added to'} favorites`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'files',
          name: file.name
        }
      });
    }
  };

  const deleteFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file && window.confirm(`Delete "${file.name}"?`)) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      addNotification({
        type: 'warning',
        title: 'File Deleted',
        message: `File "${file.name}" has been deleted`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'files',
          name: file.name
        }
      });
    }
  };

  const shareFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, shared: !f.shared } : f
      ));
      addNotification({
        type: 'info',
        title: file.shared ? 'File Unshared' : 'File Shared',
        message: `File "${file.name}" ${file.shared ? 'is no longer shared' : 'is now shared'}`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'files',
          name: file.name
        }
      });
    }
  };

  const duplicateFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      const duplicatedFile: FileItem = {
        ...file,
        id: Date.now().toString(),
        name: `${file.name} (Copy)`,
        uploadedAt: new Date().toISOString(),
        starred: false,
        version: 1,
        versions: []
      };
      setFiles(prev => [...prev, duplicatedFile]);
      
      addNotification({
        type: 'info',
        title: 'File Duplicated',
        message: `File "${file.name}" has been duplicated`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'files',
          name: file.name
        }
      });
    }
  };

  const downloadFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file && file.url) {
      // In a real app, this would trigger actual download
      addNotification({
        type: 'success',
        title: 'Download Started',
        message: `Downloading "${file.name}"`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'files',
          name: file.name
        }
      });
    }
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId);
  };

  const getCurrentPath = () => {
    if (!currentFolder) return 'Root';
    const folder = files.find(f => f.id === currentFolder);
    return folder ? folder.name : 'Unknown';
  };

  const content = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">File Manager</h2>
            <div className="flex items-center space-x-2 mt-1">
              <button
                onClick={() => navigateToFolder(null)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Root
              </button>
              {currentFolder && (
                <>
                  <span className="text-gray-400">/</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{getCurrentPath()}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <FolderPlus className="h-4 w-4" />
              <span>New Folder</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Files</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">All Files</option>
            <option value="files">Files Only</option>
            <option value="folders">Folders Only</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
          </select>
        </div>
      </div>

      {/* File Upload Area */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={createFolder}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Area */}
      {showUploadArea && (
        <div 
          className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-dashed border-blue-500 flex items-center justify-center z-50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-blue-700 dark:text-blue-300">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* Files Content */}
      <div 
        className="flex-1 p-6 overflow-auto"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer relative"
                onClick={() => {
                  if (file.type === 'folder') {
                    navigateToFolder(file.id);
                  } else {
                    onFileSelect?.(file);
                  }
                }}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative">
                    {file.thumbnail ? (
                      <img 
                        src={file.thumbnail} 
                        alt={file.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      getFileIcon(file)
                    )}
                    {file.starred && (
                      <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    {file.shared && (
                      <Share2 className="absolute -top-1 -left-1 h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="text-center w-full">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </p>
                    {file.size && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(file.id);
                      }}
                      className="p-1 text-gray-400 hover:text-yellow-500 rounded"
                    >
                      <Star className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareFile(file.id);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-500 rounded"
                    >
                      <Share2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFileActions(showFileActions === file.id ? null : file.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </button>
                  </div>

                  {/* File Actions Dropdown */}
                  {showFileActions === file.id && (
                    <div className="absolute top-8 right-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(file.id);
                          setShowFileActions(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateFile(file.id);
                          setShowFileActions(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Copy className="h-4 w-4" />
                        <span>Duplicate</span>
                      </button>
                      {file.permissions.canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                            setShowFileActions(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (file.type === 'folder') {
                    navigateToFolder(file.id);
                  } else {
                    onFileSelect?.(file);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      {file.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      {file.shared && <Share2 className="h-4 w-4 text-blue-500" />}
                      {file.version > 1 && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                          v{file.version}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      {file.size && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.size)}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {file.uploadedBy}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(file.uploadedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(file.id);
                    }}
                    className="p-1 text-gray-400 hover:text-yellow-500 rounded"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareFile(file.id);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFileActions(showFileActions === file.id ? null : file.id);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <File className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No files found</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Files
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {showFileActions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowFileActions(null)}
        />
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">File Manager</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default FileManager;