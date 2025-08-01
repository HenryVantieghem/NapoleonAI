"use client"

export function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-jetBlack">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-champagneGold mx-auto mb-4"></div>
        <p className="text-warmIvory">Loading...</p>
      </div>
    </div>
  )
}