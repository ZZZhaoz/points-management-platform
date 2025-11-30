const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  validatePromotions,
  getValidAutomaticPromotions,
  applyPromotions,
  markPromotionsAsUsed
} = require("../helpers/promotionHelper");
const e = require("express");

class TransactionService {

  async createPurchase (req) {
    const { utorid, type, spent, promotionIds = [], remark = "" } = req.body;
    const creatorId = req.user.id;
    const suspiciousCreator = req.user.suspicious;
    let amount = Math.round(spent / 0.25);

    const customer = await prisma.user.findUnique({
      where: { utorid }
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const { valid, promotions, error } = await validatePromotions(promotionIds, customer.id);
    if (!valid) {
      throw new Error(error || "Invalid promotions");
    }
    amount += applyPromotions(spent, promotions);

    const validAutomaticPromotions = await getValidAutomaticPromotions(spent);
    amount += applyPromotions(spent, validAutomaticPromotions);

    const earnedAmount = suspiciousCreator ? 0 : amount;

    if (!suspiciousCreator) {
      await prisma.user.update({
        where: { utorid },
        data: { points: { increment: amount } }
      });
    }
    const transactionData = {
      userId: customer.id,
      type,
      spent,
      amount,
      remark,
      createdById: creatorId,
      suspicious: suspiciousCreator,
      promotionIds: promotionIds.length > 0 ? {
        connect: promotionIds.map(id => ({ id }))  
      } : undefined
    };

    const transaction = await prisma.transaction.create({ data: transactionData });

    await markPromotionsAsUsed(customer.id, promotionIds);

    return {
      id: transaction.id,
      utorid,
      type,
      spent,
      earned: earnedAmount,
      remark,
      promotionIds,
      createdBy: req.user.utorid
    };
  }

  async createAdjustment (req) {
    const { utorid, type, amount, relatedId, promotionIds = [], remark = "" } = req.body;

    const customer = await prisma.user.findUnique({
      where: { utorid }
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const relatedTx = await prisma.transaction.findUnique({
      where: { id: relatedId },
      include: { user: true },
    });

    if (!relatedTx) {
      throw new Error("Not Found");
    }

    await prisma.user.update({
      where: { utorid },
      data: { points: { increment: amount } }
    });
      
    const transactionData = {
      userId: customer.id,
      type,
      amount,
      relatedId,
      remark,
      createdById: req.user.id,
      promotionIds: promotionIds.length > 0 ? {
        connect: promotionIds.map(id => ({ id }))
      } : undefined
    };

    const transaction = await prisma.transaction.create({ data: transactionData });

    if (promotionIds.length > 0) {
      await markPromotionsAsUsed(customer.id, promotionIds);
    }

    return {
      id: transaction.id,
      utorid,
      type,
      amount,
      relatedId,
      remark,
      promotionIds,
      createdBy: req.user.utorid
    };
  }

  async getAllTransactions(params) {
    const { name, createdBy, suspicious, promotionId, type, relatedId, amount, operator, page, limit } = params;

    const filters = {};

    if (name) {
      filters.OR = [
        { user: { utorid: { contains: name } } },
        { user: { name: { contains: name } } }
      ];
    }

    if (createdBy) {
      filters.createdBy = { utorid: createdBy };
    }

    if (suspicious !== undefined) {
      filters.suspicious = suspicious;
    }

    if (promotionId) {
      filters.promotionIds = { some: { id: promotionId } };
    }

    if (type) {
      filters.type = type;
    }

    if (relatedId) {
      filters.relatedId = relatedId;
    }

    if (amount && operator) {
      const op = operator === "gte" ? "gte" : "lte";
      filters.amount = { [op]: amount };
    }

    const skip = (page - 1) * limit;

    const [count, results] = await prisma.$transaction([
      prisma.transaction.count({ where: filters }),
      prisma.transaction.findMany({
        where: filters,
        skip,
        take: limit,
        include: {
          user: { select: { utorid: true } },
          promotionIds: { select: { id: true } },
          createdBy: { select: { utorid: true } }
        },
        orderBy: { id: "asc" }
      })
    ]);

    const formatted = results.map(t => ({
      id: t.id,
      utorid: t.user.utorid,
      amount: t.amount,
      type: t.type,
      spent: t.spent ?? undefined,
      relatedId: t.relatedId ?? undefined,
      promotionIds: t.promotionIds.map(p => p.id),
      suspicious: t.suspicious,
      remark: t.remark,
      createdBy: t.createdBy.utorid 
    }));

    return { count, results: formatted };
  }

  async getTransactionById(transactionId) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(transactionId) },
      include: {
        user: { select: { utorid: true } },
        promotionIds: { select: { id: true } },
        createdBy: { select: { utorid: true } }
        },
    });

    if (!transaction) return null;

    return {
      id: transaction.id,
      utorid: transaction.user.utorid,
      type: transaction.type,
      spent: transaction.spent ?? undefined,
      amount: transaction.amount,
      relatedId: transaction.relatedId ?? null,
      promotionIds: transaction.promotionIds.map(p => p.id),
      suspicious: transaction.suspicious,
      remark: transaction.remark,
      createdBy: transaction.createdBy.utorid,
    };
  }

  async setSuspicious(transactionId, suspicious) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(transactionId) },
      include: { user: true }
    });

    if (!transaction) return null;

    if (transaction.suspicious === suspicious) {
      return transaction;
    }

    const amount = transaction.amount || 0;

    if (suspicious) {
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { points: { decrement: amount } }
      });
    } else {
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { points: { increment: amount } }
      });
    }
    
    const updatedTransaction = await prisma.transaction.update({
      where: { id: Number(transactionId) },
        data: { suspicious },
        include: {
          user: true,         
          createdBy: true,   
          promotionIds: true, 
        },
      });

    return {
      id: updatedTransaction.id,
      utorid: updatedTransaction.user.utorid,
      type: updatedTransaction.type,
      spent: updatedTransaction.spent ?? null,
      amount: updatedTransaction.amount,
      promotionIds: updatedTransaction.promotionIds.map(p => p.id),
      suspicious: updatedTransaction.suspicious,
      remark: updatedTransaction.remark,
      createdBy: updatedTransaction.createdBy.utorid,
    };
  }

  async createTransferTransaction(sender, recipientId, amount, remark) {
    if (!amount || amount <= 0) {
      throw new Error("Bad Request");
    }

    const senderUser = await prisma.user.findUnique({
      where: { id: sender.id }
    });

    if (!senderUser) {
      throw new Error("Not Found");
    }

    if (!senderUser.verified) {
      throw new Error("Forbidden");
    }

    if (senderUser.points < amount) {
      throw new Error("Bad Request");
    }

    const recipientUser = await prisma.user.findUnique({
      where: { id: Number(recipientId) },
    });

    if (!recipientUser) {
      throw new Error("Not Found");
    }

    await prisma.user.update({
      where: { id: senderUser.id },
      data: { points: { decrement: amount } },
    });

    await prisma.user.update({
      where: { id: recipientUser.id },
      data: { points: { increment: amount } },
    });

    const sendTransaction = await prisma.transaction.create({
      data: {
        userId: senderUser.id,
        type: "transfer",
        amount: -amount,
        remark,
        relatedId: recipientUser.id,
        createdById: senderUser.id
      },
    });

    await prisma.transaction.create({
      data: {
        userId: recipientUser.id,
        type: "transfer",
        amount: amount,
        remark,
        relatedId: senderUser.id,
        createdById: senderUser.id
      },
    });

    const formatted = {
        id: sendTransaction.id,
        sender: senderUser.utorid,
        recipient: recipientUser.utorid,
        type: "transfer",
        sent: amount,
        remark,
        createdBy: senderUser.utorid
      };
    return formatted;
  }

  async createRedemptionTransaction(user, amount, remark) {
    const dbUser = await prisma.user.findUnique({
      where: { id: Number(user.id) },
      select: { id: true, utorid: true, verified: true, points: true },
    });

    if (!dbUser) throw new Error("Not Found");
        if (!dbUser.verified) {
        throw new Error("Forbidden");
    }

    if (dbUser.points < amount) {
      throw new Error("Bad Request");
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: dbUser.id,
        type: "redemption",
        amount,
        remark: remark || "",
        processedById: null,
        createdById: dbUser.id
      }
    });

    return {
      id: transaction.id,
      utorid: dbUser.utorid,
      type: "redemption",
      processedBy: null,
      amount: transaction.amount,
      remark: transaction.remark,
      createdBy: dbUser.utorid
    };
  }

  async getUserTransactions(userId, params) {
    const { 
      type,
      relatedId,
      promotionId,
      promotionName,
      remark,
      amount,
      operator,
      page,
      limit
    } = params;

    const filters = { userId };

    if (type) filters.type = type;

    if (relatedId && type) {
      filters.relatedId = Number(relatedId);
    }

    if (promotionId) {
      filters.promotionIds = {
        some: { id: Number(promotionId) }
      };
    }

    if (promotionName && promotionName.trim() !== "") {
      filters.promotionIds = {
        some: {
          name: { contains: promotionName.trim() }
        }
      };
    }

    if (remark && remark.trim() !== "") {
      filters.remark = {
        contains: remark.trim()
      };
    }

    if (operator && amount !== undefined && amount !== null && amount !== "") {
      const op = operator === "gte" ? "gte" : "lte";
      filters.amount = { [op]: Number(amount) };
    }

    const skip = (page - 1) * limit;

    const [count, results] = await prisma.$transaction([
      prisma.transaction.count({ where: filters }),

      prisma.transaction.findMany({
        where: filters,
        skip,
        take: limit,
        include: {
          createdBy: { select: { utorid: true } },
          processedBy: { select: { utorid: true } },
          promotionIds: { select: { id: true, name: true } }
        },
        orderBy: { id: "asc" }
      })
    ]);

    const formatted = await Promise.all(
      results.map(async (t) => {
        let relatedUtorid = null;

        if (t.type === "transfer" && t.relatedId) {
          const otherUser = await prisma.user.findUnique({
            where: { id: t.relatedId },
            select: { utorid: true }
          });
          relatedUtorid = otherUser ? otherUser.utorid : null;
        }

        return {
          id: t.id,
          amount: t.amount,
          type: t.type,
          processed: t.processed,
          processedBy: t.processedBy ?? null,
          spent: t.spent ?? undefined,
          relatedId: t.relatedId ?? undefined,
          relatedUtorid,
          promotionIds: t.promotionIds.map((p) => p.id),
          promotionNames: t.promotionIds.map((p) => p.name),
          remark: t.remark,
          createdBy: t.createdBy.utorid
        };
      })
    );

    return { count, results: formatted };
  }


  async processRedemption(transactionId, processorId) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        createdBy: { select: { utorid: true } },
        user: { select: { utorid: true, id: true, points: true } },
      },
    });

    if (!transaction) {
      throw new Error("Not Found");
    }

    if (transaction.type !== "redemption") {
      throw new Error("Bad Request");
    }

    if (transaction.processed) {
      throw new Error("Bad Request");
    }

    const amount = transaction.amount;
    const user = transaction.user;

    if (user.points < amount) {
      throw new Error("Bad Request");
    }

    const cashier = await prisma.user.findUnique({
      where: { id: processorId },
      select: { utorid: true },
    });

    if (!cashier) {
      throw new Error("Bad Request");
    }

    await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { points: { decrement: amount } },
    }),

    prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          processedById: processorId,
          processed: true,
        },
      }),
    ]);

    return {
      id: transaction.id,
      utorid: user.utorid,
      type: transaction.type,
      processedBy: cashier.utorid,
      redeemed: amount,
      remark: transaction.remark,
      createdBy: transaction.createdBy.utorid
    };
  }
}

module.exports = new TransactionService();