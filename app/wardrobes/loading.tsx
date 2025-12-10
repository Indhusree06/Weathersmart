export default function WardrobesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      {/* Navigation Skeleton */}
      <nav className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
              <div className="text-muted-foreground">|</div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                <div className="w-32 h-6 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 h-8 bg-muted rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
              <div className="w-16 h-8 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="w-64 h-8 bg-muted rounded animate-pulse mb-2"></div>
            <div className="w-96 h-4 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="w-40 h-10 bg-muted rounded animate-pulse"></div>
        </div>

        {/* Wardrobes Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-card/80 backdrop-blur-xl border border-border rounded-lg p-6 animate-pulse"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div>
                    <div className="w-24 h-4 bg-muted rounded mb-2"></div>
                    <div className="w-32 h-3 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-muted rounded"></div>
                  <div className="w-4 h-4 bg-muted rounded"></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-6 bg-muted/80 rounded mx-auto mb-1"></div>
                  <div className="w-12 h-3 bg-muted/80 rounded mx-auto"></div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="w-12 h-6 bg-muted/80 rounded mx-auto mb-1"></div>
                  <div className="w-10 h-3 bg-muted/80 rounded mx-auto"></div>
                </div>
              </div>

              {/* Status */}
              <div className="text-center py-4 mb-4">
                <div className="w-8 h-8 bg-muted/80 rounded mx-auto mb-2"></div>
                <div className="w-20 h-3 bg-muted/80 rounded mx-auto mb-1"></div>
                <div className="w-24 h-3 bg-muted/80 rounded mx-auto"></div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-muted rounded"></div>
                <div className="w-8 h-8 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
