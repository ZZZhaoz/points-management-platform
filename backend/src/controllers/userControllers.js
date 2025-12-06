const userService = require("../services/userService");


async function createUser(req, res) {
    try {
        const result = await userService.createUser(req.body);
        return res.status(201).json(result);

    } catch (err) {
        console.error("User creation error:", err.message);

        if (err.type === "CONFLICT" || err.code === "P2002") {
            return res.status(409).json({ error: "User with this UTORid already exists" });
        }

        if (
            err.type === "MISSING_FIELDS" ||
            err.type === "INVALID_UTORID" ||
            err.type === "INVALID_NAME" ||
            err.type === "INVALID_EMAIL"
        ) {
            return res.status(400).json({ error: err.message });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
}


async function getAllUsers(req, res) {
    try {
        const result = await userService.getAllUsers(req.query);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message === 'Bad Request') {
            return res.status(400).json({ error: 'Bad Request' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getUser(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (!userId) return res.status(404).json({ error: 'Not Found' });

        const result = await userService.getUser(userId, req.user.role);
        if (!result) return res.status(404).json({ error: 'Not Found' });

        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateUser(req, res) {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) return res.status(400).json({ error: 'Bad Request' });

        const result = await userService.updateUser(userId, req.user.role, req.body);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message === 'Bad Request') return res.status(400).json({ error: 'Bad Request' });
        if (err.message === 'Not Found') return res.status(404).json({ error: 'Not Found' });
        if (err.message === 'Conflict') return res.status(409).json({ error: 'Conflict' });
        if (err.message === 'Forbidden') return res.status(403).json({ error: 'Forbidden' });
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }

}

async function getCurrentUser(req, res) {
    try {
        const result = await userService.getCurrentUser(req.user.id);
        return res.status(200).json(result);
    } catch (err) {
        if (err.message === 'Not Found')
            return res.status(404).json({ error: 'Not Found' });

        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


async function updatePassword(req, res) {
  try {
    const result = await userService.updatePassword(req.user.id, req.body);
    return res.sendStatus(200);
  } catch (err) {
    if (err.message === "Forbidden")
      return res.status(403).json({ error: "Forbidden" });

    if (err.message === "Bad Request")
      return res.status(400).json({ error: "Bad Request" });

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


async function updateInfo(req, res) {
  try {
    const result = await userService.updateInfo(req.user.id, req.body, req.file);
    return res.status(200).json(result);
  } catch (err) {
    if (err.message === "Bad Request")
      return res.status(400).json({ error: "Bad Request" });

    if (err.message === "Forbidden")
      return res.status(403).json({ error: "Forbidden" });

    if (err.message === "Not Found")
      return res.status(404).json({ error: "Not Found" });

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function lookupByUtorid(req, res) {
  try {
    const utorid = req.params.utorid;

    const user = await userService.getUserByUtorid(utorid);

    if (!user) {
      return res.status(404).json({ error: "Not Found" });
    }

    return res.json({
      id: user.id,
      utorid: user.utorid,
      name: user.name,
      role: user.role,
      verified: user.verified
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


module.exports = {
    createUser,
    getAllUsers,
    getUser,
    updateUser,
    getCurrentUser,
    updatePassword,
    updateInfo,
    lookupByUtorid,
};