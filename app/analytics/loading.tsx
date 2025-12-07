export default function AnalyticsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-4 w-24 bg-slate-700 rounded mb-4 animate-pulse"></div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-14 h-14 bg-slate-700 rounded-xl animate-pulse"></div>
            <div>
              <div className="h-10 w-48 bg-slate-700 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-96 bg-slate-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="h-4 w-20 bg-slate-700 rounded mb-4 animate-pulse"></div>
              <div className="h-8 w-32 bg-slate-700 rounded mb-2 animate-pulse"></div>
              <div className="h-3 w-24 bg-slate-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="h-6 w-40 bg-slate-700 rounded mb-4 animate-pulse"></div>
              <div className="h-64 bg-slate-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Loading Text */}
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-400">Loading analytics...</p>
        </div>
      </div>
    </div>
  )
}

