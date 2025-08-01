'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Shield, 
  Zap, 
  Bell, 
  Eye, 
  Download, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw
} from 'lucide-react'

interface AdvancedSettingsData {
  // AI Processing Settings
  aiProcessingEnabled: boolean
  maxBatchSize: number
  processingFrequency: 'realtime' | 'hourly' | 'daily'
  priorityThreshold: number
  
  // Security Settings
  mfaEnabled: boolean
  sessionTimeout: number
  dataRetention: number
  encryptionLevel: 'standard' | 'high' | 'maximum'
  
  // Notification Settings
  emailNotifications: boolean
  pushNotifications: boolean
  digestFrequency: 'daily' | 'weekly' | 'monthly'
  vipAlerts: boolean
  
  // Performance Settings
  cacheEnabled: boolean
  preloadMessages: boolean
  compressionEnabled: boolean
  offlineMode: boolean
  
  // Privacy Settings
  dataSharing: boolean
  analyticsEnabled: boolean
  personalizedAds: boolean
  thirdPartyIntegrations: boolean
  
  // Developer Settings
  debugMode: boolean
  apiAccess: boolean
  webhookUrl?: string
  customPrompts?: string
}

const defaultSettings: AdvancedSettingsData = {
  aiProcessingEnabled: true,
  maxBatchSize: 10,
  processingFrequency: 'realtime',
  priorityThreshold: 70,
  mfaEnabled: false,
  sessionTimeout: 60,
  dataRetention: 365,
  encryptionLevel: 'high',
  emailNotifications: true,
  pushNotifications: true,
  digestFrequency: 'daily',
  vipAlerts: true,
  cacheEnabled: true,
  preloadMessages: true,
  compressionEnabled: true,
  offlineMode: false,
  dataSharing: false,
  analyticsEnabled: true,
  personalizedAds: false,
  thirdPartyIntegrations: true,
  debugMode: false,
  apiAccess: false
}

export default function AdvancedSettings() {
  const [settings, setSettings] = useState<AdvancedSettingsData>(defaultSettings)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load settings from API or localStorage
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // In a real app, this would be an API call
      const savedSettings = localStorage.getItem('napoleon-advanced-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      // In a real app, this would be an API call
      localStorage.setItem('napoleon-advanced-settings', JSON.stringify(settings))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  const updateSetting = <K extends keyof AdvancedSettingsData>(
    key: K,
    value: AdvancedSettingsData[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif text-navy">Advanced Settings</h2>
          <p className="text-gray-600 mt-1">Configure advanced system preferences and integrations</p>
        </div>
        <div className="flex items-center space-x-2">
          {saved && (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={loading} className="bg-navy hover:bg-navy/90">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* AI Processing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-navy">
            <Zap className="h-5 w-5 mr-2" />
            AI Processing
          </CardTitle>
          <CardDescription>
            Configure how Napoleon AI processes and analyzes your messages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ai-processing">Enable AI Processing</Label>
              <p className="text-sm text-gray-500">Process messages with GPT-4 for insights</p>
            </div>
            <Switch
              id="ai-processing"
              checked={settings.aiProcessingEnabled}
              onCheckedChange={(checked) => updateSetting('aiProcessingEnabled', checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batch-size">Max Batch Size</Label>
              <Input
                id="batch-size"
                type="number"
                min={1}
                max={50}
                value={settings.maxBatchSize}
                onChange={(e) => updateSetting('maxBatchSize', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="processing-frequency">Processing Frequency</Label>
              <Select
                value={settings.processingFrequency}
                onValueChange={(value: any) => updateSetting('processingFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="priority-threshold">Priority Threshold ({settings.priorityThreshold})</Label>
            <Input
              id="priority-threshold"
              type="range"
              min={0}
              max={100}
              value={settings.priorityThreshold}
              onChange={(e) => updateSetting('priorityThreshold', parseInt(e.target.value))}
              className="mt-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Messages above this score will be marked as high priority
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-navy">
            <Shield className="h-5 w-5 mr-2" />
            Security & Privacy
          </CardTitle>
          <CardDescription>
            Manage authentication, encryption, and data protection settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="mfa">Multi-Factor Authentication</Label>
              <p className="text-sm text-gray-500">Require 2FA for enhanced security</p>
            </div>
            <Switch
              id="mfa"
              checked={settings.mfaEnabled}
              onCheckedChange={(checked) => updateSetting('mfaEnabled', checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
              <Input
                id="session-timeout"
                type="number"
                min={15}
                max={480}
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="data-retention">Data Retention (days)</Label>
              <Input
                id="data-retention"
                type="number"
                min={30}
                max={2555}
                value={settings.dataRetention}
                onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="encryption-level">Encryption Level</Label>
            <Select
              value={settings.encryptionLevel}
              onValueChange={(value: any) => updateSetting('encryptionLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (AES-256)</SelectItem>
                <SelectItem value="high">High (AES-256 + Key Rotation)</SelectItem>
                <SelectItem value="maximum">Maximum (Zero-Knowledge)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-navy">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
          </CardTitle>
          <CardDescription>
            Control how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive email alerts</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-gray-500">Browser push alerts</p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="digest-frequency">Digest Frequency</Label>
              <Select
                value={settings.digestFrequency}
                onValueChange={(value: any) => updateSetting('digestFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vip-alerts">VIP Alerts</Label>
                <p className="text-sm text-gray-500">Instant VIP notifications</p>
              </div>
              <Switch
                id="vip-alerts"
                checked={settings.vipAlerts}
                onCheckedChange={(checked) => updateSetting('vipAlerts', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-navy">
            <Eye className="h-5 w-5 mr-2" />
            Performance
          </CardTitle>
          <CardDescription>
            Optimize system performance and caching behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="cache-enabled">Enable Caching</Label>
                <p className="text-sm text-gray-500">Cache data for faster loading</p>
              </div>
              <Switch
                id="cache-enabled"
                checked={settings.cacheEnabled}
                onCheckedChange={(checked) => updateSetting('cacheEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="preload-messages">Preload Messages</Label>
                <p className="text-sm text-gray-500">Load messages in background</p>
              </div>
              <Switch
                id="preload-messages"
                checked={settings.preloadMessages}
                onCheckedChange={(checked) => updateSetting('preloadMessages', checked)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compression">Compression</Label>
                <p className="text-sm text-gray-500">Compress data transfers</p>
              </div>
              <Switch
                id="compression"
                checked={settings.compressionEnabled}
                onCheckedChange={(checked) => updateSetting('compressionEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offline-mode">Offline Mode</Label>
                <p className="text-sm text-gray-500">Enable offline functionality</p>
              </div>
              <Switch
                id="offline-mode"
                checked={settings.offlineMode}
                onCheckedChange={(checked) => updateSetting('offlineMode', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-navy">
            <Settings className="h-5 w-5 mr-2" />
            Developer Options
          </CardTitle>
          <CardDescription>
            Advanced options for developers and power users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="debug-mode">Debug Mode</Label>
                <p className="text-sm text-gray-500">Enable verbose logging</p>
              </div>
              <Switch
                id="debug-mode"
                checked={settings.debugMode}
                onCheckedChange={(checked) => updateSetting('debugMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="api-access">API Access</Label>
                <p className="text-sm text-gray-500">Enable API endpoints</p>
              </div>
              <Switch
                id="api-access"
                checked={settings.apiAccess}
                onCheckedChange={(checked) => updateSetting('apiAccess', checked)}
              />
            </div>
          </div>

          {settings.apiAccess && (
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-domain.com/webhook"
                value={settings.webhookUrl || ''}
                onChange={(e) => updateSetting('webhookUrl', e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Receive real-time notifications at this URL
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="custom-prompts">Custom AI Prompts</Label>
            <Textarea
              id="custom-prompts"
              placeholder="Enter custom prompts for AI processing..."
              value={settings.customPrompts || ''}
              onChange={(e) => updateSetting('customPrompts', e.target.value)}
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Override default AI prompts with custom instructions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-900">Export Data</h4>
              <p className="text-sm text-red-700">Download all your data in JSON format</p>
            </div>
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}