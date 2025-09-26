import { useState, useEffect } from "react";
import { SessionCard } from "./components/SessionCard";
import { GoogleSheetsService, Session } from "./components/GoogleSheetsService";
import { Calendar, Clock, Users, RefreshCw } from "lucide-react";
import { Button } from "./components/ui/button";

export default function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting session fetch...');
      const sessionData = await GoogleSheetsService.fetchSessions();
      console.log('Received session data:', sessionData);
      setSessions(sessionData);
    } catch (err) {
      setError('Failed to load sessions. Please try refreshing the page.');
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-yellow-500/20">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              SEEKH <span className="text-yellow-500">SESSIONS</span>
            </h1>
            <p className="text-gray-300 text-base md:text-lg">
              Join our expert-led learning sessions
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center mt-6 md:mt-8 space-x-4 md:space-x-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-full mb-2 mx-auto">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{sessions.length}</div>
              <div className="text-xs md:text-sm text-gray-400">Sessions</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-yellow-500/20 rounded-full mb-2 mx-auto">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{new Set(sessions.map(s => s.date)).size}</div>
              <div className="text-xs md:text-sm text-gray-400">Days</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-500/20 rounded-full mb-2 mx-auto">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">Live</div>
              <div className="text-xs md:text-sm text-gray-400">Sessions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 md:mb-8">
            {/* Mobile Layout - Refresh button beside title */}
            <div className="flex md:hidden justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-white">Upcoming Sessions</h2>
              <Button
                onClick={() => {
                  console.log('Refresh button clicked');
                  fetchSessions();
                }}
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 ml-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {/* Desktop Layout - Original side-by-side */}
            <div className="hidden md:flex md:justify-between md:items-center">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Upcoming Sessions</h2>
              </div>
          {/*}<Button
            onClick={() => {
            console.log('Refresh button clicked');
            fetchSessions();
            }}
            disabled={loading}
            variant="outline"
            className="bg-gray-800 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh ({sessions.length})
            </Button> */}
            </div>
            
            {/* Description and note - same for both mobile and desktop */}
            <div className="mt-2">
              <p className="text-gray-400 text-sm md:text-base">Click "Join Session" to participate in live sessions</p>
              <p className="text-yellow-400/80 text-xs md:text-sm mt-1 italic">Links will be active 15 mins prior to a session.</p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-6 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                        <div>
                          <div className="w-32 h-4 bg-gray-700 rounded mb-2"></div>
                          <div className="w-16 h-3 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="w-3/4 h-6 bg-gray-700 rounded mb-4"></div>
                      <div className="flex gap-4">
                        <div className="w-24 h-4 bg-gray-700 rounded"></div>
                        <div className="w-24 h-4 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    <div className="w-32 h-10 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-6">
              {sessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Sessions Found</h3>
              <p className="text-gray-400 mb-4">There are currently no sessions scheduled.</p>
              <Button onClick={fetchSessions} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">
            Powered by <span className="text-yellow-500 font-semibold">SEEKH</span> Learning Platform
          </p>
        </div>
      </div>
    </div>
  );
}
