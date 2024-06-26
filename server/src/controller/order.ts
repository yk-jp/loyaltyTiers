import express from "express";

import { db } from "../config/config";
import { CompleteOrderDto } from "dtos/Order.dto";
import { GetCustomerOrderParams } from "types/queryParams";
import { OrderListResponse, SaveOrderResponse } from "types/response";

/**
 * circle back here to extend this api for pagination if there's time left.
 */
export const getCustomerOrder = async (
  req: express.Request<GetCustomerOrderParams, {}, {}, {}>, // type annotatation for request params
  res: express.Response<OrderListResponse>
) => {
  const params: GetCustomerOrderParams = req.params;
  const customerId: number = params.customerId;

  try {
    // don't join here as the data here is not expected to be big and it makes it easier to handle data operations when orders data doesn't exist.
    const customerData = await db.query(
      "SELECT id, name FROM customers WHERE id = $1",
      [customerId]
    );
    const ordersData = await db.query(
      "SELECT id, total_cents, ordered_at " +
        "FROM orders " +
        "WHERE customer_id = $1 AND ordered_at >= DATE_TRUNC('year', CURRENT_DATE) - INTERVAL '1 year'",
      [customerId]
    );
    // validation and response annotation if there's time left.
    const customer = customerData.rows[0];

    res.status(200).json({
      message: "OK",
      customer: customer,
      orders: ordersData.rows,
      total: ordersData.rows.length,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const saveOrder = async (
  req: express.Request<{}, {}, CompleteOrderDto>, // type annotate request body
  res: express.Response<SaveOrderResponse>
) => {
  const orderDetails: CompleteOrderDto = req.body;
  try {
    await db.query("BEGIN");
    await db.query(
      "INSERT INTO orders (id, customer_id, total_cents, ordered_at) " +
        "VALUES($1, $2, $3, $4)",
      [
        orderDetails.orderId,
        orderDetails.customerId,
        orderDetails.totalInCents,
        orderDetails.date,
      ]
    );

    // update customer info
    await db.query(
      "UPDATE customers " +
        "SET total_expense_tier = total_expense_tier + $1, " +
        "tier_id = CASE " +
        "WHEN total_expense_tier + $1 >= 500 THEN (SELECT id FROM tiers WHERE name = 'Gold') " +
        "WHEN total_expense_tier + $1 >= 100 THEN (SELECT id FROM tiers WHERE name = 'Silver') " +
        "ELSE (SELECT id FROM tiers WHERE name = 'Bronze') " +
        "END " +
        "WHERE id = $2 ",
      [orderDetails.totalInCents, orderDetails.customerId]
    );

    await db.query("COMMIT");
    res.status(200).json({ message: "Your order was successfully received." });
  } catch (e) {
    await db.query("ROLLBACK");
    res.status(500).json({ message: e.message });
  }
};
