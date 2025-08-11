import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { UserSettingsDto } from '../types'
import { 
  UserIcon, 
  ShieldCheckIcon, 
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline'

// Preset avatar options - you can replace these with your actual avatar images
const avatarOptions = [
  { id: 'default', url: '/avatars/default.png', name: 'Default' },
  { id: 'avatar1', url: '/avatars/warrior.png', name: 'Warrior' },
  { id: 'avatar2', url: '/avatars/mage.png', name: 'Mage' },
  { id: 'avatar3', url: '/avatars/rogue.png', name: 'Rogue' },
  { id: 'avatar4', url: '/avatars/duck.png', name: 'Duck' }
]

export default function AccountSettings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // UI state for profile information
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: avatarOptions[0].url
  })

  // UI state for user settings
  const [settings, setSettings] = useState<UserSettingsDto>({
    id: 0,
    userId: '',
    
    // Notification Settings
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
    processingCompleteNotifications: true,
    errorNotifications: true,
    weeklyDigestEnabled: false,
    
    // UI/UX Preferences
    theme: 'light',
    language: 'en',
    defaultPageSize: 20,
    showTutorials: true,
    compactMode: false,
    
    // Data Processing Preferences
    autoProcessUploads: true,
    maxPreviewRows: 100,
    defaultFileType: 'CSV',
    enableDataValidation: true,
    enableSchemaInference: true,
    
    // Privacy Settings
    shareAnalytics: true,
    allowDataUsageForImprovement: false,
    showProcessingTime: true,
    
    // Account Information
    displayName: '',
    timeZone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    
    createdAt: '',
    updatedAt: ''
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ]

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true)
        setError(null)
        
                 const userProfile = await apiService.getUserProfile()
         
         // Check if userProfile exists and has the expected structure
         if (!userProfile) {
           throw new Error('No user profile data received from server')
         }
         
         // Update profile state with server data (with fallbacks for null/undefined values)
         const newProfile = {
           name: userProfile.name || user?.name || '',
           email: userProfile.email || user?.email || '',
           avatar: userProfile.picture || avatarOptions[0].url
         }
         setProfile(newProfile)
         
         // Update settings state with server data (with fallbacks)
         if (userProfile.settings && typeof userProfile.settings === 'object') {
           setSettings(userProfile.settings)
         }
        
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch user profile:', err)
        setError('Failed to load profile settings. Please try again.')
      } finally {
        setIsLoadingProfile(false)
      }
    }

    fetchUserProfile()
  }, [user?.name, user?.email])

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Prepare the update request with current settings
      const updateData: UserSettingsDto = {
        ...settings,
        displayName: profile.name, // Map profile name to displayName
      }
      
             // Call the API to update the profile
       const updatedProfile = await apiService.updateUserProfile(updateData)
       
       // Update local state with the response
       const newProfile = {
         name: updatedProfile.name || profile.name, // Fallback to current profile name if server doesn't return it
         email: updatedProfile.email || profile.email, // Fallback to current profile email if server doesn't return it
         avatar: updatedProfile.picture || profile.avatar || avatarOptions[0].url
       }
       setProfile(newProfile)
       
       setSettings(updatedProfile.settings)
      // TODO: Add success toast notification
      
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ [AccountSettings] Failed to save settings:', err)
      setError('Failed to save settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (key: keyof UserSettingsDto, value: UserSettingsDto[keyof UserSettingsDto]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleNotificationChange = (key: keyof Pick<UserSettingsDto, 'emailNotificationsEnabled' | 'pushNotificationsEnabled' | 'processingCompleteNotifications' | 'errorNotifications' | 'weeklyDigestEnabled'>, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleAvatarSelect = (avatarUrl: string) => {
    setProfile(prev => ({ ...prev, avatar: avatarUrl }))
  }

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-gray-600">Loading profile settings...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'profile' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={profile.email}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email address is managed by Auth0 and cannot be changed here
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Picture
                </label>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar.url)}
                      className={`relative p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                        profile.avatar === avatar.url
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {avatar.url ? (
                          <img
                            src={avatar.url}
                            alt={avatar.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to default avatar if image fails to load
                              const target = e.target as HTMLImageElement
                              target.src = '/avatars/default.png'
                            }}
                          />
                        ) : (
                          <UserIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      {profile.avatar === avatar.url && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Click on an avatar to select it as your profile picture
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Preferences</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  Theme
                </label>
                <select
                  id="theme"
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  id="language"
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label htmlFor="defaultPageSize" className="block text-sm font-medium text-gray-700">
                  Default Page Size
                </label>
                <select
                  id="defaultPageSize"
                  value={settings.defaultPageSize}
                  onChange={(e) => handleSettingChange('defaultPageSize', parseInt(e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={10}>10 items</option>
                  <option value={20}>20 items</option>
                  <option value={50}>50 items</option>
                  <option value={100}>100 items</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Show Tutorials</h3>
                  <p className="text-sm text-gray-500">Display helpful tutorials and tips</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showTutorials}
                    onChange={(e) => handleSettingChange('showTutorials', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Compact Mode</h3>
                  <p className="text-sm text-gray-500">Use a more compact layout</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotificationsEnabled}
                    onChange={(e) => handleNotificationChange('emailNotificationsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotificationsEnabled}
                    onChange={(e) => handleNotificationChange('pushNotificationsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Processing Complete Notifications</h3>
                  <p className="text-sm text-gray-500">Get notified when data processing is complete</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.processingCompleteNotifications}
                    onChange={(e) => handleNotificationChange('processingCompleteNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Error Notifications</h3>
                  <p className="text-sm text-gray-500">Get notified about errors and issues</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.errorNotifications}
                    onChange={(e) => handleNotificationChange('errorNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Weekly Digest</h3>
                  <p className="text-sm text-gray-500">Receive a weekly summary of your activity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.weeklyDigestEnabled}
                    onChange={(e) => handleNotificationChange('weeklyDigestEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Security settings managed by Auth0
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Password changes, two-factor authentication, and other security settings are managed through your Auth0 account.
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100 px-3 py-2 rounded-md text-sm font-medium"
                        onClick={() => window.open('https://auth0.com', '_blank')}
                      >
                        Manage Auth0 Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 