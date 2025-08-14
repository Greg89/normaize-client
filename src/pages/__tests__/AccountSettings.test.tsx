import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AccountSettings from '../AccountSettings';

// Mock dependencies
const mockUseAuth = jest.fn();

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../../services/api', () => ({
  apiService: {
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
  },
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserIcon: ({ className, ...props }: any) => (
    <div data-testid="user-icon" className={className} {...props} />
  ),
  ShieldCheckIcon: ({ className, ...props }: any) => (
    <div data-testid="shield-check-icon" className={className} {...props} />
  ),
  CogIcon: ({ className, ...props }: any) => (
    <div data-testid="cog-icon" className={className} {...props} />
  ),
  BellIcon: ({ className, ...props }: any) => (
    <div data-testid="bell-icon" className={className} {...props} />
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AccountSettings', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    sub: 'auth0|123',
  };

  const mockUserProfile = {
    name: 'Test User',
    email: 'test@example.com',
    picture: '/avatars/warrior.png',
    settings: {
      id: 1,
      userId: 'auth0|123',
      emailNotificationsEnabled: true,
      pushNotificationsEnabled: false,
      processingCompleteNotifications: true,
      errorNotifications: false,
      weeklyDigestEnabled: true,
      theme: 'dark',
      language: 'en',
      defaultPageSize: 50,
      showTutorials: false,
      compactMode: true,
      autoProcessUploads: true,
      maxPreviewRows: 200,
      defaultFileType: 'JSON',
      enableDataValidation: false,
      enableSchemaInference: true,
      shareAnalytics: false,
      allowDataUsageForImprovement: true,
      showProcessingTime: false,
      displayName: 'Test User',
      timeZone: 'UTC',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: mockUser,
    });

    const { apiService } = require('../../services/api');
    apiService.getUserProfile.mockResolvedValue(mockUserProfile);
    apiService.updateUserProfile.mockResolvedValue(mockUserProfile);
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      renderWithRouter(<AccountSettings />);
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });

    it('displays the main heading and description', () => {
      renderWithRouter(<AccountSettings />);
      
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
      expect(screen.getByText('Account Settings')).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
      
      expect(screen.getByText('Manage your account preferences and settings')).toBeInTheDocument();
      expect(screen.getByText('Manage your account preferences and settings')).toHaveClass('text-gray-600');
    });

    it('displays the save button', async () => {
      renderWithRouter(<AccountSettings />);
      
      await waitFor(() => {
        const saveButton = screen.getByText('Save Changes');
        expect(saveButton).toBeInTheDocument();
        expect(saveButton).toHaveClass('bg-primary-600', 'text-white');
      });
    });

    it('displays all four tabs', async () => {
      renderWithRouter(<AccountSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Preferences')).toBeInTheDocument();
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Security')).toBeInTheDocument();
      });
    });

    it('shows tab icons', async () => {
      renderWithRouter(<AccountSettings />);
      
      await waitFor(() => {
        expect(screen.getByTestId('user-icon')).toBeInTheDocument();
        expect(screen.getByTestId('cog-icon')).toBeInTheDocument();
        expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
        expect(screen.getByTestId('shield-check-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state when fetching profile', () => {
      const { apiService } = require('../../services/api');
      apiService.getUserProfile.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithRouter(<AccountSettings />);
      
      expect(screen.getByText('Loading profile settings...')).toBeInTheDocument();
      expect(screen.getByText('Loading profile settings...')).toHaveClass('text-gray-600');
    });
  });

  describe('Error Handling', () => {
    it('shows error message when profile fetch fails', async () => {
      const { apiService } = require('../../services/api');
      apiService.getUserProfile.mockRejectedValue(new Error('Failed to fetch'));
      
      renderWithRouter(<AccountSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load profile settings. Please try again.')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Failed to load profile settings. Please try again.')).toHaveClass('text-red-800');
    });

    it('shows error message when save fails', async () => {
      const { apiService } = require('../../services/api');
      apiService.updateUserProfile.mockRejectedValue(new Error('Failed to save'));
      
      renderWithRouter(<AccountSettings />);
      
      // Wait for profile to load
      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });
      
      // Try to save
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to save settings. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Profile Tab', () => {
    beforeEach(async () => {
      renderWithRouter(<AccountSettings />);
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
    });

    it('displays profile information section', () => {
      expect(screen.getByText('Profile Information')).toBeInTheDocument();
      expect(screen.getByText('Profile Information')).toHaveClass('text-lg', 'font-medium', 'text-gray-900');
    });

    it('displays name input field', () => {
      const nameInput = screen.getByLabelText('Full Name');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveValue('Test User');
      expect(nameInput).toHaveClass('border-gray-300', 'rounded-md');
    });

    it('allows editing name', () => {
      const nameInput = screen.getByLabelText('Full Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      expect(nameInput).toHaveValue('Updated Name');
    });

    it('displays email input field (disabled)', () => {
      const emailInput = screen.getByLabelText('Email Address');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveValue('test@example.com');
      expect(emailInput).toBeDisabled();
      expect(emailInput).toHaveClass('bg-gray-50', 'text-gray-500', 'cursor-not-allowed');
    });

    it('shows email management note', () => {
      expect(screen.getByText('Email address is managed by Auth0 and cannot be changed here')).toBeInTheDocument();
      expect(screen.getByText('Email address is managed by Auth0 and cannot be changed here')).toHaveClass('text-sm', 'text-gray-500');
    });

    it('displays avatar selection section', () => {
      expect(screen.getByText('Profile Picture')).toBeInTheDocument();
      expect(screen.getByText('Click on an avatar to select it as your profile picture')).toBeInTheDocument();
    });

    it('shows all avatar options', () => {
      expect(screen.getByAltText('Default')).toBeInTheDocument();
      expect(screen.getByAltText('Warrior')).toBeInTheDocument();
      expect(screen.getByAltText('Mage')).toBeInTheDocument();
      expect(screen.getByAltText('Rogue')).toBeInTheDocument();
      expect(screen.getByAltText('Duck')).toBeInTheDocument();
    });

    it('allows avatar selection', () => {
      const warriorAvatar = screen.getByAltText('Warrior').closest('button');
      expect(warriorAvatar).toBeInTheDocument();
      
      if (warriorAvatar) {
        fireEvent.click(warriorAvatar);
        // The avatar should now be selected (though we can't easily test the visual state)
      }
    });
  });

  describe('Preferences Tab', () => {
    beforeEach(async () => {
      renderWithRouter(<AccountSettings />);
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
      
      // Switch to preferences tab
      const preferencesTab = screen.getByText('Preferences');
      fireEvent.click(preferencesTab);
    });

    it('displays preferences section', () => {
      expect(screen.getByText('Preferences', { selector: 'h2' })).toBeInTheDocument();
      expect(screen.getByText('Preferences', { selector: 'h2' })).toHaveClass('text-lg', 'font-medium', 'text-gray-900');
    });

    it('displays theme selection', () => {
      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect).toBeInTheDocument();
      expect(themeSelect).toHaveValue('dark');
      
      const options = Array.from(themeSelect.querySelectorAll('option'));
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveValue('light');
      expect(options[1]).toHaveValue('dark');
      expect(options[2]).toHaveValue('system');
    });

    it('displays language selection', () => {
      const languageSelect = screen.getByLabelText('Language');
      expect(languageSelect).toBeInTheDocument();
      expect(languageSelect).toHaveValue('en');
      
      const options = Array.from(languageSelect.querySelectorAll('option'));
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveValue('en');
      expect(options[1]).toHaveValue('es');
      expect(options[2]).toHaveValue('fr');
      expect(options[3]).toHaveValue('de');
    });

    it('displays page size selection', () => {
      const pageSizeSelect = screen.getByLabelText('Default Page Size');
      expect(pageSizeSelect).toBeInTheDocument();
      expect(pageSizeSelect).toHaveValue('50');
      
      const options = Array.from(pageSizeSelect.querySelectorAll('option'));
      expect(options).toHaveLength(4);
      expect(options[0]).toHaveValue('10');
      expect(options[1]).toHaveValue('20');
      expect(options[2]).toHaveValue('50');
      expect(options[3]).toHaveValue('100');
    });

    it('displays show tutorials toggle', () => {
      expect(screen.getByText('Show Tutorials')).toBeInTheDocument();
      expect(screen.getByText('Display helpful tutorials and tips')).toBeInTheDocument();
      
      // Find the checkbox by looking for the label that contains "Show Tutorials"
      const tutorialsLabel = screen.getByText('Show Tutorials').closest('div')?.parentElement;
      const tutorialsToggle = tutorialsLabel?.querySelector('input[type="checkbox"]');
      expect(tutorialsToggle).toBeInTheDocument();
      expect(tutorialsToggle).not.toBeChecked(); // Based on mock data
    });

    it('displays compact mode toggle', () => {
      expect(screen.getByText('Compact Mode')).toBeInTheDocument();
      expect(screen.getByText('Use a more compact layout')).toBeInTheDocument();
      
      // Find the checkbox by looking for the label that contains "Compact Mode"
      const compactModeLabel = screen.getByText('Compact Mode').closest('div')?.parentElement;
      const compactModeToggle = compactModeLabel?.querySelector('input[type="checkbox"]');
      expect(compactModeToggle).toBeInTheDocument();
      expect(compactModeToggle).toBeChecked(); // Based on mock data
    });
  });

  describe('Notifications Tab', () => {
    beforeEach(async () => {
      renderWithRouter(<AccountSettings />);
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
      
      // Switch to notifications tab
      const notificationsTab = screen.getByText('Notifications');
      fireEvent.click(notificationsTab);
    });

    it('displays notifications section', () => {
      expect(screen.getByText('Notification Settings')).toBeInTheDocument();
      expect(screen.getByText('Notification Settings')).toHaveClass('text-lg', 'font-medium', 'text-gray-900');
    });

    it('displays email notifications toggle', () => {
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('Receive notifications via email')).toBeInTheDocument();
      
      // Find the checkbox by looking for the label that contains "Email Notifications"
      const emailLabel = screen.getByText('Email Notifications').closest('div')?.parentElement;
      const emailToggle = emailLabel?.querySelector('input[type="checkbox"]');
      expect(emailToggle).toBeInTheDocument();
      expect(emailToggle).toBeChecked(); // Based on mock data
    });

    it('displays push notifications toggle', () => {
      expect(screen.getByText('Push Notifications')).toBeInTheDocument();
      expect(screen.getByText('Receive push notifications in browser')).toBeInTheDocument();
      
      // Find the checkbox by looking for the label that contains "Push Notifications"
      const pushLabel = screen.getByText('Push Notifications').closest('div')?.parentElement;
      const pushToggle = pushLabel?.querySelector('input[type="checkbox"]');
      expect(pushToggle).toBeInTheDocument();
      expect(pushToggle).not.toBeChecked(); // Based on mock data
    });

    it('displays processing complete notifications toggle', () => {
      expect(screen.getByText('Processing Complete Notifications')).toBeInTheDocument();
      expect(screen.getByText('Get notified when data processing is complete')).toBeInTheDocument();
      
      // Find the checkbox by looking for the label that contains "Processing Complete Notifications"
      const processingLabel = screen.getByText('Processing Complete Notifications').closest('div')?.parentElement;
      const processingToggle = processingLabel?.querySelector('input[type="checkbox"]');
      expect(processingToggle).toBeInTheDocument();
      expect(processingToggle).toBeChecked(); // Based on mock data
    });

    it('displays error notifications toggle', () => {
      expect(screen.getByText('Error Notifications')).toBeInTheDocument();
      expect(screen.getByText('Get notified about errors and issues')).toBeInTheDocument();
      
      // Find the checkbox by looking for the label that contains "Error Notifications"
      const errorLabel = screen.getByText('Error Notifications').closest('div')?.parentElement;
      const errorToggle = errorLabel?.querySelector('input[type="checkbox"]');
      expect(errorToggle).toBeInTheDocument();
      expect(errorToggle).not.toBeChecked(); // Based on mock data
    });

    it('displays weekly digest toggle', () => {
      expect(screen.getByText('Weekly Digest')).toBeInTheDocument();
      expect(screen.getByText('Receive a weekly summary of your activity')).toBeInTheDocument();
      
      // Find the checkbox by looking for the label that contains "Weekly Digest"
      const weeklyDigestLabel = screen.getByText('Weekly Digest').closest('div')?.parentElement;
      const weeklyDigestToggle = weeklyDigestLabel?.querySelector('input[type="checkbox"]');
      expect(weeklyDigestToggle).toBeInTheDocument();
      expect(weeklyDigestToggle).toBeChecked(); // Based on mock data
    });
  });

  describe('Security Tab', () => {
    beforeEach(async () => {
      renderWithRouter(<AccountSettings />);
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
      
      // Switch to security tab
      const securityTab = screen.getByText('Security');
      fireEvent.click(securityTab);
    });

    it('displays security section', () => {
      expect(screen.getByText('Security Settings')).toBeInTheDocument();
      expect(screen.getByText('Security Settings')).toHaveClass('text-lg', 'font-medium', 'text-gray-900');
    });

    it('displays Auth0 management notice', () => {
      expect(screen.getByText('Security settings managed by Auth0')).toBeInTheDocument();
      expect(screen.getByText('Security settings managed by Auth0')).toHaveClass('text-sm', 'font-medium', 'text-yellow-800');
      
      expect(screen.getByText('Password changes, two-factor authentication, and other security settings are managed through your Auth0 account.')).toBeInTheDocument();
    });

    it('displays manage Auth0 settings button', () => {
      const manageButton = screen.getByText('Manage Auth0 Settings');
      expect(manageButton).toBeInTheDocument();
      expect(manageButton).toHaveClass('bg-yellow-50', 'text-yellow-800', 'hover:bg-yellow-100');
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(async () => {
      renderWithRouter(<AccountSettings />);
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
    });

    it('starts with profile tab active', () => {
      const profileTab = screen.getByText('Profile').closest('button');
      expect(profileTab).toHaveClass('border-primary-500', 'text-primary-600');
    });

    it('switches to preferences tab', () => {
      const preferencesTab = screen.getByText('Preferences').closest('button');
      expect(preferencesTab).toBeInTheDocument();
      if (preferencesTab) {
        fireEvent.click(preferencesTab);
        
        expect(screen.getByText('Preferences', { selector: 'h2' })).toBeInTheDocument();
        expect(preferencesTab).toHaveClass('border-primary-500', 'text-primary-600');
      }
    });

    it('switches to notifications tab', () => {
      const notificationsTab = screen.getByText('Notifications').closest('button');
      expect(notificationsTab).toBeInTheDocument();
      if (notificationsTab) {
        fireEvent.click(notificationsTab);
        
        expect(screen.getByText('Notification Settings')).toBeInTheDocument();
        expect(notificationsTab).toHaveClass('border-primary-500', 'text-primary-600');
      }
    });

    it('switches to security tab', () => {
      const securityTab = screen.getByText('Security').closest('button');
      expect(securityTab).toBeInTheDocument();
      if (securityTab) {
        fireEvent.click(securityTab);
        
        expect(screen.getByText('Security Settings')).toBeInTheDocument();
        expect(securityTab).toHaveClass('border-primary-500', 'text-primary-600');
      }
    });
  });

  describe('Save Functionality', () => {
    beforeEach(async () => {
      renderWithRouter(<AccountSettings />);
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
    });

    it('calls API when save button is clicked', async () => {
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      const { apiService } = require('../../services/api');
      await waitFor(() => {
        expect(apiService.updateUserProfile).toHaveBeenCalledTimes(1);
      });
    });

    it('shows loading state during save', async () => {
      const { apiService } = require('../../services/api');
      apiService.updateUserProfile.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
    });

    it('updates settings when preference changes', async () => {
      // Switch to preferences tab
      const preferencesTab = screen.getByText('Preferences');
      fireEvent.click(preferencesTab);
      
      // Change theme
      const themeSelect = screen.getByLabelText('Theme');
      fireEvent.change(themeSelect, { target: { value: 'light' } });
      
      // Save changes
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      const { apiService } = require('../../services/api');
      await waitFor(() => {
        expect(apiService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            theme: 'light',
          })
        );
      });
    });

    it('updates settings when notification changes', async () => {
      // Switch to notifications tab
      const notificationsTab = screen.getByText('Notifications');
      fireEvent.click(notificationsTab);
      
      // Toggle email notifications
      const emailNotificationsLabel = screen.getByText('Email Notifications').closest('div')?.parentElement;
      const emailToggle = emailNotificationsLabel?.querySelector('input[type="checkbox"]');
      expect(emailToggle).toBeInTheDocument();
      if (emailToggle) {
        fireEvent.click(emailToggle);
      }
      
      // Save changes
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      
      const { apiService } = require('../../services/api');
      await waitFor(() => {
        expect(apiService.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            emailNotificationsEnabled: false,
          })
        );
      });
    });
  });

  describe('Form Validation and State', () => {
    beforeEach(async () => {
      renderWithRouter(<AccountSettings />);
      await waitFor(() => {
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
      });
    });

    it('maintains form state across tab switches', () => {
      // Change name in profile tab
      const nameInput = screen.getByLabelText('Full Name');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
      
      // Switch to preferences tab and back
      const preferencesTab = screen.getByText('Preferences');
      fireEvent.click(preferencesTab);
      
      const profileTab = screen.getByText('Profile');
      fireEvent.click(profileTab);
      
      // Name should still be updated
      expect(nameInput).toHaveValue('Updated Name');
    });

    it('handles empty profile data gracefully', async () => {
      const { apiService } = require('../../services/api');
      apiService.getUserProfile.mockResolvedValue(null);
      
      renderWithRouter(<AccountSettings />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load profile settings. Please try again.')).toBeInTheDocument();
      });
    });
  });
});
