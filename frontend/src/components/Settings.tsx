import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { User, Mail, Lock, Bell, Globe, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = 'https://evidi-backend.vercel.app';

interface SettingsPageProps {
  userEmail: string | null;
}

export function SettingsPage({ userEmail }: SettingsPageProps) {
  // Profile change
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  
  // Preferences
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
  if (!userEmail) return;

  const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/users/${encodeURIComponent(userEmail)}`
        );
        if (!res.ok) {
          console.error('Failed to fetch user profile');
          return;
        }
        const data = await res.json();
        setUsername(data.full_name || '');
        setEmail(data.email || '');
      } catch (err) {
        console.error('Error fetching user profile', err);
      }
    };

    fetchProfile();
  }, [userEmail]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      toast.error('No user email available');
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/users/${encodeURIComponent(userEmail)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: username,
          }),
        }
      );

      if (!res.ok) {
        toast.error('Failed to update profile');
        setIsSaving(false);
        return;
      }

      toast.success('Profile updated successfully');
    } catch (err) {
      console.error(`Error updating profile: ${err}`);
      toast.error(`Error updating profile: ${err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully');
    }, 1000);
  };

  const handleSaveNotifications = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Notification preferences saved');
    }, 1000);
  };

  const handleSavePreferences = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Preferences saved');
    }, 1000);
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      toast.error('Account deletion is disabled in demo mode');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className='text-primary text-2xl font-bold'>Settings</h2>
        <p className="">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className='text-primary font-semibold'>Profile Information</CardTitle>
          </div>
          <CardDescription>
            Update your account profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-primary" htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <Label className="text-primary" htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                disabled
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle className='text-primary font-semibold'>Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-primary" htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-primary" htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-primary" htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className='text-primary font-semibold'>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-primary" htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-primary">
                Receive email notifications for new job matches
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-primary" htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-primary">
                Receive push notifications for urgent updates
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-primary" htmlFor="weekly-digest">Weekly Digest</Label>
              <p className="text-sm text-primary">
                Get a weekly summary of your job search activity
              </p>
            </div>
            <Switch
              id="weekly-digest"
              checked={weeklyDigest}
              onCheckedChange={setWeeklyDigest}
            />
          </div>
          <Button onClick={handleSaveNotifications} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Notification Preferences'}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className='text-primary font-semibold'>Preferences</CardTitle>
          </div>
          <CardDescription>
            Customize your application experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-primary" htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-primary" htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                <SelectItem value="EST">Eastern Time (GMT-5)</SelectItem>
                <SelectItem value="CST">Central Time (GMT-6)</SelectItem>
                <SelectItem value="PST">Pacific Time (GMT-8)</SelectItem>
                <SelectItem value="CET">Central European Time (GMT+1)</SelectItem>
                <SelectItem value="JST">Japan Standard Time (GMT+9)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSavePreferences} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive font-semibold">Danger Zone</CardTitle>
          </div>
          <CardDescription className="">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Once you delete your account, there is no going back. Please be certain.
            </AlertDescription>
          </Alert>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            className="mt-4"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
