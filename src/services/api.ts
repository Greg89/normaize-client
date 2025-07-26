import { ApiResponse, DataSet, Analysis, DataSetUploadResponse } from '../types';
import { API_CONFIG } from '../utils/constants';
import { logger } from '../utils/logger';

class ApiService {
  private baseUrl: string;
  private getToken?: () => Promise<string | null>;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  setTokenGetter(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
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
      await logger.trackApiCall(
        options.method || 'GET',
        url,
        response.status,
        duration
      );

      // Handle 401 Unauthorized - try to refresh token and retry
      if (response.status === 401 && this.getToken && !this.isRefreshing) {
        this.isRefreshing = true;
        
        try {
          // Try to get a fresh token
          const newToken = await this.getToken();
          this.isRefreshing = false;
          
          if (newToken) {
            // Retry the request with the new token
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryConfig: RequestInit = {
              ...config,
              headers,
            };
            
            const retryResponse = await fetch(url, retryConfig);
            const retryDuration = Date.now() - startTime;
            
            // Log the retry
            await logger.trackApiCall(
              options.method || 'GET',
              url,
              retryResponse.status,
              retryDuration
            );
            
            if (!retryResponse.ok) {
              await logger.error(`API retry failed: ${retryResponse.status} ${retryResponse.statusText}`, {
                url,
                method: options.method || 'GET',
                status: retryResponse.status,
                duration: retryDuration,
                retry: true,
              });
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }
            
            // Handle 204 No Content responses (no body to parse)
            if (retryResponse.status === 204) {
              return {} as ApiResponse<T>;
            }
            
            const data = await retryResponse.json();
            return data;
          }
        } catch (refreshError) {
          this.isRefreshing = false;
          await logger.error('Token refresh failed', { refreshError });
          // Continue to throw the original 401 error
        }
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
        return {} as ApiResponse<T>;
      }
      
      const data = await response.json();
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
    
    // Handle both response formats
    if (Array.isArray(response)) {
      return response; // Server returns array directly
    } else if (response.data) {
      return response.data; // Server returns { data: [...] }
    } else {
      return [];
    }
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
    
    // Handle the actual backend response structure (camelCase)
    if (result && typeof result === 'object' && 'dataSetId' in result) {
      const transformed = {
        id: result.dataSetId,
        message: result.message || '',
        success: result.success || false
      };
      return transformed;
    }
    
    // Fallback for unexpected response structure
    throw new Error('Unexpected response structure from server');
  }

  async deleteDataSet(id: number): Promise<void> {
    await this.request(`/api/datasets/${id}`, { method: 'DELETE' });
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
}

export const apiService = new ApiService(); 