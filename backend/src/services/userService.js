const { PrismaClient, RoleType, PromotionType } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

class UserService {

    async createUser({ utorid, name, email }) {
        const emailRegex = /^[A-Za-z0-9._%+-]+@mail\.utoronto\.ca$/;
        const utoridRegex = /^[A-Za-z0-9]{7,8}$/;

        if (!utorid || !name || !email) {
            const msg = "Missing required fields: utorid, name, email";
            const err = new Error(msg);
            err.type = "MISSING_FIELDS";
            throw err;
        }

        if (!utoridRegex.test(utorid)) {
            const err = new Error("Invalid UTORid: must be alphanumeric, 7-8 chars");
            err.type = "INVALID_UTORID";
            throw err;
        }

        if (name.length < 1 || name.length > 50) {
            const err = new Error("Invalid name: must be 1-50 characters");
            err.type = "INVALID_NAME";
            throw err;
        }

        if (!emailRegex.test(email)) {
            const err = new Error("Invalid email: must be a @mail.utoronto.ca address");
            err.type = "INVALID_EMAIL";
            throw err;
        }

        const existingUser = await prisma.user.findUnique({
            where: { utorid }
        });

        if (existingUser) {
            const err = new Error("UTORid already exists");
            err.type = "CONFLICT";
            throw err;
        }

        const resetToken = require("uuid").v4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const newUser = await prisma.user.create({
            data: {
                utorid,
                name,
                email,
                role: RoleType.regular,
                verified: false,
                student: false,
                points: 0,
                createdAt: new Date(),
                resetToken,
                expiresAt,
            }
        });

        return {
            id: newUser.id,
            utorid: newUser.utorid,
            name: newUser.name,
            email: newUser.email,
            verified: newUser.verified,
            expiresAt: newUser.expiresAt,
            resetToken: newUser.resetToken,
        };
    }

    async getAllUsers({ name, role, verified, activated, page, limit }) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        // Check if page and limit are valid positive numbers
        if (page !== undefined && (isNaN(pageNum) || pageNum < 1)) {
            throw new Error('Bad Request');
        }
        if (limit !== undefined && (isNaN(limitNum) || limitNum < 1)) {
            throw new Error('Bad Request');
        }
        
        const whereClause = {};
        if (name) {
            whereClause.name = {
                contains: name,
            };
        }
        if (role !== undefined) whereClause.role = role;
        if (verified !== undefined) whereClause.verified = verified;
        if (activated !== undefined) whereClause.activated = activated;
    
        const [users, count] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    utorid: true,
                    name: true,
                    email: true,
                    birthday: true,
                    role: true,
                    points: true,
                    createdAt: true,
                    lastLogin: true,
                    verified: true,
                    avatarUrl: true,
                },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            }),
            prisma.user.count({ where: whereClause }),
        ]);
    
        return {
            count,      
            results: users,
        };
    }

    async getUser(userId, userRole) {
        // const userRole = req.user.role;
        if ("cashier" === userRole) {
            // const userId = parseInt(req.params.userId, 10);
            // if (isNaN(userId)) {
            //     return res.status(400).json({ 'error': 'Bad Request' });
            // }

            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    utorid: true,
                    name: true,
                    points: true,
                    verified: true,
                    promotions: {
                        where: {
                            type: PromotionType.onetime,
                            startTime: {
                                lte: new Date(),
                            },
                            endTime: {
                                gte: new Date(),
                            }
                        }
                    }
                }
            });

            // if (!user) {
            //     return res.status(404).json({ error: 'User not found' });
            // }

            return user;
        }
        else {
            // const userId = parseInt(req.params.userId, 10);
            // if (isNaN(userId)) {
            //     return res.status(400).json({ 'error': 'Bad Request' });
            // }

            const user = await prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    utorid: true,
                    name: true,
                    email: true,
                    birthday: true,
                    role: true,
                    points: true,
                    createdAt: true,
                    lastLogin: true,
                    verified: true,
                    avatarUrl: true,
                    promotions: true,
                }
            });

            // if (!user) {
            //     return res.status(404).json({ error: 'User not found' });
            // }

            return user;
        }
    }

    async updateUser(userId, userRole, { email, verified, suspicious, role }) {
        const data = Object.fromEntries(
        Object.entries({ email, verified, suspicious, role })
            .map(([k, v]) => [k, v === null ? undefined : v])
            .filter(([_, value]) => value !== undefined)
        );


        if (Object.keys(data).length === 0) {
            throw new Error('Bad Request');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('Not Found');
        }
        
        if (data.verified !== undefined && data.verified !== true) {
            throw new Error('Bad Request');
        }

        if (data.email &&
            !/^[A-Za-z0-9._%+-]+@mail\.utoronto\.ca$/.test(data.email)) {
            throw new Error("Bad Request");
        }

        if (data.role && typeof data.role === 'string') {
            data.role = RoleType[data.role];
            if (!data.role) {
                throw new Error('Bad Request');
            }
        }

        if (data.role && typeof data.role === 'string') {
            data.role = RoleType[data.role];
        }

        if (data.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email }
            });
            
            if (existingUser && existingUser.id !== userId) {
                throw new Error('Conflict');
            }
        }

        if (data.role === RoleType.cashier && user.suspicious) {
            throw new Error('Forbidden');
        }

        if (userRole === RoleType.manager && data.role) {
            if (![RoleType.cashier, RoleType.regular].includes(data.role)) {
                throw new Error('Forbidden');
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: data,
        });

        const response = {
            id: updatedUser.id,
            utorid: updatedUser.utorid,
            name: updatedUser.name,
        };

        ["email", "verified", "suspicious", "role"].forEach((key) => {
            if (data[key] !== undefined) response[key] = updatedUser[key];
        });

        return response;
    }


    async getCurrentUser(userId){

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                utorid: true,
                name: true,
                email: true,
                birthday: true,
                role: true,
                points: true,
                createdAt: true,
                lastLogin: true,
                verified: true,
                avatarUrl: true,
                promotions: true
            },
        });

        if (!user) {
            throw new Error('Not Found');
        }

        const organizerOfEvents = await prisma.event.findFirst({
            where: {
                organizers: {
                    some: { id: userId }
                }
            }
        });

        const isOrganizer = organizerOfEvents !== null;

        return {
            ...user,
            isOrganizer   
        };
    }


    async updatePassword(userId, body) {

 

        const { old: oldPassword, new: newPassword } = body || {};


        if (!oldPassword || !newPassword) {
            throw new Error("Bad Request");
        }

        if (!passwordRegex.test(newPassword)) {
            throw new Error("Bad Request");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error("Forbidden");
        }

        const valid =
            user.password === oldPassword ||
            (await bcrypt.compare(oldPassword, user.password));

        if (!valid) {
            throw new Error("Forbidden");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }




    async updateInfo(userId, body, file) {


        const { name, email, birthday, avatar } = body || {};
        const avatarPath = file
        ? `/uploads/${file.filename}` 
        : undefined;




        if ((!name || name === "null"|| name === null) 
            && (!email || email === "null" || email === null)
            && (!birthday || birthday === "null" || birthday === null) 
            && !avatarPath && (!avatar || avatar === "null"|| avatar === null)){
            throw new Error("Bad Request");
        }

  

        const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) throw new Error("Not Found");


        const data = {};

        if (name){ 
            data.name = name;}

        if (email) {
            data.email = email;}

        if (birthday){
            data.birthday = birthday};

        if (avatarPath){
             data.avatarUrl = avatarPath;};


        

        if (name != null && email != "null" && data.name && (data.name.length < 1 || data.name.length > 50)) {
            throw new Error("Bad Request");
        }




        if (
            email != null && email != "null" && data.email && data.email !== null && data.email !== "null" &&
            !/^[A-Za-z0-9._%+-]+@mail\.utoronto\.ca$/.test(data.email)
        ) {
            throw new Error("Bad Request");
        }


        
        if (birthday != null && birthday != "null" && data.birthday) {

            if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(data.birthday)) {
                throw new Error("Bad Request");
            }

            const d = new Date(data.birthday);

            if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== data.birthday) {
                throw new Error("Bad Request");
            }

                data.birthday = d;

            }


        for (const key in data) {
            if (data[key] == null || data[key] === "null") {
                delete data[key];
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
        });



        return {
            id: updatedUser.id,
            utorid: updatedUser.utorid,
            name: updatedUser.name,
            email: updatedUser.email,
            birthday: updatedUser.birthday 
            ? updatedUser.birthday.toISOString().slice(0, 10)
            : null,
            role: updatedUser.role,
            points: updatedUser.points,
            createdAt: updatedUser.createdAt,
            lastLogin: updatedUser.lastLogin,
            verified: updatedUser.verified,
            avatarUrl: updatedUser.avatarUrl, 
        };
        }

    async getUserByUtorid(utorid) {
        return await prisma.user.findUnique({
            where: { utorid }
        });
    }


}
module.exports = new UserService();