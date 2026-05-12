import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as Location from "expo-location";

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type Destination = {
  id: number;
  title: string;
  coordinate: LatLng;
};

export const destinations: Destination[] = [
  {
    id: 1,
    title: "Unair Kampus C",
    coordinate: {
      latitude: -7.269791,
      longitude: 112.784851,
    },
  },
  {
    id: 2,
    title: "Unair Kampus B",
    coordinate: {
      latitude: -7.269994,
      longitude: 112.75854,
    },
  },
  {
    id: 3,
    title: "Galaxy Mall 2",
    coordinate: {
      latitude: -7.275847,
      longitude: 112.780163,
    },
  },
  {
    id: 4,
    title: "Galaxy Mall 3",
    coordinate: {
      latitude: -7.27653,
      longitude: 112.779664,
    },
  },
];

export const useTracking = () => {
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [pickupCords, setPickupCords] = useState<LatLng | null>(null);

  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);

  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const lastFetchRef = useRef<number>(0);

  const routeLockRef = useRef(false);

  useEffect(() => {
    startTracking();

    return () => {
      watchRef.current?.remove();
    };
  }, [selectedDestination]);

  // =========================
  // GPS TRACKING
  // =========================
  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Permission denied");
      return;
    }

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 50,
      },
      (location) => {
        const { latitude, longitude } = location.coords;

        const currentPos = {
          latitude,
          longitude,
        };

        setPickupCords(currentPos);

        const now = Date.now();

        if (selectedDestination && now - lastFetchRef.current >= 30000) {
          lastFetchRef.current = now;

          fetchRoute(currentPos, selectedDestination.coordinate);
        }
      },
    );
  };

  // =========================
  // FETCH ROUTE
  // =========================
  const fetchRoute = async (start: LatLng, end: LatLng) => {
    try {
      const response = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          coordinates: [
            [start.longitude, start.latitude],
            [end.longitude, end.latitude],
          ],
        },
        {
          headers: {
            Authorization: process.env.EXPO_PUBLIC_ORS_API_KEY as string,
            "Content-Type": "application/json",
          },
        },
      );

      const coords: LatLng[] =
        response.data.features[0].geometry.coordinates.map(
          (item: number[]) => ({
            latitude: item[1],
            longitude: item[0],
          }),
        );

      setRouteCoords(coords);
    } catch (error: any) {
      console.log(error.response?.data || error.message);
    }
  };

  // =========================
  // SELECT DESTINATION
  // =========================
  const handleSelectDestination = (destination: Destination) => {
    if (routeLockRef.current) return;

    routeLockRef.current = true;

    setSelectedDestination(destination);

    if (pickupCords) {
      fetchRoute(pickupCords, destination.coordinate);
    }

    setTimeout(() => {
      routeLockRef.current = false;
    }, 5000);
  };

  return {
    pickupCords,
    routeCoords,
    selectedDestination,
    handleSelectDestination,
  };
};
