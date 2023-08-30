export interface ParkingSpace {
  spaceNumber: number;
  ticket: {
    barcode: string;
  } | null;
}

export interface ParkingSpaceWithTicket extends ParkingSpace {
  ticket: {
    barcode: string;
  }
}

export interface ParkingContextType {
  parkingSpaces: ParkingSpace[];
  park: (spaceNumber: number) => Promise<ParkingSpaceWithTicket>;
  leave: (spaceNumber: number) => Promise<ParkingSpace>;
}
