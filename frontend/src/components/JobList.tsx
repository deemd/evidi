import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Building2, Clock, ExternalLink, TrendingUp, RefreshCw } from 'lucide-react';
import { JobOffer } from '../types';

interface JobListProps {
  jobs: JobOffer[];
  onSelectJob: (job: JobOffer) => void;
  onRefreshJobs: () => void;
}

export function JobList({ jobs, onSelectJob, onRefreshJobs }: JobListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('matchScore');
  const [filterTab, setFilterTab] = useState('all');

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = 
      filterTab === 'all' ||
      (filterTab === 'matched' && job.isMatch) ||
      (filterTab === 'new' && new Date(job.postedDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesTab;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'matchScore') return b.matchScore - a.matchScore;
    if (sortBy === 'date') return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
    return 0;
  });

  const newCount = jobs.filter(j => new Date(j.postedDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className='text-primary text-2xl font-bold'>Job Offers</h2>
          <p className=''>
            Browse and filter collected job opportunities
          </p>
        </div>

        <Button
            size="sm"
            onClick={onRefreshJobs}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Update
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search jobs, companies, or technologies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="matchScore">Best Match</SelectItem>
            <SelectItem value="date">Most Recent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={filterTab} onValueChange={setFilterTab}>
        <TabsList>
          <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="matched">Matched ({jobs.filter(j => j.isMatch).length})</TabsTrigger>
          <TabsTrigger value="new">New ({newCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filterTab} className="mt-6">
          <div className="space-y-4">
            {sortedJobs.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-40">
                  <p className="text-primary">No jobs found matching your criteria</p>
                </CardContent>
              </Card>
            ) : (
              sortedJobs.map((job) => (
                <Card
                  key={job.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onSelectJob(job)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <p className='text-primary font-medium'>{job.title}</p>
                          {job.isMatch && (
                            <Badge variant="default" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {job.matchScore}% Match
                            </Badge>
                          )}
                          {!job.isMatch && (
                            <Badge variant="secondary" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {job.matchScore}% Match
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex flex-col gap-1 mt-2">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(job.postedDate)}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline">{job.type}</Badge>
                        {job.salary && (
                          <span className="text-primary">
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {job.stack.map((tech, i) => (
                          <Badge key={i} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      {job.aiSummary && (
                        <div className="p-3 bg-tabs-background rounded-lg">
                          <p>{job.aiSummary}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-primary">
                          Source: {job.source}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Original
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
