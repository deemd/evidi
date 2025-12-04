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
import { Briefcase, Settings, FileText, Database, List, LogOut, X } from 'lucide-react';

// Types
import { FilterCriteria, JobOffer, JobSource } from './types';
import { toast } from 'sonner';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://evidi-backend.vercel.app';

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
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);

  // ------------------------------------------------------
  // FETCH USER DATA (jobs, sources, filters, user profile)
  // ------------------------------------------------------
  useEffect(() => {
    if (!isAuthenticated || !userEmail) return;

    const loadProfile = async () => {
      try {
        const userRes = await fetch(`${API_BASE}/api/users/${encodeURIComponent(userEmail)}`);

        if (userRes.ok) {
          const user: UserProfile = await userRes.json();
          
          setFilters(user.filters);

          if (!user.resume) {
            setResumeRequired(true);
            setIsCvModalOpen(true);
          }
        }
      } catch (e) {
        console.error("Error loading user data:", e);
      }
    };

    const loadRest = async () => {
      try {
        const [jobsRes, sourcesRes] = await Promise.all([
          fetch(`${API_BASE}/api/users/${encodeURIComponent(userEmail)}/job-offers`),
          fetch(`${API_BASE}/api/users/${encodeURIComponent(userEmail)}/job-sources`)
        ]);
        
        if (jobsRes.ok) setJobs(await jobsRes.json());
        
        if (sourcesRes.ok) setSources(await sourcesRes.json());
      } catch (e) {
        console.error("Error loading jobs or sources:", e);
      }
    }

    loadProfile();
    loadRest();
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
      if (res.ok) {
        setResumeRequired(false);
        setIsCvModalOpen(false);
      }
    } catch (e) {
      console.error("Error saving resume:", e);
    }
  };
  
  const handleResumeSubmitted = () => {
    setResumeRequired(false);
    setIsCvModalOpen(false);
  };

  // ------------------------------------------------------
  // HANDLERS — SOURCES
  // ------------------------------------------------------
  const handleAddSource = (newSource: JobSource) => {
    setSources([...sources, newSource]);   // 👈 use backend id as-is
  };

  const handleToggleSource = (id: string) =>
    setSources(sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));

  const handleDeleteSource = async (id: string) => {
    await fetch(`${API_BASE}/api/job-sources/${id}`, {
      method: 'DELETE',
  });

  setSources((prev) => prev.filter((s) => s.id !== id));
};

    const handleSyncSource = async (id: string) => {
      if (!userEmail) return;

      try {
        // POST to fire-and-forget load-new jobs endpoint
        await fetch(`${API_BASE}/api/job-offers/load-new`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_email: userEmail }),
        });

        // Update UI optimistically
        setSources(sources.map(s =>
          s.id === id ? { ...s, lastSync: new Date().toISOString() } : s
        ));

        toast.success("Sync started");
      } catch (e) {
        console.error("Error syncing source:", e);
        toast.error("Failed to sync source");
      }
    };

  // ------------------------------------------------------
  // HANDLERS — JOBS
  // ------------------------------------------------------
  const handleRefreshJobs = async () => {
      if (!userEmail) return;

      try {
        const res = await fetch(
          `${API_BASE}/api/users/${encodeURIComponent(userEmail)}/job-offers`
        );
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
          toast.success("Job offers updated successfully");
        }
      } catch (e) {
        console.error("Error refreshing job offers:", e);
        toast.error("Failed to refresh job offers");
      }
    };

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
    if (resumeRequired && value !== 'settings') {
      // keep user focused on adding resume
      setIsCvModalOpen(true);
      return;
    }
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
              <Button variant="outline" size="sm" onClick={() => setIsCvModalOpen(true)}>
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
        <main className="container mx-auto px-4 py-8 relative">
          <TabsContent value="dashboard">
            <Dashboard
              totalJobs={jobs.length}
              matchedJobs={matchedJobs.length}
              appliedJobs={12}
              responseRate={35}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <JobList jobs={jobs} onSelectJob={handleSelectJob} onRefreshJobs={handleRefreshJobs}/>
          </TabsContent>

          <TabsContent value="sources">
            <JobSources
              sources={sources}
              onAddSource={handleAddSource}
              onToggleSource={handleToggleSource}
              onDeleteSource={handleDeleteSource}
              onSyncSource={handleSyncSource}
              userEmail={userEmail!}
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

          {/* <TabsContent value="cv">
            <CVUpload
              onExtractFilters={handleExtractFilters}
              onSaveResume={handleSaveResume}
              resumeRequired={resumeRequired}
            />
          </TabsContent> */}

          <TabsContent value="settings">
            <SettingsPage userEmail={userEmail} />
          </TabsContent>

          {isCvModalOpen && (
            <div className="absolute inset-0 z-40 flex items-start justify-center">
              {/* Blurred background over the current tab area */}
              <div
                className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                onClick={() => {
                  if (!resumeRequired) {
                    setIsCvModalOpen(false);
                  }
                }}
              />

              {/* Centered popup */}
              <div className="relative z-50 w-full max-w-2xl my-4">
                <div className="bg-card-background rounded-xl shadow-lg border">
                  <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <h2 className="text-lg font-semibold">My Resume</h2>
                    </div>

                    {!resumeRequired && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCvModalOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="p-4">
                    <CVUpload
                      userEmail={userEmail!}
                      onExtractFilters={handleExtractFilters}
                      onSaveResume={handleSaveResume}
                      resumeRequired={resumeRequired}
                      onResumeSubmitted={handleResumeSubmitted}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
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
