import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from 'wouter';
import { ArrowLeft, Mail, Phone, Building, Calendar, MessageSquare, Trash2, Eye, EyeOff, LogOut, Upload, Download, FileText, Image, File, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Contact {
  id: number;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  createdAt: string;
}

interface FileRecord {
  id: number;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <Image className="w-5 h-5 text-green-400" />;
  if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-400" />;
  return <File className="w-5 h-5 text-blue-400" />;
};

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClientLocal = useQueryClient();

  const adminPassword = 'deployp2v2024';

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setAdminToken(password);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setAdminToken('');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const { data: contacts, isLoading, error } = useQuery<{ success: boolean; contacts: Contact[] }>({
    queryKey: ['/api/contacts'],
    enabled: isAuthenticated,
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: number) => {
      return await apiRequest('DELETE', `/api/contacts/${contactId}`);
    },
    onSuccess: () => {
      queryClientLocal.invalidateQueries({ queryKey: ['/api/contacts'] });
      toast({
        title: "Contact Deleted",
        description: "Contact has been successfully deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    },
  });

  const handleDeleteContact = (contactId: number, contactName: string) => {
    if (confirm(`Are you sure you want to delete the contact from ${contactName}?`)) {
      deleteContactMutation.mutate(contactId);
    }
  };

  // File queries and mutations
  const { data: filesData, isLoading: filesLoading } = useQuery<{ success: boolean; files: FileRecord[] }>({
    queryKey: ['/api/files', adminToken],
    enabled: isAuthenticated && !!adminToken,
    queryFn: async () => {
      const response = await fetch('/api/files', {
        headers: { 'x-admin-token': adminToken }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      return response.json();
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
        body: formData
      });
      const result = await response.json();
      
      if (result.success) {
        queryClientLocal.invalidateQueries({ queryKey: ['/api/files', adminToken] });
        toast({
          title: "File Uploaded",
          description: `${file.name} has been uploaded successfully`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileDownload = async (fileRecord: FileRecord) => {
    try {
      const response = await fetch(`/api/files/${fileRecord.id}/download`, {
        headers: { 'x-admin-token': adminToken }
      });
      
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileRecord.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleFileDelete = async (fileRecord: FileRecord) => {
    if (!confirm(`Are you sure you want to delete ${fileRecord.originalName}?`)) return;

    try {
      const response = await fetch(`/api/files/${fileRecord.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      const result = await response.json();
      
      if (result.success) {
        queryClientLocal.invalidateQueries({ queryKey: ['/api/files', adminToken] });
        toast({
          title: "File Deleted",
          description: `${fileRecord.originalName} has been deleted`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const filesList = filesData?.files || [];

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            <p className="text-gray-300">Enter password to access admin dashboard</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleLogin}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Login
              </Button>
              <Button 
                onClick={() => setLocation('/')}
                variant="outline"
                className="text-gray-300 border-gray-600 hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading contacts</p>
          <Button onClick={() => setLocation('/')} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const contactList = contacts?.contacts || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-md py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setLocation('/')}
              variant="ghost"
              className="text-gray-300 hover:text-indigo-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-indigo-600">
              {contactList.length} Total Contacts
            </Badge>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="mb-6 bg-gray-800 border border-gray-700">
            <TabsTrigger value="contacts" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white" data-testid="tab-contacts">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contacts ({contactList.length})
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white" data-testid="tab-files">
              <FolderOpen className="w-4 h-4 mr-2" />
              Files ({filesList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Contact Submissions</h2>
              <p className="text-gray-300">Manage and review all contact form submissions</p>
            </div>

            {contactList.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">No contacts yet</h3>
                  <p className="text-gray-400">Contact submissions will appear here when users fill out the form.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {contactList.map((contact) => (
                  <Card key={contact.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white text-xl">{contact.name}</CardTitle>
                          <p className="text-gray-400 text-sm mt-1">
                            Submitted {format(new Date(contact.createdAt), 'PPP at p')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-indigo-400 border-indigo-400">
                            ID: {contact.id}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContact(contact.id, contact.name)}
                            disabled={deleteContactMutation.isPending}
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                            data-testid={`button-delete-contact-${contact.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-300">
                          <Mail className="w-4 h-4 mr-3 text-indigo-400" />
                          <a href={`mailto:${contact.email}`} className="hover:text-indigo-400 transition-colors">
                            {contact.email}
                          </a>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center text-gray-300">
                            <Phone className="w-4 h-4 mr-3 text-indigo-400" />
                            <a href={`tel:${contact.phone}`} className="hover:text-indigo-400 transition-colors">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {contact.company && (
                          <div className="flex items-center text-gray-300">
                            <Building className="w-4 h-4 mr-3 text-indigo-400" />
                            <span>{contact.company}</span>
                          </div>
                        )}
                        <div className="flex items-center text-gray-300">
                          <Calendar className="w-4 h-4 mr-3 text-indigo-400" />
                          <span>{format(new Date(contact.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">Message:</h4>
                        <p className="text-gray-300 whitespace-pre-wrap">{contact.message}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="files">
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">File Repository</h2>
                  <p className="text-gray-300">Upload, download, and manage files</p>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    data-testid="input-file-upload"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    data-testid="button-upload-file"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </Button>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Supported formats: PDF, Images (JPG, PNG, GIF, WebP), Documents (DOC, DOCX, XLS, XLSX), Text files (TXT, CSV). Max size: 1GB
              </p>
            </div>

            {filesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Loading files...</p>
              </div>
            ) : filesList.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-12 text-center">
                  <FolderOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">No files yet</h3>
                  <p className="text-gray-400">Upload files to store them in the repository.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filesList.map((file) => (
                  <Card key={file.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getFileIcon(file.mimeType)}
                          <div>
                            <h4 className="text-white font-medium" data-testid={`text-filename-${file.id}`}>{file.originalName}</h4>
                            <div className="flex items-center space-x-3 text-sm text-gray-400">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>{format(new Date(file.uploadedAt), 'MMM dd, yyyy')}</span>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                                {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileDownload(file)}
                            className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                            data-testid={`button-download-file-${file.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFileDelete(file)}
                            className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                            data-testid={`button-delete-file-${file.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}