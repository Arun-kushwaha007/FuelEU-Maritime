// frontend/src/adapters/ui/hooks/useSidebarData.ts

import { useState, useEffect } from 'react';
import { api } from '../../infrastructure/api';
import type { Route } from '../../../core/domain/types';

const TARGET_INTENSITY = 89.3368;

export interface RoutesTabSummary {
  count: number;
  years: number[];
  targetIntensity: number;
}

export interface RoutesTabDetails {
  route: Route;
  cb: {
    cb_g: number;
    cb_t: number;
  };
}

// Placeholder types for other tabs
export interface CompareTabData {}
export interface BankingTabData {}
export interface PoolingTabData {}


export type SidebarData = {
    routes?: RoutesTabSummary | RoutesTabDetails;
    compare?: CompareTabData;
    banking?: BankingTabData;
    pooling?: PoolingTabData;
} | null;

export function useSidebarData(activeTab: 'routes' | 'compare' | 'banking' | 'pooling', selectedItemId?: string) {
  const [data, setData] = useState<SidebarData>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        if (activeTab === 'routes') {
          const response = await api.get<Route[]>('/routes');
          const routes = response.data;

          if (selectedItemId) {
            const route = routes.find((r) => r.routeId === selectedItemId);
            if (route) {
              const energy_MJ = route.fuelConsumption_t * 41000;
              const cb_g = (TARGET_INTENSITY - route.ghgIntensity) * energy_MJ;
              const cb_t = cb_g / 1e6;
              setData({
                  routes: {
                    route,
                    cb: { cb_g, cb_t },
                  }
              });
            } else {
              setError(new Error('Route not found'));
            }
          } else {
            const uniqueYears = Array.from(new Set(routes.map((r) => r.year)));
            setData({
                routes: {
                    count: routes.length,
                    years: uniqueYears.sort(),
                    targetIntensity: TARGET_INTENSITY,
                }
            });
          }
        }
        // TODO: Implement logic for 'compare', 'banking', 'pooling' tabs
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedItemId]);

  return { data, loading, error };
}
