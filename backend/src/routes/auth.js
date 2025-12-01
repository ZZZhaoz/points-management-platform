const express = require("express");
const router = express.Router();
const { validateFields } = require("../middleware/validate");
const authControllers = require("../controllers/authControllers");


router.post("/tokens", validateFields(['utorid', 'password'], ['utorid', 'password'],
                { utorid: "string", password: 'string'}),
                         authControllers.generateToken);



router.post("/resets", validateFields(['utorid'], ['utorid'],
        { utorid: "string"}), authControllers.tokenReset);



router.post("/resets/:resetToken", 
        validateFields(['utorid', 'password'], ['password'], { utorid: "string", password: 'string'}), 
                authControllers.passwordReset
        );



module.exports = router;