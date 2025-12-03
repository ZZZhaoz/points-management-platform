const express = require("express");
const router = express.Router();
const eventControllers = require("../controllers/eventControllers");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { validateFields, validateQuery } = require("../middleware/validate");
const { validate } = require("uuid");

// POST /events - Create a new event
router.post(
    "/",
    authenticateToken,
    requireRole(["manager", "superuser"]),
    validateFields(
        ["name", "description", "location", "startTime", "endTime", "capacity", "points"],
        ["name", "description", "location", "startTime", "endTime"],
        {
            name: "string",
            description: "string",
            location: "string",
            startTime: "string",
            endTime: "string",
            points: "number",
        }
    ),
    eventControllers.createEvent
);

// GET /events - Get all events
router.get(
    "/",
    authenticateToken,
    requireRole(["regular", "cashier", "manager", "superuser"]),
    validateQuery(
        ["name", "location", "started", "ended", "showFull", "published", "page", "limit"],
        [],
        {
            name: "string",
            location: "string",
            started: "boolean",
            ended: "boolean",
            showFull: "boolean",
            published: "boolean",
            page: "number",
            limit: "number",
        }
    ),
    eventControllers.getAllEvents
);

// GET /events/organized/me - Get events organized by current user
router.get(
    "/organized/me",
    authenticateToken,
    requireRole(["regular", "cashier", "manager", "superuser"]),
    eventControllers.listOrganizedEvents
);

// GET /events/:eventId - Get a single event
router.get(
    "/:eventId",
    authenticateToken,
    requireRole(["regular", "cashier", "manager", "superuser"]),
    validateFields([], [], {}),
    eventControllers.getEvent
);

// PATCH /events/:eventId - Update an event
router.patch(
    "/:eventId",
    authenticateToken,
    requireRole(["regular", "cashier", "manager", "superuser"]),
    validateFields(
        ["name", "description", "location", "startTime", "endTime", "capacity", "points", "published"],
        [],
        {
            name: "string",
            description: "string",
            location: "string",
            startTime: "string",
            endTime: "string",
            points: "number",
            published: "boolean",
        }
    ),
    eventControllers.updateEvent
);

// DELETE /events/:eventId - Delete an event
router.delete(
    "/:eventId",
    authenticateToken,
    requireRole(["manager", "superuser"]),
    eventControllers.deleteEvent
);

// POST /events/:eventId/organizers - Add an organizer
router.post(
    "/:eventId/organizers",
    authenticateToken,
    requireRole(["manager", "superuser"]),
    validateFields(["utorid"], ["utorid"], { utorid: "string" }),
    eventControllers.addOrganizer
);

// DELETE /events/:eventId/organizers/:userId - Remove an organizer
router.delete(
    "/:eventId/organizers/:userId",
    authenticateToken,
    requireRole(["manager", "superuser"]),
    eventControllers.removeOrganizer
);

// POST /events/:eventId/guests - Add a guest (Manager or organizer)
router.post(
    "/:eventId/guests",
    authenticateToken,
    requireRole(["regular", "cashier", "manager", "superuser"]),
    validateFields(["utorid"], ["utorid"], { utorid: "string" }),
    eventControllers.addGuest
);

// POST /events/:eventId/guests/me - RSVP to event (Regular user)
// NOTE: This must come before /guests/:userId route
router.post(
    "/:eventId/guests/me",
    authenticateToken,
    requireRole(["regular", "cashier", "manager", "superuser"]),
    eventControllers.addGuestMe
);

// DELETE /events/:eventId/guests/me - Cancel RSVP (Regular user)
// NOTE: This must come before /guests/:userId route
router.delete(
    "/:eventId/guests/me",
    authenticateToken,
    requireRole(["regular", "cashier", "manager", "superuser"]),
    eventControllers.removeGuestMe
);

// DELETE /events/:eventId/guests/:userId - Remove a guest (Manager only)
router.delete(
    "/:eventId/guests/:userId",
    authenticateToken,
    requireRole(["manager", "superuser"]),
    eventControllers.removeGuest
);

// POST /events/:eventId/transactions - Award points to guests
router.post(
    "/:eventId/transactions",
    authenticateToken,
    requireRole(["regular", "cashier", "manager", "superuser"]),
    validateFields(
        ["type", "utorid", "amount", "remark"],
        ["type", "amount"],
        {
            type: "string",
            utorid: "string",
            amount: "number",
            remark: "string",
        }
    ),
    eventControllers.createEventTransaction
);

router.get(
    "/organizer/events",
    authenticateToken,
    requireRole(["regular", "cashier", "manager", "superuser"]),
    validateQuery(["userId"], ["userId"], { userId: "number" }),
    eventControllers.getMyOrganizedEvents
);


module.exports = router;
