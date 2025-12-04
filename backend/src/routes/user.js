const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");
const transactionController = require("../controllers/transactionControllers");
const eventsController = require("../controllers/eventControllers");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { validateFields, validateQuery } = require("../middleware/validate");
const upload = require("../middleware/upload");




router.post('/',
    validateFields(['utorid', 'name', 'email'], ['utorid', 'name', 'email'],
        { utorid: "string", name: "string", email: "string" }),
    authenticateToken,
    requireRole(["cashier", "manager", "superuser"]),
    userControllers.createUser);


router.get('/',
    validateQuery(['name', 'role', 'verified', 'activated', 'page', 'limit'],
        [], {
            name: 'string', role: 'string', verified: 'boolean',
        activated: 'boolean', page: 'number', limit: 'number'
    }),
    authenticateToken,
    requireRole(["manager", "superuser"]),
    userControllers.getAllUsers);
    

router.get('/me', authenticateToken, userControllers.getCurrentUser);


router.patch(
    "/me",
    authenticateToken,
    upload.single("avatar"), 
    validateFields(["name", "email", "birthday",  null, "null"], [], {
      name: "string",
      email: "string",
    }),
    userControllers.updateInfo
);


router.patch(
  "/me/password",
  authenticateToken,
  validateFields(["old", "new"], ["old", "new"], {
    old: "string",
    new: "string",
  }),
  userControllers.updatePassword
);

router.get('/:userId', 
    validateQuery([],
    [], {}),
    authenticateToken, 
    requireRole(["cashier", "manager", "superuser"]),
    userControllers.getUser);


router.patch('/:userId',
    authenticateToken, 
    requireRole(["manager", "superuser"]),
    validateFields(['email', 'verified', 'suspicious', 'role'],
    [], {
        email: 'string',
        verified: 'boolean',
        suspicious: 'boolean',
        role: 'string',
    }),
   
    userControllers.updateUser);

router.post(
  "/me/transactions",
  authenticateToken,
  requireRole(["regular", "cashier", "manager", "superuser"]),
  validateFields(
    ["type", "amount", "remark"], // allowed fields
    ["type", "amount"],           // required fields
    {
      type: "string",
      amount: "number",
      remark: "string",
    }
  ),
  transactionController.createRedemptionTransaction
);

router.post(
  "/:userId/transactions",
  authenticateToken,
  requireRole(["regular", "cashier", "manager", "superuser"]),
  validateFields(
    ["type", "amount", "remark"], // allowed fields
    ["type", "amount"],           // required fields
    { 
      type: "string",
      amount: "number",
      remark: "string"
    }
  ),
  transactionController.createTransferTransaction
);

router.get(
  "/me/transactions",
  authenticateToken,
  requireRole(["regular", "cashier", "manager", "superuser"]),
  validateQuery(
    // allowed fields
    [
      "type",
      "relatedId",
      "promotionId",
      "promotionName",
      "amount",
      "operator",
      "remark",
      "from",
      "to",
      "page",
      "limit"
    ],
    // required fields (none for this endpoint)
    [],
    // type rules
    {
      type: "string",
      relatedId: "number",
      promotionId: "number",
      promotionName: "string",
      amount: "number",
      operator: "string",
      from: "string",
      to: "string",
      remark: "string",
      page: "number",
      limit: "number"
    }
  ),
  transactionController.getUserTransactions
);

router.get("/me/events", authenticateToken, eventsController.getMyEvents);

router.get(
    '/lookup/:utorid',
    authenticateToken, 
    requireRole(["regular", "cashier", "manager", "superuser"]), 
    userControllers.lookupByUtorid
);


router.all("*", (req, res) => {
  res.set("Allow", "GET, POST, PATCH");
  res.status(405).json({ error: "Method Not Allowed" });
});

module.exports = router;