const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionControllers");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { validateFields, validateQuery } = require("../middleware/validate");

router.post(
  "/",
  authenticateToken,
  requireRole(["cashier", "manager", "superuser"]),
  validateFields(
    // allowed fields 
    [
      "utorid",
      "type",
      "spent",
      "amount",
      "relatedId",
      "promotionIds",
      "remark"
    ],
    // required fields 
    ["utorid", "type"],
    // type rules
    {
      utorid: "string",
      type: "string",
      spent: "number",
      amount: "number",
      relatedId: "number",
      promotionIds: "array",
      remark: "string"
    }
  ),
  transactionController.createTransaction
);

router.get(
  "/",
  authenticateToken,
  requireRole(["manager", "superuser"]),
  validateQuery(
    // allowed fields 
    [
      "name",
      "createdBy",
      "suspicious",
      "promotionId",
      "type",
      "relatedId",
      "id",
      "amount",
      "operator",
      "page",
      "limit"
    ],
    // required fields
    [],
    // type rules
    {
      name: "string",
      createdBy: "string",
      suspicious: "boolean",
      promotionId: "number",
      type: "string",
      relatedId: "number",
      id: "number",
      amount: "number",
      operator: "string",
      page: "number",
      limit: "number"
    }
  ),
  transactionController.getTransactions
);


router.get(
  "/:transactionId",
  authenticateToken,
  requireRole(["manager", "superuser"]),
  transactionController.getTransactionById
);

router.patch(
  "/:transactionId/suspicious",
  authenticateToken,
  requireRole(["manager", "superuser"]),
  validateFields(
    // allowed fields 
    ["suspicious"],
    // required fields
    ["suspicious"],
    // type rules
    {
      suspicious: "boolean"
    }
  ),
  transactionController.setSuspicious
);

router.patch(
  "/:transactionId/processed",
  authenticateToken,
  requireRole(["cashier", "manager", "superuser"]),
   validateFields(
    ["processed"],   // allowed fields
    ["processed"],   // required fields
    { processed: "boolean" } // type rules
  ),
  transactionController.processRedemption
);

module.exports = router;
