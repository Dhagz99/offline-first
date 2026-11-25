import "dotenv/config";

import bcrypt from "bcrypt";
import { z } from "zod";

import { prisma } from "../../src/lib/database/prisma";

const initialAdminSchema = z.object({
    username: z.string().trim().min(3).max(100),

    password: z.string()
        .min(16, "Administrator password must be at least 16 characters")
        .refine(
            (password) => Buffer.byteLength(password, "utf8") <= 72,
            "Password must not exceed 72 bytes when using bcrypt"
        ),

    email: z.email().max(191).optional(),
});

async function main() {
    // ==========================================
    // CENTRAL-ONLY PROTECTION
    // ==========================================

    if (process.env.APP_MODE !== "CENTRAL") {
        throw new Error(
            "Initial administrator creation is only allowed in CENTRAL mode."
        );
    }

    // ==========================================
    // VALIDATE ENVIRONMENT VARIABLES
    // ==========================================

    const { username, password, email } =
        initialAdminSchema.parse({
            username: process.env.INITIAL_ADMIN_USERNAME,
            password: process.env.INITIAL_ADMIN_PASSWORD,
            email: process.env.INITIAL_ADMIN_EMAIL || undefined,
        });

    console.log("========================================");
    console.log("Creating Initial Administrator");
    console.log("Application Mode: CENTRAL");
    console.log("========================================");

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const passwordHash = await bcrypt.hash(password, 12);

    // ==========================================
    // CREATE ADMINISTRATOR
    // ==========================================

    const administrator = await prisma.$transaction(
        async (tx) => {
            const adminRole = await tx.role.findUnique({
                where: {
                    name: "ADMIN",
                },
            });

            if (!adminRole) {
                throw new Error(
                    "ADMIN role not found. Seed roles first."
                );
            }

            // Prevent duplicate initial administrators.
            const existingAdmin = await tx.user.findFirst({
                where: {
                    roles: {
                        some: {
                            roleId: adminRole.id,
                        },
                    },
                },
                select: {
                    id: true,
                },
            });

            if (existingAdmin) {
                throw new Error(
                    "An administrator already exists. Use Access Control to manage users."
                );
            }

            // Check username and email uniqueness.
            const existingUser = await tx.user.findFirst({
                where: {
                    OR: [
                        { username },
                        ...(email ? [{ email }] : []),
                    ],
                },
                select: {
                    id: true,
                },
            });

            if (existingUser) {
                throw new Error(
                    "Username or email already exists."
                );
            }

            // Create administrator and assign ADMIN role.
            return tx.user.create({
                data: {
                    name: "System Administrator",
                    username,
                    email: email ?? null,
                    password: passwordHash,
                    isActive: true,

                    roles: {
                        create: {
                            roleId: adminRole.id,
                        },
                    },
                },

                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    isActive: true,

                    roles: {
                        select: {
                            role: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
            });
        },
        {
            isolationLevel: "Serializable",
            maxWait: 10000,
            timeout: 30000,
        }
    );

    // ==========================================
    // DISPLAY RESULT
    // ==========================================

    console.log("========================================");
    console.log("Administrator created successfully");
    console.log("========================================");

    console.table({
        id: administrator.id,
        name: administrator.name,
        username: administrator.username,
        email: administrator.email,
        role: administrator.roles
            .map((item) => item.role.name)
            .join(", "),
        isActive: administrator.isActive,
    });
}

main()
    .catch((error) => {
        console.error(
            "Administrator creation failed:",
            error instanceof Error
                ? error.message
                : "Unknown error"
        );

        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });