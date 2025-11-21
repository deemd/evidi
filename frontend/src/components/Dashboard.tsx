import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Briefcase, Filter, TrendingUp, FileText } from 'lucide-react';

interface DashboardProps {
  totalJobs: number;
  matchedJobs: number;
  appliedJobs: number;
  responseRate: number;
}

export function Dashboard({ totalJobs, matchedJobs, appliedJobs, responseRate }: DashboardProps) {
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Recent Activity</CardTitle>
            <CardDescription>Latest job matches and applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Full Stack Engineer - Next.js', company: 'Modern Web Co.', status: 'new', time: '2 hours ago' },
                { title: 'Senior Full Stack Developer', company: 'TechCorp Inc.', status: 'applied', time: '1 day ago' },
                { title: 'Frontend Engineer', company: 'StartupXYZ', status: 'reviewed', time: '2 days ago' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p>{activity.title}</p>
                    <p>{activity.company}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={activity.status === 'new' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                    <span>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Top Skills in Demand</CardTitle>
            <CardDescription>From matched job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { skill: 'React', count: 45, percentage: 90 },
                { skill: 'TypeScript', count: 38, percentage: 76 },
                { skill: 'Node.js', count: 32, percentage: 64 },
                { skill: 'AWS', count: 28, percentage: 56 },
                { skill: 'PostgreSQL', count: 24, percentage: 48 },
              ].map((item) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
