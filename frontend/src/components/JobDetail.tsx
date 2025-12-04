import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { MapPin, Building2, Clock, DollarSign, ExternalLink, Sparkles, Copy, Check } from 'lucide-react';
import { JobOffer } from '../types';
import { toast } from 'sonner';

interface JobDetailProps {
  job: JobOffer | null;
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE = 'https://evidi-backend.vercel.app';

export function JobDetail({ job, isOpen, onClose }: JobDetailProps) {
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [motivationLetter, setMotivationLetter] = useState(job?.coverLetter ?? '');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setMotivationLetter(job?.coverLetter ?? '');
  }, [job?.id, job?.coverLetter]);

  if (!job) return null;

  const handleGenerateLetter = async () => {
    if (!job) return;
    
    // Reset the letter and go to loading mode
    setMotivationLetter('');
    setIsGeneratingLetter(true);

    try {
      const res = await fetch(`${API_BASE}/api/cover-letter/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
          id: job.id,
          jobDescription: job.description,
          // TODO: replace '' with the actual resume text when available
          resume: '',
        }),
      });

      if (!res.ok) {
        console.error('Failed to generate cover letter', await res.text());
        toast.error('Failed to generate cover letter');
        return;
      }

      const data = await res.json();
        setMotivationLetter(data.coverLetter ?? '');
    } catch (err) {
      console.error('Error generating cover letter', err);
      toast.error('Error generating cover letter');
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(motivationLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {job.title}
            {<Badge variant="default">
                {job.matchScore}% Match
              </Badge>}
          </DialogTitle>
          <DialogDescription className="flex flex-col gap-2 pt-2">
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Posted {formatDate(job.postedDate)}
            </span>
            {job.salary && (
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {job.salary}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="letter">Motivation Letter</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{job.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.stack.map((tech, i) => (
                    <Badge key={i} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button className="flex-1" asChild>
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on {job.source}
                </a>
              </Button>
              <Button variant="outline" className="flex-1">
                Save for Later
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Match Analysis</CardTitle>
                <CardDescription>
                  How this job aligns with your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-tabs-background rounded-lg">
                  <p className="text-primary">{job.aiSummary}</p>
                </div>

                {/* <div>
                  <h3 className="mb-2">Match Score Breakdown</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Skills Match</span>
                        <span>{Math.round(job.matchScore * 0.9)}%</span>
                      </div>
                      <div className="w-full bg-card-bar-background rounded-full h-2">
                        <div
                          className="bg-card-bar h-2 rounded-full"
                          style={{ width: `${job.matchScore * 0.9}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Experience Level</span>
                        <span>{job.matchScore}%</span>
                      </div>
                      <div className="w-full bg-card-bar-background rounded-full h-2">
                        <div
                          className="bg-card-bar h-2 rounded-full"
                          style={{ width: `${job.matchScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Location Preference</span>
                        <span>{Math.round(job.matchScore * 1.05)}%</span>
                      </div>
                      <div className="w-full bg-card-bar-background rounded-full h-2">
                        <div
                          className="bg-card-bar h-2 rounded-full"
                          style={{ width: `${Math.min(job.matchScore * 1.05, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div> */}

                <div>
                  <h3 className="mb-2">Matching Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.stack.map((tech, i) => (
                      <Badge key={i} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="letter" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Motivation Letter</CardTitle>
                <CardDescription>
                  AI-powered personalized cover letter for this position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!motivationLetter ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Sparkles className="h-12 w-12 text-primary mb-4" />
                    <p className="text-primary mb-4 text-center">
                      Generate a customized motivation letter based on your profile and this job posting
                    </p>
                    <Button onClick={handleGenerateLetter} disabled={isGeneratingLetter}>
                      {isGeneratingLetter ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                          Generating with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Motivation Letter
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <Textarea
                      value={motivationLetter}
                      onChange={(e) => setMotivationLetter(e.target.value)}
                      className="min-h-[400px]"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleCopyLetter} className="flex-1">
                        {isCopied ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy to Clipboard
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleGenerateLetter();
                        }}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
