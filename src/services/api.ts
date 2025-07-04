// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface DataSet {
  id: number;
  name: string;
  description?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  rowCount: number;
  columnCount: number;
  isProcessed: boolean;
}

export interface Analysis {
  id: number;
  name: string;
  description?: string;
  type: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  dataSetId: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // DataSet endpoints
  async getDataSets(): Promise<DataSet[]> {
    const response = await this.request<DataSet[]>('/api/datasets');
    return response.data;
  }

  async uploadDataSet(file: File, name: string, description?: string): Promise<DataSet> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (description) {
      formData.append('description', description);
    }

    const response = await fetch(`${this.baseUrl}/api/datasets/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
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
    configuration?: any;
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