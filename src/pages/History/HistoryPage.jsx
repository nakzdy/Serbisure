import { useState } from "react";

function HistoryPage({ user }) {
    const [filterStatus, setFilterStatus] = useState("all");

    // Mock service history data
    const [serviceHistory] = useState([
        {
            id: 1,
            title: "Kitchen Pipe Repair",
            category: "Plumbing",
            workerName: "Marcus J.",
            date: "Feb 20, 2026",
            status: "completed",
            rating: 5,
        },
        {
            id: 10,
            title: "Wooden Deck Repair",
            category: "Carpentry",
            workerName: "You",
            date: "Mar 01, 2026",
            status: "completed",
            rating: 5,
        },
        {
            id: 2,
            title: "Living Room Rewiring",
            category: "Electrical",
            workerName: "Mario Rossi",
            date: "Feb 15, 2026",

            status: "completed",
            rating: 4,
        },
        {
            id: 3,
            title: "Bathroom Deep Clean",
            category: "Cleaning",
            workerName: "Maria Clara",
            date: "Feb 10, 2026",

            status: "completed",
            rating: 5,
        },
        {
            id: 4,
            title: "Fixture Installation",
            category: "Electrical",
            workerName: "Juana Dela Cruz",
            date: "Feb 5, 2026",

            status: "cancelled",
            rating: null,
        },
        {
            id: 5,
            title: "Drain Unclogging",
            category: "Plumbing",
            workerName: "Marcus J.",
            date: "Jan 28, 2026",

            status: "completed",
            rating: 4,
        },
    ]);

    const filteredHistory = serviceHistory
        .filter(h => {
            const matchesStatus = filterStatus === "all" || h.status === filterStatus;

            // Skill filtering for workers
            if (user?.role === "worker") {
                const skillsString = user?.skills || "";
                const profileSkills = user?.workerProfile?.skills || [];
                const allSkills = [...new Set([...profileSkills, ...skillsString.split(",").map(s => s.trim()).filter(Boolean)])];

                // If they have explicitly onboarded, only show their skills
                if (user.isWorkerOnboarded && allSkills.length > 0) {
                    return matchesStatus && allSkills.some(s => s.toLowerCase() === h.category.toLowerCase());
                }

                // If they haven't onboarded yet, show everything (new worker view)
                return matchesStatus;
            }

            return matchesStatus;
        });

    const getStatusStyle = (status) => {
        switch (status) {
            case "completed":
                return { background: "var(--status-pending)", color: "var(--status-pending-text)", border: "1px solid var(--status-pending-border)" };
            case "cancelled":
                return { background: "var(--input-bg)", color: "var(--text-muted)", border: "1px solid var(--input-border)" };
            default:
                return { background: "var(--input-bg)", color: "var(--text-muted)", border: "1px solid var(--input-border)" };
        }
    };

    const completedCount = filteredHistory.filter(h => h.status === "completed").length;


    return (
        <div className="page-wrapper" style={{ width: "100%", maxWidth: "1100px" }}>
            {/* Header */}
            <div style={{ marginBottom: "28px", width: "100%" }}>
                <h2 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text)", margin: "0 0 6px 0" }}>
                    Service History
                </h2>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
                    View your past bookings and completed services
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px", width: "100%" }}>
                <div style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "14px",
                    padding: "20px",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--accent)" }}>
                        {filteredHistory.length}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", marginTop: "4px" }}>
                        Total Bookings
                    </div>
                </div>
                <div style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "14px",
                    padding: "20px",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "var(--status-pending-text)" }}>
                        {completedCount}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", marginTop: "4px" }}>
                        Completed
                    </div>
                </div>

            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px", background: "var(--input-bg)", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
                {["all", "completed", "cancelled"].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        style={{
                            padding: "8px 18px",
                            borderRadius: "8px",
                            border: "none",
                            background: filterStatus === status ? "var(--accent)" : "transparent",
                            color: filterStatus === status ? "#fff" : "var(--text-muted)",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            textTransform: "capitalize",
                            transition: "all 0.2s ease"
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* History List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                {filteredHistory.map(item => (
                    <div key={item.id} style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        borderRadius: "14px",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        flexWrap: "wrap"
                    }}>
                        {/* Service icon */}
                        <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: "var(--status-pending)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            flexShrink: 0
                        }}>
                            {item.category === "Plumbing" ? <i className="fa-solid fa-wrench"></i> :
                                item.category === "Electrical" ? <i className="fa-solid fa-bolt"></i> :
                                    item.category === "Cleaning" ? <i className="fa-solid fa-broom"></i> :
                                        item.category === "Babysitting" ? <i className="fa-solid fa-baby-carriage"></i> :
                                            item.category === "Pet Care" ? <i className="fa-solid fa-paw"></i> :
                                                item.category === "Carpentry" ? <i className="fa-solid fa-hammer"></i> : <i className="fa-solid fa-screwdriver-wrench"></i>}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: "120px" }}>
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", color: "var(--text)", fontWeight: "600" }}>
                                {item.title}
                            </h3>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                <span>{item.category}</span>
                                <span>•</span>
                                <span>{item.workerName}</span>
                                <span>•</span>
                                <span>{item.date}</span>
                            </div>
                        </div>

                        {/* Rating */}
                        <div style={{ flexShrink: 0 }}>
                            {item.rating ? (
                                <div style={{ display: "flex", gap: "2px" }}>
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} style={{ color: i < item.rating ? "var(--status-pending-text)" : "var(--input-border)", fontSize: "11px", marginRight: "2px" }}><i className="fa-solid fa-star"></i></span>
                                    ))}
                                </div>
                            ) : (
                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>No rating</span>
                            )}
                        </div>



                        {/* Status */}
                        <span style={{
                            ...getStatusStyle(item.status),
                            padding: "5px 12px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                            flexShrink: 0
                        }}>
                            {item.status}
                        </span>
                    </div>
                ))}
            </div>

            {filteredHistory.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    <p style={{ fontSize: "16px" }}>No services found for this filter.</p>
                </div>
            )}
        </div>
    );
}

export default HistoryPage;
