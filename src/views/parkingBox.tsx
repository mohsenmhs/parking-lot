import * as React from "react";
import styled from "styled-components";
import { useParking } from "../context/parkingContext";
import {
  ParkingSpace,
  ParkingSpaceWithPaidTicket,
  ParkingSpaceWithTicket,
  PaymentMethod,
} from "../context/types";
import { formattedDate, paidDateExired } from "../utils/utils";
import {
  calculatePriceByDates,
  calculatePriceByParkingSpace,
} from "../services/parking";
import {
  expirePaidDateDuration,
  paymentMethods,
  ticketState,
} from "../context/constant";
import Timer from "../components/Timer";

export function ParkingBox({
  parkingSpace,
}: {
  parkingSpace: ParkingSpace;
}): JSX.Element {
  const { park, leave, parkingSpaces, setSelectedParkingSpace, updateTicket } =
    useParking();
  const { spaceNumber, ticket } = parkingSpace;

  const togglePlace = async () => {
    try {
      const res = ticket ? leave(spaceNumber) : park(spaceNumber);
      res.then((e) => {
        console.log(e.ticket?.barcode);
      });
    } catch (error) {
      console.log(error);
    }
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

  const parkingSpacePriceModal = () => {
    setSelectedParkingSpace(parkingSpace as ParkingSpaceWithTicket);
  };

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
      return updateTicketState(parkingSpace as ParkingSpaceWithPaidTicket);
    } else {
      return `No barcode #${barcode} found!`;
    }
  };

  (window as any).getTicketState = getTicketState; //To access payTicket from developer console!

  const updateTicketState = async (ps: ParkingSpaceWithPaidTicket) => {
    try {
      const res = await updateTicket({
        ...ps,
        ticket: {
          ...ps.ticket,
          state: paidDateExired(ps.ticket.paymentDate)
            ? ticketState.unpaid
            : ticketState.paid,
        },
      });
      return res.ticket.state;
    } catch (error) {
      console.log(error);
    }
  };

  const remainMilisecond = () => {
    const temp =
      expirePaidDateDuration -
      (Date.now() -
        (parkingSpace as ParkingSpaceWithPaidTicket).ticket.paymentDate);
    return temp > 0 ? temp : expirePaidDateDuration;
  };

  return (
    <ParkingBoxContainer className={ticket ? "occupied" : "free"}>
      <ParkingBoxContent
        className={!ticket ? "free" : ""}
        onClick={togglePlace}
      >
        {spaceNumber}
      </ParkingBoxContent>

      {ticket?.state === ticketState.paid && (
        <ParkingBoxContent className={"price state"}>
          <Timer
            remainMilisecond={remainMilisecond()}
            timerExpired={() => {
              updateTicketState(parkingSpace as ParkingSpaceWithPaidTicket);
            }}
          />
        </ParkingBoxContent>
      )}

      {ticket && (
        <ParkingBoxContent
          className={"price " + ticket?.state}
          onClick={parkingSpacePriceModal}
        >
          €
        </ParkingBoxContent>
      )}
    </ParkingBoxContainer>
  );
}

const ParkingBoxContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
  &.free {
    background: var(--free-spot);
  }
  &.occupied {
    background: var(--occupied-spot);
  }
`;

const ParkingBoxContent = styled.div`
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  &.free {
    height: 100%;
  }
  &.price {
    background: #00bcd4;

    &.paid {
      background: #66bb6a;
    }

    &.state {
      background: #ffeb3b;
    }
  }
`;
