export interface Session {
  id: number;
  speaker: string;
  topic: string;
  description: string;
  date: string;
  time: string;
  joinLink: string;
  status: string;
  imgLink: string;
}

export class GoogleSheetsService {
  private static readonly SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTL6n7HLUSix1o0Wyms6moEbCAtp_RjkuddFwtsJZzliuVA5LC2yhPOblW20eUmsjZID4aIQx2sdLvI/pub?output=csv";
  
  // Alternative fetch method with simpler approach
  private static async simpleFetch(): Promise<string> {
    const response = await fetch(this.SHEET_URL);
    return await response.text();
  }

  static async fetchSessions(): Promise<Session[]> {
    try {
      console.log('Attempting to fetch Google Sheets data...');
      
      let csvData: string = '';
      
      // Try method 1: With cache busting
      try {
        const separator = this.SHEET_URL.includes('?') ? '&' : '?';
        const cacheBuster = `${separator}t=${Date.now()}&rand=${Math.random()}`;
        const urlWithCacheBuster = this.SHEET_URL + cacheBuster;
        
        console.log('Method 1 - Fetching with cache busting:', urlWithCacheBuster);
        
        const response = await fetch(urlWithCacheBuster, {
          method: 'GET',
          mode: 'cors'
        });
        
        if (response.ok) {
          csvData = await response.text();
          console.log('Method 1 successful');
        } else {
          throw new Error(`Method 1 failed: ${response.status}`);
        }
      } catch (error1) {
        console.log('Method 1 failed, trying method 2...', error1);
        
        // Try method 2: Simple fetch without cache busting
        try {
          console.log('Method 2 - Simple fetch from:', this.SHEET_URL);
          csvData = await this.simpleFetch();
          console.log('Method 2 successful');
        } catch (error2) {
          console.log('Method 2 also failed:', error2);
          throw error2;
        }
      }
      
      console.log('Raw CSV data received (first 200 chars):', csvData.substring(0, 200));
      console.log('Total CSV length:', csvData.length);
      
      if (!csvData || csvData.trim().length === 0) {
        console.warn('Empty CSV data received, using fallback');
        return this.getFallbackData();
      }
      
      const sessions = this.parseCSV(csvData);
      console.log('Parsed sessions count:', sessions.length);
      
      return sessions.length > 0 ? sessions : this.getFallbackData();
    } catch (error) {
      console.error('All fetch methods failed:', error);
      console.log('Using fallback data (5 sample sessions)');
      return this.getFallbackData();
    }
  }

  private static parseCSV(csvData: string): Session[] {
    const lines = csvData.trim().split('\n');
    const sessions: Session[] = [];
    
    console.log('Total lines in CSV:', lines.length);
    console.log('Header line:', lines[0]);
    
    // Skip header row (assuming first row contains headers)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        console.log(`Skipping empty line ${i}`);
        continue;
      }
      
      const columns = this.parseCSVLine(line);
      console.log(`Line ${i} columns:`, columns);
      
      if (columns.length >= 6 && columns[0]?.trim() && columns[1]?.trim()) {
        const session = {
          id: i,
          speaker: columns[0]?.trim() || '',
          topic: columns[1]?.trim() || '',
          description: columns[2]?.trim() || '',
          date: this.formatDate(columns[3]?.trim() || ''),
          time: this.formatTime(columns[4]?.trim() || ''),
          joinLink: columns[5]?.trim() || '',
          status: columns.length > 7 ? (columns[7]?.trim() || 'upcoming') : 'upcoming',
          imgLink: columns.length > 6 ? (columns[6]?.trim() || '') : ''
        };
        
        console.log(`Adding session ${i}:`, session);
        sessions.push(session);
      } else {
        console.log(`Skipping line ${i} - insufficient data or empty speaker/topic:`, columns);
      }
    }
    
    console.log('Final sessions array:', sessions);
    return sessions;
  }

  private static parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  private static formatDate(dateString: string): string {
    if (!dateString) return '';
    
    // Handle dd MMM yyyy format (e.g., "8 Oct 2025")
    const parts = dateString.trim().split(' ');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIndex = monthNames.indexOf(month);
      
      if (monthIndex !== -1) {
        // Create date in IST timezone to avoid timezone conversion issues
        // Return in a format that preserves the original date intent
        const dayNum = parseInt(day);
        const yearNum = parseInt(year);
        
        if (!isNaN(dayNum) && !isNaN(yearNum)) {
          // Return as dd-MM-yyyy to avoid UTC conversion issues
          const formattedDay = dayNum.toString().padStart(2, '0');
          const formattedMonth = (monthIndex + 1).toString().padStart(2, '0');
          return `${formattedDay}-${formattedMonth}-${yearNum}`;
        }
      }
    }
    
    // Try to parse other date formats as fallback
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      // For other formats, also avoid ISO string to prevent UTC conversion
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
    
    return dateString; // Return original if can't parse
  }

  private static formatTime(timeString: string): string {
    if (!timeString) return '';
    
    // Handle HH:mm format (24-hour) and convert to HH:mm a format (12-hour with AM/PM)
    const timeParts = timeString.trim().split(':');
    if (timeParts.length === 2) {
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      
      if (!isNaN(hours) && hours >= 0 && hours <= 23) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHours}:${minutes} ${period}`;
      }
    }
    
    return timeString; // Return original if can't parse
  }

  private static getFallbackData(): Session[] {
    return [
      {
        id: 1,
        speaker: "Dr. Sarah Johnson",
        topic: "AI in Healthcare: Future Perspectives",
        description: "Explore the transformative potential of artificial intelligence in healthcare systems and patient care.",
        date: "25-12-2024",
        time: "10:00 AM",
        joinLink: "https://meet.google.com/abc-defg-hij",
        status: "upcoming",
        imgLink: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face"
      },
      {
        id: 2,
        speaker: "Prof. Michael Chen",
        topic: "Sustainable Technology Solutions",
        description: "Discover innovative technologies that drive sustainability and environmental responsibility.",
        date: "26-12-2024",
        time: "2:00 PM",
        joinLink: "https://zoom.us/j/123456789",
        status: "upcoming",
        imgLink: ""
      },
      {
        id: 3,
        speaker: "Dr. Priya Sharma",
        topic: "Digital Transformation Strategies",
        description: "Learn effective strategies for implementing digital transformation in modern organizations.",
        date: "27-12-2024",
        time: "11:00 AM",
        joinLink: "https://teams.microsoft.com/l/meetup-join/xyz",
        status: "upcoming",
        imgLink: "https://images.unsplash.com/photo-1494790108755-2616b612c77f?w=400&h=400&fit=crop&crop=face"
      },
      {
        id: 4,
        speaker: "Prof. Alex Rodriguez",
        topic: "Machine Learning Applications",
        description: "Practical applications of machine learning in various industries and business contexts.",
        date: "28-12-2024",
        time: "9:30 AM",
        joinLink: "https://meet.google.com/xyz-abc-def",
        status: "upcoming",
        imgLink: ""
      },
      {
        id: 5,
        speaker: "Dr. Maya Patel",
        topic: "Cybersecurity Best Practices",
        description: "Essential cybersecurity strategies for protecting digital assets and maintaining data privacy.",
        date: "29-12-2024",
        time: "3:00 PM",
        joinLink: "https://zoom.us/j/987654321",
        status: "upcoming",
        imgLink: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face"
      }
    ];
  }
}