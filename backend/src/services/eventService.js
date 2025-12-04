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
        } 
        else {
            if (published === "true" || published === true) {
                // filter on published
                where.published = true;
            } 
            else if (published === "false" || published === false) {
                // filter on NOT published
                where.published = false;
            }
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

        


        if (showFull === "true" || showFull === true) {
            // Only full events
            events = events.filter(event => {
                return event.capacity !== null && event.numGuests >= event.capacity;
            });
        } else if (showFull === "false" || showFull === false) {
            events = events.filter(event => {
                return event.capacity === null || event.numGuests < event.capacity;
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
            throw new Error("Event not found");
        }

        const isOrganizer = event.organizers.some(org => org.id === userId);
        if (!isOrganizer && userRole !== "manager" && userRole !== "superuser") {
            throw new Error("You do not have permission to edit this event");
        }

        const data = {};
        const now = new Date();
        const originalStartTime = event.startTime;
        const originalEndTime = event.endTime;

        if (updates.name !== undefined) {
            if (originalStartTime < now) {
                throw new Error("Cannot edit event name after event has started");
            }

            const existingEvent = await prisma.event.findUnique({
                where: { name: updates.name },
            });
            if (existingEvent && existingEvent.id !== eventId) {
                throw new Error("Another event with this name already exists");
            }

            data.name = updates.name;
        }

        if (updates.description !== undefined) {
            if (originalStartTime < now) {
                throw new Error("Cannot edit event description after event has started");
            }
            data.description = updates.description;
        }

        if (updates.location !== undefined) {
            if (originalStartTime < now) {
                throw new Error("Cannot edit event location after event has started");
            }
            data.location = updates.location;
        }

        if (updates.startTime !== undefined) {
            const startTime = new Date(updates.startTime);

            if (startTime < now) {
                throw new Error("Start time cannot be in the past");
            }
            if (originalStartTime < now) {
                throw new Error("Cannot update start time after event has started");
            }
            if (updates.endTime === undefined && startTime >= new Date(event.endTime)) {
                throw new Error("Start time must be earlier than end time");
            }

            data.startTime = startTime;
        }

        if (updates.endTime !== undefined) {
            const endTime = new Date(updates.endTime);
            const startTime = updates.startTime ? new Date(updates.startTime) : originalStartTime;

            if (endTime < now) {
                throw new Error("End time cannot be in the past");
            }
            if (originalEndTime < now) {
                throw new Error("Cannot update end time after event has ended");
            }
            if (endTime <= startTime) {
                throw new Error("End time must be later than start time");
            }

            data.endTime = endTime;
        }

        if (updates.capacity !== undefined && updates.capacity !== null && updates.capacity !== "null") {
            if (originalStartTime < now) {
                throw new Error("Cannot change event capacity after event has started");
            }

            const newCapacity =
                typeof updates.capacity === "number"
                    ? updates.capacity
                    : parseInt(updates.capacity, 10);

            if (isNaN(newCapacity) || newCapacity <= 0) {
                throw new Error("Capacity must be a positive number");
            }

            if (event.numGuests > newCapacity) {
                throw new Error("New capacity cannot be smaller than current number of guests");
            }

            data.capacity = newCapacity;
        }

        if (userRole === "manager" || userRole === "superuser") {
            if (updates.points !== undefined) {
                const newTotalPoints = parseInt(updates.points, 10);
                if (isNaN(newTotalPoints) || newTotalPoints <= 0) {
                    throw new Error("Points must be a positive number");
                }
                const newRemain = newTotalPoints - event.pointsAwarded;
                if (newRemain < 0) {
                    throw new Error("Total points cannot be less than points already awarded");
                }
                data.pointsRemain = newRemain;
            }

            if (updates.published !== undefined) {
                if (typeof updates.published !== "boolean") {
                    throw new Error("Published must be a boolean");
                }
                data.published = updates.published;
            }
        } else {
            throw new Error("Only managers or superusers may update points or publication status");
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

        if (updates.name !== undefined) response.name = updated.name;
        if (updates.description !== undefined) response.description = updated.description;
        if (updates.location !== undefined) response.location = updated.location;
        if (updates.startTime !== undefined) response.startTime = updated.startTime;
        if (updates.endTime !== undefined) response.endTime = updated.endTime;
        if (updates.capacity !== undefined) response.capacity = updated.capacity;
        if (updates.points !== undefined) response.pointsRemain = updated.pointsRemain;
        if (updates.published !== undefined) response.published = updated.published;

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
            throw new Error("Event not found");
        }

        const isOrganizer = event.organizers.some(org => org.id === userId);

        if (isOrganizer && !event.published) {
            throw new Error("Event is not visible to organizers yet (not published)");
        }

        const now = new Date();
        if (event.endTime < now) {
            throw new Error("Event has already ended");
        }

        if (event.capacity !== null && event.numGuests >= event.capacity) {
            throw new Error("Event is full");
        }

        const user = await prisma.user.findUnique({
            where: { utorid },
        });

        if (!user) {
            throw new Error("User not found");
        }

        if (event.organizers.some(org => org.id === user.id)) {
            throw new Error("User is already an organizer — cannot also be a guest");
        }

        if (event.guests.some(guest => guest.id === user.id)) {
            throw new Error("User is already a guest of this event");
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

    async addGuestMe(eventId, utorid) {
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

        const user = await prisma.user.findUnique({
            where: { utorid },
        });

        if (!user) {
            throw new Error("Not Found");
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
            include: {
                guests: true,
            }
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
            throw new Error("Type must be 'event'");
        }

        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                organizers: true,
                guests: true,
            },
        });

        if (!event) {
            throw new Error("Event not found");
        }

        const isOrganizer = event.organizers.some(org => org.id === userId);
        if (!isOrganizer && userRole !== 'manager' && userRole !== 'superuser') {
            throw new Error("You do not have permission to award points for this event");
        }

        const points = parseInt(amount, 10);
        if (isNaN(points) || points <= 0) {
            throw new Error("Awarded points must be a positive number");
        }

        if (event.pointsRemain < points) {
            throw new Error("Not enough remaining points in this event");
        }

        if (utorid) {
            const user = await prisma.user.findUnique({
                where: { utorid },
            });

            if (!user) {
                throw new Error("User not found");
            }

            if (!event.guests.some(guest => guest.id === user.id)) {
                throw new Error("This user is not a guest of the event");
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
        }

        if (event.guests.length === 0) {
            throw new Error("Cannot award points: no guests have RSVPed");
        }

        const totalPoints = points * event.guests.length;
        if (event.pointsRemain < totalPoints) {
            throw new Error("Not enough remaining points to award all guests");
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


    async listOrganizedEvent(userId, userRole) {
        const where = {
            organizers: {
                some: {
                    id: userId
                }
            }
        };

        // Regular/Cashier can only see the published events
        if (userRole === 'regular' || userRole === 'cashier') {
            where.published = true;
        }

        const events = await prisma.event.findMany({
            where,
            include: {
                organizers: {
                    select: {
                        id: true,
                        utorid: true,
                        name: true,
                    },
                },
                guests: (userRole !== 'regular' && userRole !== 'cashier') ? {
                    select: {
                        id: true,
                        utorid: true,
                        name: true,
                    },
                } : false,
            },
        });

        return events.map(event => {
            if (userRole === 'regular' || userRole === 'cashier') {
                return {
                    id: event.id,
                    name: event.name,
                    description: event.description,
                    location: event.location,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    capacity: event.capacity,
                    numGuests: event.numGuests,
                    organizers: event.organizers,
                };
            } else {
                return {
                    id: event.id,
                    name: event.name,
                    description: event.description,
                    location: event.location,
                    startTime: event.startTime,
                    endTime: event.endTime,
                    capacity: event.capacity,
                    numGuests: event.numGuests,
                    pointsRemain: event.pointsRemain,
                    pointsAwarded: event.pointsAwarded,
                    published: event.published,
                    organizers: event.organizers,
                    guests: event.guests || [],
                };
            }
        });
    }

    async getEventsOrganizedBy(userId) {
        const events = await prisma.event.findMany({
            where: {
                organizers: {
                    some: { id: userId }
                }
            },
            select: {
                id: true,
                name: true,
                location: true,
                startTime: true,
                endTime: true,
                published: true,
                numGuests: true,
                pointsRemain: true,
                pointsAwarded: true
            }
        });

        return events;
    }

}

module.exports = new EventService();
