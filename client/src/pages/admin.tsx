import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { ArrowLeft, Mail, Phone, Building, Calendar, MessageSquare, Trash2, Eye, EyeOff, LogOut } from 'lucide-react';
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

export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple password check (in production, use proper authentication)
  const adminPassword = 'deployp2v2024';

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
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
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
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
      </div>
    </div>
  );
}