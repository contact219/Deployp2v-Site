import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { ArrowLeft, Mail, Phone, Building, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

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

  const { data: contacts, isLoading, error } = useQuery<{ success: boolean; contacts: Contact[] }>({
    queryKey: ['/api/contacts'],
  });

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
          <Badge variant="secondary" className="bg-indigo-600">
            {contactList.length} Total Contacts
          </Badge>
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
                    <Badge variant="outline" className="text-indigo-400 border-indigo-400">
                      ID: {contact.id}
                    </Badge>
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