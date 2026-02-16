import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[oklch(0.25_0.05_250)] to-[oklch(0.15_0.03_270)] p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-2xl border border-border/50">
        <div className="text-center space-y-2">
          <img
            src="/assets/generated/app-logo.dim_512x128.png"
            alt="App Logo"
            className="mx-auto h-16 w-auto mb-6"
          />
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
