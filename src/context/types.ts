export interface ParkingSpace {
  spaceNumber: number;
  ticket: {
    barcode: string;
    enterDate: number;
  } | null;
}

export interface ParkingSpaceWithTicket extends ParkingSpace {
  ticket: {
    barcode: string;
    enterDate: number;
  }
}

export interface ParkingContextType {
  parkingSpaces: ParkingSpace[];
  park: (spaceNumber: number) => Promise<ParkingSpaceWithTicket>;
  leave: (spaceNumber: number) => Promise<ParkingSpace>;
  spacePrice: string|null;
  setSpacePrice: (spacePrice: string|null) => void;
}
