import * as React from "react";
import styled from "styled-components";
import { useParking } from "../context/parkingContext";
import {
  ParkingSpaceWithTicket,
  PaymentMethod,
  paymentMethods,
} from "../context/types";
import { calculatePriceByParkingSpace } from "../services/parking";

export function ParkingSpacePrice() {
  const { ticketPayment, selectedParkingSpace, setSelectedParkingSpace } = useParking();
  const closeModal = () => setSelectedParkingSpace(null);

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState<PaymentMethod | null>(null);

  const payNow = async () => {
    try {
      await ticketPayment(
        selectedParkingSpace as ParkingSpaceWithTicket,
        selectedPaymentMethod as PaymentMethod
      );

      closeModal();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ParkingSpacePriceModal onClick={closeModal}>
      <ParkingSpacePriceContainer
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          onClick={closeModal}
          className="close-button"
          aria-label="Close Modal"
          type="button"
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <div>Total price:</div>
        <div className="price">
        €{calculatePriceByParkingSpace(selectedParkingSpace as ParkingSpaceWithTicket)}
          <div className="subtitle">€2 per started hour</div>
        </div>
        <div>How do you want to pay?</div>
        <PaymentMethod>
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
        </PaymentMethod>

        <button
          onClick={payNow}
          className="pay-button"
          aria-label="Pay Now"
          type="button"
          disabled={!selectedPaymentMethod}
        >
          Pay Now
        </button>
      </ParkingSpacePriceContainer>
    </ParkingSpacePriceModal>
  );
}

const ParkingSpacePriceModal = styled.div`
  width: 100%;
  height: 100%;
  background: rgb(166 166 166 / 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 99;
`;

const PaymentMethod = styled.div`
  display: flex;
  gap: 20px;
  & .payment-method {
    padding: 7px 15px;
    background: #f1f1f1;
    border: 1px solid #676767;
    cursor: pointer;
    &.active {
      background: #ffeb3b;
    }
  }
`;

const ParkingSpacePriceContainer = styled.div`
  width: 450px;
  height: 300px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-direction: column;
  border: 1px dashed #676767;
  position: relative;
  & .price {
    font-size: 45px;
    text-align: center;
  }
  & .subtitle {
    font-size: 12px;
    color: #676767;
  }

  & .close-button {
    background: transparent;
    border: none;
    font-size: 35px;
    position: absolute;
    left: 0;
    top: 0;
    color: #676767;
    cursor: pointer;
    &:hover {
      color: #000;
    }
  }

  & .pay-button {
    background: #4caf50;
    border: 1px solid #676767;
    padding: 5px 15px;
  }
`;
