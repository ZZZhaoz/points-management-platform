const eventService = require("../services/eventService");

async function createEvent(req, res) {
    try {
        const result = await eventService.createEvent(req.body, req.user.id);
        return res.status(201).json(result);
    } catch (err) {
        if (err.message === 'Conflict') {
            return res.status(409).json({ error: 'Conflict' });
        }
        if (err.message === "Bad Request") {
            return res.status(400).json({ error: "Bad Request" });
        }
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getAllEvents(req, res) {
    try {
        const result = await eventService.getAllEvents(req.query, req.user.role, req.user.id);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message === "Bad Request") {
            return res.status(400).json({ error: "Bad Request" });
        }
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getEvent(req, res) {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (!eventId) {
            return res.status(404).json({ error: 'Not Found' });
        }

        const result = await eventService.getEvent(eventId, req.user.role, req.user.id);
        if (!result) {
            return res.status(404).json({ error: 'Not Found' });
        }

        return res.status(200).json(result);
    } catch (err) {
        if (err.message === 'Not Found') {
            return res.status(404).json({ error: 'Not Found' });
        }
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getMyEvents(req, res) {
  try {
    const userId = req.user.id;

    const eventIds = await eventService.getMyEvents(userId);

    return res.json(eventIds);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}



async function updateEvent(req, res) {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (!eventId) {
            return res.status(404).json({ error: "Event ID is invalid" });
        }

        const result = await eventService.updateEvent(
            eventId,
            req.body,
            req.user.role,
            req.user.id
        );

        return res.status(200).json(result);

    } catch (err) {
        const msg = err.message;

        if ([
            "Event not found",
        ].includes(msg)) {
            return res.status(404).json({ error: msg });
        }

        if ([
            "You do not have permission to edit this event",
            "Only managers or superusers may update points or publication status",
        ].includes(msg)) {
            return res.status(403).json({ error: msg });
        }

        if ([
            "Another event with this name already exists",
        ].includes(msg)) {
            return res.status(409).json({ error: msg });
        }

        if ([
            "Cannot edit event name after event has started",
            "Cannot edit event description after event has started",
            "Cannot edit event location after event has started",
            "Cannot update start time after event has started",
            "Cannot update end time after event has ended",
            "Start time cannot be in the past",
            "End time cannot be in the past",
            "Start time must be earlier than end time",
            "End time must be later than start time",
            "Cannot change event capacity after event has started",
            "Capacity must be a positive number",
            "New capacity cannot be smaller than current number of guests",
            "Points must be a positive number",
            "Total points cannot be less than points already awarded",
            "Published must be a boolean",
        ].includes(msg)) {
            return res.status(400).json({ error: msg });
        }

        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}


async function deleteEvent(req, res) {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (!eventId) {
            return res.status(404).json({ error: 'Not Found' });
        }

        await eventService.deleteEvent(eventId);
        return res.sendStatus(204);
    } catch (err) {
        if (err.message === 'Not Found') {
            return res.status(404).json({ error: 'Not Found' });
        }
        if (err.message === "Bad Request") {
            return res.status(400).json({ error: "Bad Request" });
        }
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function addOrganizer(req, res) {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (!eventId) {
            return res.status(404).json({ error: 'Not Found' });
        }

        const result = await eventService.addOrganizer(eventId, req.body.utorid);
        return res.status(201).json(result);
    } catch (err) {
        if (err.message === 'Not Found') {
            return res.status(404).json({ error: 'Not Found' });
        }
        if (err.message === "Bad Request") {
            return res.status(400).json({ error: "Bad Request" });
        }
        if (err.message === "Gone") {
            return res.status(410).json({ error: "Gone" });
        }
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function removeOrganizer(req, res) {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        const userId = parseInt(req.params.userId, 10);
        if (!eventId || !userId) {
            return res.status(404).json({ error: 'Not Found' });
        }

        await eventService.removeOrganizer(eventId, userId);
        return res.sendStatus(204);
    } catch (err) {
        if (err.message === 'Not Found') {
            return res.status(404).json({ error: 'Not Found' });
        }
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function addGuest(req, res) {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (!eventId) {
            return res.status(404).json({ error: "Event ID not valid" });
        }

        const { utorid } = req.body;
        const role = req.user.role;
        const currentUserId = req.user.id;

        const result = await eventService.addGuest(
            eventId,
            utorid,
            role,
            currentUserId
        );

        return res.status(201).json(result);

    } catch (err) {
        const msg = err.message;

        if ([
            "Event not found",
            "User not found",
            "Event is not visible to organizers yet (not published)"
        ].includes(msg)) {
            return res.status(404).json({ error: msg });
        }

        if ([
            "Event has already ended",
            "Event is full"
        ].includes(msg)) {
            return res.status(410).json({ error: msg });
        }

        if ([
            "User is already an organizer — cannot also be a guest",
            "User is already a guest of this event"
        ].includes(msg)) {
            return res.status(400).json({ error: msg });
        }

        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}


async function removeGuest(req, res) {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        const userId = parseInt(req.params.userId, 10);
        if (!eventId || !userId) {
            return res.status(404).json({ error: 'Not Found' });
        }

        await eventService.removeGuest(eventId, userId);
        return res.sendStatus(204);
    } catch (err) {
        if (err.message === 'Not Found') {
            return res.status(404).json({ error: 'Not Found' });
        }
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function addGuestMe(req, res) {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (!eventId) {
            return res.status(404).json({ error: 'Not Found' });
        }

        const result = await eventService.addGuestMe(eventId, req.user.utorid);
        return res.status(201).json(result);
    } catch (err) {
        if (err.message === 'Not Found') {
            return res.status(404).json({ error: 'Not Found' });
        }
        if (err.message === "Bad Request") {
            return res.status(400).json({ error: "Bad Request" });
        }
        if (err.message === "Gone") {
            return res.status(410).json({ error: "Gone" });
        }
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function removeGuestMe(req, res) {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (!eventId) {
            return res.status(404).json({ error: 'Not Found' });
        }

        await eventService.removeGuestMe(eventId, req.user.id);
        return res.sendStatus(204);
    } catch (err) {
        if (err.message === 'Not Found') {
            return res.status(404).json({ error: 'Not Found' });
        }
        if (err.message === "Gone") {
            return res.status(410).json({ error: "Gone" });
        }
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function createEventTransaction(req, res) {
    try {
        const eventId = parseInt(req.params.eventId, 10);
        if (!eventId) {
            return res.status(404).json({ error: "Invalid event ID" });
        }

        const result = await eventService.createEventTransaction(
            eventId,
            req.body,
            req.user.role,
            req.user.id
        );

        return res.status(201).json(result);

    } catch (err) {
        const msg = err.message;

        if ([
            "Event not found",
            "User not found"
        ].includes(msg)) {
            return res.status(404).json({ error: msg });
        }

        if ([
            "You do not have permission to award points for this event",
        ].includes(msg)) {
            return res.status(403).json({ error: msg });
        }

        if ([
            "Type must be 'event'",
            "Awarded points must be a positive number",
            "Not enough remaining points in this event",
            "This user is not a guest of the event",
            "Cannot award points: no guests have RSVPed",
            "Not enough remaining points to award all guests",
        ].includes(msg)) {
            return res.status(400).json({ error: msg });
        }

        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}


async function listOrganizedEvents(req, res) {
    try {
        const result = await eventService.listOrganizedEvent(req.user.id, req.user.role);
        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function getMyOrganizedEvents(req, res) {
    try {
        const userId = parseInt(req.query.userId, 10);

        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: "Bad Request: userId is required" });
        }

        const events = await eventService.getEventsOrganizedBy(userId);
        return res.status(200).json(events);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    createEvent,
    getAllEvents,
    getEvent,
    updateEvent,
    deleteEvent,
    addOrganizer,
    removeOrganizer,
    addGuest,
    removeGuest,
    addGuestMe,
    removeGuestMe,
    createEventTransaction,
    listOrganizedEvents,
    getMyEvents,
    getMyOrganizedEvents
};
