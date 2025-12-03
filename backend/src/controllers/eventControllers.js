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
            return res.status(404).json({ error: 'Not Found' });
        }

        const result = await eventService.updateEvent(eventId, req.body, req.user.role, req.user.id);
        if (!result) {
            return res.status(404).json({ error: 'Not Found' });
        }

        return res.status(200).json(result);
    } catch (err) {
        if (err.message === 'Not Found') {
            return res.status(404).json({ error: 'Not Found' });
        }
        if (err.message === 'Forbidden') {
            return res.status(403).json({ error: 'Forbidden' });
        }
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
            return res.status(404).json({ error: 'Not Found' });
        }

        const result = await eventService.addGuest(eventId, req.body.utorid, req.user.role, req.user.id);
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

        const result = await eventService.addGuestMe(eventId, req.user.id);
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
            return res.status(404).json({ error: 'Not Found' });
        }

        const result = await eventService.createEventTransaction(eventId, req.body, req.user.role, req.user.id);
        return res.status(201).json(result);
    } catch (err) {
        if (err.message === 'Not Found') {
            return res.status(404).json({ error: 'Not Found' });
        }
        if (err.message === 'Forbidden') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (err.message === "Bad Request") {
            return res.status(400).json({ error: "Bad Request" });
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
