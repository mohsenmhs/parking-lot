import * as React from "react";
import styled from "styled-components";
import { ParkingSpaceWithPaidTicket } from "../context/types";
import { formattedDate } from "../utils/utils";

export const PaymentReceipt = ({
  parkingSpace,
}: {
  parkingSpace: ParkingSpaceWithPaidTicket;
}) => {
  return (
    <PaymentReceiptContainer>
      <div className="bold-text">Payment Receipt</div>

      <div>
        <div className="receipt-item">
          <div>Barcode:</div>
          <div>{parkingSpace.ticket.barcode}</div>
        </div>

        <div className="receipt-item">
          <div>Enter Date:</div>
          <div>{formattedDate(new Date(parkingSpace.ticket.enterDate))}</div>
        </div>

        <div className="receipt-item">
          <div>Payment Date:</div>
          <div>{formattedDate(new Date(parkingSpace.ticket.paymentDate))}</div>
        </div>

        <div className="receipt-item">
          <div>Last Payment Method:</div>
          <div>{parkingSpace.ticket.paymentMethod}</div>
        </div>
      </div>

      <div>
        <div className="receipt-item bold-text">
          <div>Paid:</div>
          <div>€{parkingSpace.ticket.paid}</div>
        </div>
      </div>

      <div className="bold-text">THANK YOU AND LUCKY ROAD!</div>
    </PaymentReceiptContainer>
  );
};

const PaymentReceiptContainer = styled.div`
  width: 250px;
  border: 1px dashed var(--box-border);
  padding: 10px;
  font-family: monospace;
  gap: 30px;
  display: flex;
  flex-direction: column;
  & .receipt-item {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }
`;
