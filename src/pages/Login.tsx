import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const { isLoading, login, error } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-center text-sm text-red-600">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <button
              onClick={login}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Login form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
                         <div className="text-center">
               {/* Full logo for login page */}
               <div className="flex justify-center mb-8">
                 <img 
                   src="/logo.svg" 
                   alt="NormAIze Logo" 
                   style={{ height: '80px', width: 'auto', maxWidth: '280px' }}
                 />
               </div>
               <p className="text-center text-lg text-gray-600">
                 Your intelligent data analysis platform
               </p>
             </div>
            
            <div className="mt-8 space-y-6">
              <div>
                <button
                  onClick={login}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  Sign in with Auth0
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Recent improvements */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-white">
          <div className="max-w-lg w-full px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Recent Improvements
              </h3>
              
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-6 text-left">
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-900">Enhanced Data Processing</h4>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">
                    Improved data normalization algorithms for better accuracy and faster processing times.
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-6 text-left">
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-green-900">New Visualization Features</h4>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">
                    Added advanced charting capabilities and interactive data exploration tools.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 text-left">
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-purple-900">Enhanced Security</h4>
                    </div>
                  </div>
                  <p className="text-sm text-purple-700">
                    Improved authentication and data protection measures for better security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 