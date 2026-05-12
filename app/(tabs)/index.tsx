import MapUI from "../../components/ui/MapUI";

import { useTracking } from "../../hooks/useTracking";

export default function HomeScreen() {
  const {
    pickupCords,
    routeCoords,
    selectedDestination,
    handleSelectDestination,
  } = useTracking();

  return (
    <MapUI
      pickupCords={pickupCords}
      routeCoords={routeCoords}
      selectedDestination={selectedDestination}
      onSelectDestination={handleSelectDestination}
    />
  );
}
