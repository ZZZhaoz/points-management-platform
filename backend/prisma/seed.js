'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
function randomCreatedAt() {
  const dice = Math.random();

  if (dice < 0.3) {
    const daysAgo = Math.floor(Math.random() * 7); 
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);

    d.setHours(Math.floor(Math.random() * 24));
    d.setMinutes(Math.floor(Math.random() * 60));
    d.setSeconds(Math.floor(Math.random() * 60));
    return d;
  }

  const daysAgo = Math.floor(Math.random() * 90);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);

  d.setHours(Math.floor(Math.random() * 24));
  d.setMinutes(Math.floor(Math.random() * 60));
  d.setSeconds(Math.floor(Math.random() * 60));
  return d;
}

async function main() {
  console.log("Seeding database...");

  // ----------------------------------------
  // 1. USERS (Password hashed)
  // ----------------------------------------
  const baseUsers = [
    { utorid: "alice1", name: "Alice Zhang", email: "alice@mail.utoronto.ca", role: "regular", verified: true, student: true, points: 200 },
    { utorid: "bob2", name: "Bob Li", email: "bob@mail.utoronto.ca", role: "regular", verified: false, student: true, points: 150 },
    { utorid: "charlie3", name: "Charlie Kim", email: "charlie@mail.utoronto.ca", role: "regular", verified: true, student: true, points: 50 },
    { utorid: "cashier01", name: "Cashier One", email: "cashier1@mail.utoronto.ca", role: "cashier", verified: true, student: false, points: 100 },
    { utorid: "manager01", name: "Manager One", email: "manager1@mail.utoronto.ca", role: "manager", verified: true, student: false, points: 300 },
    { utorid: "super01", name: "Super User", email: "superuser@mail.utoronto.ca", role: "superuser", verified: true, student: false, points: 300 },
    { utorid: "david4", name: "David Tan", email: "david@mail.utoronto.ca", role: "regular", verified: false, student: true, points: 80 },
    { utorid: "ella5", name: "Ella Smith", email: "ella@mail.utoronto.ca", role: "regular", verified: true, student: false, points: 300 },
    { utorid: "frank6", name: "Frank Lee", email: "frank@mail.utoronto.ca", role: "regular", verified: false, student: true, points: 0 },
    { utorid: "george7", name: "George Wu", email: "george@mail.utoronto.ca", role: "regular", verified: true, student: false, points: 120 },
    { utorid: "zhaoz188", name: "Jason Zhao", email: "zzhao.zhao@mail.utoronto.ca", role: "regular", verified: true, student: false, points: 120 }
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
      endTime: new Date(Date.now() + 360000000),
      location: "UofT Front Campus",
      description: "Welcome to UofT!",
      capacity: 100,
      numGuests: 3,
      pointsRemain: 500,
      pointsAwarded: 10,
      published: true
    },
    {
      name: "Career Workshop",
      startTime: new Date(),
      endTime: new Date(Date.now() + 720000000),
      location: "BA 1130",
      description: "Resume workshop",
      capacity: 50,
      numGuests: 2,
      pointsRemain: 300,
      pointsAwarded: 20,
      published: true
    },
    {
      name: "Coding Night",
      startTime: new Date(),
      endTime: new Date(Date.now() + 540000000),
      location: "BA 2220",
      description: "Leetcode practice",
      capacity: 80,
      numGuests: 4,
      pointsRemain: 400,
      pointsAwarded: 30,
      published: true
    },
    {
      name: "Networking Session",
      startTime: new Date(Date.now() + 3600000),
      endTime: new Date(Date.now() + 360000000),
      location: "SS 2135",
      description: "Meet recruiters",
      capacity: 60,
      numGuests: 1,
      pointsRemain: 600,
      pointsAwarded: 15,
      published: true
    },
    {
      name: "AI Seminar",
      startTime: new Date(),
      endTime: new Date(Date.now() + 1800000000),
      location: "BA 1200",
      description: "Introduction to LLMs",
      capacity: 120,
      numGuests: 5,
      pointsRemain: 200,
      pointsAwarded: 25,
      published: true
    },

    {
    name: "Tech Career Fair",
    startTime: new Date(Date.now() + 86400000 * 2),
    endTime: new Date(Date.now() + 86400000 * 2 + 7200000),
    location: "Myhal Lobby",
    description: "Meet recruiters from top tech companies.",
    capacity: 300,
    numGuests: 12,
    pointsRemain: 800,
    pointsAwarded: 50,
    published: true
  },
  {
    name: "Frontend Workshop",
    startTime: new Date(Date.now() + 86400000 * 5),
    endTime: new Date(Date.now() + 86400000 * 5 + 5400000),
    location: "IC 2200",
    description: "React + Tailwind live coding session.",
    capacity: 80,
    numGuests: 10,
    pointsRemain: 400,
    pointsAwarded: 30,
    published: true
  },
  {
    name: "Hackathon Kickoff",
    startTime: new Date(Date.now() + 86400000 * 1),
    endTime: new Date(Date.now() + 86400000 * 1 + 10800000),
    location: "BA 1130",
    description: "Start your 24-hour coding marathon!",
    capacity: 150,
    numGuests: 20,
    pointsRemain: 1000,
    pointsAwarded: 100,
    published: true
  },

    {
    name: "Quantum Computing Talk",
    startTime: new Date(Date.now() - 86400000 * 5),
    endTime: new Date(Date.now() - 86400000 * 5 + 7200000),
    location: "BA 2155",
    description: "Intro to quantum circuits.",
    capacity: 100,
    numGuests: 55,
    pointsRemain: 0,
    pointsAwarded: 300,
    published: true
  },
  {
    name: "Resume Clinic",
    startTime: new Date(Date.now() - 86400000 * 10),
    endTime: new Date(Date.now() - 86400000 * 10 + 3600000),
    location: "SS 1088",
    description: "One-on-one resume review session.",
    capacity: 60,
    numGuests: 40,
    pointsRemain: 0,
    pointsAwarded: 200,
    published: true
  },
  {
    name: "Python Crash Course",
    startTime: new Date(Date.now() - 86400000 * 15),
    endTime: new Date(Date.now() - 86400000 * 15 + 5400000),
    location: "BA 3008",
    description: "Introduction to Python for beginners.",
    capacity: 120,
    numGuests: 100,
    pointsRemain: 0,
    pointsAwarded: 350,
    published: true
    }, 
    {
    name: "Machine Learning Bootcamp",
    startTime: new Date(Date.now() + 86400000 * 3),
    endTime: new Date(Date.now() + 86400000 * 3 + 3 * 3600000),
    location: "Myhal 370",
    description: "Hands-on introduction to ML models and tools.",
    capacity: 150,
    numGuests: 30,
    pointsRemain: 700,
    pointsAwarded: 120,
    published: true
  },
  {
    name: "Entrepreneurship Talk",
    startTime: new Date(Date.now() + 86400000 * 7),
    endTime: new Date(Date.now() + 86400000 * 7 + 2 * 3600000),
    location: "SS 1088",
    description: "Learn how to build products and pitch to investors.",
    capacity: 200,
    numGuests: 15,
    pointsRemain: 500,
    pointsAwarded: 80,
    published: true
  },
  {
    name: "Cloud Computing Workshop",
    startTime: new Date(Date.now() + 86400000 * 12),
    endTime: new Date(Date.now() + 86400000 * 12 + 2 * 3600000),
    location: "BA 3175",
    description: "AWS + GCP intro with hands-on labs.",
    capacity: 100,
    numGuests: 45,
    pointsRemain: 900,
    pointsAwarded: 150,
    published: true
  },
  {
    name: "Startup Networking Night",
    startTime: new Date(Date.now() + 86400000 * 15),
    endTime: new Date(Date.now() + 86400000 * 15 + 3 * 3600000),
    location: "Innov8 Hub",
    description: "Meet founders and discuss startup opportunities.",
    capacity: 120,
    numGuests: 60,
    pointsRemain: 600,
    pointsAwarded: 170,
    published: true
  },
  {
    name: "Cybersecurity Crash Course",
    startTime: new Date(Date.now() + 86400000 * 18),
    endTime: new Date(Date.now() + 86400000 * 18 + 2 * 3600000),
    location: "BA 1200",
    description: "Introduction to ethical hacking and system security.",
    capacity: 80,
    numGuests: 40,
    pointsRemain: 400,
    pointsAwarded: 90,
    published: true
  },
  {
    name: "Robotics Expo",
    startTime: new Date(Date.now() + 86400000 * 22),
    endTime: new Date(Date.now() + 86400000 * 22 + 4 * 3600000),
    location: "Myhal Atrium",
    description: "Experience demos from the Robotics Institute.",
    capacity: 200,
    numGuests: 120,
    pointsRemain: 1000,
    pointsAwarded: 200,
    published: true
  },
  {
    name: "SWE Career Panel",
    startTime: new Date(Date.now() + 86400000 * 28),
    endTime: new Date(Date.now() + 86400000 * 28 + 2 * 3600000),
    location: "BA 1130",
    description: "Engineers from industry share interview tips and career paths.",
    capacity: 180,
    numGuests: 70,
    pointsRemain: 500,
    pointsAwarded: 140,
    published: true
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
        guests: { connect: [] }
      }
    });
  }

  // ----------------------------------------
  // 4. RANDOMLY ASSIGN GUESTS TO EVENTS
  // ----------------------------------------
  events = await prisma.event.findMany();

  for (const event of events) {

    const num = Math.floor(Math.random() * 8) + 3;  
    
    const shuffled = regularUsers.sort(() => 0.5 - Math.random());
    const selectedGuests = shuffled.slice(0, num);

    await prisma.event.update({
      where: { id: event.id },
      data: {
        organizers: {
          connect: [
            { id: manager.id },
            { id: superuser.id }
          ]
        },
        guests: {
          connect: selectedGuests.map(u => ({ id: u.id }))
        },
        numGuests: num
      }
    });
  }

  console.log("✓ Random guests assigned to events");

  // ----------------------------------------
  // 4. TRANSACTIONS (same logic)
  // ----------------------------------------
  const txTypes = ["purchase", "redemption", "adjustment", "event", "transfer"];
  const transactions = [];

  const updatedEvents = await prisma.event.findMany();

  for (let i = 0; i < 150; i++) {
    const type = txTypes[i % txTypes.length];
    const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
    const receiver = regularUsers[(i + 1) % regularUsers.length];
    const event = updatedEvents[i % updatedEvents.length];

    const createdAt = randomCreatedAt();


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
      suspicious: false,
      createdAt
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
