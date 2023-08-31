export interface ParkingSpace {
  spaceNumber: number;
  ticket: {
    barcode: string;
    enterDate: number;
    paymentMethod?: PaymentMethod | null;
    paymentDate?: number | null;
  } | null;
}

export interface ParkingSpaceWithTicket extends ParkingSpace {
  ticket: {
    barcode: string;
    enterDate: number;
    paymentMethod?: PaymentMethod | null;
    paymentDate?: number | null;
  };
}

export interface ParkingSpaceWithPaidTicket extends ParkingSpace {
  ticket: {
    barcode: string;
    enterDate: number;
    paymentMethod: PaymentMethod;
    paymentDate: number;
  };
}

export interface ParkingContextType {
  parkingSpaces: ParkingSpace[];
  park: (spaceNumber: number) => Promise<ParkingSpaceWithTicket>;
  leave: (spaceNumber: number) => Promise<ParkingSpace>;
  selectedParkingSpace: ParkingSpaceWithTicket | null;
  setSelectedParkingSpace: (
    selectedParkingSpace: ParkingSpaceWithTicket | null
  ) => void;
  ticketPayment: (
    parkingSpace: ParkingSpaceWithTicket,
    paymentMethod: PaymentMethod
  ) => Promise<ParkingSpaceWithPaidTicket>;
}

export const paymentMethods = ["credit card", "debit", "card", "cash"];
export type PaymentMethod = (typeof paymentMethods)[number];
