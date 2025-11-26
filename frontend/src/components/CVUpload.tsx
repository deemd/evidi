import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { FilterCriteria } from '../types';

interface CVUploadProps {
  userEmail: string;
  onExtractFilters: (filters: Partial<FilterCriteria>) => void;
  onSaveResume?: (cvText: string) => void;
  resumeRequired?: boolean;
  onResumeSubmitted?: () => void;
}

const API_BASE = 'https://evidi-backend.vercel.app';

export function CVUpload({ userEmail, onExtractFilters, onSaveResume, resumeRequired, onResumeSubmitted}: CVUploadProps) {
  const [cvText, setCvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    skills: string[];
    experience: string;
    locations: string[];
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userEmail) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `${API_BASE}/api/users/${encodeURIComponent(userEmail)}/resume/upload-analyze`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!res.ok) {
        console.error('Failed to analyze resume', await res.text());
        return;
      }

      const data = await res.json();
      // data: { filters: FilterCriteria; resume: string | null }

      const filters = data.filters ?? {};
      onExtractFilters(filters);

      const extracted = {
        skills: data.skills || [],
        experience: data.experience || '',
        locations: data.locations || [],
      };
      setExtractedData(extracted);

      // Notify parent that resume is handled so it can close modal
      onResumeSubmitted?.();

      // Just to show something in the textarea
      setCvText(`File uploaded: ${file.name}`);
    } catch (err) {
      console.error('Error uploading/analyzing resume:', err);
    } finally {
      setIsProcessing(false);
    }
  };


  const handleExtractFromCV = () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      // Mock extraction - in real app, this would use AI to parse the CV
      const mockExtracted = {
        skills: [
          'React', 'TypeScript', 'Node.js', 'Next.js', 
          'PostgreSQL', 'AWS', 'Docker', 'Git'
        ],
        experience: 'Senior',
        locations: ['Remote', 'San Francisco', 'New York'],
      };
      
      setExtractedData(mockExtracted);
      setIsProcessing(false);
    }, 2000);
  };

  const handleApplyFilters = () => {
    if (extractedData) {
      onExtractFilters({
        stack: extractedData.skills,
        experience: [extractedData.experience],
        location: extractedData.locations,
      });
    }
  };

  const handleSaveCV = async () => {
    if (!onSaveResume || !cvText) return;

    try {
      setIsSaving(true);
      await onSaveResume(cvText);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Upload Resume</CardTitle>
            <CardDescription>
              Upload your resume or paste its content below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <input
                type="file"
                id="cv-upload"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-10 w-10 text-primary" />
                <div>
                  <p>Click to upload or drag and drop your</p>
                  <p>resume in .pdf format</p>
                </div>
              </label>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card-background px-2 text-primary">
                  or paste text
                </span>
              </div>
            </div>

            <Textarea
              placeholder="Paste your CV content here..."
              className="min-h-[115px]"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={() => {
                handleExtractFromCV();
                handleSaveCV();
              }}
              disabled={!cvText || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Save Resume & Extract Filters
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}