import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { initDatabase } from '../database/db';
import { ensureMaintenanceTypesSeeded, seedSampleDataIfEmpty } from '../database/seed';
import {
  getActiveMotorcycleId,
  getAllMotorcycles,
  setActiveMotorcycleId as persistActiveMotorcycleId,
} from '../database/motorcycleRepository';
import { Motorcycle } from '../types';

interface AppContextValue {
  isReady: boolean;
  error: string | null;
  motorcycles: Motorcycle[];
  activeMotorcycle: Motorcycle | null;
  refreshMotorcycles: () => Promise<void>;
  setActiveMotorcycle: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [activeMotorcycleId, setActiveMotorcycleIdState] = useState<string | null>(null);

  const refreshMotorcycles = useCallback(async () => {
    const all = await getAllMotorcycles();
    setMotorcycles(all);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await initDatabase();
        await ensureMaintenanceTypesSeeded();
        await seedSampleDataIfEmpty();

        const all = await getAllMotorcycles();
        let activeId = await getActiveMotorcycleId();

        // Guard against a stale pointer (e.g. the active bike was deleted).
        const activeStillExists = activeId != null && all.some((m) => m.id === activeId);
        if (!activeStillExists) {
          activeId = all.length > 0 ? all[0].id : null;
          if (activeId) await persistActiveMotorcycleId(activeId);
        }

        if (!cancelled) {
          setMotorcycles(all);
          setActiveMotorcycleIdState(activeId);
          setIsReady(true);
        }
      } catch (e) {
        console.error('MotoCare failed to initialize the database', e);
        if (!cancelled) {
          setError('Something went wrong setting up MotoCare. Try restarting the app.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setActiveMotorcycle = useCallback(async (id: string) => {
    await persistActiveMotorcycleId(id);
    setActiveMotorcycleIdState(id);
  }, []);

  const activeMotorcycle = motorcycles.find((m) => m.id === activeMotorcycleId) ?? null;

  return (
    <AppContext.Provider
      value={{ isReady, error, motorcycles, activeMotorcycle, refreshMotorcycles, setActiveMotorcycle }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
