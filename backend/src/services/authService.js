const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


class AuthService{
    async authenticate({utorid, password}){

        // If the user does not have a username or password field
        if (!utorid || !password){
            throw new Error("Bad Request");
        }

        const existingUser = await prisma.user.findUnique({
            where: { utorid },
        });

        // If the provided password is incorrect
        if (!existingUser || !existingUser.password){
            throw new Error("Invalid credentials");
        }

        console.log("Print before");
        const validPassword = await bcrypt.compare(password, existingUser.password);
        console.log("Print after");

        if (!validPassword) {
            throw new Error("Invalid credentials");
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);


        await prisma.user.update({
        where: { id: existingUser.id },
        data: {lastLogin: new Date(), 
            expiresAt: expiresAt,
            activated: true,
            },
        });

        const token = jwt.sign(
            { id: existingUser.id, utorid: existingUser.utorid, role: existingUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );
        return { token, expiresAt: expiresAt.toISOString() };
    }




    async resetToken({utorid}, rateLimiter){

        if (!utorid){
            throw new Error("Bad Request");
        }

        const lastRequest = rateLimiter[utorid];

        if (lastRequest) {
            const timePassed = Date.now() - lastRequest;

            if (timePassed < 60 * 1000) {
                throw new Error("Too Many Requests");
            }
        }

        

        rateLimiter[utorid] = Date.now();

        const user = await prisma.user.findUnique(
            { where: { utorid } }
        );

        if (!user){
            throw new Error("Not Found");
        }

                
        const resetToken = require("uuid").v4();

        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);


        await prisma.user.update({
            where: { utorid },
            data: { resetToken: resetToken, expiresAt: expiresAt },
        });


        return {
            resetToken,
            expiresAt: expiresAt.toISOString(),
        };
    }

    
    async resetPassword({ utorid, password }, { resetToken }) {
        if (!utorid || !password || !resetToken) {
            throw new Error("Bad Request");
        }

         const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        if (!passwordRegex.test(password)) {
            throw new Error("Bad Request");
        }

        const user = await prisma.user.findFirst({
            where: { resetToken: resetToken },
        });
    
        if (!user) {
            throw new Error("Not Found");
        }

        if (user.utorid !== utorid) {
            throw new Error("Unauthorized");
        }

        if (!user.expiresAt || user.expiresAt.getTime() <= Date.now()) {
            throw new Error("Gone");
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { utorid: utorid},
            data: {
            password: hashedPassword,
            resetToken: null,
            expiresAt: null,
            // activated: true,
            },
        });

    }


}
module.exports = new AuthService();