import { createContext, useContext } from 'react';
import { Activity } from '../../types/activity';

export type OpenDirections = (activity: Activity) => void;

export const DirectionsContext = createContext<OpenDirections>(() => {});

/** Abre "Cómo llegar" desde cualquier componente: const openDirections = useDirections(); */
export const useDirections = (): OpenDirections => useContext(DirectionsContext);
