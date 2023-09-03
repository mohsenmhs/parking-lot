import * as React from "react";
import styled from "styled-components";
import { useParking } from "../context/parkingContext";
import {
  ParkingSpace,
  ParkingSpaceWithPaidTicket,
  ParkingSpaceWithTicket
} from "../context/types";
import { paidDateExired } from "../utils/utils";

import {
  expirePaidDateDuration,
  ticketState,
} from "../context/constant";
import Timer from "../components/Timer";

export function ParkingBox({
  parkingSpace,
}: {
  parkingSpace: ParkingSpace;
}): JSX.Element {

  const { park, leave, setSelectedParkingSpace, updateTicket } =
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

  const parkingSpacePriceModal = () => {
    setSelectedParkingSpace(parkingSpace as ParkingSpaceWithTicket);
  };

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
