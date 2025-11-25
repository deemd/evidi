import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { X } from 'lucide-react';
import { FilterCriteria } from '../types';
import { toast } from 'sonner';

interface FilterConfigurationProps {
  filters: FilterCriteria;
  onUpdateFilters: (filters: FilterCriteria) => void;
  onSaveFilters: () => void;
  isDirty: boolean;
}

export function FilterConfiguration({ filters, onUpdateFilters, onSaveFilters, isDirty }: FilterConfigurationProps) {
  const [newStackItem, setNewStackItem] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newExcludeKeyword, setNewExcludeKeyword] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const addItem = (field: keyof FilterCriteria, value: string) => {
    const v = value.trim();
    if (!v) return;
    // avoid duplicate additions (optional)
    if (filters[field].includes(v)) return;
    onUpdateFilters({
      ...filters,
      [field]: [...filters[field], v],
    });
  };

  const removeItem = (field: keyof FilterCriteria, index: number) => {
    onUpdateFilters({
      ...filters,
      [field]: filters[field].filter((_, i) => i !== index),
    });
  };

  const toggleJobType = (type: string) => {
    const updated = filters.jobType.includes(type)
      ? filters.jobType.filter((t) => t !== type)
      : [...filters.jobType, type];
    onUpdateFilters({ ...filters, jobType: updated });
  };

  const toggleExperience = (level: string) => {
    const updated = filters.experience.includes(level)
      ? filters.experience.filter((e) => e !== level)
      : [...filters.experience, level];
    onUpdateFilters({ ...filters, experience: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-primary text-2xl font-bold">Filter Configuration</h2>
          <p>Define criteria to automatically filter job offers</p>
        </div>
        <Button
          onClick={onSaveFilters}
          disabled={!isDirty}               // 👈 disable when no changes
          variant={isDirty ? "default" : "outline"}  // optional: visual feedback
        >
          Save
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Technology Stack</CardTitle>
            <CardDescription>Skills and technologies you're looking for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., React, TypeScript, Node.js"
                value={newStackItem}
                onChange={(e) => setNewStackItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addItem('stack', newStackItem);
                    setNewStackItem('');
                  }
                }}
              />
              <Button
                onClick={() => {
                  addItem('stack', newStackItem);
                  setNewStackItem('');
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.stack.map((item, index) => (
                <Badge key={`${item}-${index}`} variant="secondary" className="gap-1">
                  <span className="max-w-xs truncate">{item}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item}`}
                    className="inline-flex items-center justify-center p-1 rounded hover:bg-muted focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem('stack', index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience Level */}
        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Experience Level</CardTitle>
            <CardDescription>Preferred seniority levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Junior', 'Mid-level', 'Senior', 'Lead', 'Principal'].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={level}
                  checked={filters.experience.includes(level)}
                  onCheckedChange={() => toggleExperience(level)}
                />
                <Label htmlFor={level} className="cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Keywords</CardTitle>
            <CardDescription>Must-have terms in job descriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., remote, startup, agile"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addItem('keywords', newKeyword);
                    setNewKeyword('');
                  }
                }}
              />
              <Button
                onClick={() => {
                  addItem('keywords', newKeyword);
                  setNewKeyword('');
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.keywords.map((item, index) => (
                <Badge key={`${item}-${index}`} variant="secondary" className="gap-1">
                  <span className="max-w-xs truncate">{item}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item}`}
                    className="inline-flex items-center justify-center p-1 rounded hover:bg-muted focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem('keywords', index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Exclude Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Exclude Keywords</CardTitle>
            <CardDescription>Terms to filter out</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., unpaid, intern"
                value={newExcludeKeyword}
                onChange={(e) => setNewExcludeKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addItem('excludeKeywords', newExcludeKeyword);
                    setNewExcludeKeyword('');
                  }
                }}
              />
              <Button
                onClick={() => {
                  addItem('excludeKeywords', newExcludeKeyword);
                  setNewExcludeKeyword('');
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.excludeKeywords.map((item, index) => (
                <Badge key={`${item}-${index}`} variant="destructive" className="gap-1">
                  <span className="max-w-xs truncate">{item}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item}`}
                    className="inline-flex items-center justify-center p-1 rounded hover:bg-muted focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem('excludeKeywords', index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Locations</CardTitle>
            <CardDescription>Preferred work locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Remote, San Francisco, New York"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addItem('location', newLocation);
                    setNewLocation('');
                  }
                }}
              />
              <Button
                onClick={() => {
                  addItem('location', newLocation);
                  setNewLocation('');
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.location.map((item, index) => (
                <Badge key={`${item}-${index}`} variant="secondary" className="gap-1">
                  <span className="max-w-xs truncate">{item}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${item}`}
                    className="inline-flex items-center justify-center p-1 rounded hover:bg-muted focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem('location', index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Job Type */}
        <Card>
          <CardHeader>
            <CardTitle className='text-primary font-semibold'>Job Type</CardTitle>
            <CardDescription>Employment types you're interested in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={filters.jobType.includes(type)}
                  onCheckedChange={() => toggleJobType(type)}
                />
                <Label htmlFor={type} className="cursor-pointer">
                  {type}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
