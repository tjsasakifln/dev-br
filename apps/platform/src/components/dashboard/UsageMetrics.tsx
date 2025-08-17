'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface UserMetrics {
  credits: number;
}

export const UsageMetrics = () => {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/v1/users/me');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data: UserMetrics = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créditos Restantes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold">{metrics?.credits}</p>
        )}
      </CardContent>
    </Card>
  );
};