import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import * as api from '../services/api'; // Migrated from Supabase to custom backend
import { Match, Profile } from '../types';

const MatchesScreen = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    async function loadMatches() {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your matches",
          variant: "destructive"
        });
        setLocation('/login');
        return;
      }

      try {
        // For now, we'll simulate matches since we don't have a matches API endpoint yet
        // In a real implementation, you would call: const userMatches = await api.getMatches();
        
        // Simulate some matches for demo purposes
        const mockMatches: Match[] = [
          {
            id: '1',
            userId: user.id,
            matchedUserId: 'user1',
            createdAt: new Date().toISOString(),
            profile: {
              id: 'user1',
              name: 'Emma Wilson',
              photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
              age: 27,
              bio: 'Love hiking and photography',
              occupation: 'Graphic Designer'
            }
          },
          {
            id: '2',
            userId: user.id,
            matchedUserId: 'user2',
            createdAt: new Date().toISOString(),
            profile: {
              id: 'user2',
              name: 'Lucas Brown',
              photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500',
              age: 30,
              bio: 'Musician and teacher',
              occupation: 'Music Teacher'
            }
          }
        ];
        
        setMatches(mockMatches);
        setLoading(false);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load matches",
          variant: "destructive"
        });
        setLoading(false);
      }
    }
    
    loadMatches();
  }, [user, setLocation, toast]);

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    // Load messages for this match
    // In a real implementation: loadMessages(match.id);
    setMessages([
      {
        id: '1',
        userId: match.matchedUserId,
        message: 'Hey! Nice to meet you 😊',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '2',
        userId: user?.id,
        message: 'Hi! Great to match with you too!',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) return;

    try {
      // In a real implementation: await api.sendMessage(selectedMatch.id, newMessage);
      
      const newMsg = {
        id: Date.now().toString(),
        userId: user?.id,
        message: newMessage.trim(),
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">{t('common.loading')}</span>
      </div>
    );
  }

  // If a match is selected, show chat interface
  if (selectedMatch) {
    return (
      <div className="max-w-md mx-auto h-screen flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setSelectedMatch(null)}
            className="mr-3 text-primary hover:text-primary-dark"
          >
            ←
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-3">
            {selectedMatch.profile?.photo ? (
              <img 
                src={selectedMatch.profile.photo} 
                alt={selectedMatch.profile.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                👤
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{selectedMatch.profile?.name}</h3>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.userId === user?.id 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary dark:bg-gray-800"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main matches list view
  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('matches.title', 'Matches')}</h1>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💔</div>
          <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Keep swiping to find your perfect match!
          </p>
          <button
            onClick={() => setLocation('/home')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition"
          >
            Start Swiping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div 
              key={match.id}
              onClick={() => handleMatchSelect(match)}
              className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden mr-4">
                {match.profile?.photo ? (
                  <img 
                    src={match.profile.photo} 
                    alt={match.profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    👤
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{match.profile?.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {match.profile?.occupation} • {match.profile?.age}
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                  Matched {new Date(match.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-primary">
                💬
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesScreen;