import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  ChartPieIcon,
  ArrowUpIcon 
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalDatasets: number
  totalAnalyses: number
  totalVisualizations: number
  recentUploads: number
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalDatasets: 0,
    totalAnalyses: 0,
    totalVisualizations: 0,
    recentUploads: 0
  })

  useEffect(() => {
    // Fetch dashboard stats from API
    setStats({
      totalDatasets: 12,
      totalAnalyses: 8,
      totalVisualizations: 15,
      recentUploads: 3
    })
  }, [])

  const handleQuickAction = (action: { name: string; href: string }) => {
    if (action.name === 'Upload Dataset') {
      navigate('/datasets?upload=true');
    } else {
      navigate(action.href);
    }
  };

  const quickActions = [
    {
      name: 'Upload Dataset',
      description: 'Upload a new CSV, JSON, or Excel file',
      icon: DocumentTextIcon,
      href: '/datasets',
      color: 'bg-blue-500'
    },
    {
      name: 'Run Analysis',
      description: 'Analyze your datasets for insights',
      icon: ChartBarIcon,
      href: '/analysis',
      color: 'bg-green-500'
    },
    {
      name: 'Create Visualization',
      description: 'Generate charts and graphs',
      icon: ChartPieIcon,
      href: '/visualization',
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your data toolbox</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Datasets</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalDatasets}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Analyses</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalAnalyses}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartPieIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Visualizations</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalVisualizations}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowUpIcon className="h-8 w-8 text-orange-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recent Uploads</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.recentUploads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <div 
              key={action.name} 
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleQuickAction(action)}
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{action.name}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 