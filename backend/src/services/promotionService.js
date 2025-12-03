const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
    getValidAutomaticPromotions,
    filterUnusedPromotions,
    checkActivePromotion,
} = require("../helpers/promotionHelper");


class PromotionService {
    async createPromotion(data) {
        if (data.type === "one-time") {
            data.type = "onetime";
        }

        const promotion = await prisma.promotion.create({
            data
        });

        const formatted = {
            ...promotion,
            type: promotion.type === "onetime" ? "one-time" : promotion.type,
            startTime: promotion.startTime.toISOString(),
            endTime: promotion.endTime.toISOString(),
            minSpending: promotion.minSpending ?? null,
            rate: promotion.rate ?? null,
            points: promotion.points ?? null

        };
        return formatted;
    }

    async getAllPromotions(params) {
        const { user, role, name, type, started, ended, page = 1, limit = 10 } = params;

        const now = new Date();
        let formatted = [];
        let count = 0;

        console.log(name);

        if (role === "regular" || role === "cashier") {
            const nameFilter = name ? {
                name: {
                    contains: name,
                }
            } : {};

            let validOnetimePromotions = [];
            if (!type || type === "onetime") {  
                const onetimePromotions = await prisma.promotion.findMany({
                    where: { 
                        type: "onetime", 
                        startTime: { lte: now }, 
                        endTime: { gt: now },
                        ...nameFilter,
                    },
                });
                validOnetimePromotions = await filterUnusedPromotions(onetimePromotions, user.id);
            }

            let validAutomaticPromotions = [];
            if (!type || type === "automatic") {
                validAutomaticPromotions = await getValidAutomaticPromotions(0, { name }, now);
            }

            const allValidPromotions = [...validOnetimePromotions, ...validAutomaticPromotions];

            count = allValidPromotions.length;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedPromotions = allValidPromotions.slice(startIndex, endIndex);

            formatted = paginatedPromotions.map(t => ({
                id: t.id,
                name: t.name,
                type: t.type,
                startTime: t.startTime.toISOString(),
                endTime: t.endTime.toISOString(),
                minSpending: t.minSpending ?? null,
                rate: t.rate ?? null,
                points: t.points ?? null
            }));

        }

        else {
            const where = {};

            if (name) {
                where.name = {
                    contains: name,
                };
            }

            if (type) {
                where.type = type;
            }

            if (started === true) {
                where.startTime = { lte: now };
            } else if (started === false) {
                where.startTime = { gt: now };
            }

            if (ended === true) {
                where.endTime = { lt: now };
            } else if (ended === false) {
                where.endTime = { gte: now };
            }

            const skip = (page - 1) * limit;

            const [total, results] = await Promise.all([
                prisma.promotion.count({ where }),
                prisma.promotion.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { id: "asc" },
                }),
            ]);

            count = total;

            formatted = results.map(t => ({
                id: t.id,
                name: t.name,
                type: t.type,
                startTime: t.startTime.toISOString(),
                endTime: t.endTime.toISOString(),
                minSpending: t.minSpending ?? null,
                rate: t.rate ?? null,
                points: t.points ?? null,
            }));

        }
       
        return { count, results: formatted };

    }

    async getPromotion(promotionId, userRole) {
        const validity = await checkActivePromotion(promotionId, userRole);

        if (validity.valid && (userRole === "regular" || userRole === "cashier")) {
            const promotion = await prisma.promotion.findUnique({
                where: {
                    id: promotionId,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    endTime: true,
                    minSpending: true,
                    rate: true,
                    points: true,
                }
            });

            return promotion;
        }
        else if (validity.valid && (userRole === "manager" || userRole === "superuser")) {
            const promotion = await prisma.promotion.findUnique({
                where: {
                    id: promotionId,
                },
            });
            return promotion;
        }
        else {
            if (validity.error === 'Not Found') {
                throw new Error('Not Found');
            }   
        }

    }

    async updatePromotion(promotionId, 
        {name, description, type, startTime, endTime, minSpending, rate, points}) {
        const promo = await prisma.promotion.findUnique({
            where: {
                id : promotionId,
            },
        });

        if (type == "one-time"){
            type = "onetime"
        }

        if (!promo) {
            throw new Error('Not Found');
        }
        
        const now = new Date(); 
        
        if (startTime && new Date(startTime) < now) {
            throw new Error('Bad Request');
        }
        
        if (endTime && new Date(endTime) < now) {
            throw new Error('Bad Request');
        }
        
        if (endTime && startTime && new Date(endTime) <= new Date(startTime)) {
            throw new Error('Bad Request');
        }

        
        if (name !== undefined || description !== undefined || type !== undefined ||
            startTime !== undefined || minSpending !== undefined || rate !== undefined ||
            points !== undefined
        ) {
            if (promo.startTime < now) {
                throw new Error('Bad Request');
            }
        }

        if (endTime !== undefined) {
            if (promo.endTime < now) {
                throw new Error('Bad Request');
            }
        }
        
        if (minSpending !== undefined && minSpending <= 0) {
            throw new Error('Bad Request');
        }
        
        if (rate !== undefined && rate <= 0) {
            throw new Error('Bad Request');
        }
        
        if (points !== undefined && (!Number.isInteger(points) || points <= 0)) {
            throw new Error('Bad Request');
        }
        
        if (type !== undefined) {
            if (type !== "onetime" && type !== "automatic") {
                 throw new Error('Bad Request');
            }
        }

        const data = Object.fromEntries(
            Object.entries({name, description, type, 
            startTime: startTime ? new Date(startTime) : undefined, 
            endTime: endTime ? new Date(endTime) : undefined, 
            minSpending, rate, points})
                .filter(([_, value]) => value !== undefined)
        );
        
        const updatedPromo = await prisma.promotion.update({
            where: { id: promotionId},
            data: data,
        });

        return {
            "id": updatedPromo.id,
            "name": updatedPromo.name,
            "type": updatedPromo.type,
            ...data,
        };
    }


    async deletePromotion(promotionId) {
        const promo = await prisma.promotion.findUnique({
            where: {
                id: promotionId
            },
        });

        if (!promo) {
            throw new Error('Not Found');
        }

        const now = new Date(); 
        if (promo.startTime <= now ) {
            throw new Error('Forbidden');
        }

        await prisma.promotion.delete({
            where: {
                id: promotionId
            },
        });

        return;
    }
}




module.exports = new PromotionService();
