import * as React from "react";
import styled from "styled-components";
import { useParkingDispatch } from "../context/parkingContext";
import { ParkingSpaceWithTicket, PaymentMethod } from "../context/types";
import { formattedDate } from "../utils/utils";
import { paymentMethods, ticketState } from "../context/constant";
import { calculatePriceByParkingSpace } from "../services/parking";

export const TicketPayment = ({
  closeModal,
  parkingSpace,
}: {
  closeModal: () => void;
  parkingSpace: ParkingSpaceWithTicket;
}) => {
  const dispatch = useParkingDispatch();

  const price =
    calculatePriceByParkingSpace(parkingSpace) - parkingSpace.ticket.paid;
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState<PaymentMethod | null>(null);

  const payNow = () => {
    try {
      dispatch({
        type: "update",
        parkingSpace: {
          ...parkingSpace,
          ticket: {
            ...parkingSpace.ticket,
            paymentMethod: selectedPaymentMethod,
            paymentDate: Date.now(),
            state: ticketState.paid,
            paid: price + parkingSpace.ticket.paid,
          },
        },
      });

      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <PaymentContainer>
      <div className="bold-text">Total price:</div>
      <div className="price">
        €{price}
        <div className="subtitle">€2 per started hour</div>
        {parkingSpace && parkingSpace.ticket.paid > 0 && (
          <div className="subtitle">
            You have paid €{parkingSpace.ticket.paid} on{" "}
            {formattedDate(new Date(parkingSpace.ticket.enterDate))}
          </div>
        )}
      </div>
      <div>How do you want to pay?</div>
      <PaymentMethodItem>
        {paymentMethods.map((paymentMethod) => {
          return (
            <div
              className={
                selectedPaymentMethod === paymentMethod
                  ? "payment-method active"
                  : "payment-method"
              }
              key={paymentMethod}
              onClick={() => setSelectedPaymentMethod(paymentMethod)}
            >
              {paymentMethod}
            </div>
          );
        })}
      </PaymentMethodItem>

      <button
        onClick={payNow}
        className="pay-button"
        aria-label="Pay Now"
        type="button"
        disabled={!selectedPaymentMethod}
      >
        Pay Now
      </button>
    </PaymentContainer>
  );
};

const PaymentContainer = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;

  & .price {
    font-size: 45px;
    cursor: pointer;
  }
  & .subtitle {
    font-size: 12px;
    color: var(--box-border);
  }

  & .pay-button {
    background: #4caf50;
    border: 1px solid var(--box-border);
    padding: 5px 15px;
    cursor: pointer;
  }
`;
const PaymentMethodItem = styled.div`
  display: flex;
  gap: 20px;
  & .payment-method {
    padding: 7px 15px;
    background: #f1f1f1;
    border: 1px solid var(--box-border);
    cursor: pointer;
    &.active {
      background: #ffeb3b;
    }
  }
`;
