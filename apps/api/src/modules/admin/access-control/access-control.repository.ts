import { prisma } from "@/lib/database/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import { AppError } from "@/errors/app-error";
import { ErrorCodes } from "@/errors/error-codes";

export const userSelect = {
    id: true,
    username: true,
    name: true,
    email: true,
    isActive: true,
    createdAt: true,

    roles: {
        select: {
            role: {
                select: {
                    id: true,
                    name: true,
                    description: true,

                    permissions: {
                        select: {
                            permission: {
                                select: {
                                    id: true,
                                    code: true,
                                    name: true,
                                    description: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    },

    branches: {
        select: {
            branch: {
                select: {
                    id: true,
                    branchCode: true,
                    branchName: true,
                    isActive: true,
                },
            },
        },
    },
} satisfies Prisma.UserSelect;

export type SelectedUser = Prisma.UserGetPayload<{
    select: typeof userSelect;
}>;

async function validateRoleIds(
    tx: Prisma.TransactionClient,
    roleIds: string[]
) {
    const uniqueRoleIds = [...new Set(roleIds)];

    if (uniqueRoleIds.length === 0) {
        throw new AppError(
            "Select at least one role",
            400,
            ErrorCodes.INVALID_ROLE_IDS
        );
    }

    const roles = await tx.role.findMany({
        where: {
            id: {
                in: uniqueRoleIds,
            },
        },

        select: {
            id: true,
        },
    });

    if (roles.length !== uniqueRoleIds.length) {
        throw new AppError(
            "One or more role IDs are invalid",
            400,
            ErrorCodes.INVALID_ROLE_IDS
        );
    }

    return uniqueRoleIds;
}

async function validateBranchIds(
    tx: Prisma.TransactionClient,
    branchIds: string[]
) {
    const uniqueBranchIds = [...new Set(branchIds)];

    if (uniqueBranchIds.length === 0) {
        return [];
    }

    const branches = await tx.branch.findMany({
        where: {
            id: {
                in: uniqueBranchIds,
            },

            isActive: true,
        },

        select: {
            id: true,
        },
    });

    if (branches.length !== uniqueBranchIds.length) {
        throw new AppError(
            "One or more branches are invalid or inactive",
            400,
            ErrorCodes.INVALID_BRANCH_IDS
        );
    }

    return uniqueBranchIds;
}

type FindAllUsersParams = {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sort?: string;
    branchId?: string;
};

export async function findAllUsers(
    params: FindAllUsersParams
) {
    const {
        page = 1,
        limit = 10,
        search,
        role,
        status,
        sort,
        branchId,
    } = params;

    const where: Prisma.UserWhereInput = {};

    if (search?.trim()) {
        where.OR = [
            {
                name: {
                    contains: search.trim(),
                    mode: "insensitive",
                },
            },
            {
                username: {
                    contains: search.trim(),
                    mode: "insensitive",
                },
            },
            {
                email: {
                    contains: search.trim(),
                    mode: "insensitive",
                },
            },
        ];
    }

    if (status && status !== "all") {
        where.isActive = status === "active";
    }

    if (role && role !== "all") {
        where.roles = {
            some: {
                role: {
                    name: role,
                },
            },
        };
    }

    if (branchId) {
        where.branches = {
            some: {
                branchId,
            },
        };
    }

    let orderBy: Prisma.UserOrderByWithRelationInput = {
        username: "asc",
    };

    switch (sort) {
        case "name_asc":
            orderBy = { name: "asc" };
            break;

        case "name_desc":
            orderBy = { name: "desc" };
            break;

        case "username_asc":
            orderBy = { username: "asc" };
            break;

        case "username_desc":
            orderBy = { username: "desc" };
            break;

        case "date_desc":
            orderBy = { createdAt: "desc" };
            break;

        case "date_asc":
            orderBy = { createdAt: "asc" };
            break;
    }

    const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
            where,

            select: userSelect,

            skip: (page - 1) * limit,
            take: limit,

            orderBy: [
                orderBy,
                { id: "asc" },
            ],
        }),

        prisma.user.count({
            where,
        }),
    ]);

    return {
        data: users,

        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function findAllPermissions() {
    return prisma.permission.findMany({
        select: {
            id: true,
            code: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function findUserById(userId: string) {
    return prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
}

export async function findRoleById(roleId: string) {
    return prisma.role.findUnique({
        where: {
            id: roleId,
        },
    });
}

export async function findDuplicateUser(
    username: string,
    email?: string | null,
    excludeUserId?: string
) {
    return prisma.user.findFirst({
        where: {
            ...(excludeUserId && {
                id: {
                    not: excludeUserId,
                },
            }),

            OR: [
                { username },
                ...(email ? [{ email }] : []),
            ],
        },
    });
}

export async function createUser(data: {
    name: string;
    username: string;
    email?: string | null;
    password: string;
    roleIds: string[];
    branchIds: string[];
}) {
    return prisma.$transaction(async (tx) => {
        const roleIds = await validateRoleIds(
            tx,
            data.roleIds
        );

        const branchIds = await validateBranchIds(
            tx,
            data.branchIds
        );

        const user = await tx.user.create({
            data: {
                name: data.name,
                username: data.username,
                email: data.email ?? null,
                password: data.password,
                isActive: true,
            },

            select: {
                id: true,
            },
        });

        /* =====================
           ASSIGN ROLES
        ===================== */

        await tx.userRole.createMany({
            data: roleIds.map((roleId) => ({
                userId: user.id,
                roleId,
            })),
        });

        /* =====================
           ASSIGN BRANCHES
        ===================== */

        if (branchIds.length > 0) {
            await tx.userBranch.createMany({
                data: branchIds.map((branchId) => ({
                    userId: user.id,
                    branchId,
                })),
            });
        }

        /* =====================
           RETURN SAFE RESPONSE
        ===================== */

        return tx.user.findUniqueOrThrow({
            where: {
                id: user.id,
            },

            select: userSelect,
        });
    });
}

export async function updateUser(
    userId: string,
    data: {
        name?: string;
        username?: string;
        email?: string | null;
        password?: string;
        isActive?: boolean;
        roleIds?: string[];
        branchIds?: string[];
    }
) {
    return prisma.$transaction(async (tx) => {
        const roleIds =
            data.roleIds !== undefined
                ? await validateRoleIds(tx, data.roleIds)
                : undefined;

        const branchIds =
            data.branchIds !== undefined
                ? await validateBranchIds(tx, data.branchIds)
                : undefined;

        /* =====================
           UPDATE USER
        ===================== */

        await tx.user.update({
            where: {
                id: userId,
            },

            data: {
                ...(data.name !== undefined && {
                    name: data.name,
                }),

                ...(data.username !== undefined && {
                    username: data.username,
                }),

                ...(data.email !== undefined && {
                    email: data.email,
                }),

                ...(data.password !== undefined && {
                    password: data.password,
                }),

                ...(data.isActive !== undefined && {
                    isActive: data.isActive,
                }),
            },

            select: {
                id: true,
            },
        });

        /* =====================
           UPDATE ROLES
        ===================== */

        if (roleIds !== undefined) {
            await tx.userRole.deleteMany({
                where: {
                    userId,

                    roleId: {
                        notIn: roleIds,
                    },
                },
            });

            await tx.userRole.createMany({
                data: roleIds.map((roleId) => ({
                    userId,
                    roleId,
                })),

                skipDuplicates: true,
            });
        }

        /* =====================
           UPDATE BRANCHES
        ===================== */

        if (branchIds !== undefined) {
            if (branchIds.length === 0) {
                await tx.userBranch.deleteMany({
                    where: {
                        userId,
                    },
                });
            } else {
                await tx.userBranch.deleteMany({
                    where: {
                        userId,

                        branchId: {
                            notIn: branchIds,
                        },
                    },
                });

                await tx.userBranch.createMany({
                    data: branchIds.map((branchId) => ({
                        userId,
                        branchId,
                    })),

                    skipDuplicates: true,
                });
            }
        }

        /* =====================
           RETURN UPDATED USER
        ===================== */

        return tx.user.findUniqueOrThrow({
            where: {
                id: userId,
            },

            select: userSelect,
        });
    });
}

export const deleteUser = async (userId: string) => {
    return prisma.user.delete({
        where: {
            id: userId,
        },
    });
};

export async function createRole(data: {
    name: string;
    description?: string | null;
}) {
    return prisma.role.create({
        data,
    });
}

export async function updateRole(
    roleId: string,
    data: {
        name?: string;
        description?: string | null;
    }
) {
    return prisma.role.update({
        where: {
            id: roleId,
        },
        data,
    });
}

export async function updateRolePermissions(
    roleId: string,
    permissionIds: string[]
) {
    return prisma.$transaction(async (tx) => {
        const uniquePermissionIds = [
            ...new Set(permissionIds),
        ];

        const permissions = await tx.permission.findMany({
            where: {
                id: {
                    in: uniquePermissionIds,
                },
            },
            select: {
                id: true,
            },
        });

        if (
            permissions.length !==
            uniquePermissionIds.length
        ) {
            throw new AppError(
                "One or more permission IDs are invalid",
                400,
                ErrorCodes.INVALID_PERMISSION_IDS
            );
        }

        await tx.rolePermission.deleteMany({
            where: {
                roleId,
            },
        });

        if (uniquePermissionIds.length > 0) {
            await tx.rolePermission.createMany({
                data: uniquePermissionIds.map(
                    (permissionId) => ({
                        roleId,
                        permissionId,
                    })
                ),
                skipDuplicates: true,
            });
        }

        return tx.rolePermission.findMany({
            where: {
                roleId,
            },
            select: {
                roleId: true,
                permissionId: true,
            },
        });
    });
}

export async function findAllRoles() {
    return prisma.role.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            permissions: {
                select: {
                    permission: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}