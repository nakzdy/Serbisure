// Mock data for Active Requests, Top Rated Workers, and Notifications

export const activeRequests = [
    {
        id: 1,
        title: "Pipe Repair",
        category: "Plumbing",
        priority: "Emergency",
        date: "Today, 2:00 PM",
        estimatedCost: "₱85",
        status: "pending-approval",
        statusLabel: "Pending Approval",
        image: "/pipe_repair.png",
        worker: {
            name: "Marcus J.",
            avatar: "fa-solid fa-user",
            rating: 4.9,
            reviews: 120,
        },
    },
    {
        id: 2,
        title: "Fixture Installation",
        category: "Electrical",
        priority: "Standard",
        date: "Tomorrow, 10:00 AM",
        estimatedCost: "₱120",
        status: "pending-worker",
        statusLabel: "Pending Worker",
        image: "/fixture_installation.png",
        worker: null,
        searching: true,
        searchingText: "Searching for top-rated electricians...",
    },
    {
        id: 3,
        title: "Deep Cleaning",
        category: "Cleaning",
        priority: "Home",
        date: "Oct 24, 9:00 AM",
        estimatedCost: "₱150",
        status: "awaiting-confirmation",
        statusLabel: "Awaiting Confirmation",
        image: "/deep_cleaning.png",
        worker: {
            name: "Sarah L.",
            avatar: "fa-solid fa-user",
            rating: 4.8,
            reviews: 85,
        },
    },
];

export const topRatedWorkers = [
    {
        id: 1,
        name: "James Wilson",
        specialty: "HVAC Specialist",
        rating: 5.0,
        reliability: "96% Reliability",
        verified: true,
        avatar: "fa-solid fa-user-gear",
    },
    {
        id: 2,
        name: "Elena Rodriguez",
        specialty: "Interior Designer",
        rating: 4.9,
        reliability: "96% Reliability",
        verified: true,
        avatar: "fa-solid fa-paint-roller",
    },
    {
        id: 3,
        name: "Mike Chen",
        specialty: "General Handyman",
        rating: 4.2,
        reliability: "Below threshold",
        verified: false,
        avatar: "fa-solid fa-user-gear",
        belowThreshold: true,
    },
];

export const dashboardNotifications = [
    {
        id: 1,
        title: "Booking Updated",
        message: "Marcus J. accepted your request for Pipe Repair.",
        time: "2 minutes ago",
        unread: true,
    },
    {
        id: 2,
        title: "Payment Receipt",
        message: "Invoice #4023 paid successfully.",
        time: "Yesterday",
        unread: false,
    },
    {
        id: 3,
        title: "System Update",
        message: "Maintenance scheduled for Nov 1st.",
        time: "2 days ago",
        unread: false,
    },
];

export const workerStats = {
    totalEarnings: "₱2,450",
    completedJobs: 42,
    rating: 4.9,
    reliability: "98%",
    activeJobs: 3
};

export const incomingJobs = [
    {
        id: 101,
        title: "Kitchen Sink Leak",
        category: "Plumbing",
        priority: "High",
        customer: "Sarah Johnson",
        location: "Quezon City",
        estimatedPay: "₱65",
        time: "Requested 15m ago",
        status: "pending"
    },
    {
        id: 102,
        title: "Garden Lighting Sync",
        category: "Electrical",
        priority: "Medium",
        customer: "Robert Lim",
        location: "Makati City",
        estimatedPay: "₱120",
        time: "Requested 1h ago",
        status: "pending"
    }
];
