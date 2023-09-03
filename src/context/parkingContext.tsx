import * as React from "react";
import { PARKING_CAPACITY } from "../config";
import {
  ParkingContextType,
  ParkingSpace,
  ParkingSpaceWithPaidTicket,
  ParkingSpaceWithTicket,
  PaymentMethod,
} from "./types";
import { formattedDate, getRandumNumber, paidDateExired } from "../utils/utils";
import { paymentMethods, ticketState } from "./constant";
import { calculatePriceByDates, calculatePriceByParkingSpace } from "../services/parking";

export const ParkingContext = React.createContext<
  ParkingContextType | undefined
>(undefined);

function initParking(): ParkingSpace[] {
  if (localStorage.getItem("parkingSpaces")) {
    const localStorageParkingSpaces = JSON.parse(
      localStorage.getItem("parkingSpaces") || ""
    );
    return localStorageParkingSpaces.map((parkingSpace: ParkingSpace) => {
      //if State was undefined (from old version localstorage)
      if (parkingSpace.ticket && !parkingSpace.ticket?.state)
        (parkingSpace as ParkingSpaceWithPaidTicket).ticket.state =
          ticketState.unpaid;

      //if State was paid and expired
      if (parkingSpace.ticket?.state === ticketState.paid) {
        const ps = parkingSpace as ParkingSpaceWithPaidTicket;
        ps.ticket.state = paidDateExired(ps.ticket.paymentDate)
          ? ticketState.unpaid
          : ticketState.paid;
      }

      //if Paid was undefined (from old version localstorage)
      if (
        parkingSpace.ticket &&
        !((parkingSpace as ParkingSpaceWithTicket).ticket?.paid >= 0)
      ) {
        parkingSpace.ticket.paid = parkingSpace.ticket.paymentDate
          ? calculatePriceByDates(
              parkingSpace.ticket.enterDate,
              parkingSpace.ticket.paymentDate
            )
          : 0;
      }
      return parkingSpace;
    });
  }

  return [...Array(PARKING_CAPACITY)].map((_, idx: number) => ({
    spaceNumber: idx + 1,
    ticket: null,
  }));
}

export function ParkingContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [parkingSpaces, setParkingSpaces] = React.useState(initParking());
  const [selectedParkingSpace, setSelectedParkingSpace] =
    React.useState<ParkingSpaceWithTicket | null>(null);

  const updateParkingSpace = (parkingSpace: ParkingSpace) => {
    setParkingSpaces((prev: ParkingSpace[]) => {
      const temp = prev.map((space) =>
        space.spaceNumber === parkingSpace.spaceNumber ? parkingSpace : space
      );
      localStorage.setItem("parkingSpaces", JSON.stringify(temp));
      return temp;
    });

    return parkingSpace;
  };

  const park = (spaceNumber: number) => {
    const parkingSpace: ParkingSpaceWithTicket = {
      spaceNumber,
      ticket: {
        barcode: getRandumNumber(16).toString(),
        enterDate: Date.now(), // get current date
        state: ticketState.unpaid,
        paid: 0,
      },
    };
    const p = new Promise<ParkingSpaceWithTicket>((resolve, rejct) => {
      const temp = updateParkingSpace(parkingSpace) as ParkingSpaceWithTicket;
      if (temp) resolve(temp);
      else rejct("Error!");
    });
    return p;
  };

  const leave = (spaceNumber: number) => {
    const p = new Promise<ParkingSpace>((resolve) =>
      resolve(
        updateParkingSpace({
          spaceNumber,
          ticket: null,
        })
      )
    );
    return p;
  };

  const updateTicket = (parkingSpace: ParkingSpaceWithTicket) => {
    const p = new Promise<ParkingSpaceWithTicket>((resolve, rejct) => {
      const temp = updateParkingSpace(
        parkingSpace
      ) as ParkingSpaceWithPaidTicket;
      if (temp) resolve(temp);
      else rejct("Error!");
    });
    return p;
  };

  const initialState: ParkingContextType = {
    parkingSpaces,
    park,
    leave,
    selectedParkingSpace,
    setSelectedParkingSpace,
    updateTicket,
  };


  const getTicket = async () => {
    const firstEmptyParkingSpace = parkingSpaces.find((obj) => {
      return !obj.ticket;
    });

    if (firstEmptyParkingSpace) {
      try {
        const res: ParkingSpaceWithTicket = await park(
          firstEmptyParkingSpace.spaceNumber
        );
        return res.ticket.barcode;
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Sorry, parking lot is full!");
    }
  };

  (window as any).getTicket = getTicket; //To access getTicket from developer console!
  

  const calculatePrice = async (barcode: string) => {
    const parkingSpace = getParkingSpaceByBarcode(barcode);

    if (parkingSpace) {
      try {
        const ps = parkingSpace as ParkingSpaceWithPaidTicket;

        const price = calculatePriceByParkingSpace(ps) - ps.ticket.paid;
        if (price === 0) {
          //Paid before and display Payment Receipt !
          console.log("*********** Payment Receipt ***********");
          console.log("*  Barcode:        ", barcode, " *");
          console.log(
            "*  Enter Date:        ",
            formattedDate(new Date(ps.ticket.enterDate)),
            " *"
          );
          console.log(
            "*  Payment Date:      ",
            formattedDate(new Date(ps.ticket.paymentDate)),
            " *"
          );

          const spaces = 12 - ps.ticket.paymentMethod.length;
          console.log(
            "*  Last payment Method:",
            Array(spaces).join(" "),
            parkingSpace.ticket?.paymentMethod,
            " *"
          );

          const paid = "€" + ps.ticket.paid;
          const paidSpaces = 27 - paid.length;
          console.log("*  Paid:", Array(paidSpaces).join(" "), paid, " *");

          console.log("***************************************");

          return 0;
        }

        return price;
      } catch (error) {}
    } else {
      return `No barcode #${barcode} found!`;
    }
  };

  (window as any).calculatePrice = calculatePrice; //To access calculatePrice from developer console!

  const getParkingSpaceByBarcode = (barcode: string) => {
    return parkingSpaces.find((obj) => {
      return obj.ticket?.barcode === barcode;
    });
  };

  const payTicket = async (barcode: string, paymentMethod: PaymentMethod) => {
    if (!paymentMethods.includes(paymentMethod)) {
      return `No payment method "${paymentMethod}" found!`;
    }
    const parkingSpace = getParkingSpaceByBarcode(barcode);

    if (parkingSpace) {
      try {
        await getTicketState(barcode); //update payment state!

        if (parkingSpace?.ticket?.state === ticketState.paid) {
          return `Ticket #${barcode} has been paid!`;
        } else {
          const ps = parkingSpace as ParkingSpaceWithTicket;

          await updateTicket({
            ...ps,
            ticket: {
              ...ps.ticket,
              paymentMethod: paymentMethod,
              paymentDate: Date.now(),
              paid: calculatePriceByParkingSpace(ps),
              state: ticketState.paid,
            },
          });
          return `Ticket #${barcode} paid!`;
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      return `No barcode #${barcode} found!`;
    }
  };

  (window as any).payTicket = payTicket; //To access payTicket from developer console!

  const getTicketState = async (barcode: string) => {
    const parkingSpace = getParkingSpaceByBarcode(barcode);

    if (parkingSpace?.ticket?.state === ticketState.unpaid) {
      return ticketState.unpaid;
    }

    if (parkingSpace) {
      //Ticket has been paid but the payment date may have expired
      const res = await updateTicket(parkingSpace as ParkingSpaceWithPaidTicket);
      return res.ticket.state;
    } else {
      return `No barcode #${barcode} found!`;
    }
  };

  (window as any).getTicketState = getTicketState; //To access payTicket from developer console!
  
  const getFreeSpaces = () => {
    return parkingSpaces.filter((parkingSpace) => !parkingSpace.ticket).length;
  };

  (window as any).getFreeSpaces = getFreeSpaces;

  return (
    <ParkingContext.Provider value={initialState}>
      {children}
    </ParkingContext.Provider>
  );
}

export function useParking(): ParkingContextType {
  const context = React.useContext(ParkingContext);
  if (context === undefined) {
    throw new Error("useParking called outside context.");
  }

  return context;
}
