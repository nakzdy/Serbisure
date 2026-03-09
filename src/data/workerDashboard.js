export const workerStats = {
    profileViews: 124,
    rating: 4.9,
    jobsCompleted: 34,
    responseRate: "98%",
};

export const incomingRequests = [
    {
        id: 101,
        homeowner: {
            name: "Alex Martinez",
            avatar: "fa-solid fa-user",
            location: "123 Maple St, QC",
        },
        title: "Pipe Leak Repair",
        category: "Plumbing",
        priority: "Emergency",
        date: "Today, 2:00 PM",

        distance: "2.4 km away",
        status: "pending",
    },
    {
        id: 102,
        homeowner: {
            name: "Sarah Lim",
            avatar: "fa-solid fa-user",
            location: "45 Oak Drive, Makati",
        },
        title: "Ceiling Fan Installation",
        category: "Electrical",
        priority: "Standard",
        date: "Tomorrow, 10:00 AM",

        distance: "5.1 km away",
        status: "pending",
    },
    {
        id: 104,
        homeowner: {
            name: "Liza Soberano",
            avatar: "fa-solid fa-user",
            location: "Boracay St, QC",
        },
        title: "Overnight Babysitting",
        category: "Babysitting",
        priority: "Standard",
        date: "Today, 6:00 PM",
        distance: "3.2 km away",
        status: "pending",
    },
    {
        id: 105,
        homeowner: {
            name: "Roberto G.",
            avatar: "fa-solid fa-user",
            location: "Don Antonio, QC",
        },
        title: "Kitchen Cabinet Repair",
        category: "Carpentry",
        priority: "Standard",
        date: "Tomorrow, 9:00 AM",
        distance: "4.5 km away",
        status: "pending",
    },
];

export const activeJobs = [
    {
        id: 103,
        homeowner: {
            name: "Miguel Santos",
            avatar: "fa-solid fa-user",
            location: "78 Pine Ave, Pasig",
        },
        title: "Deep House Cleaning",
        category: "Cleaning",
        priority: "Standard",
        date: "Oct 24, 9:00 AM",

        status: "in-progress",
    },
    {
        id: 106,
        homeowner: {
            name: "Elena R.",
            avatar: "fa-solid fa-user",
            location: "Katipunan, QC",
        },
        title: "Custom Bookshelf Build",
        category: "Carpentry",
        priority: "High",
        date: "In Progress",
        status: "in-progress",
    },
];

export const reviews = [
    {
        id: 1,
        author: "Alex M.",
        rating: 5,
        text: "Very professional and fixed the leak quickly!",
        date: "2 days ago",
    },
    {
        id: 2,
        author: "David L.",
        rating: 4,
        text: "Good work, but arrived 10 mins late.",
        date: "1 week ago",
    },
];
