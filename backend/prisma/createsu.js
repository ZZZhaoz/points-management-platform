/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const {RoleType} = require("@prisma/client");
const prisma = new PrismaClient();



async function main() {
  
    // Parse the arguments and check if they are valid

    const args = process.argv.slice(2);
    const argc = args.length

    if (argc !== 3) {
    console.error(
        `Invalid number of arguments!!
    Expected: node prisma/createsu.js <utorid> <email> <password>
    Received: ${process.argv.join(' ')}`
    );
    process.exit(1);
    }

  const [utorid, email, password] = args;

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the superuser
  const superuser = await prisma.user.create({
    data: {
      utorid: utorid,
      email: email,
      name: "chenpan",
      password: hashedPassword,
      role: RoleType.superuser,
      verified: true,
      student: true,
      activated: true
    },
  });
  
}


main()
  .catch((e) => {
    console.error('Cannot create the superuser', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })