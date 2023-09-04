import * as React from "react";
import styled from "styled-components";
import { useParkingDispatch } from "../context/parkingContext";
import {
  ParkingSpace,
  ParkingSpaceWithPaidTicket,
  ParkingSpaceWithTicket,
} from "../context/types";

import { expirePaidDateDuration, ticketState } from "../context/constant";
import Timer from "../components/Timer";
import {
  calculatePriceByParkingSpace,
  createNewTicket,
  updateTicketState,
} from "../services/parking";
import { ModalComponent } from "../components/Modal";
import { PaymentReceipt } from "./PaymentReceipt";
import { TicketPayment } from "./TicketPayment";

export function ParkingBox({
  parkingSpace,
}: {
  parkingSpace: ParkingSpace;
}): JSX.Element {
  const dispatch = useParkingDispatch();
  const { spaceNumber, ticket } = parkingSpace;

  const [visibleModal, setVisibleModal] = React.useState<boolean>(false);

  const togglePlace = () => {
    try {
      const newTicket = ticket ? null : createNewTicket();
      dispatch({
        type: "update",
        parkingSpace: {
          spaceNumber,
          ticket: newTicket,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onExireTimer = () => {
    try {
      dispatch({
        type: "update",
        parkingSpace: updateTicketState(
          parkingSpace as ParkingSpaceWithPaidTicket
        ),
      });
      // return res.ticket.state;
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

  const onParkingSpaceStateClick = () => {
    const ps = parkingSpace as ParkingSpaceWithTicket;
    const price = calculatePriceByParkingSpace(ps) - ps.ticket.paid;
    if (price === 0 && ps.ticket.state === ticketState.unpaid) {
      parkingSpace = {
        ...ps,
        ticket: {
          ...ps.ticket,
          paymentDate: Date.now(),
          state: ticketState.paid,
        },
      };
      try {
        dispatch({
          type: "update",
          parkingSpace,
        });
      } catch (error) {
        console.log(error);
      }
    }

    setVisibleModal(true);
  };

  const closeModal = () => {
    setVisibleModal(false);
  };
  return (
    <ParkingBoxContainer className={ticket ? "occupied" : "free"}>
      {visibleModal && (
        <ModalComponent
          closeModal={closeModal}
        >
          {parkingSpace.ticket?.state === ticketState.paid ? (
            <PaymentReceipt
              parkingSpace={parkingSpace as ParkingSpaceWithPaidTicket}
            />
          ) : (
            <TicketPayment
              parkingSpace={parkingSpace as ParkingSpaceWithTicket}
              closeModal={closeModal}
            />
          )}
        </ModalComponent>
      )}

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
            timerExpired={onExireTimer}
          />
        </ParkingBoxContent>
      )}

      {ticket && (
        <ParkingBoxContent
          className={"price " + ticket?.state}
          onClick={onParkingSpaceStateClick}
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
