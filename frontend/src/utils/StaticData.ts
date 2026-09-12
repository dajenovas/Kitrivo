export const UserManagementTableHeaders = [
    'S.no',
    'Employee ID',
    'Full Name',
    'Email',
    'Role',
    'Status',
    'Actions'
];

export const RoleManagementTableHeaders = [
    'S.no',
    'Role Name',
    'Code',
    'Description',
    'Permissions',
    'Actions'
];

export const PermissionManagementTableHeaders = [
    'Icon',
    'Name',
    'Code',
    'Module',
    'Description',
    'Is Menu',
    'Path',
    'Sort Order',
    'Actions'
];

export const PaymentMethods = [
    { id: "ALL", label: "All Payment Methods" },
    { id: "RAZORPAY", label: "Razorpay" },
    { id: "CREDIT_CARD", label: "Credit / Debit Card" },
    { id: "BANK_TRANSFER", label: "Bank Transfer / NEFT" },
    { id: "DIRECT", label: "Direct Checkout" },
]