import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { FilterCriteria } from '../types';

interface CVUploadProps {
  onExtractFilters: (filters: Partial<FilterCriteria>) => void;
}

export function CVUpload({ onExtractFilters }: CVUploadProps) {
  const [cvText, setCvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    skills: string[];
    experience: string;
    locations: string[];
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCvText(text);
      };
      reader.readAsText(file);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className='text-primary text-2xl font-bold'>CV Analysis</h2>
        <p className="">
          Upload your CV to automatically extract filter criteria
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Upload CV</CardTitle>
            <CardDescription>
              Upload your CV or paste its content below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <input
                type="file"
                id="cv-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="cv-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-10 w-10 text-primary" />
                <div>
                  <p>Click to upload or drag and drop</p>
                  <p className="text-primary">
                    PDF, DOC, DOCX, or TXT
                  </p>
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
              className="min-h-[200px]"
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
            />

            <Button
              className="w-full"
              onClick={handleExtractFromCV}
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
                  Extract Filters from CV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Extracted Data</CardTitle>
            <CardDescription>
              AI-powered analysis of your CV
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!extractedData ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <Sparkles className="h-12 w-12 text-primary mb-4" />
                <p className="text-primary">
                  Upload or paste your CV and click "Extract Filters" to see
                  AI-analyzed results
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3">Skills Detected</h3>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3">Experience Level</h3>
                  <Badge>{extractedData.experience}</Badge>
                </div>

                <div>
                  <h3 className="mb-3">Preferred Locations</h3>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.locations.map((loc, i) => (
                      <Badge key={i} variant="outline">
                        {loc}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={handleApplyFilters}>
                  Apply Filters to Configuration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
