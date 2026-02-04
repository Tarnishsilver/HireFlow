export interface Candidate {
  id: string;
  realName: string;
  photoUrl: string;
  role: string;
  college: string;
  location: string;
  gender: 'Male' | 'Female' | 'Non-binary';
  substituteId: string; // e.g. "Candidate-842"
  matchScore: number;
  status: 'Pending' | 'Interviewed' | 'Offer' | 'Rejected';
  scores: {
    technical: number;
    communication: number;
    culture: number;
    trust: number;
  };
  risks: {
    plagiarism: 'Low' | 'Medium' | 'High';
    consistency: 'Low' | 'Medium' | 'High';
  };
}

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    realName: 'Sarah Jenkins',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    role: 'Senior Frontend Engineer',
    college: 'Stanford University',
    location: 'San Francisco, CA',
    gender: 'Female',
    substituteId: 'Candidate-842',
    matchScore: 92,
    status: 'Interviewed',
    scores: {
      technical: 88,
      communication: 95,
      culture: 90,
      trust: 100
    },
    risks: {
      plagiarism: 'Low',
      consistency: 'Low'
    }
  },
  {
    id: 'c2',
    realName: 'Michael Chen',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    role: 'Backend Architect',
    college: 'University of Waterloo',
    location: 'Toronto, ON',
    gender: 'Male',
    substituteId: 'Candidate-391',
    matchScore: 85,
    status: 'Pending',
    scores: {
      technical: 94,
      communication: 78,
      culture: 82,
      trust: 98
    },
    risks: {
      plagiarism: 'Low',
      consistency: 'Low'
    }
  },
  {
    id: 'c3',
    realName: 'Anita Patel',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    role: 'Product Manager',
    college: 'Georgia Tech',
    location: 'Atlanta, GA',
    gender: 'Female',
    substituteId: 'Candidate-720',
    matchScore: 78,
    status: 'Rejected',
    scores: {
      technical: 65,
      communication: 90,
      culture: 88,
      trust: 92
    },
    risks: {
      plagiarism: 'High',
      consistency: 'Medium'
    }
  },
  {
    id: 'c4',
    realName: 'David Kim',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    role: 'Full Stack Developer',
    college: 'MIT',
    location: 'Boston, MA',
    gender: 'Male',
    substituteId: 'Candidate-155',
    matchScore: 96,
    status: 'Offer',
    scores: {
      technical: 98,
      communication: 85,
      culture: 92,
      trust: 99
    },
    risks: {
      plagiarism: 'Low',
      consistency: 'Low'
    }
  }
];
