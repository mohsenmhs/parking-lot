import { useParking } from "./parkingContext";

const { parkingSpaces } = useParking();
const getFreeSpaces = () => {
    return parkingSpaces.filter((parkingSpace) => !parkingSpace.ticket).length;
};

(window as any).getFreeSpaces = getFreeSpaces; //To access getFreeSpaces from developer console!
