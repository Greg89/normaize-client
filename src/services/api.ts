import { ApiResponse, PaginatedResponse, DataSet, Analysis, DataSetUploadResponse, UserProfileDto, UserSettingsDto } from '../types';
import { API_CONFIG } from '../utils/constants';
import { logger } from '../utils/logger';

class ApiService {
  private baseUrl: string;
  private getToken?: () => Promise<string | null>;
  private forceReAuth?: () => Promise<void>;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  setForceReAuth(forceReAuth: () => Promise<void>) {
    this.forceReAuth = forceReAuth;
  }

  /**
   * Validates that the API response has the expected structure
   */
  private validateResponse<T>(response: ApiResponse<T>): void {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format: response is not an object');
    }
    
    if (typeof response.success !== 'boolean') {
      throw new Error('Invalid response format: success field is missing or not boolean');
    }
    
    if (!response.success && response.errors && response.errors.length > 0) {
      throw new Error(`API Error: ${response.errors.join(', ')}`);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Add authorization header if token is available
    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        logger.devDebug('API Request with token', {
          endpoint,
          method: options.method || 'GET',
          tokenLength: token.length,
          tokenStart: token.substring(0, 20) + '...',
        });
      } else {
        logger.devDebug('API Request without token', {
          endpoint,
          method: options.method || 'GET',
        });
      }
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const duration = Date.now() - startTime;
      
      // Log the API call
      try {
        await logger.trackApiCall(
          options.method || 'GET',
          url,
          response.status,
          duration
        );
      } catch (loggingError) {
        // Prevent logging errors from breaking the API call
        // Use console.warn as fallback since logger failed
        // eslint-disable-next-line no-console
        console.warn('Logging failed for API call:', loggingError);
      }

      // Handle 401 Unauthorized - trigger re-authentication
      if (response.status === 401) {
        await logger.warn('401 Unauthorized detected, triggering re-authentication', {
          url,
          method: options.method || 'GET',
          endpoint,
          hasToken: !!headers['Authorization'],
        });
        
        if (this.forceReAuth) {
          await this.forceReAuth();
        }
        
        throw new Error('Authentication required - redirecting to login');
      }

      if (!response.ok) {
        await logger.error(`API request failed: ${response.status} ${response.statusText}`, {
          url,
          method: options.method || 'GET',
          status: response.status,
          duration,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Handle 204 No Content responses (no body to parse)
      if (response.status === 204) {
        return {
          data: {} as T,
          success: true,
          message: 'Success'
        };
      }
      
      const data = await response.json();
      this.validateResponse(data);
      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      await logger.error(`API request exception`, {
        url,
        method: options.method || 'GET',
        duration,
      }, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // DataSet endpoints
  async getDataSets(): Promise<DataSet[]> {
    const response = await this.request<DataSet[]>('/api/datasets');
    return response.data;
  }

  async getDataSetsPaginated(page = 1, pageSize = 10): Promise<PaginatedResponse<DataSet>> {
    const response = await this.request<DataSet[]>(`/api/datasets?page=${page}&pageSize=${pageSize}`);
    return response as PaginatedResponse<DataSet>;
  }

  async uploadDataSet(file: File, name: string, description?: string): Promise<DataSetUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (description) {
      formData.append('description', description);
    }

    // Get token for authentication
    let token = null;
    if (this.getToken) {
      token = await this.getToken();
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/api/datasets/upload`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Handle the new consistent API response structure
    if (result && typeof result === 'object' && 'data' in result && result.success) {
      // Server returns { data: { dataSetId: 123, ... }, success: true, message: "..." }
      const uploadData = result.data;
      return {
        id: uploadData.dataSetId || uploadData.id,
        message: result.message || 'Upload successful',
        success: result.success
      };
    }
    
    // Fallback for unexpected response structure
    throw new Error('Unexpected response structure from server');
  }

  async deleteDataSet(id: number): Promise<void> {
    await this.request(`/api/datasets/${id}`, { method: 'DELETE' });
  }

  async updateDataSet(id: number, updates: { name?: string; description?: string }): Promise<DataSet> {
    const response = await this.request<DataSet>(`/api/datasets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  // Analysis endpoints
  async getAnalyses(): Promise<Analysis[]> {
    const response = await this.request<Analysis[]>('/api/analyses');
    return response.data;
  }

  async createAnalysis(data: {
    name: string;
    description?: string;
    type: string;
    dataSetId: number;
    configuration?: unknown;
  }): Promise<Analysis> {
    const response = await this.request<Analysis>('/api/analyses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getAnalysis(id: number): Promise<Analysis> {
    const response = await this.request<Analysis>(`/api/analyses/${id}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.request<{ status: string }>('/health');
    return response.data;
  }

  // User Profile endpoints
  async getUserProfile(): Promise<UserProfileDto> {
    const response = await this.request<UserProfileDto>('/api/UserSettings/profile');
    return response.data;
  }

  async updateUserProfile(data: UserSettingsDto): Promise<UserProfileDto> {
    const response = await this.request<UserProfileDto>('/api/UserSettings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }
}

export const apiService = new ApiService(); 