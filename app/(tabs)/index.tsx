import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, UrlTile, Region } from "react-native-maps";
import axios from "axios";
import tw from "twrnc";
import * as Location from "expo-location";

// type koordinat
type LatLng = {
  latitude: number;
  longitude: number;
};

export default function HomeScreen() {
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [pickupCords, setPickupCords] = useState<LatLng | null>(null);

  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const dropLocationCords: LatLng = {
    latitude: -7.2686917,
    longitude: 112.7842194,
  };

  useEffect(() => {
    startTracking();

    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
      }
    };
  }, []);

  // =========================
  // 1. GPS Tracking
  // =========================
  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      console.log("Permission denied");
      return;
    }

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000, // 10 detik
        distanceInterval: 0,
      },
      (location) => {
        const { latitude, longitude } = location.coords;

        const newPos: LatLng = {
          latitude,
          longitude,
        };

        setPickupCords(newPos);

        fetchRoute(latitude, longitude);
      },
    );
  };

  // =========================
  // 2. Fetch Route API
  // =========================
  const fetchRoute = async (lat: number, lng: number) => {
    try {
      const response = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          coordinates: [
            [lng, lat],
            [dropLocationCords.longitude, dropLocationCords.latitude],
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
  // 3. Region fallback
  // =========================
  const defaultRegion: Region = {
    latitude: -7.2761716,
    longitude: 112.7802211,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <MapView
        style={tw`flex-1`}
        region={
          pickupCords
            ? { ...pickupCords, latitudeDelta: 0.01, longitudeDelta: 0.01 }
            : defaultRegion
        }
      >
        {/* OSM Tile */}
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {/* Marker HP */}
        {pickupCords && <Marker coordinate={pickupCords} title="Saya" />}

        {/* Marker tujuan */}
        <Marker coordinate={dropLocationCords} title="Tujuan" />

        {/* Route */}
        <Polyline
          coordinates={routeCoords}
          strokeWidth={5}
          strokeColor="blue"
        />
      </MapView>
    </SafeAreaView>
  );
}
