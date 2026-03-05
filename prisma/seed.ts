import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const randomDate = (offsetHours: number) =>
  new Date(Date.now() - offsetHours * 60 * 60 * 1000);

async function main() {
  const users = [];

  for (let i = 0; i < 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        name: `User ${i}`,
        posts: {
          create: Array.from({ length: 5 }, (_, postIdx) => ({
            title: `Post ${postIdx} by user ${i}`,
            content: `Content for post ${postIdx}`,
            published: postIdx % 2 === 0,
            createdAt: randomDate(i * 5 + postIdx),
            updatedAt: randomDate(i * 5 + postIdx - 1),
            comments: {
              create: Array.from({ length: 3 }, (_, commentIdx) => ({
                content: `Comment ${commentIdx}`,
                createdAt: randomDate(i * 5 + postIdx + commentIdx),
                updatedAt: randomDate(i * 5 + postIdx + commentIdx - 1),
              })),
            },
          })),
        },
      },
    });

    users.push(user);
  }

  console.log("seeded", users.length, "users");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());