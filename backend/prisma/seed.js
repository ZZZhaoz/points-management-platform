'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ----------------------------------------
  // 1. USERS (Password hashed)
  // ----------------------------------------
  const baseUsers = [
    { utorid: "alice1", name: "Alice Zhang", email: "alice@mail.utoronto.ca", role: "regular", verified: true, student: true, points: 200 },
    { utorid: "bob2", name: "Bob Li", email: "bob@mail.utoronto.ca", role: "regular", verified: false, student: true, points: 150 },
    { utorid: "charlie3", name: "Charlie Kim", email: "charlie@mail.utoronto.ca", role: "regular", verified: true, student: true, points: 50 },
    { utorid: "cashier01", name: "Cashier One", email: "cashier1@mail.utoronto.ca", role: "cashier", verified: true, student: false, points: 0 },
    { utorid: "manager01", name: "Manager One", email: "manager1@mail.utoronto.ca", role: "manager", verified: true, student: false, points: 0 },
    { utorid: "super01", name: "Super User", email: "superuser@mail.utoronto.ca", role: "superuser", verified: true, student: false, points: 0 },
    { utorid: "david4", name: "David Tan", email: "david@mail.utoronto.ca", role: "regular", verified: false, student: true, points: 80 },
    { utorid: "ella5", name: "Ella Smith", email: "ella@mail.utoronto.ca", role: "regular", verified: true, student: false, points: 300 },
    { utorid: "frank6", name: "Frank Lee", email: "frank@mail.utoronto.ca", role: "regular", verified: false, student: true, points: 0 },
    { utorid: "george7", name: "George Wu", email: "george@mail.utoronto.ca", role: "regular", verified: true, student: false, points: 120 }
  ];

  const usersData = [];
  for (const u of baseUsers) {
    usersData.push({
      ...u,
      password: await bcrypt.hash("pass", 10)   
    });
  }

  await prisma.user.createMany({ data: usersData });
  console.log("✓ Users created");

  const allUsers = await prisma.user.findMany();
  const regularUsers = allUsers.filter(u => u.role === "regular");
  const cashier = allUsers.find(u => u.role === "cashier");
  const manager = allUsers.find(u => u.role === "manager");
  const superuser = allUsers.find(u => u.role === "superuser");

  // ----------------------------------------
  // 2. PROMOTIONS
  // ----------------------------------------
  const promotionsData = [
    {
      name: "Winter Bonus",
      description: "20% winter bonus",
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000 * 5),
      type: "automatic",
      rate: 0.20
    },
    {
      name: "Welcome Freshmen",
      description: "50 points one-time bonus",
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000 * 30),
      type: "onetime",
      points: 50
    },
    {
      name: "Holiday Deal",
      description: "Spend 100 get 10",
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000 * 10),
      type: "automatic",
      minSpending: 100,
      points: 10
    },
    {
      name: "Weekend Special",
      description: "30pt one-time",
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000 * 2),
      type: "onetime",
      points: 30
    },
    {
      name: "Flash Sale",
      description: "5% bonus",
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000 * 3),
      type: "automatic",
      rate: 0.05
    }
  ];

  await prisma.promotion.createMany({ data: promotionsData });
  console.log("✓ Promotions created");

  const promotions = await prisma.promotion.findMany();

  // ----------------------------------------
  // 3. EVENTS
  // ----------------------------------------
  const eventData = [
    {
      name: "Campus Tour",
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      location: "UofT Front Campus",
      description: "Welcome to UofT!",
      capacity: 100,
      numGuests: 3,
      pointsRemain: 500,
      pointsAwarded: 10
    },
    {
      name: "Career Workshop",
      startTime: new Date(),
      endTime: new Date(Date.now() + 7200000),
      location: "BA 1130",
      description: "Resume workshop",
      capacity: 50,
      numGuests: 2,
      pointsRemain: 300,
      pointsAwarded: 20
    },
    {
      name: "Coding Night",
      startTime: new Date(),
      endTime: new Date(Date.now() + 5400000),
      location: "BA 2220",
      description: "Leetcode practice",
      capacity: 80,
      numGuests: 4,
      pointsRemain: 400,
      pointsAwarded: 30
    },
    {
      name: "Networking Session",
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      location: "SS 2135",
      description: "Meet recruiters",
      capacity: 60,
      numGuests: 1,
      pointsRemain: 600,
      pointsAwarded: 15
    },
    {
      name: "AI Seminar",
      startTime: new Date(),
      endTime: new Date(Date.now() + 1800000),
      location: "BA 1200",
      description: "Introduction to LLMs",
      capacity: 120,
      numGuests: 5,
      pointsRemain: 200,
      pointsAwarded: 25
    }
  ];

  await prisma.event.createMany({ data: eventData });
  console.log("✓ Events created");

  let events = await prisma.event.findMany();

  // Add organizers & guests
  for (const event of events) {
    await prisma.event.update({
      where: { id: event.id },
      data: {
        organizers: { connect: [{ id: manager.id }, { id: superuser.id }] },
        guests: { connect: regularUsers.slice(0, event.numGuests).map(u => ({ id: u.id })) }
      }
    });
  }

  // ----------------------------------------
  // 4. TRANSACTIONS (same logic)
  // ----------------------------------------
  const txTypes = ["purchase", "redemption", "adjustment", "event", "transfer"];
  const transactions = [];

  const updatedEvents = await prisma.event.findMany();

  for (let i = 0; i < 30; i++) {
    const type = txTypes[i % txTypes.length];
    const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
    const receiver = regularUsers[(i + 1) % regularUsers.length];
    const event = updatedEvents[i % updatedEvents.length];

    let amount = 10 + i;
    let spent = null;
    let relatedId = null;
    let awarded = null;

    if (type === "purchase") {
      spent = 5 + i;
    } else if (type === "redemption") {
      amount = -(5 + i);
    } else if (type === "event") {
      relatedId = event.id;
      awarded = event.pointsAwarded;
    } else if (type === "transfer") {
      relatedId = receiver.id;
    } else if (type === "adjustment") {
      amount = i % 2 === 0 ? 10 : -10;
    }

    transactions.push({
      type,
      remark: `Auto transaction ${i}`,
      userId: user.id,
      createdById: cashier.id,
      processedById: manager.id,
      amount,
      spent,
      relatedId,
      awarded,
      processed: true,
      suspicious: false
    });
  }

  await prisma.transaction.createMany({ data: transactions });
  console.log("Transactions created");

  // Connect promotions to purchases
  const allTransactions = await prisma.transaction.findMany();
  for (let i = 0; i < allTransactions.length; i++) {
    const tx = allTransactions[i];
    if (tx.type === "purchase") {
      const p = promotions[i % promotions.length];
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          promotionIds: { connect: [{ id: p.id }] }
        }
      });
    }
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
