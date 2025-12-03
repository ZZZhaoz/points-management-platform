const VALID_TRANSACTION_TYPES = [
  "purchase",
  "redemption",
  "adjustment",
  "event",
  "transfer",
];

const VALID_OPERATORS = ["gte", "lte"];

const transactionService = require("../services/transactionService");

async function createTransaction(req, res) {
  const { type } = req.body;

  try {
    if (type && !VALID_TRANSACTION_TYPES.includes(type)) {
      return res.status(400).json({ error: `Bad Request` });
    }

    if (type === "purchase") {
      const { spent } = req.body;
      if (spent == null || spent <= 0) {
        return res.status(400).json({ error: `Bad Request` });
      }
      const transaction = await transactionService.createPurchase(req);
      return res.status(201).json(transaction);
    }

    if (type === "adjustment") {
      const { amount, relatedId } = req.body;
      if (amount == null || relatedId == null) {
        return res.status(400).json({ error: `Bad Request` });
      }
      
      const role = req.user.role;
      if (!["manager", "superuser"].includes(role)) {
        return res.status(403).json({ error: `Forbidden` });
      }

      const transaction = await transactionService.createAdjustment(req);
      return res.status(201).json(transaction);
    }

    return res.status(400).json({ error: `Bad Request` });

    } catch (err) {
      console.error(err);
      if (err.message === "Not Found") {
        return res.status(404).json({ error: "Not Found" });
      }

      if (err.message === "Customer not found") {
        return res.status(404).json({ error: "Not Found" });
      }

      if (err.message === "Invalid promotions" || err.message === "Bad Request") {
        return res.status(400).json({ error: "Bad Request" });
      }

      return res.status(500).json({ error: `Internal server error` });
    }
}


async function getTransactions(req, res) {
  try {
    const {
      type,
      relatedId,
      amount,
      operator,
      page = 1,
      limit = 10,
      ...filters
    } = req.query;
  
  if (type && !VALID_TRANSACTION_TYPES.includes(type)) {
    return res.status(400).json({ error: `Bad Request` });
  }

  if (relatedId && !type) {
    return res.status(400).json({ error: `Bad Request` });
  }

  if (operator && !amount) {
      return res.status(400).json({ error: `Bad Request` });
  }

  if (operator && !VALID_OPERATORS.includes(operator)) {
    return res.status(400).json({ error: `Bad Request` });
  }
  
  if (page <= 0 || limit <= 0) {
      return res.status(400).json({ error: `Bad Request` });
  }

  const transactions = await transactionService.getAllTransactions({
      type,
      relatedId,
      amount,
      operator,
      page,
      limit,
      ...filters
  });

  return res.status(200).json(transactions);
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Internal server error` });
  }   
}

async function getTransactionById(req, res) {
  try {
    const transactionId = parseInt(req.params.transactionId, 10);

    if (isNaN(transactionId)) {
      return res.status(400).json({ error: `Bad Request` });
    }

    const transaction = await transactionService.getTransactionById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: `Not Found` });
    }

    return res.status(200).json(transaction);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Internal server error` });
  }
}

async function setSuspicious(req, res) {
  try {
    const transactionId = parseInt(req.params.transactionId, 10);
    const { suspicious } = req.body;

    if (isNaN(transactionId)) {
      return res.status(400).json({ error: `Bad Request` });
    }

    const updatedTransaction = await transactionService.setSuspicious(
      transactionId, 
      suspicious);

    if (!updatedTransaction) {
      return res.status(404).json({ error: "Not Found" });
    }

    return res.status(200).json(updatedTransaction);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Internal server error` });
  }
}

async function createTransferTransaction(req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const {type, amount, remark} = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: `Bad Request` });
    }

    if (type !== "transfer" || amount <= 0 || !Number.isInteger(amount)) {
      return res.status(400).json({ error: `Bad Request` });
    }

    const transaction = await transactionService.createTransferTransaction(
      req.user,
      userId,
      amount,
      remark
    );

    return res.status(201).json(transaction);

  } catch (err) {
    console.error(err);
    if (err.message === "Bad Request") {
      return res.status(400).json({ error: `Bad Request` });
    }

    if (err.message === "Not Found") {
      return res.status(404).json({ error: `Not Found` });
    }

    if (err.message === "Forbidden") {
      return res.status(403).json({ error: `Forbidden` });
    }

    return res.status(500).json({ error: `Internal server error` });
  }
}

async function createRedemptionTransaction(req, res) {
  try {
    const user = req.user;
    const { type, amount, remark = "" } = req.body;

    if (type !== "redemption" || amount <= 0) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const transaction = await transactionService.createRedemptionTransaction(
      user,
      amount,
      remark
    );

    return res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    if (err.message === "Not Found") {
      return res.status(404).json({ error: `Not Found` });
    }

    if (err.message === "Bad Request") {
      return res.status(400).json({ error: `Bad Request` });
    }

    if (err.message === "Forbidden") {
      return res.status(403).json({ error: `Forbidden` });
    }

    return res.status(500).json({ error: `Internal server error` });
  }
}

async function getUserTransactions(req, res) {
  try {
    const {
      type,
      relatedId,
      amount,
      operator,
      promotionId,
      promotionName,
      remark,
      page = 1,
      limit = 10
    } = req.query;

    if (type && !VALID_TRANSACTION_TYPES.includes(type)) {
      return res.status(400).json({ error: "Bad Request" });
    }

    if (relatedId && type !== "transfer") {
      return res.status(400).json({ error: "Bad Request" });
    }

    if (operator && (amount == null || amount === "")) {
      return res.status(400).json({ error: "Bad Request" });
    }

    if (operator && !VALID_OPERATORS.includes(operator)) {
      return res.status(400).json({ error: "Bad Request" });
    }

    if (page <= 0 || limit <= 0) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const transactions = await transactionService.getUserTransactions(
      req.user.id,
      {
        type, 
        relatedId,
        amount,
        operator,
        promotionId,
        promotionName,
        remark,
        page,
        limit
      }
    );

    return res.status(200).json(transactions);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


async function processRedemption(req, res) {
  try {
    const transactionId = parseInt(req.params.transactionId, 10);
    const { processed } = req.body;

    // --- Validate input (400) ---
    if (isNaN(transactionId)) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }

    if (processed !== true) {
      return res.status(400).json({ error: "Processed flag must be true" });
    }

    const result = await transactionService.processRedemption(
      transactionId,
      req.user.id
    );

    return res.status(200).json(result);

  } catch (err) {
    const msg = err.message;

    if (msg === "Transaction not found") {
      return res.status(404).json({ error: msg });
    }

    if ([
      "This transaction is not a redemption request",
      "This redemption request has already been processed",
      "User does not have enough points for redemption",
      "Processor (cashier) does not exist",
    ].includes(msg)) {
      return res.status(400).json({ error: msg });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}



module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  setSuspicious,
  processRedemption,
  createTransferTransaction,
  createRedemptionTransaction,
  getUserTransactions
};