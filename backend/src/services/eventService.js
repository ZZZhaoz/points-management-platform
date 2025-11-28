const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EventService {
    async createEvent({ name, description, location, startTime, endTime, capacity, points }, userId) {
        
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error("Bad Request");
        }

        if (start < now || end < now) {
            throw new Error("Bad Request");
        }

        if (end <= start) {
            throw new Error("Bad Request");
        }

        if (capacity !== undefined && capacity !== null && (typeof capacity !== "number" || capacity <= 0)) {
            throw new Error("Bad Request");
        }

        
        if (capacity !== undefined) {
            if (capacity !== null) {
                if (typeof capacity !== 'number' || capacity <= 0) {
                    throw new Error("Bad Request");
                }
            }
        }
        
        if (typeof points !== 'number' || points <= 0) {
            throw new Error("Bad Request");
        }        
        
        const existingEvent = await prisma.event.findUnique({
            where: { name },
        });

        if (existingEvent) {
            throw new Error('Conflict');
        }

        const event = await prisma.event.create({
            data: {
                name,
                description,
                location,
                startTime: start,
                endTime: end,
                capacity: capacity !== undefined ? capacity : null,
                pointsRemain: points || 0,
                pointsAwarded: 0,
                published: false,
                organizers: {
                    connect: { id: userId },
                },
            },
            include: {
                organizers: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true,
                    },
                },
            },
        });

       return {
        id: event.id,
        name: event.name,
        description: event.description,
        location: event.location,
        startTime: event.startTime,
        endTime: event.endTime,
        capacity: event.capacity,
        pointsRemain: event.pointsRemain,
        pointsAwarded: event.pointsAwarded,
        published: event.published,
        organizers: event.organizers,
        guests: [] 
        };

    }

    async getAllEvents(query, userRole) {
        const {
            name,
            location,
            started,
            ended,
            showFull,
            published,
            page,
            limit,
        } = query;

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const showFullBool = showFull === true || showFull === 'true';

        if (parseInt(page, 10) <= 0 || parseInt(limit, 10) <= 0) {
            throw new Error("Bad Request");
        }
        
        if (started !== undefined && ended !== undefined) {
            throw new Error("Bad Request");
        }

        const where = {};

        if (name) {
            where.name = { contains: name };
        }

        if (location) {
            where.location = { contains: location };
        }

        const now = new Date();
        if (started !== undefined) {
            if (started === true || started === 'true') {
                where.startTime = { lte: now };
            } else {
                where.startTime = { gt: now };
            }
        }

        if (ended !== undefined) {
            if (ended === true || ended === 'true') {
                where.endTime = { lte: now };
            } else {
                where.endTime = { gt: now };
            }
        }

        
        // For all users, filter by published status
        if (userRole === 'regular' || userRole === 'cashier') {
            // Regular and cashier users always see only published events
            where.published = true;
        } else if (published !== undefined) {
            // Manager and superuser can filter by published status
            where.published = published === true || published === 'true';
        } else {
            // Manager and superuser see only published events by default
            where.published = true;
        }

        

        let events = await prisma.event.findMany({
            where,
            select: userRole === 'regular' ? {
                id: true,
                name: true,
                location: true,
                startTime: true,
                endTime: true,
                capacity: true,
                numGuests: true,
            } : {
                id: true,
                name: true,
                location: true,
                startTime: true,
                endTime: true,
                capacity: true,
                pointsRemain: true,
                pointsAwarded: true,
                published: true,
                numGuests: true,
            },
        });

        

        if (!showFullBool) {
            events = events.filter(event => {
                if (event.capacity === null) return true;
                return event.numGuests < event.capacity;
            });
        }
        
        const count = events.length;
        events = events.slice((pageNum - 1) * limitNum, pageNum * limitNum);

        return {
            count,
            results: events,
        };
    }

    async getEvent(eventId, userRole, userId) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true,
                    },
                },
                guests: userRole !== 'regular' ? {
                    select: {
                        id: true,
                        utorid: true,
                        name: true,
                    },
                } : false,
            },
        });

        if (!event) {
            throw new Error('Not Found');
        }

        
        const isOrganizer = event.organizers.some(org => org.id === userId);

        
        if (userRole === 'regular' && !isOrganizer && !event.published) {
            throw new Error('Not Found');
        }

        if (userRole === 'regular') {
            return {
                id: event.id,
                name: event.name,
                description: event.description,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                capacity: event.capacity,
                organizers: event.organizers,
                numGuests: event.numGuests,
            };
        }

        
        return {
            id: event.id,
            name: event.name,
            description: event.description,
            location: event.location,
            startTime: event.startTime,
            endTime: event.endTime,
            capacity: event.capacity,
            pointsRemain: event.pointsRemain,
            pointsAwarded: event.pointsAwarded,
            published: event.published,
            organizers: event.organizers,
            guests: event.guests || [],
        };
    }

    async getMyEvents(userId) {
    const events = await prisma.event.findMany({
        where: {
        guests: {
            some: { id: userId }
        }
        },
        select: { id: true }     
    });

    return events.map(e => e.id);
    }

    async updateEvent(eventId, updates, userRole, userId) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: true,
                guests: true,
            },
        });

        if (!event) {
            throw new Error('Not Found');
        }

        
        const isOrganizer = event.organizers.some(org => org.id === userId);
        if (!isOrganizer && userRole !== 'manager' && userRole !== 'superuser') {
            throw new Error('Forbidden');
        }

        const data = {};
        const now = new Date();
        const originalStartTime = event.startTime;
        const originalEndTime = event.endTime;

        if (updates.name !== undefined) {
            if (originalStartTime < now) {
                throw new Error("Bad Request");
            }
            const existingEvent = await prisma.event.findUnique({
                where: { name: updates.name },
            });
            if (existingEvent && existingEvent.id !== eventId) {
                throw new Error('Conflict');
            }
            data.name = updates.name;
        }

        if (updates.description !== undefined) {
            if (originalStartTime < now) {
                throw new Error("Bad Request");
            }
            data.description = updates.description;
        }

        if (updates.location !== undefined) {
            if (originalStartTime < now) {
                throw new Error("Bad Request");
            }
            data.location = updates.location;
        }

        if (updates.startTime !== undefined) {
            const startTime = new Date(updates.startTime);
            if (startTime < now || originalStartTime < now) {
                throw new Error("Bad Request");
            }
            if (updates.endTime === undefined && startTime >= new Date(event.endTime)) {
                throw new Error("Bad Request");
            }
            data.startTime = startTime;
        }

        if (updates.endTime !== undefined) {
            const endTime = new Date(updates.endTime);
            const startTime = updates.startTime ? new Date(updates.startTime) : originalStartTime;
            if (endTime < now || originalEndTime < now) {
                throw new Error("Bad Request");
            }
            if (endTime <= startTime) {
                throw new Error("Bad Request");
            }
            data.endTime = endTime;
        }

        if (updates.capacity !== undefined && updates.capacity !== null && updates.capacity !== 'null' ) {
            if (originalStartTime < now) {
                throw new Error("Bad Request");
            }
            

                
            const newCapacity = typeof updates.capacity === 'number' 
                ? updates.capacity 
                : parseInt(updates.capacity, 10);
            if (isNaN(newCapacity) || newCapacity <= 0) {
                throw new Error("Bad Request");
            }
            if (event.numGuests > newCapacity) {
                throw new Error("Bad Request");
            }
            data.capacity = newCapacity;
            
        }

        
        if (userRole === 'manager' || userRole === 'superuser') {
            if (updates.points !== undefined) {
                const newTotalPoints = parseInt(updates.points, 10);
                if (newTotalPoints <= 0) {
                    throw new Error("Bad Request");
                }
                
                const newRemain = newTotalPoints - event.pointsAwarded;
                if (newRemain < 0) {
                    throw new Error("Bad Request");
                }
                data.pointsRemain = newRemain;
            }

            if (updates.published !== undefined) {
                
                if (typeof updates.published !== 'boolean') {
                    throw new Error("Bad Request");
                }
                data.published = updates.published;
            }
        }
        else {
            throw new Error('Forbidden');
        }

        const updated = await prisma.event.update({
            where: { id: eventId },
            data,
        });

        const response = {
            id: updated.id,
            name: updated.name,
            location: updated.location,
        };

        
        if (updates.name !== undefined) {
            response.name = updated.name;
        }
        if (updates.description !== undefined) {
            response.description = updated.description;
        }
        if (updates.location !== undefined) {
            response.location = updated.location;
        }
        if (updates.startTime !== undefined) {
            response.startTime = updated.startTime;
        }
        if (updates.endTime !== undefined) {
            response.endTime = updated.endTime;
        }
        if (updates.capacity !== undefined) {
            response.capacity = updated.capacity;
        }
        if (updates.points !== undefined && (userRole === 'manager' || userRole === 'superuser')) {
            response.pointsRemain = updated.pointsRemain;
        }
        if (updates.published !== undefined && (userRole === 'manager' || userRole === 'superuser')) {
            response.published = updated.published;
        }

        return response;
    }

    async deleteEvent(eventId) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            throw new Error('Not Found');
        }

        if (event.published) {
            throw new Error("Bad Request");
        }

        await prisma.event.delete({
            where: { id: eventId },
        });
    }

    async addOrganizer(eventId, utorid) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: true,
                guests: true,
            },
        });

        if (!event) {
            throw new Error('Not Found');
        }

        const now = new Date();
        if (event.endTime < now) {
            throw new Error("Gone");
        }

        const user = await prisma.user.findUnique({
            where: { utorid },
        });

        if (!user) {
            throw new Error('Not Found');
        }

        
        if (event.guests.some(guest => guest.id === user.id)) {
            throw new Error("Bad Request");
        }

        
        if (event.organizers.some(org => org.id === user.id)) {
            throw new Error("Bad Request");
        }

        const updated = await prisma.event.update({
            where: { id: eventId },
            data: {
                organizers: {
                    connect: { id: user.id },
                },
            },
            include: {
                organizers: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true,
                    },
                },
            },
        });

        return {
            id: updated.id,
            name: updated.name,
            location: updated.location,
            organizers: updated.organizers,
        };
    }

    async removeOrganizer(eventId, userId) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: true,
            },
        });

        if (!event) {
            throw new Error('Not Found');
        }

        if (!event.organizers.some(org => org.id === userId)) {
            throw new Error('Not Found');
        }

        await prisma.event.update({
            where: { id: eventId },
            data: {
                organizers: {
                    disconnect: { id: userId },
                },
            },
        });
    }

    async addGuest(eventId, utorid, userRole, userId) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: true,
                guests: true,
            },
        });

        if (!event) {
            throw new Error('Not Found');
        }

        
        const isOrganizer = event.organizers.some(org => org.id === userId);
        if (isOrganizer && !event.published) {
            throw new Error('Not Found');
        }

        const now = new Date();
        if (event.endTime < now) {
            throw new Error("Gone");
        }

        if (event.capacity !== null && event.numGuests >= event.capacity) {
            throw new Error("Gone");
        }

        const user = await prisma.user.findUnique({
            where: { utorid },
        });

        if (!user) {
            throw new Error('Not Found');
        }

        
        if (event.organizers.some(org => org.id === user.id)) {
            throw new Error("Bad Request");
        }

        
        if (event.guests.some(guest => guest.id === user.id)) {
            throw new Error("Bad Request");
        }

        const updated = await prisma.event.update({
            where: { id: eventId },
            data: {
                guests: {
                    connect: { id: user.id },
                },
                numGuests: { increment: 1 },
            },
        });

        return {
            id: updated.id,
            name: updated.name,
            location: updated.location,
            guestAdded: {
                id: user.id,
                utorid: user.utorid,
                name: user.name,
            },
            numGuests: updated.numGuests,
        };
    }

    async removeGuest(eventId, userId) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                guests: true,
            },
        });

        if (!event) {
            throw new Error('Not Found');
        }

        if (!event.guests.some(guest => guest.id === userId)) {
            throw new Error('Not Found');
        }

        await prisma.event.update({
            where: { id: eventId },
            data: {
                guests: {
                    disconnect: { id: userId },
                },
                numGuests: { decrement: 1 },
            },
        });
    }

    async addGuestMe(eventId, userId) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: true,
                guests: true,
            },
        });

        if (!event) {
            throw new Error('Not Found');
        }

        if (!event.published) {
            throw new Error('Not Found');
        }

        const now = new Date();
        if (event.endTime < now) {
            throw new Error("Gone");
        }

        if (event.capacity !== null && event.numGuests >= event.capacity) {
            throw new Error("Gone");
        }

        
        if (event.organizers.some(org => org.id === userId)) {
            throw new Error("Bad Request");
        }

        
        if (event.guests.some(guest => guest.id === userId)) {
            throw new Error("Bad Request");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        const updated = await prisma.event.update({
            where: { id: eventId },
            data: {
                guests: {
                    connect: { id: userId },
                },
                numGuests: { increment: 1 },
            },
        });

        return {
            id: updated.id,
            name: updated.name,
            location: updated.location,
            guestAdded: {
                id: user.id,
                utorid: user.utorid,
                name: user.name,
            },
            numGuests: updated.numGuests,
        };
    }

    async removeGuestMe(eventId, userId) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                guests: true,
            },
        });

        if (!event) {
            throw new Error('Not Found');
        }

        if (!event.guests.some(guest => guest.id === userId)) {
            throw new Error('Not Found');
        }

        const now = new Date();
        if (event.endTime < now) {
            throw new Error("Gone");
        }

        await prisma.event.update({
            where: { id: eventId },
            data: {
                guests: {
                    disconnect: { id: userId },
                },
                numGuests: { decrement: 1 },
            },
        });
    }

    async createEventTransaction(eventId, { type, utorid, amount, remark }, userRole, userId) {
        if (type !== 'event') {
            throw new Error("Bad Request");
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: true,
                guests: true,
            },
        });

        if (!event) {
            throw new Error('Not Found');
        }

        
        const isOrganizer = event.organizers.some(org => org.id === userId);
        if (!isOrganizer && userRole !== 'manager' && userRole !== 'superuser') {
            throw new Error('Forbidden');
        }

        const points = parseInt(amount, 10);
        if (points <= 0) {
            throw new Error("Bad Request");
        }

        if (event.pointsRemain < points) {
            throw new Error("Bad Request");
        }

        if (utorid) {
            
            const user = await prisma.user.findUnique({
                where: { utorid },
            });

            if (!user) {
                throw new Error('Not Found');
            }

            
            if (!event.guests.some(guest => guest.id === user.id)) {
                throw new Error("Bad Request");
            }

            
            const transaction = await prisma.transaction.create({
                data: {
                    type: 'event',
                    amount: points,
                    remark: remark || '',
                    userId: user.id,
                    createdById: userId,
                    relatedId: eventId,
                },
            });

            
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    points: { increment: points },
                },
            });

            
            await prisma.event.update({
                where: { id: eventId },
                data: {
                    pointsRemain: { decrement: points },
                    pointsAwarded: { increment: points },
                },
            });

            const creator = await prisma.user.findUnique({
                where: { id: userId },
            });

            return {
                id: transaction.id,
                recipient: user.utorid,
                awarded: points,
                type: 'event',
                relatedId: eventId,
                remark: remark || '',
                createdBy: creator.utorid,
            };
        } else {
            
            if (event.guests.length === 0) {
                throw new Error("Bad Request");
            }

            const totalPoints = points * event.guests.length;
            if (event.pointsRemain < totalPoints) {
                throw new Error("Bad Request");
            }

            const creator = await prisma.user.findUnique({
                where: { id: userId },
            });

            const transactions = [];

            
            for (const guest of event.guests) {
                const transaction = await prisma.transaction.create({
                    data: {
                        type: 'event',
                        amount: points,
                        remark: remark || '',
                        userId: guest.id,
                        createdById: userId,
                        relatedId: eventId,
                    },
                });

                
                await prisma.user.update({
                    where: { id: guest.id },
                    data: {
                        points: { increment: points },
                    },
                });

                transactions.push({
                    id: transaction.id,
                    recipient: guest.utorid,
                    awarded: points,
                    type: 'event',
                    relatedId: eventId,
                    remark: remark || '',
                    createdBy: creator.utorid,
                });
            }

            
            await prisma.event.update({
                where: { id: eventId },
                data: {
                    pointsRemain: { decrement: totalPoints },
                    pointsAwarded: { increment: totalPoints },
                },
            });

            return transactions;
        }
    }
}

module.exports = new EventService();
