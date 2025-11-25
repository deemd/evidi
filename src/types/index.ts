export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // Full-time, Part-time, Contract
  salary?: string;
  description: string;
  requirements: string[];
  stack: string[];
  experience: string;
  postedDate: string;
  source: string;
  url: string;
  isMatch: boolean;
  matchScore: number;
  aiSummary?: string;
}

export interface FilterCriteria {
  stack: string[];
  experience: string[];
  keywords: string[];
  location: string[];
  jobType: string[];
  excludeKeywords: string[];
}

export interface JobSource {
  id: string;
  name: string;
  type: 'RSS' | 'Email' | 'API';
  url: string;
  enabled: boolean;
  lastSync?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  skills: string[];
  experience: string;
  preferredLocations: string[];
  cvText?: string;
}
