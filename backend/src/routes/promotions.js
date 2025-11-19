const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionControllers");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { validateFields, validateQuery } = require("../middleware/validate");

router.post(
  "/",
  authenticateToken,
  requireRole(["manager", "superuser"]),
  validateFields(
    // allowed fields
    [
      "name",
      "description",
      "type",
      "startTime",
      "endTime",
      "minSpending",
      "rate",
      "points"
    ],
    // required fields
    ["name", "description", "type", "startTime", "endTime"],
    // type rules
    {
      name: "string",
      description: "string",
      type: "string",
      startTime: "string",
      endTime: "string",
      minSpending: "number",
      rate: "number",
      points: "number"
    }
  ),
  promotionController.createPromotion
);

router.get(
  "/",
  authenticateToken,
  requireRole(["regular", "cashier", "manager", "superuser"]),
  validateQuery(
    // allowed fields
    [
      "name",
      "type",
      "started",
      "ended",
      "page",
      "limit"
    ],
    // required fields
    [],
    // type rules
    {
      name: "string",
      type: "string",
      started: "boolean",
      ended: "boolean",
      page: "number",
      limit: "number"
    }
  ),
  promotionController.getPromotions
);

router.get("/:promotionId", 
  authenticateToken,
  requireRole(["regular", "cashier", "manager", "superuser"]),
  promotionController.getPromotion
)

router.patch("/:promotionId",
  authenticateToken,
  requireRole(["manager", "superuser"]),
  validateFields([
    "name",
    "description",
    "type",
    "startTime",
    "endTime",
    "minSpending",
    "rate",
    "points"
  ],
  [],
  {
    name: "string",
    description: "string",
    type: "string",
    startTime: "string",
    endTime: "string",
    minSpending: "number",
    rate: "number",
    points: "number"
  }
),
promotionController.updatePromotion
)

router.delete("/:promotionId",
  authenticateToken,
  requireRole(["manager", "superuser"]),
  promotionController.deletePromotion
)


module.exports = router;