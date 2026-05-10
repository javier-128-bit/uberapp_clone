import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import axios from "axios";
import tw from "twrnc";

export default function HomeScreen() {
  const [routeCoords, setRouteCoords] = useState([]);

  const pickupCords = {
    latitude: -7.2761716,
    longitude: 112.7802211,
    latitudeDelta: 0.0005,
    longitudeDelta: 0.0005,
  };

  const dropLocationCords = {
    latitude: -7.2686917,
    longitude: 112.7842194,
    latitudeDelta: 0.0005,
    longitudeDelta: 0.005,
  };

  useEffect(() => {
    getRoute();
  }, []);

  const getRoute = async () => {
    try {
      const response = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          coordinates: [
            [pickupCords.longitude, pickupCords.latitude],
            [dropLocationCords.longitude, dropLocationCords.latitude],
          ],
        },
        {
          headers: {
            Authorization: process.env.EXPO_PUBLIC_ORS_API_KEY,
            "Content-Type": "application/json",
          },
        },
      );

      const coords = response.data.features[0].geometry.coordinates.map(
        (item: any) => ({
          latitude: item[1],
          longitude: item[0],
        }),
      );

      setRouteCoords(coords);
    } catch (error: any) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <MapView style={tw`flex-1`} initialRegion={pickupCords}>
        {/* OpenStreetMap */}
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          maximumZ={19}
        />
        {/* Pickup */}
        <Marker coordinate={pickupCords} />

        {/* Destination */}
        <Marker coordinate={dropLocationCords} />

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
