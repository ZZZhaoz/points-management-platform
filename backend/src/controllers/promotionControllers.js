const VALID_PROMOTION_TYPES = ["automatic", "one-time"];

const promotionService = require("../services/promotionService");

async function createPromotion(req, res) {
    try {
        const { name, description, type, startTime, endTime, minSpending, rate, points } = req.body;

        if (!VALID_PROMOTION_TYPES.includes(type)) {
            return res.status(400).json({ error: `Bad Request` });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: `Bad Request` });
        }

        if (start < now || end <= start) {
            return res.status(400).json({ error: `Bad Request` });
        }

        if (minSpending !== undefined && minSpending <= 0 ) {
            return res.status(400).json({ error: "Bad Request" });
        }

        if (rate !== undefined && rate <= 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        if (points !== undefined && (!Number.isInteger(points) || points < 0)) {
            return res.status(400).json({ error: "Bad Request" });
        }

        const formatted = await promotionService.createPromotion({
            name,
            type,
            description,
            startTime: start,
            endTime: end,
            minSpending: minSpending ?? null,
            rate: rate ?? null,
            points: points ?? null
        });

        return res.status(201).json(formatted);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getPromotions(req, res) {
    try {
        const user = req.user;
        const role = user.role;

        const { name, type, started, ended } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page <= 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        if (limit <= 0) {
            return res.status(400).json({ error: "Bad Request" });
        }

        if ((role === "regular" || role === "cashier") && (started !== undefined || ended !== undefined)) {
           return res.status(400).json({ error: "Bad Request" });
        }

        if ((role !== "regular" && role !== "cashier") && started !== undefined && ended !== undefined) {
            return res.status(400).json({ error: "Bad Request" });
        }
        
        const promotions = await promotionService.getAllPromotions({
            user,
            role,
            name,
            type,
            started,
            ended,
            page,
            limit
        });
        return res.status(200).json(promotions);
    } catch (error) {
        console.error("ERROR IN GET /promotions:", error);
        if (error.message === 'Bad Request') return res.status(400).json({ error: 'Bad Request' });
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getPromotion(req, res) {
    try {
        const promotionId = parseInt(req.params.promotionId ,10);
        if (isNaN(promotionId)) {
            return res.status(400).json({ error: "Bad Request" });
          }

        const promotion = await promotionService.getPromotion(promotionId, req.user.role);
        
        return res.status(200).json(promotion);
    } catch (error) {
        if (error.message === 'Not Found') return res.status(404).json({ error: 'Not Found' });
        if (error.message === 'Bad Request') return res.status(400).json({ error: 'Bad Request' });
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function updatePromotion(req, res) {
    try {
      const promotionId = parseInt(req.params.promotionId, 10);
      if (isNaN(promotionId)) return res.status(400).json({ error: "Bad Request" });
  
      const { name, description, type, startTime, endTime, minSpending, rate, points } = req.body;
  
      const updatedPromotion = await promotionService.updatePromotion(promotionId, req.body);
  
      return res.status(200).json(updatedPromotion);
  
    } catch (error) {
      if (error.message === 'Not Found') return res.status(404).json({ error: 'Not Found' });
      if (error.message === 'Bad Request') return res.status(400).json({ error: 'Bad Request' });
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  

async function deletePromotion(req, res) {
    try {
        const promotionId = parseInt(req.params.promotionId ,10);
        await promotionService.deletePromotion(promotionId);

        return res.status(204).send();
    } catch (error) {
        if (error.message === 'Not Found') return res.status(404).json({ error: 'Not Found' });
        if (error.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports = {
    createPromotion,
    getPromotions,
    getPromotion,
    updatePromotion,
    deletePromotion,
};  