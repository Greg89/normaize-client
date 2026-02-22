import { ApiResponse, PaginatedResponse, DataSet, Analysis, DataSetUploadResponse, UserProfileDto, UserSettingsDto, DataSetResetDto, RemoveDuplicateRowsRequest, NormalizationJobResponse } from '../types';
import { API_CONFIG } from '../utils/constants';
import { logger } from '../utils/logger';

class ApiService {
  private baseUrl: string;
  private getToken?: () => Promise<string | null>;
  private forceReAuth?: () => Promise<void>;
  private retryingRequest = false;

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

      // Handle 401 Unauthorized - attempt token refresh first
      if (response.status === 401) {
        // If we didn't send a token, don't force logout.
        // This commonly happens when Auth0 token retrieval fails transiently (e.g. "login required")
        // and aggressively logging out creates a redirect loop.
        if (!headers['Authorization']) {
          await logger.warn('401 Unauthorized without token - not forcing re-authentication', {
            url,
            method: options.method || 'GET',
            endpoint,
          });
          throw new Error('Authentication required');
        }

        await logger.warn('401 Unauthorized detected, attempting token refresh', {
          url,
          method: options.method || 'GET',
          endpoint,
          hasToken: !!headers['Authorization'],
          retryingRequest: this.retryingRequest,
        });
        
        // If we're already retrying, don't retry again - force re-auth
        if (this.retryingRequest) {
          await logger.warn('Token refresh already attempted, forcing re-authentication', {
            url,
            endpoint,
          });
          
          if (this.forceReAuth) {
            await this.forceReAuth();
          }
          
          throw new Error('Authentication required - redirecting to login');
        }
        
        // Try to get a fresh token and retry the request once
        if (this.getToken) {
          try {
            this.retryingRequest = true;
            await logger.debug('Attempting to get fresh token for retry', { url, endpoint });
            
            const freshToken = await this.getToken();
            if (freshToken) {
              await logger.debug('Got fresh token, retrying request', { url, endpoint });
              
              // Update authorization header with fresh token
              const retryHeaders = {
                ...headers,
                'Authorization': `Bearer ${freshToken}`
              };
              
              const retryConfig: RequestInit = {
                ...config,
                headers: retryHeaders,
              };
              
              // Retry the request with fresh token
              const retryResponse = await fetch(url, retryConfig);
              const retryDuration = Date.now() - startTime;
              
              // Log the retry attempt
              try {
                await logger.trackApiCall(
                  options.method || 'GET',
                  url + ' (retry)',
                  retryResponse.status,
                  retryDuration
                );
              } catch (loggingError) {
                // Use logger as fallback, but don't let logging errors break the API flow
                  logger.warn('Logging failed for retry API call', { error: loggingError });
              }
              
              this.retryingRequest = false;
              
              // If retry still gets 401, force re-auth
              if (retryResponse.status === 401) {
                await logger.warn('Retry with fresh token also got 401, forcing re-authentication', {
                  url,
                  endpoint,
                });
                
                if (this.forceReAuth) {
                  await this.forceReAuth();
                }
                
                throw new Error('Authentication required - redirecting to login');
              }
              
              // If retry succeeded, continue with the retry response
              if (retryResponse.ok) {
                await logger.debug('Retry request succeeded', { url, endpoint, status: retryResponse.status });
                
                // Handle 204 No Content responses for retry
                if (retryResponse.status === 204) {
                  return {
                    data: {} as T,
                    success: true,
                    message: 'Success'
                  };
                }
                
                const retryData = await retryResponse.json();
                this.validateResponse(retryData);
                return retryData;
              }
              
              // If retry failed for other reasons, fall through to normal error handling
              this.retryingRequest = false;
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }
          } catch (tokenError) {
            this.retryingRequest = false;
            await logger.warn('Failed to get fresh token, forcing re-authentication', {
              url,
              endpoint,
              error: tokenError,
            });

            // We only reach this block when we had an Authorization header to begin with.
            if (this.forceReAuth) {
              await this.forceReAuth();
            }

            throw new Error('Authentication required - redirecting to login');
          }
        }
        
        // If no token getter available, force re-auth
        await logger.warn('No token getter available, forcing re-authentication', {
          url,
          endpoint,
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
  async getDataSets(includeDeleted = false): Promise<DataSet[]> {
    const query = includeDeleted ? '?includeDeleted=true' : '';
    const response = await this.request<DataSet[]>(`/api/datasets${query}`);
    return response.data;
  }

  async getDataSetsPaginated(page = 1, pageSize = 10, includeDeleted = false): Promise<PaginatedResponse<DataSet>> {
    const includeParam = includeDeleted ? '&includeDeleted=true' : '';
    const response = await this.request<DataSet[]>(`/api/datasets?page=${page}&pageSize=${pageSize}${includeParam}`);
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
      let errorMessage = `Upload failed: ${response.statusText}`;

      // Attempt to read a structured error message from the response body.
      // If the body isn't JSON (or is empty), fall back to status-code hints.
      try {
        const errorBody = await response.json() as Record<string, unknown>;
        if (typeof errorBody['message'] === 'string') {
          errorMessage = errorBody['message'];
        } else if (Array.isArray(errorBody['errors']) && (errorBody['errors'] as unknown[]).length > 0) {
          errorMessage = String((errorBody['errors'] as unknown[])[0]);
        }
      } catch {
        // Body is not JSON — map common status codes to friendlier messages.
        switch (response.status) {
          case 413:
            errorMessage = 'Upload failed: File is too large';
            break;
          case 415:
            errorMessage = 'Upload failed: Unsupported file type';
            break;
          case 422:
            errorMessage = 'Upload failed: File validation error';
            break;
        }
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    // New DDD API returns: { success: true, data: DataSetResponse, message: "...", processingJobId?, isAsyncProcessing? }
    if (result && typeof result === 'object' && 'data' in result && result.success) {
      // Return the DataSetResponse with async processing fields if present
      const uploadResponse: DataSetUploadResponse = {
        ...result.data,
        processingJobId: result.processingJobId,
        isAsyncProcessing: result.isAsyncProcessing || false
      };
      return uploadResponse;
    }
    
    // Fallback for unexpected response structure
    throw new Error('Unexpected response structure from server');
  }

  async deleteDataSet(id: string): Promise<void> {
    await this.request(`/api/datasets/${id}`, { method: 'DELETE' });
  }

  async resetDataSet(id: string, resetDto: DataSetResetDto): Promise<DataSet> {
    const response = await this.request<DataSet>(`/api/datasets/${id}/reset`, {
      method: 'POST',
      body: JSON.stringify(resetDto),
    });
    
    return response.data;
  }

  async updateDataSet(id: string, updates: { name?: string; description?: string; retentionExpiryDate?: string }): Promise<DataSet> { 
    const response = await this.request<DataSet>(`/api/datasets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    return response.data;
  }

  async getDataSetPreview(id: string): Promise<unknown> {
    const response = await this.request<unknown>(`/api/datasets/${id}/preview`);
    return response.data;
  }

  async removeDuplicates(dataSetId: string, request: RemoveDuplicateRowsRequest): Promise<NormalizationJobResponse> {
    const response = await this.request<NormalizationJobResponse>(`/api/datasets/${dataSetId}/remove-duplicates`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.data;
  }

  async getJobStatus(jobId: string): Promise<NormalizationJobResponse> {
    const response = await this.request<NormalizationJobResponse>(`/api/jobs/${jobId}/status`);
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
    dataSetId: string; // Changed from number to string
    configuration?: unknown;
  }): Promise<Analysis> {
    const response = await this.request<Analysis>('/api/analyses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async getAnalysis(id: string): Promise<Analysis> { // Changed from number to string
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