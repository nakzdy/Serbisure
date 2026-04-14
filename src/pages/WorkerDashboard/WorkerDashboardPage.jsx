import { useState, useEffect, useMemo } from "react";
import { bookingsAPI } from "../../api/api";
import { workerStats, reviews } from "../../data/workerDashboard";
import "./WorkerDashboard.css";

function WorkerDashboardPage({ user }) {
    const [isOnline, setIsOnline] = useState(true);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch real bookings from Django on mount
    useEffect(() => {
        const fetchWorkerData = async () => {
            setLoading(true);
            try {
                const data = await bookingsAPI.getBookings();
                const safeData = Array.isArray(data) ? data : (data?.results || []);
                
                // Map Django Booking model to UI
                const mappedRequests = safeData.map(b => ({
                    id: b.id,
                    title: b.service_details?.name || "Service Request",
                    category: b.service_details?.category || "General",
                    date: new Date(b.scheduled_date).toLocaleDateString(),
                    priority: "High",
                    distance: "2.5 km away",
                    status: b.status,
                    homeowner: {
                        name: b.homeowner_details?.full_name || "Client",
                        location: "Davao City",
                        avatar: "fa-solid fa-house-user"
                    }
                }));
                setRequests(mappedRequests);
            } catch (err) {
                console.error("Worker dashboard fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkerData();
    }, [user.uid]);

    const handleAccept = async (id) => {
        // In a real app, this would PATCH the status to 'confirmed'
        alert("Accepting Job...");
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    const handleDecline = (id) => {
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div className="worker-dashboard-page">
            {/* Header */}
            <div className="worker-header">
                <div className="worker-welcome">
                    <h1>Hello, {user?.name || "Service Worker"}!</h1>
                    <p>Here's what's happening today.</p>
                </div>
                <div className="worker-toggle">
                    <span className="toggle-label">{isOnline ? "Online & Available" : "Offline"}</span>
                    <label className="switch">
                        <input type="checkbox" checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="worker-stats">
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Profile Views</h4>
                        <div className="stat-value">{workerStats.profileViews}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Rating</h4>
                        <div className="stat-value">{workerStats.rating} <span style={{ fontSize: "14px", fontWeight: "normal" }}>/ 5.0</span></div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Jobs Done</h4>
                        <div className="stat-value">{workerStats.jobsCompleted}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Response</h4>
                        <div className="stat-value">{workerStats.responseRate}</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="worker-content">
                {/* Left Side: Requests & Jobs */}
                <div className="worker-main">
                    <div className="worker-section">
                        <div className="worker-section-header">
                            <h2>Incoming Requests ({requests.length})</h2>
                            <button className="view-all-link">View History</button>
                        </div>

                        <div className="requests-grid">
                            {requests.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>No new requests at the moment.</p>
                            ) : (
                                requests.map(req => (
                                    <div className="worker-request-card" key={req.id}>
                                        <div className="req-header">
                                            <div className="req-title-area">
                                                <span className="req-category">{req.category}</span>
                                                <h3 style={{ marginTop: "8px" }}>{req.title}</h3>
                                            </div>

                                        </div>

                                        <div className="req-details">
                                            <div className="req-detail-row">
                                                <span><i className="fa-regular fa-calendar"></i></span> <strong>When:</strong> {req.date} ({req.priority})
                                            </div>
                                            <div className="req-detail-row">
                                                <span><i className="fa-solid fa-location-dot"></i></span> <strong>Where:</strong> {req.distance}
                                            </div>
                                        </div>

                                        <div className="req-footer">
                                            <div className="req-client">
                                                <div className="req-client-avatar"><i className={req.homeowner.avatar}></i></div>
                                                <div className="req-client-info">
                                                    <p>{req.homeowner.name}</p>
                                                    <span>{req.homeowner.location}</span>
                                                </div>
                                            </div>
                                            <div className="req-actions">
                                                <button className="btn-decline" onClick={() => handleDecline(req.id)}>Decline</button>
                                                <button className="btn-accept" onClick={() => handleAccept(req.id)}>Accept Job</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="worker-section" style={{ opacity: 0.8 }}>
                        <div className="worker-section-header">
                            <h2>Active Jobs ({requests.filter(r => r.status === 'confirmed').length})</h2>
                        </div>
                        <div className="requests-grid">
                            {requests.filter(r => r.status === 'confirmed').length > 0 ? (
                                requests.filter(r => r.status === 'confirmed').map(job => (
                                    <div className="worker-request-card" key={job.id} style={{ borderLeft: "4px solid #f39c12" }}>
                                        <div className="req-header">
                                            <div className="req-title-area">
                                                <span className="req-category">{job.category}</span>
                                                <h3 style={{ marginTop: "8px" }}>{job.title}</h3>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0, gridColumn: "1 / -1" }}>No active jobs found in the system.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Reviews & Info */}
                <div className="worker-sidebar">
                    <div className="worker-section">
                        <div className="worker-section-header">
                            <h2>Recent Reviews</h2>
                            <button className="view-all-link">See All</button>
                        </div>
                        <div className="review-list">
                            {reviews.map(rev => (
                                <div className="review-item" key={rev.id}>
                                    <div className="review-header">
                                        <span className="review-author">{rev.author}</span>
                                        <span className="review-rating">
                                            {[...Array(rev.rating)].map((_, i) => <i key={`star-${i}`} className="fa-solid fa-star"></i>)}
                                            {[...Array(5 - rev.rating)].map((_, i) => <i key={`empty-${i}`} className="fa-regular fa-star"></i>)}
                                        </span>
                                    </div>
                                    <p className="review-text">"{rev.text}"</p>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px", display: "block" }}>{rev.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkerDashboardPage;
