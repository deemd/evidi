import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, RefreshCw, Trash2, Rss, Mail, Code } from 'lucide-react';
import { JobSource } from '../types';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://evidi-backend.vercel.app';

interface JobSourcesProps {
  sources: JobSource[];
  onAddSource: (source: JobSource) => void;
  onToggleSource: (id: string) => void;
  onDeleteSource: (id: string) => void;
  onSyncSource: (id: string) => void;
  userEmail: string;
}

export function JobSources({ sources, onAddSource, onToggleSource, onDeleteSource, onSyncSource, userEmail }: JobSourcesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
  });

  const handleAddSource = async () => {
    if (!newSource.name || !newSource.url) {
      return;
    }

    const payload = {
      name: newSource.name,
      type: 'API',
      url: newSource.url,
      enabled: true,
      lastSync: null,
      user_id: userEmail,
    };

    try {
      const resp = await fetch(`${API_BASE}/api/job-sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        console.error('Failed to create job source');
        return;
      }

      const created = await resp.json();

      onAddSource(created);

      setNewSource({ name: '', url: '' });
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error while creating job source', err);
    }
  };

  const getSourceIcon = (type: JobSource['type']) => {
    switch (type) {
      case 'RSS':
        return <Rss className="h-4 w-4" />;
      case 'Email':
        return <Mail className="h-4 w-4" />;
      case 'API':
        return <Code className="h-4 w-4" />;
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className='text-primary text-2xl font-bold'>Job Sources</h2>
          <p className="">
            Manage where job offers are collected from
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add LinkedIn Job Source</DialogTitle>
              <DialogDescription>
                Paste a LinkedIn search URL from an incognito browser tab. This will be saved as an API source.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Source Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., LinkedIn Paris Data Jobs"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">LinkedIn Search URL</Label>
                <Input
                  id="url"
                  placeholder="Paste your LinkedIn search URL here"
                  value={newSource.url}
                  onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                />
              </div>
              <p className="text-sm text-secondary">
                Source type will be <strong>API</strong>, enabled by default, and last sync set to <strong>Never</strong> until the first sync.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSource}>Add Source</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-ternary">
                    {getSourceIcon(source.type)}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {source.name}
                      <Badge variant="outline">{source.type}</Badge>
                    </CardTitle>
                    <CardDescription className="mt-1 text-secondary">{source.url}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={source.enabled}
                    onCheckedChange={() => onToggleSource(source.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-primary">
                      Last synced
                    </p>
                    <p>{formatLastSync(source.lastSync)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSyncSource(source.id)}
                    disabled={!source.enabled}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteSource(source.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
