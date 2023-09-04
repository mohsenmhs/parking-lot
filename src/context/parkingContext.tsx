import * as React from "react";
import { PARKING_CAPACITY } from "../config";
import {
  DispatchType,
  ParkingContextType,
  ParkingDispatchContextType,
  ParkingSpace,
  ParkingSpaceWithPaidTicket,
  ParkingSpaceWithTicket,
  PaymentMethod,
} from "./types";
import { formattedDate } from "../utils/utils";
import { paymentMethods, ticketState } from "./constant";
import {
  calculatePriceByDates,
  calculatePriceByParkingSpace,
  createNewTicket,
  paidDateExired,
  updateTicketState,
} from "../services/parking";

export const ParkingContext = React.createContext<
  ParkingContextType | undefined
>(undefined);
export const ParkingDispatchContext = React.createContext<
  ParkingDispatchContextType | undefined
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
  const getTicket = () => {
    const firstEmptyParkingSpace = parkingSpaces.find((obj) => {
      return !obj.ticket;
    });

    if (firstEmptyParkingSpace) {
      firstEmptyParkingSpace.ticket = createNewTicket();
      try {
        dispatch({
          type: "update",
          parkingSpace: firstEmptyParkingSpace,
        });
        return firstEmptyParkingSpace.ticket.barcode;
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Sorry, parking lot is full!");
    }
  };

  (window as any).getTicket = getTicket; //To access getTicket from developer console!

  const calculatePrice = (barcode: string) => {
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
      } catch (error) {
        console.log(error);
      }
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

  const payTicket = (barcode: string, paymentMethod: PaymentMethod) => {
    if (!paymentMethods.includes(paymentMethod)) {
      return `No payment method "${paymentMethod}" found!`;
    }
    const parkingSpace = getParkingSpaceByBarcode(barcode);

    if (parkingSpace) {
      try {
        const state = getTicketState(barcode); //update payment state!

        if (state === ticketState.paid) {
          return `Ticket #${barcode} has been paid!`;
        } else {
          const ps = parkingSpace as ParkingSpaceWithTicket;

          dispatch({
            type: "update",
            parkingSpace: {
              ...ps,
              ticket: {
                ...ps.ticket,
                paymentMethod: paymentMethod,
                paymentDate: Date.now(),
                paid: calculatePriceByParkingSpace(ps),
                state: ticketState.paid,
              },
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

  const getTicketState = (barcode: string) => {
    const parkingSpace = getParkingSpaceByBarcode(barcode);

    if (parkingSpace) {
      if (parkingSpace?.ticket?.state === ticketState.unpaid) {
        return ticketState.unpaid;
      }

      const ps = updateTicketState(parkingSpace as ParkingSpaceWithPaidTicket);
      dispatch({
        type: "update",
        parkingSpace: ps,
      });

      return ps.ticket.state;
    } else {
      return `No barcode #${barcode} found!`;
    }
  };

  (window as any).getTicketState = getTicketState; //To access payTicket from developer console!

  const getFreeSpaces = () => {
    return parkingSpaces.filter((parkingSpace) => !parkingSpace.ticket).length;
  };

  (window as any).getFreeSpaces = getFreeSpaces;

  const [parkingSpaces, dispatch] = React.useReducer(
    parkingSpacesReducer,
    initParking()
  );

  React.useEffect(() => {
    localStorage.setItem("parkingSpaces", JSON.stringify(parkingSpaces));
  }, [parkingSpaces]);

  return (
    <ParkingContext.Provider value={parkingSpaces}>
      <ParkingDispatchContext.Provider value={dispatch}>
        {children}
      </ParkingDispatchContext.Provider>
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
export function useParkingDispatch(): ParkingDispatchContextType {
  const context = React.useContext(ParkingDispatchContext);
  if (context === undefined) {
    throw new Error("useParking called outside context.");
  }

  return context;
}

function parkingSpacesReducer(
  parkingSpaces: ParkingSpace[],
  action: DispatchType
) {
  switch (action.type) {
    case "update": {
      return parkingSpaces.map((t) => {
        if (t.spaceNumber === action.parkingSpace.spaceNumber) {
          return action.parkingSpace;
        } else {
          return t;
        }
      });
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}
