import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { JobSources } from './components/JobSources';
import { FilterConfiguration } from './components/FilterConfiguration';
import { CVUpload } from './components/CVUpload';
import { JobList } from './components/JobList';
import { JobDetail } from './components/JobDetail';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Settings as SettingsPage } from './components/Settings';
import { ThemeSwitcher, ThemeColor } from './components/ThemeSwitcher';
import { useTheme } from "./components/UseTheme";
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { mockJobOffers, mockJobSources } from './lib/mockData';
import { FilterCriteria, JobOffer, JobSource } from './types';
import { Briefcase, Settings, FileText, Database, List, LogOut } from 'lucide-react';
import React from "react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  // const [currentTheme, setCurrentTheme] = useState<ThemeColor>('default');
  const { theme, setTheme } = useTheme("default"); // or read from user setting
  const handleThemeChange = (t: ThemeColor) => setTheme(t);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState<JobOffer[]>(mockJobOffers);
  const [sources, setSources] = useState<JobSource[]>(mockJobSources);
  const [filters, setFilters] = useState<FilterCriteria>({
    stack: ['React', 'TypeScript', 'Node.js'],
    experience: ['Mid-level', 'Senior'],
    keywords: ['remote'],
    location: ['Remote', 'San Francisco'],
    jobType: ['Full-time', 'Contract'],
    excludeKeywords: [],
  });
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);

  // // Apply theme to document
  // useEffect(() => {
  //   const root = document.documentElement;
  //   root.classList.remove('theme-black', 'theme-blue', 'theme-green');
    
  //   if (currentTheme !== 'default') {
  //     root.classList.add(`theme-${currentTheme}`);
  //   }
  // }, [currentTheme]);

  const handleLogin = (email: string, password: string) => {
    // In a real app, this would validate credentials
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleRegister = (name: string, email: string, password: string) => {
    // In a real app, this would create a new account
    // For demo, we'll just log them in
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowRegister(false);
    setActiveTab('dashboard');
  };

  const handleAddSource = (newSource: Omit<JobSource, 'id'>) => {
    const source: JobSource = {
      ...newSource,
      id: Date.now().toString(),
      lastSync: undefined,
    };
    setSources([...sources, source]);
  };

  const handleToggleSource = (id: string) => {
    setSources(sources.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const handleSyncSource = (id: string) => {
    setSources(sources.map(s => 
      s.id === id ? { ...s, lastSync: new Date().toISOString() } : s
    ));
  };

  const handleUpdateFilters = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
    // In a real app, this would trigger re-filtering of jobs
  };

  const handleExtractFilters = (extractedFilters: Partial<FilterCriteria>) => {
    setFilters({
      ...filters,
      ...extractedFilters,
    });
    setActiveTab('filters');
  };

  const handleSelectJob = (job: JobOffer) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  const matchedJobs = jobs.filter(j => j.isMatch);
  const totalJobs = jobs.length;
  const appliedJobs = 12; // Mock data
  const responseRate = 35; // Mock data

  // Show register or login page if not authenticated
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register 
          onRegister={handleRegister}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              <h1>Evidi</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher 
                // currentTheme={currentTheme}
                // onThemeChange={setCurrentTheme}
                currentTheme={theme as ThemeColor}
                onThemeChange={handleThemeChange}
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2">
              <List className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="sources" className="gap-2">
              <Database className="h-4 w-4" />
              Sources
            </TabsTrigger>
            <TabsTrigger value="filters" className="gap-2">
              <Settings className="h-4 w-4" />
              Filters
            </TabsTrigger>
            <TabsTrigger value="cv" className="gap-2">
              <FileText className="h-4 w-4" />
              CV Analysis
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard
              totalJobs={totalJobs}
              matchedJobs={matchedJobs.length}
              appliedJobs={appliedJobs}
              responseRate={responseRate}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <JobList
              jobs={jobs}
              onSelectJob={handleSelectJob}
            />
          </TabsContent>

          <TabsContent value="sources">
            <JobSources
              sources={sources}
              onAddSource={handleAddSource}
              onToggleSource={handleToggleSource}
              onDeleteSource={handleDeleteSource}
              onSyncSource={handleSyncSource}
            />
          </TabsContent>

          <TabsContent value="filters">
            <FilterConfiguration
              filters={filters}
              onUpdateFilters={handleUpdateFilters}
            />
          </TabsContent>

          <TabsContent value="cv">
            <CVUpload onExtractFilters={handleExtractFilters} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPage />
          </TabsContent>
        </Tabs>
      </main>

      <JobDetail
        job={selectedJob}
        isOpen={isJobDetailOpen}
        onClose={() => setIsJobDetailOpen(false)}
      />

      <Toaster />
    </div>
  );
}
