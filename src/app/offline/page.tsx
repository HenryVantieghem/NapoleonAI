import { Metadata } from "next"
import { Crown, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Executive Offline Mode | Napoleon AI",
  description: "Napoleon AI is temporarily offline. Your executive data is cached and ready when you reconnect.",
  robots: { index: false, follow: false }
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-luxury p-8">
          {/* Crown icon with animation */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="w-20 h-20 bg-gradient-burgundy rounded-full flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <WifiOff className="w-4 h-4 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-4">
            Executive Offline Mode
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Napoleon AI is temporarily offline. Your executive dashboard and critical data are cached and ready when you reconnect.
          </p>

          <div className="space-y-4">
            <Button 
              onClick={() => window.location.reload()}
              variant="luxury"
              className="w-full"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Reconnect to Command Center
            </Button>

            <Button 
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(registration => {
                    // TypeScript workaround for background sync
                    if ('sync' in registration) {
                      (registration as any).sync.register('executive-action')
                    }
                  })
                }
              }}
              variant="outline"
              className="w-full"
            >
              Sync Executive Actions
            </Button>
          </div>

          {/* Cached data indicator */}
          <div className="mt-8 p-4 bg-burgundy-50 rounded-xl">
            <h3 className="font-semibold text-burgundy-800 mb-2">Available Offline:</h3>
            <ul className="text-sm text-burgundy-700 space-y-1">
              <li>• Executive Dashboard</li>
              <li>• VIP Contact List</li>
              <li>• Recent Messages</li>
              <li>• Action Items</li>
            </ul>
          </div>

          {/* Connection status */}
          <div className="mt-6 text-xs text-gray-500">
            <div id="connection-status" className="flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              Offline Mode Active
            </div>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          // Monitor connection status
          function updateConnectionStatus() {
            const status = document.getElementById('connection-status');
            if (navigator.onLine) {
              status.innerHTML = '<div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>Connection Restored';
              setTimeout(() => window.location.reload(), 2000);
            } else {
              status.innerHTML = '<div class="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>Offline Mode Active';
            }
          }

          // Listen for connection changes
          window.addEventListener('online', updateConnectionStatus);
          window.addEventListener('offline', updateConnectionStatus);
          
          // Initial check
          updateConnectionStatus();
        `
      }} />
    </div>
  )
}