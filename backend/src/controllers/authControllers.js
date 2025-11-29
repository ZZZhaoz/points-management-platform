const authService = require("../services/authService");
const rateLimiter = {}


async function generateToken(req, res) {
  try {
    const result = await authService.authenticate(req.body);
    return res.status(200).json(result);
  } catch (err) {
    if (err.message === "Bad Request") {
      return res.status(400).json({ error: "Bad Request" });
    }

    if (err.message === "Invalid credentials") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}



async function tokenReset(req, res) {
  try {
    const result = await authService.resetToken(req.body, rateLimiter);
    return res.status(202).json(result);
  } 
  catch (err) {

    if (err.message === "Not Found"){
      return res.status(404).json({ error: "Not Found" });
    }

    if (err.message === "Too Many Requests"){
      return res.status(429).json({ error: "Too Many Requests" });
    }

    if (err.message === "Bad Request"){
      return res.status(400).json({ error: "Bad Request" });
    }
    
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}



async function passwordReset(req, res) {
  try {
    await authService.resetPassword(req.body, req.params);
    return res.status(200).json({ success: true });
  } 
  catch (err) {

    if (err.message === "Unauthorized") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (err.message === "Not Found") {
      return res.status(404).json({ error: "Not Found" });
    }
    if (err.message === "Gone") {
      return res.status(410).json({ error: "Expired reset token" });
    }
    if (err.message === "Bad Request") {
      return res.status(400).json({ error: "Bad Request" });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


module.exports = {
  generateToken, tokenReset, passwordReset
};