export interface ParkingSpace {
  spaceNumber: number;
  ticket: string | null;
}

export interface ParkingContextType {
  parkingSpaces: ParkingSpace[];
  park: (spaceNumber: number) => void;
  leave: (spaceNumber: number) => void;
}
