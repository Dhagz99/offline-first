export interface Branch {
    id: string;

    branchCode: string;

    branchName: string;

    address: string | null;

    isActive: boolean;

    createdAt: string;

    updatedAt: string;

    _count?: {
        users: number;
    };
}

export interface BranchSummary {
    totalBranches: number;

    activeBranches: number;

    inactiveBranches: number;
}

export interface BranchOption {
    id: string;

    branchCode: string;

    branchName: string;
}