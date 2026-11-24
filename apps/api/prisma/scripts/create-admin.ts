import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../../src/lib/database/prisma";

async function main() {
  const username = process.env.INITIAL_ADMIN_USERNAME;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const email = process.env.INITIAL_ADMIN_EMAIL;

  if (!username || !password) {
    throw new Error(
      "INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD are required"
    );
  }

  if (password.length < 8) {
    throw new Error(
      "Administrator password must be at least 16 characters"
    );
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (!adminRole) {
    throw new Error(
      "ADMIN role not found. Seed roles first."
    );
  }

  const existingAdmin = await prisma.user.findFirst({
    where: {
      roles: {
        some: {
          roleId: adminRole.id,
        },
      },
    },
  });

  if (existingAdmin) {
    throw new Error(
      "An administrator already exists. Use Access Control to manage users."
    );
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        ...(email ? [{ email }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new Error("Username or email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        name: "System Administrator",
        username,
        email: email || null,
        password: passwordHash,
        isActive: true,
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
    });
  });

  console.log("Initial administrator created successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });