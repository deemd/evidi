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

  const API_BASE = 'https://testfastapi-flax.vercel.app';

  export function CVUpload({ userEmail, onExtractFilters, onSaveResume, resumeRequired, onResumeSubmitted}: CVUploadProps) {
    const [cvText, setCvText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [extractedData, setExtractedData] = useState<{
      skills: string[];
      experience: string;
      locations: string[];
    } | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !userEmail) return;

      // Just store the file and show the success message.
      setSelectedFile(file);
      setUploadSuccess(true);

      // Optional: if you want to reflect the name in the textarea
      setCvText(file.name);
    };


    const handleExtractFromCV = async () => {
      // Need either a selected file or some text, and an email
      if ((!selectedFile && !cvText.trim()) || !userEmail) return;

      setIsProcessing(true);

      try {
        const formData = new FormData();

        if (selectedFile) {
          // ✅ Use the real uploaded file
          formData.append('file', selectedFile);
        } else {
          // Fallback: create a fake file from pasted text
          const blob = new Blob([cvText], { type: 'application/pdf' });
          const fakeFile = new File([blob], 'resume.pdf', { type: 'application/pdf' });
          formData.append('file', fakeFile);
        }

        const res = await fetch(
          `${API_BASE}/api/users/${encodeURIComponent(userEmail)}/resume/upload-analyze`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!res.ok) {
          console.error('Failed to analyze resume', await res.text());
          setIsProcessing(false);
          return;
        }

        // Backend returns: { filters: FilterCriteria; resume: string | null }
        const data = await res.json();
        const filters = data.filters ?? {};

        onExtractFilters(filters);

        setExtractedData({
          skills: filters.stack ?? [],
          experience: (filters.experience && filters.experience[0]) || '',
          locations: filters.location ?? [],
        });

        if (onSaveResume && !selectedFile) {
          // Only makes sense to send raw text if we're in "paste text" mode
          await onSaveResume(cvText);
        }

        onResumeSubmitted?.();
      } catch (err) {
        console.error('Error analyzing resume from pasted text:', err);
      } finally {
        setIsProcessing(false);
      }
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

              {uploadSuccess && (
                <p className="text-green-600 text-sm font-medium">
                  Resume successfully uploaded!
                </p>
              )}

              <Button
                className="w-full"
                onClick={() => {
                  handleExtractFromCV();
                  handleSaveCV();
                }}
                disabled={(!selectedFile && !cvText) || isProcessing}
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