import React, { useCallback, useState } from 'react';
import { Activity } from '../../types/activity';
import { Trip } from '../../types/trip';
import DirectionsModal from './DirectionsModal';
import { DirectionsContext, OpenDirections } from './directionsContext';

interface DirectionsProviderProps {
  trip: Trip | null;
  children: React.ReactNode;
}

export default function DirectionsProvider({ trip, children }: DirectionsProviderProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const open = useCallback<OpenDirections>((act) => setActivity(act), []);

  return (
    <DirectionsContext.Provider value={open}>
      {children}
      {activity && <DirectionsModal activity={activity} trip={trip} onClose={() => setActivity(null)} />}
    </DirectionsContext.Provider>
  );
}
