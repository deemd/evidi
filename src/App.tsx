import { useState, useEffect } from 'react';

// Components
import { Dashboard } from './components/Dashboard';
import { JobSources } from './components/JobSources';
import { FilterConfiguration } from './components/FilterConfiguration';
import { CVUpload } from './components/CVUpload';
import { JobList } from './components/JobList';
import { JobDetail } from './components/JobDetail';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { SettingsPage } from './components/Settings';
import { ThemeSwitcher, ThemeColor } from './components/ThemeSwitcher';
import { useTheme } from "./components/UseTheme";

// UI
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { Briefcase, Settings, FileText, Database, List, LogOut } from 'lucide-react';

// Types
import { FilterCriteria, JobOffer, JobSource } from './types';
import { toast } from 'sonner';

const API_BASE = 'https://testfastapi-flax.vercel.app';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  filters: FilterCriteria;
  resume: string | null;
}

export default function App() {
  // --- Auth & User ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resumeRequired, setResumeRequired] = useState(false);

  // --- Data ---
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [sources, setSources] = useState<JobSource[]>([]);
  const [filters, setFilters] = useState<FilterCriteria>({
    stack: [], experience: [], keywords: [], location: [], jobType: [], excludeKeywords: []
  });

  // --- UI ---
  const { theme, setTheme } = useTheme("default");
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFiltersDirty, setIsFiltersDirty] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);

  // ------------------------------------------------------
  // FETCH USER DATA (jobs, sources, filters, user profile)
  // ------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated || !userEmail) return;

    const loadAll = async () => {
      try {
        const [jobsRes, sourcesRes, filtersRes, userRes] = await Promise.all([
          fetch(`${API_BASE}/api/job-offers`),
          fetch(`${API_BASE}/api/job-sources`),
          fetch(`${API_BASE}/api/users/${encodeURIComponent(userEmail)}/filters`),
          fetch(`${API_BASE}/api/users/${encodeURIComponent(userEmail)}`)
        ]);

        if (jobsRes.ok) setJobs(await jobsRes.json());
        if (sourcesRes.ok) setSources(await sourcesRes.json());

        if (filtersRes.ok) {
          const f = await filtersRes.json();
          setFilters(f.filters);
        }

        if (userRes.ok) {
          const user: UserProfile = await userRes.json();
          if (!user.resume) {
            setResumeRequired(true);
            setActiveTab('cv');
          }
        }
      } catch (e) {
        console.error("Error loading user data:", e);
      }
    };

    loadAll();
  }, [isAuthenticated, userEmail]);

  // Scroll reset on tab switch
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeTab]);

  // ------------------------------------------------------
  // HANDLERS — AUTH
  // ------------------------------------------------------
  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setShowRegister(false);
    setUserEmail(email);
  };

  const handleRegister = (_name: string, email: string) => {
    setIsAuthenticated(true);
    setShowRegister(false);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setActiveTab('dashboard');
    setJobs([]);
    setSources([]);
    setFilters({
      stack: [], experience: [], keywords: [], location: [], jobType: [], excludeKeywords: []
    });
    setResumeRequired(false);
    setRegisterSuccess(false);
  };

  // ------------------------------------------------------
  // HANDLERS — RESUME ONBOARDING
  // ------------------------------------------------------
  const handleSaveResume = async (cvText: string) => {
    if (!userEmail || !cvText) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/users/${encodeURIComponent(userEmail)}/resume`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume: cvText }) }
      );
      if (res.ok) setResumeRequired(false);
    } catch (e) {
      console.error("Error saving resume:", e);
    }
  };

  // ------------------------------------------------------
  // HANDLERS — SOURCES
  // ------------------------------------------------------
  const handleAddSource = (newSource: Omit<JobSource, 'id'>) => {
    setSources([...sources, { ...newSource, id: Date.now().toString(), lastSync: undefined }]);
  };

  const handleToggleSource = (id: string) =>
    setSources(sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));

  const handleDeleteSource = (id: string) =>
    setSources(sources.filter(s => s.id !== id));

  const handleSyncSource = (id: string) =>
    setSources(sources.map(s => s.id === id ? { ...s, lastSync: new Date().toISOString() } : s));

  // ------------------------------------------------------
  // HANDLERS — FILTERS
  // ------------------------------------------------------
  const handleUpdateFilters = (f: FilterCriteria) => {
    setFilters(f);
    setIsFiltersDirty(true);
  };

  const handleExtractFilters = (partial: Partial<FilterCriteria>) => {
    setFilters({ ...filters, ...partial });
    setActiveTab('filters');
  };

  const handleSaveFilters = async () => {
    if (!userEmail) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/users/${encodeURIComponent(userEmail)}/filters`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filters }),
        }
      );

      if (res.ok) {
        setIsFiltersDirty(false);
        toast.success("Filters saved successfully");
      }
    } catch (e) {
      console.error("Error saving filters:", e);
      toast.error("Failed to save filters");
    }
  };

  // ------------------------------------------------------
  // HANDLERS — UI
  // ------------------------------------------------------
  const handleSelectJob = (job: JobOffer) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  };

  const handleTabChange = (value: string) => {
    if (resumeRequired && value !== 'cv' && value !== 'settings') return;
    setActiveTab(value);
  };

  const handleThemeChange = (t: ThemeColor) => setTheme(t);

  // ------------------------------------------------------
  // AUTH SCREENS
  // ------------------------------------------------------
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={(status) => {
            if (status === 'account_created') setRegisterSuccess(true);
            setShowRegister(false);
          }}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => { setRegisterSuccess(false); setShowRegister(true); }}
        successMessage={registerSuccess ? 'account_created' : null}
      />
    );
  }

  // ------------------------------------------------------
  // MAIN APP
  // ------------------------------------------------------
  const matchedJobs = jobs.filter(j => j.isMatch);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <div className="min-h-screen bg-background">
        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Briefcase className="h-6 w-6" />
                <h1 className="text-xl font-bold">Evidi</h1>
              </div>

              <TabsList className="flex items-center space-x-2">
                <TabsTrigger value="dashboard" disabled={resumeRequired} className="gap-2">
                  <Briefcase className="h-4 w-4" /> Dashboard
                </TabsTrigger>

                <TabsTrigger value="jobs" disabled={resumeRequired} className="gap-2">
                  <List className="h-4 w-4" /> Jobs
                </TabsTrigger>

                <TabsTrigger value="sources" disabled={resumeRequired} className="gap-2">
                  <Database className="h-4 w-4" /> Sources
                </TabsTrigger>

                <TabsTrigger value="filters" disabled={resumeRequired} className="gap-2">
                  <Settings className="h-4 w-4" /> Filters
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setActiveTab('cv')}>
                <FileText className="h-4 w-4 mr-2" /> My Resume
              </Button>

              <ThemeSwitcher
                currentTheme={theme as ThemeColor}
                onThemeChange={handleThemeChange}
              />

              <Button variant="outline" size="sm" onClick={() => setActiveTab('settings')}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>

              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="container mx-auto px-4 py-8">
          <TabsContent value="dashboard">
            <Dashboard
              totalJobs={jobs.length}
              matchedJobs={matchedJobs.length}
              appliedJobs={12}
              responseRate={35}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <JobList jobs={jobs} onSelectJob={handleSelectJob} />
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
              onSaveFilters={handleSaveFilters}
              isDirty={isFiltersDirty}
            />
          </TabsContent>

          <TabsContent value="cv">
            <CVUpload
              onExtractFilters={handleExtractFilters}
              onSaveResume={handleSaveResume}
              resumeRequired={resumeRequired}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPage userEmail={userEmail} />
          </TabsContent>
        </main>

        <JobDetail
          job={selectedJob}
          isOpen={isJobDetailOpen}
          onClose={() => setIsJobDetailOpen(false)}
        />

        <Toaster />
      </div>
    </Tabs>
  );
}
