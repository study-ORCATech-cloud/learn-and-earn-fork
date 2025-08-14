// Settings Page - User preferences and configuration

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Monitor, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Shield, 
  BookOpen, 
  BarChart3,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Mail,
  Smartphone,
  Users,
  Lock,
  TrendingUp,
  Target,
  Brain,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

// Settings state interface
interface SettingsState {
  // Display preferences
  theme: 'light' | 'dark' | 'system';
  language: string;
  
  // Notification preferences
  emailNotifications: boolean;
  systemAlerts: boolean;
  courseReminders: boolean;
  achievementNotifications: boolean;
  weeklyProgress: boolean;
  
  // Privacy settings
  profileVisibility: 'public' | 'private' | 'friends';
  showProgress: boolean;
  showAchievements: boolean;
  allowDataSharing: boolean;
  allowAnalytics: boolean;
  
  // Learning preferences
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  topicsOfInterest: string[];
  learningPace: number; // 1-5 scale
  preferredContentType: string[];
  
  // Progress tracking
  progressVisibility: 'public' | 'private' | 'friends';
  showDetailedStats: boolean;
  allowLeaderboard: boolean;
  shareCompletions: boolean;
}

const Settings: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Initialize settings state (in real app, this would come from backend)
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'dark',
    language: 'en',
    emailNotifications: true,
    systemAlerts: true,
    courseReminders: true,
    achievementNotifications: true,
    weeklyProgress: false,
    profileVisibility: 'public',
    showProgress: true,
    showAchievements: true,
    allowDataSharing: false,
    allowAnalytics: true,
    difficultyLevel: 'intermediate',
    topicsOfInterest: ['javascript', 'react'],
    learningPace: 3,
    preferredContentType: ['videos', 'hands-on'],
    progressVisibility: 'public',
    showDetailedStats: true,
    allowLeaderboard: true,
    shareCompletions: true,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Available options
  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
  ];

  const topics = [
    'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 
    'Vue.js', 'Angular', 'CSS', 'HTML', 'GraphQL', 
    'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS'
  ];

  const contentTypes = [
    { value: 'videos', label: 'Video Tutorials', icon: <Smartphone className="w-4 h-4" /> },
    { value: 'hands-on', label: 'Hands-on Labs', icon: <Brain className="w-4 h-4" /> },
    { value: 'reading', label: 'Reading Materials', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'interactive', label: 'Interactive Exercises', icon: <Zap className="w-4 h-4" /> },
  ];

  const updateSettings = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const toggleTopic = (topic: string) => {
    setSettings(prev => ({
      ...prev,
      topicsOfInterest: prev.topicsOfInterest.includes(topic)
        ? prev.topicsOfInterest.filter(t => t !== topic)
        : [...prev.topicsOfInterest, topic]
    }));
    setHasChanges(true);
  };

  const toggleContentType = (type: string) => {
    setSettings(prev => ({
      ...prev,
      preferredContentType: prev.preferredContentType.includes(type)
        ? prev.preferredContentType.filter(t => t !== type)
        : [...prev.preferredContentType, type]
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save settings
      console.log('Saving settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // TODO: Reset to default settings or reload from backend
    setHasChanges(false);
    console.log('Reset settings to defaults');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl text-slate-600">🔒</div>
          <h2 className="text-xl font-semibold text-slate-300">Authentication Required</h2>
          <p className="text-slate-500">Please log in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400">Customize your learning experience</p>
              </div>
            </div>
            
            {hasChanges && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          
          {/* Display Preferences */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Display Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300 text-sm font-medium">Theme</Label>
                  <RadioGroup 
                    value={settings.theme} 
                    onValueChange={(value) => updateSettings('theme', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="light" className="text-slate-300 flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="dark" className="text-slate-300 flex items-center gap-2">
                        <Moon className="w-4 h-4" />
                        Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="system" className="text-slate-300 flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm font-medium">Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSettings('language', value)}>
                    <SelectTrigger className="mt-2 bg-slate-800 border-slate-600 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value} className="text-slate-200">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {lang.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-slate-300">Email Notifications</Label>
                      <p className="text-sm text-slate-500">Receive course updates and announcements</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSettings('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-slate-300">System Alerts</Label>
                      <p className="text-sm text-slate-500">Important system notifications</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.systemAlerts}
                    onCheckedChange={(checked) => updateSettings('systemAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-slate-300">Course Reminders</Label>
                      <p className="text-sm text-slate-500">Reminders to continue learning</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.courseReminders}
                    onCheckedChange={(checked) => updateSettings('courseReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-slate-300">Achievement Notifications</Label>
                      <p className="text-sm text-slate-500">Celebrate your accomplishments</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.achievementNotifications}
                    onCheckedChange={(checked) => updateSettings('achievementNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-slate-300">Weekly Progress</Label>
                      <p className="text-sm text-slate-500">Weekly learning progress summaries</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.weeklyProgress}
                    onCheckedChange={(checked) => updateSettings('weeklyProgress', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300 text-sm font-medium">Profile Visibility</Label>
                  <RadioGroup 
                    value={settings.profileVisibility} 
                    onValueChange={(value) => updateSettings('profileVisibility', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="public" className="text-slate-300 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Public - Anyone can see your profile
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friends" id="friends" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="friends" className="text-slate-300 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Friends - Only connected users can see your profile
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="private" className="text-slate-300 flex items-center gap-2">
                        <EyeOff className="w-4 h-4" />
                        Private - Only you can see your profile
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <div>
                        <Label className="text-slate-300">Show Progress</Label>
                        <p className="text-sm text-slate-500">Display learning progress on profile</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.showProgress}
                      onCheckedChange={(checked) => updateSettings('showProgress', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-slate-400" />
                      <div>
                        <Label className="text-slate-300">Show Achievements</Label>
                        <p className="text-sm text-slate-500">Display earned badges and certificates</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.showAchievements}
                      onCheckedChange={(checked) => updateSettings('showAchievements', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-slate-400" />
                      <div>
                        <Label className="text-slate-300">Allow Data Sharing</Label>
                        <p className="text-sm text-slate-500">Share anonymized data for research</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.allowDataSharing}
                      onCheckedChange={(checked) => updateSettings('allowDataSharing', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <div>
                        <Label className="text-slate-300">Allow Analytics</Label>
                        <p className="text-sm text-slate-500">Help improve the platform with usage data</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.allowAnalytics}
                      onCheckedChange={(checked) => updateSettings('allowAnalytics', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Learning Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label className="text-slate-300 text-sm font-medium">Preferred Difficulty Level</Label>
                  <RadioGroup 
                    value={settings.difficultyLevel} 
                    onValueChange={(value) => updateSettings('difficultyLevel', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="beginner" className="text-slate-300">
                        Beginner - New to programming
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="intermediate" className="text-slate-300">
                        Intermediate - Some programming experience
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="advanced" className="text-slate-300">
                        Advanced - Experienced developer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="mixed" className="text-slate-300">
                        Mixed - Varies by topic
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm font-medium mb-3 block">
                    Learning Pace (Hours per week)
                  </Label>
                  <div className="space-y-3">
                    <Slider
                      value={[11 - settings.learningPace]}
                      onValueChange={([value]) => updateSettings('learningPace', 11 - value)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                      orientation="horizontal"
                      dir="rtl"
                    />
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>1 hour</span>
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        {settings.learningPace} hour{settings.learningPace !== 1 ? 's' : ''} per week
                      </Badge>
                      <span>10+ hours</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm font-medium mb-3 block">
                    Topics of Interest
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {topics.map((topic) => (
                      <div
                        key={topic}
                        onClick={() => toggleTopic(topic.toLowerCase())}
                        className={cn(
                          'p-3 rounded-lg border cursor-pointer transition-colors',
                          settings.topicsOfInterest.includes(topic.toLowerCase())
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                        )}
                      >
                        <div className="text-sm font-medium">{topic}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300 text-sm font-medium mb-3 block">
                    Preferred Content Types
                  </Label>
                  <div className="space-y-2">
                    {contentTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={settings.preferredContentType.includes(type.value)}
                          onCheckedChange={() => toggleContentType(type.value)}
                          className="border-slate-600"
                        />
                        <Label htmlFor={type.value} className="text-slate-300 flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracking */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-300 text-sm font-medium">Progress Visibility</Label>
                  <RadioGroup 
                    value={settings.progressVisibility} 
                    onValueChange={(value) => updateSettings('progressVisibility', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="progress-public" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="progress-public" className="text-slate-300 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Public - Anyone can see your progress
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friends" id="progress-friends" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="progress-friends" className="text-slate-300 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Friends - Only connected users can see your progress
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="progress-private" className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                      <Label htmlFor="progress-private" className="text-slate-300 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Private - Only you can see your progress
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      <div>
                        <Label className="text-slate-300">Show Detailed Statistics</Label>
                        <p className="text-sm text-slate-500">Display time spent, completion rates, etc.</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.showDetailedStats}
                      onCheckedChange={(checked) => updateSettings('showDetailedStats', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <div>
                        <Label className="text-slate-300">Allow Leaderboard</Label>
                        <p className="text-sm text-slate-500">Participate in community leaderboards</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.allowLeaderboard}
                      onCheckedChange={(checked) => updateSettings('allowLeaderboard', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-slate-400" />
                      <div>
                        <Label className="text-slate-300">Share Completions</Label>
                        <p className="text-sm text-slate-500">Announce when you complete courses</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.shareCompletions}
                      onCheckedChange={(checked) => updateSettings('shareCompletions', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Actions */}
          {hasChanges && (
            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Save className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="text-blue-400 font-medium">Unsaved Changes</h3>
                      <p className="text-blue-300/70 text-sm">You have unsaved changes to your settings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;