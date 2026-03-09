import { useState } from "react";
import { workerStats, incomingJobs, dashboardNotifications } from "../data/dashboard";
import "../styles/Dashboard.css";
import "../styles/ActiveRequests.css";
import "../styles/Sidebar.css";

function WorkerDashboardPage({ user }) {
    const [jobs, setJobs] = useState(incomingJobs);

    const handleAcceptJob = (id) => {
        setJobs(prev => prev.map(job =>
            job.id === id ? { ...job, status: "accepted" } : job
        ));
    };

    const handleDeclineJob = (id) => {
        setJobs(prev => prev.filter(job => job.id !== id));
    };

    return (
        <div className="dashboard-page">
            {/* Main Content */}
            <div className="dashboard-main">
                {/* Welcome & Stats */}
                <div className="dashboard-welcome">
                    <div className="dashboard-welcome-header">
                        <div>
                            <h1>Partner Dashboard</h1>
                            <p>Manage your service requests and track your growth.</p>
                        </div>
                        <div className="system-status-badge">
                            <span className="status-dot"></span>
                            Accepting Jobs
                        </div>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "20px",
                        marginTop: "24px"
                    }}>
                        <div className="glass-card" style={{ padding: "20px", textAlign: "center", background: "var(--card-bg)" }}>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Total Earnings</div>
                            <div style={{ fontSize: "24px", fontWeight: "700", color: "#4ade80" }}>{workerStats.totalEarnings}</div>
                        </div>
                        <div className="glass-card" style={{ padding: "20px", textAlign: "center", background: "var(--card-bg)" }}>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Reliability</div>
                            <div style={{ fontSize: "24px", fontWeight: "700", color: "#6c5ce7" }}>{workerStats.reliability}</div>
                        </div>
                        <div className="glass-card" style={{ padding: "20px", textAlign: "center", background: "var(--card-bg)" }}>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Completed</div>
                            <div style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)" }}>{workerStats.completedJobs}</div>
                        </div>
                    </div>
                </div>

                {/* Job Requests */}
                <div className="active-requests-header">
                    <h2>Incoming Job Requests</h2>
                    <span className="request-count-badge">{jobs.filter(j => j.status === "pending").length}</span>
                </div>

                <div className="request-list">
                    {jobs.filter(j => j.status === "pending").map(job => (
                        <div className="request-card" key={job.id}>
                            <div className="request-card-top">
                                <div className="request-card-info">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                        <h3 style={{ margin: 0 }}>{job.title}</h3>
                                        <span className={`request-status ${job.priority.toLowerCase()}`} style={{
                                            background: job.priority === "High" ? "rgba(239, 68, 68, 0.1)" : "rgba(108, 92, 231, 0.1)",
                                            color: job.priority === "High" ? "#ef4444" : "#6c5ce7",
                                            border: "none",
                                            padding: "4px 10px",
                                            borderRadius: "12px"
                                        }}>
                                            {job.priority} Priority
                                        </span>
                                    </div>
                                    <div className="request-card-category" style={{ marginBottom: "12px" }}>
                                        {job.category} • {job.location}
                                    </div>
                                    <div className="request-card-meta">
                                        <span className="request-meta-item">
                                            <span className="request-meta-icon">👤</span>
                                            {job.customer}
                                        </span>
                                        <span className="request-meta-item">
                                            <span className="request-meta-icon">💰</span>
                                            Pay: {job.estimatedPay}
                                        </span>
                                        <span className="request-meta-item">
                                            <span className="request-meta-icon">🕒</span>
                                            {job.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="request-card-bottom" style={{ borderTop: "1px solid var(--card-border)", paddingTop: "14px", marginTop: "14px" }}>
                                <div className="request-card-actions" style={{ width: "100%", justifyContent: "flex-end", gap: "12px" }}>
                                    <button className="btn-details" onClick={() => handleDeclineJob(job.id)}>Decline</button>
                                    <button className="btn-message" onClick={() => handleAcceptJob(job.id)}>Accept Job</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {jobs.filter(j => j.status === "pending").length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontStyle: "italic" }}>
                            No incoming requests at the moment.
                        </div>
                    )}
                </div>

                {/* Accepted Jobs Placeholder */}
                <div className="active-requests-header" style={{ marginTop: "40px" }}>
                    <h2>Active Schedule</h2>
                </div>
                <div style={{
                    padding: "30px",
                    border: "2px dashed var(--card-border)",
                    borderRadius: "16px",
                    textAlign: "center",
                    color: "var(--text-muted)"
                }}>
                    Workers will see their confirmed schedule and route optimizations here.
                </div>
            </div>

            {/* Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-cta" style={{ background: "linear-gradient(135deg, #6c5ce7, #4834d4)" }}>
                    <h3>Earn More Rewards</h3>
                    <p>Complete 5 more jobs this week to unlock the Bronze Tier bonus!</p>
                    <button className="btn-book-now" style={{ background: "#fff", color: "#6c5ce7" }}>View Tiers</button>
                </div>

                <div className="sidebar-panel">
                    <div className="sidebar-panel-header">
                        <h3>Notifications</h3>
                    </div>
                    <div className="notification-list">
                        {dashboardNotifications.map(notif => (
                            <div className="notification-item" key={notif.id}>
                                <span className={`notification-dot ${notif.unread ? "unread" : "read"}`}></span>
                                <div className="notification-content">
                                    <h4>{notif.title}</h4>
                                    <p>{notif.message}</p>
                                    <span className="notification-time">{notif.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkerDashboardPage;
