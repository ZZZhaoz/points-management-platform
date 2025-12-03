const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function validatePromotions(promotionIds, userId) {
  if (!promotionIds || promotionIds.length === 0) {
    return { valid: true, promotions: [] };
  }

  if (promotionIds.length !== new Set(promotionIds).size) {
    return { valid: false, error: "Duplicate promotion IDs are not allowed" };
  }

  const promotions = await prisma.promotion.findMany({
    where: { id: { in: promotionIds } },
    include: { users: { select: { id: true } } },
  });

  const foundIds = new Set(promotions.map(p => p.id));
  for (const id of promotionIds) {
    if (!foundIds.has(id)) {
      return { valid: false, error: `Promotion ID ${id} does not exist` };
    }
  }

  const now = new Date();

  for (const promo of promotions) {

    if (now < promo.startTime || now > promo.endTime) {
      return { valid: false, error: `Promotion '${promo.name}' is expired or not active` };
    }

    if (promo.type === "automatic") {
      return { valid: false, error: `Promotion '${promo.name}' is automatic and cannot be manually applied` };
    }

    if (promo.type === "onetime") {
      const used = promo.users.some(u => u.id === userId);
      if (used) {
        return { valid: false, error: `Promotion '${promo.name}' has already been used` };
      }
    }
  }

  return { valid: true, promotions };
}



async function checkActivePromotion(promotionId, userRole) {
  const promo = await prisma.promotion.findUnique({
    where: { id: promotionId },
  });

  if (!promo) {
    return { valid: false, error: 'Not Found' };
  }

  const now = new Date();

  if (userRole === "regular" || userRole === "cashier") {
    if (now < promo.startTime || now > promo.endTime) {
      return { valid: false, error: 'Not Found' };
    }
  }

  return { valid: true };
}

async function getValidAutomaticPromotions(spent, filters = {}, now) {
  const where = {
    type: "automatic",
    startTime: { lte: now },
    endTime: { gt: now },
    OR: [
      { minSpending: null },
      { minSpending: { lte: spent } },
    ],
  };

  if (filters.name) {
    where.name = {
      contains: filters.name,
    };
  }

  const promotions = await prisma.promotion.findMany({
    where,
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
      rate: true,
      points: true,
      minSpending: true,
      startTime: true,
      endTime: true,
    },
  });

  return promotions;
}

function applyPromotions(spent, promotions) {
  let totalRateBonus = 0;
  let totalFixedBonus = 0;
  const basePoints = spent/0.25;

  for (const promo of promotions) {
    if (promo.minSpending !== null && spent < promo.minSpending) continue;

    if (promo.rate && promo.rate > 0) {
      totalRateBonus += basePoints * (0.25 + promo.rate);
    }

    if (promo.points && promo.points > 0) {
      totalFixedBonus += promo.points;
    }
  }

  return Math.round(totalRateBonus) + totalFixedBonus;
}


async function markPromotionsAsUsed(userId, promotionIds) {
  if (!promotionIds || promotionIds.length === 0) return;

  const oneTimePromotions = await prisma.promotion.findMany({
    where: {
      id: { in: promotionIds },
      type: "onetime"
    },
    select: { id: true }
  });

  for (const promo of oneTimePromotions) {
    await prisma.promotion.update({
      where: { id: promo.id },
      data: {
        users: {
          connect: { id: userId }
        }
      }
    });
  }
}

async function filterUnusedPromotions(promotions, userId) {
  if (!promotions || promotions.length === 0) {
    return [];
  }

  const oneTimePromotionIds = promotions
    .filter(p => p.type === "onetime")
    .map(p => p.id);

  if (oneTimePromotionIds.length === 0) {
    return promotions;
  }

  const usedPromotions = await prisma.promotion.findMany({
    where: {
      id: { in: oneTimePromotionIds },
      type: "onetime",
      users: {
        some: { id: userId }
      }
    },
    select: { id: true }
  });

  const usedIds = new Set(usedPromotions.map(p => p.id));

  return promotions.filter(p => !usedIds.has(p.id));
}

module.exports = {
  validatePromotions,
  getValidAutomaticPromotions,
  applyPromotions,
  markPromotionsAsUsed,
  filterUnusedPromotions,
  checkActivePromotion,
};