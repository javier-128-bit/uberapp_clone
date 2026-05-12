import { useEffect, useRef } from "react";

import { View, Text, TouchableOpacity } from "react-native";

import { Marker, Polyline, Region, UrlTile } from "react-native-maps";

import MapView from "react-native-maps";

import { SafeAreaView } from "react-native-safe-area-context";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import tw from "twrnc";

import { Destination, destinations, LatLng } from "../../hooks/useTracking";

type Props = {
  pickupCords: LatLng | null;
  routeCoords: LatLng[];
  selectedDestination: Destination | null;

  onSelectDestination: (destination: Destination) => void;
};

export default function MapUI({
  pickupCords,
  routeCoords,
  selectedDestination,
  onSelectDestination,
}: Props) {
  // =========================
  // MAP REF
  // =========================
  const mapRef = useRef<MapView | null>(null);

  // =========================
  // DEFAULT REGION
  // =========================
  const defaultRegion: Region = {
    latitude: -7.2761716,
    longitude: 112.7802211,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  // =========================
  // FIT TRUCK + DESTINATION
  // =========================
  const fitToRoute = () => {
    if (!pickupCords || !selectedDestination || !mapRef.current) return;

    mapRef.current.fitToCoordinates(
      [pickupCords, selectedDestination.coordinate],
      {
        edgePadding: {
          top: 120,
          right: 80,
          bottom: 350,
          left: 80,
        },
        animated: true,
      },
    );
  };

  // =========================
  // FOCUS TO TRUCK
  // =========================
  const focusTruck = () => {
    if (!pickupCords || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: pickupCords.latitude,
        longitude: pickupCords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000,
    );
  };

  // =========================
  // AUTO FIT
  // =========================
  useEffect(() => {
    fitToRoute();
  }, [pickupCords, selectedDestination]);

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1`}>
        {/* MAP */}
        <MapView ref={mapRef} style={tw`flex-1`} initialRegion={defaultRegion}>
          {/* TILE */}
          <UrlTile
            urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            maximumZ={19}
          />

          {/* TRUCK */}
          {pickupCords && (
            <Marker coordinate={pickupCords}>
              <MaterialCommunityIcons
                name="truck-delivery"
                size={35}
                color="red"
              />
            </Marker>
          )}

          {/* DESTINATION */}
          {selectedDestination && (
            <Marker
              coordinate={selectedDestination.coordinate}
              title={selectedDestination.title}
            >
              <MaterialCommunityIcons
                name="map-marker"
                size={35}
                color="blue"
              />
            </Marker>
          )}

          {/* ROUTE */}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={5}
              strokeColor="blue"
            />
          )}
        </MapView>

        {/* GPS BUTTON */}
        <TouchableOpacity
          style={tw`absolute right-5 bottom-60 bg-white p-4 rounded-full shadow-lg`}
          onPress={focusTruck}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={24}
            color="black"
          />
        </TouchableOpacity>

        {/* DESTINATION PANEL */}
        <View style={tw`absolute bottom-5 w-full px-4`}>
          <View style={tw`bg-white rounded-3xl p-4 shadow-lg`}>
            <Text style={tw`text-lg font-bold mb-3`}>Pilih Destination</Text>

            <View style={tw`flex-row flex-wrap`}>
              {destinations.map((item) => {
                const isActive = selectedDestination?.id === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={tw.style(
                      `px-4 py-3 rounded-2xl mr-2 mb-2`,
                      isActive ? `bg-blue-500` : `bg-gray-200`,
                    )}
                    onPress={() => onSelectDestination(item)}
                  >
                    <Text
                      style={tw.style(
                        isActive ? `text-white font-bold` : `text-black`,
                      )}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
