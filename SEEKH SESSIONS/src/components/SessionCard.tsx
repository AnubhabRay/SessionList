import { Calendar, Clock, ExternalLink, Play, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Session } from "./GoogleSheetsService";

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const handleJoinSession = () => {
    if (session.joinLink && (session.joinLink.startsWith('http') || session.joinLink.startsWith('https'))) {
      window.open(session.joinLink, '_blank');
    } else if (session.joinLink) {
      // If it doesn't start with http/https, add https://
      window.open(`https://${session.joinLink}`, '_blank');
    } else {
      alert('No session link available');
    }
  };

  const formatDate = (dateString: string) => {
    // Handle dd-MM-yyyy format from our service
    if (dateString.includes('-') && dateString.split('-').length === 3) {
      const [day, month, year] = dateString.split('-');
      const dayNum = parseInt(day);
      const monthNum = parseInt(month) - 1; // Month is 0-indexed
      const yearNum = parseInt(year);
      
      if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
        // Create date object with explicit local timezone (IST)
        const date = new Date(yearNum, monthNum, dayNum);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }
    }
    
    // Fallback for other date formats
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return dateString;
  };

  const getInitials = (name: string) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }
    return 'U';
  };

  return (
    <Card className="bg-gray-900 border-gray-700 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden">
      <div className="p-4 md:p-6">
        {/* Mobile Layout: Stack vertically */}
        <div className="block md:hidden">
          {/* Speaker */}
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 mr-3 rounded-full overflow-hidden bg-gradient-to-br from-yellow-500 to-green-500 flex items-center justify-center">
              {session.imgLink ? (
                <img 
                  src={session.imgLink} 
                  alt={session.speaker}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {getInitials(session.speaker)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{session.speaker}</h3>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-green-400 font-medium">Available</span>
              </div>
            </div>
          </div>

          {/* Join Button - Mobile: Below profile */}
          <div className="mb-4">
            <Button 
              onClick={handleJoinSession}
              disabled={!session.joinLink}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Join Session
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Topic */}
          <h4 className="text-xl font-bold text-yellow-500 mb-2">{session.topic}</h4>
          
          {/* Description - Mobile: Full width */}
          {session.description && (
            <p className="text-gray-300 mb-4 leading-relaxed">{session.description}</p>
          )}

          {/* Date and Time */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center text-gray-300">
              <Calendar className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm">{formatDate(session.date)}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Clock className="w-4 h-4 mr-2 text-green-400" />
              <span className="text-sm">{session.time}</span>
            </div>
          </div>
        </div>

        {/* Desktop Layout: Original side-by-side */}
        <div className="hidden md:block">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Speaker */}
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 mr-3 rounded-full overflow-hidden bg-gradient-to-br from-yellow-500 to-green-500 flex items-center justify-center">
                  {session.imgLink ? (
                    <img 
                      src={session.imgLink} 
                      alt={session.speaker}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {getInitials(session.speaker)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{session.speaker}</h3>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-green-400 font-medium">Available</span>
                  </div>
                </div>
              </div>

              {/* Topic */}
              <h4 className="text-xl font-bold text-yellow-500 mb-2">{session.topic}</h4>
              
              {/* Description */}
              {session.description && (
                <p className="text-gray-300 mb-4 leading-relaxed">{session.description}</p>
              )}

              {/* Date and Time */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-gray-300">
                  <Calendar className="w-4 h-4 mr-2 text-yellow-400" />
                  <span>{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Clock className="w-4 h-4 mr-2 text-green-400" />
                  <span>{session.time}</span>
                </div>
              </div>
            </div>

            {/* Join Button - Desktop: Side */}
            <div className="ml-6">
              <Button 
                onClick={handleJoinSession}
                disabled={!session.joinLink}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Join Session
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Session Status Bar */}
        <div className="mt-4 md:mt-6 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm text-yellow-500 font-medium">Upcoming Session</span>
            </div>
            <div className="text-sm text-gray-400">
              Session ID: #{session.id.toString().padStart(3, '0')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}