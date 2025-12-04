import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Briefcase, Filter, TrendingUp, FileText } from 'lucide-react';
import { JobOffer } from '../types'; // 👈 add this

interface DashboardProps {
  totalJobs: number;
  matchedJobs: number;
  appliedJobs: number;
  responseRate: number;
  jobs: JobOffer[];
}

export function Dashboard({ totalJobs, matchedJobs, appliedJobs, responseRate, jobs }: DashboardProps) {
  const sortedJobs = [...jobs].sort((a, b) => {
    const da = new Date(a.postedDate).getTime();
    const db = new Date(b.postedDate).getTime();
    return db - da; // newest first
  });

  // Take the 3 newest
  const recentJobs = sortedJobs.slice(0, 3); 

  const skillCounts: Record<string, number> = {};

  jobs.forEach((job) => {
    const stack = (job as any).stack;

    if (!stack) return;

    if (Array.isArray(stack)) {
      stack.forEach((rawSkill) => {
        const skill = String(rawSkill).trim();
        if (!skill) return;
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    } else {
      const skill = String(stack).trim();
      if (!skill) return;
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    }
  });

  const topSkillsRaw = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  const maxCount = topSkillsRaw[0]?.count ?? 0;

  const topSkills = topSkillsRaw.map(({ skill, count }) => ({
    skill,
    count,
    percentage: maxCount ? Math.round((count / maxCount) * 100) : 0,
  }));

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
      <div>
        <h2 className='text-primary text-2xl font-bold'>Dashboard</h2>
        <p className="">Overview of your job search activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className='text-primary font-semibold'>Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-card-badge-highlight font-bold text-3xl">{totalJobs}</div>
            <p>
              Collected from all sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className='text-primary font-semibold'>Matched Jobs</CardTitle>
            <Filter className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-card-badge-highlight font-bold text-3xl">{matchedJobs}</div>
            <p>
              Based on your criteria
            </p>
          </CardContent>
        </Card>
        <div className="opacity-50 pointer-events-none select-none">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className='text-primary font-semibold'>Applications</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-card-badge-highlight font-bold text-3xl">{appliedJobs}</div>
              <p>
                Submitted this month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="opacity-50 pointer-events-none select-none">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className='text-primary font-semibold'>Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-card-badge-highlight font-bold text-3xl">{responseRate}%</div>
              <p>
                From applications sent
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Recent Activity</CardTitle>
            <CardDescription>Latest job matches and applications</CardDescription>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No job offers yet. Connect some sources or refresh.
              </p>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between">
                    <div>
                      <p>{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">new</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(job.postedDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Top Skills in Demand</CardTitle>
            <CardDescription>From matched job postings</CardDescription>
          </CardHeader>
          <CardContent>
            {topSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No skills found yet. Add job sources or refresh job offers.
                </p>
              ) : (
                <div className="space-y-3">
                  {topSkills.map((item) => (
                    <div key={item.skill}>
                      <div className="flex items-center justify-between mb-1">
                        <span>{item.skill}</span>
                        <span>{item.count} jobs</span>
                      </div>
                      <div className="w-full bg-card-bar-background rounded-full h-2">
                        <div
                          className="bg-card-bar h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
