import React, { createContext, useContext, useState } from 'react';
import * as Location from 'expo-location';

export type UserLocation = {
  label: string;
  lat?: number;
  lng?: number;
  city?: string;
};

type LocationContextType = {
  location: UserLocation | null;
  setLocation: (loc: UserLocation | null) => void;
  requestCurrentLocation: () => Promise<void>;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null);

  const requestCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        label: 'Current Location',
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location', error);
      alert('Could not get current location');
    }
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, requestCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
