import React from "react";

import "./OrderListTable.css";
import { Order } from "../../models/Order";

type OrderListTableProps = {
  orders: Order[];
};

export default function OrderListTable({ orders }: OrderListTableProps) {
  return (
    <div className="container">
      <table>
        <thead className="bg-coral">
          <tr>
            <th>Order ID</th>
            <th>Expense</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.total_cents}</td>
              <td>{String(order.ordered_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
