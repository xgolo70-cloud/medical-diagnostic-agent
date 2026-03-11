import React from 'react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
