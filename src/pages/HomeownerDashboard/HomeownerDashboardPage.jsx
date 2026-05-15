import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { servicesAPI, bookingsAPI } from "../../api/api";
import { dashboardNotifications } from "../../data/dashboard";
import "./Dashboard.css";
import "./ActiveRequests.css";
import "./Sidebar.css";

function HomeownerDashboardPage({ user }) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("pending");
    const [requests, setRequests] = useState([]);
    const [topWorkers, setTopWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingRequest, setRatingRequest] = useState(null);
    const [starRating, setStarRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [messageRequest, setMessageRequest] = useState(null);
    const [messageText, setMessageText] = useState("");
    const [messageSent, setMessageSent] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [minRating, setMinRating] = useState(0);

    const filterOptions = [
        { label: "All Workers", value: 0 },
        { label: "4.8+ Stars", value: 4.8 },
        { label: "4.5+ Stars", value: 4.5 },
        { label: "4.0+ Stars", value: 4.0 }
    ];

    const handleSendMessage = (e) => {
        e.preventDefault();
        setMessageSent(true);
        setTimeout(() => {
            setMessageRequest(null);
            setMessageSent(false);
            setMessageText("");
        }, 3000);
    };


    // Fetch live data on mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Fetch live bookings
                const bookingsData = await bookingsAPI.getBookings();
                const safeBookingsData = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.results || []);
                
                const mappedRequests = safeBookingsData.map(b => ({
                    id: b.id,
                    title: b.service_details?.name || "Service Request",
                    category: b.service_details?.category || "General",
                    priority: "Normal", 
                    date: new Date(b.scheduled_date).toLocaleDateString(),
                    estimatedCost: `${b.service_details?.price || 0}`,
                    status: b.status,
                    statusLabel: b.status === 'confirmed' ? "Accepted" : (b.status === 'completed' ? "Finished" : "Pending"),
                    image: null,
                    imageLetter: b.service_details?.category?.charAt(0) || 'S',
                    worker: b.service_details?.provider ? {
                        name: b.service_details.provider.full_name,
                        rating: 4.8,
                        reviews: 12,
                        avatar: "fa-solid fa-user-gear"
                    } : null,
                    searching: b.status === "pending",
                    searchingText: "Waiting for confirmation..."
                }));
                setRequests(mappedRequests);

                // 2. Fetch live services for the sidebar
                const servicesData = await servicesAPI.getServices();
                const safeServicesData = Array.isArray(servicesData) ? servicesData : (servicesData?.results || []);
                
                // Show newest services first: take the last 5 and reverse order
                const mappedWorkers = safeServicesData.slice(-5).reverse().map(s => ({
                    id: s.id,
                    name: s.provider?.full_name || s.name,
                    specialty: s.category,
                    rating: 4.9,
                    reliability: "98% Reliable",
                    avatar: "fa-solid fa-user-tie",
                    verified: true
                }));
                setTopWorkers(mappedWorkers);
            } catch (err) {
                console.error("Dashboard fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();

        // Poll for new services every 15s so newly posted services appear without a manual refresh
        const servicesPoll = setInterval(async () => {
            try {
                const servicesData = await servicesAPI.getServices();
                const safeServicesData = Array.isArray(servicesData) ? servicesData : (servicesData?.results || []);
                const mappedWorkers = safeServicesData.slice(-5).reverse().map(s => ({
                    id: s.id,
                    name: s.provider?.full_name || s.name,
                    specialty: s.category,
                    rating: 4.9,
                    reliability: "98% Reliable",
                    avatar: "fa-solid fa-user-tie",
                    verified: true
                }));
                setTopWorkers(mappedWorkers);
            } catch (err) {
                console.debug('Services poll failed:', err);
            }
        }, 15000);

        return () => clearInterval(servicesPoll);
    }, [user.uid]);

    const filteredRequests = activeTab === "pending"
        ? requests.filter(r => r.status === "pending")
        : requests.filter(r => r.status === "confirmed" || r.status === "completed");

    // Live Delete: Cancel a request in the backend
    const handleCancelRequest = async (id) => {
        if (window.confirm("Are you sure you want to cancel this request?")) {
            try {
                await bookingsAPI.deleteBooking(id);
                setRequests(prev => prev.filter(r => r.id !== id));
            } catch (err) {
                alert("Failed to cancel request. Please try again.");
            }
        }
    };

    return (
        <div className="dashboard-page">
            {/* Main Content */}
            <div className="dashboard-main">
                {/* Welcome */}
                <div className="dashboard-welcome">
                    <div className="dashboard-welcome-header">
                        <div>
                            <h1>Welcome back, {user.name || "Alex"}</h1>
                            <p>Manage your household services and trusted workers.</p>
                        </div>
                        <div className="system-status-badge">
                            <span className="status-dot"></span>
                            System Online
                        </div>
                    </div>
                </div>

                {/* Controls: Tabs + Filter */}
                <div className="dashboard-controls">
                    <div className="dashboard-tabs">
                        <button
                            className={`dashboard-tab ${activeTab === "pending" ? "active" : ""}`}
                            onClick={() => setActiveTab("pending")}
                        >
                            Pending
                        </button>
                        <button
                            className={`dashboard-tab ${activeTab === "confirmed" ? "active" : ""}`}
                            onClick={() => setActiveTab("confirmed")}
                        >
                            Confirmed
                        </button>
                    </div>

                    <div className="dashboard-filter" style={{ position: "relative" }}>
                        <span className="filter-label">Reliability Score</span>
                        <button
                            className="filter-dropdown"
                            onClick={() => setFilterOpen(!filterOpen)}
                        >
                            {minRating === 0 ? "All Workers" : `${minRating}+ Stars`}
                            <span className="filter-star"><i className="fa-solid fa-star"></i></span>
                            <span className="filter-chevron"><i className="fa-solid fa-chevron-down"></i></span>
                        </button>
                        {filterOpen && (
                            <div style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                marginTop: "6px",
                                background: "var(--card-bg-solid)",
                                border: "1px solid var(--card-border)",
                                borderRadius: "12px",
                                overflow: "hidden",
                                zIndex: 100,
                                minWidth: "160px",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
                            }}>
                                {filterOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { setMinRating(opt.value); setFilterOpen(false); }}
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            padding: "10px 16px",
                                            background: minRating === opt.value ? "var(--accent-glow)" : "transparent",
                                            border: "none",
                                            color: minRating === opt.value ? "var(--accent)" : "var(--text)",
                                            fontSize: "13px",
                                            fontWeight: minRating === opt.value ? "600" : "400",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            fontFamily: "inherit",
                                            transition: "background 0.15s ease"
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Active Requests */}
                <div className="active-requests-header">
                    <h2>Active Requests</h2>
                    <span className="request-count-badge">{filteredRequests.length}</span>
                </div>

                <div className="request-list">
                    {filteredRequests.map(request => (
                        <div className="request-card" key={request.id}>
                            {/* Top: Image + Info + Status */}
                            <div className="request-card-top">
                                <div className="request-card-image">
                                    {request.image ? (
                                        <img src={request.image} alt={request.title} />
                                    ) : (
                                        <div style={{
                                            width: '100%', height: '100%', display: 'flex', 
                                            alignItems: 'center', justifyContent: 'center', 
                                            fontSize: '36px', fontWeight: 'bold', 
                                            background: 'var(--input-bg)', color: 'var(--accent)'
                                        }}>
                                            {request.imageLetter}
                                        </div>
                                    )}
                                </div>
                                <div className="request-card-info">
                                    <h3>{request.title}</h3>
                                    <div className="request-card-category">
                                        {request.category} • {request.priority}
                                    </div>
                                    <div className="request-card-meta">
                                        <span className="request-meta-item">
                                            <span className="request-meta-icon"><i className="fa-regular fa-calendar" /></span>
                                            {request.date}
                                        </span>
                                        <span className="request-meta-item">
                                            <span className="request-meta-icon"><i className="fa-solid fa-peso-sign" /></span>
                                            Est. {request.estimatedCost}
                                        </span>
                                    </div>
                                </div>
                                <span className={`request-status ${request.status}`}>
                                    {request.statusLabel}
                                </span>
                            </div>

                            {/* Bottom: Worker or Searching State */}
                            {request.worker && (
                                <div className="request-card-bottom">
                                    <div className="request-worker">
                                        <div className="request-worker-avatar">
                                            <i className={request.worker.avatar || "fa-solid fa-user"} />
                                        </div>
                                        <div className="request-worker-info">
                                            <span className="request-worker-name">
                                                {request.worker.name}
                                            </span>
                                            <span className="request-worker-rating">
                                                <i className="fa-solid fa-star" style={{ color: "#f39c12", fontSize: "10px" }} /> {request.worker.rating}
                                                <span className="review-count">
                                                    ({request.worker.reviews} reviews)
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="request-card-actions">
                                        {request.status === 'completed' ? (
                                            <button className="btn-message" style={{ background: "var(--accent)" }} onClick={() => { setRatingRequest(request); setShowRatingModal(true); }}>Rate Service</button>
                                        ) : (
                                            <>
                                                <button className="btn-details" onClick={() => setSelectedRequest(request)}>Details</button>
                                                <button className="btn-message" onClick={() => setMessageRequest(request)}>Message</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {request.searching && (
                                <div className="request-searching">
                                    <span className="searching-dot"></span>
                                    <span className="searching-text">{request.searchingText}</span>
                                    <button className="cancel-link" onClick={() => handleCancelRequest(request.id)}>Cancel</button>
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredRequests.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                            <p style={{ fontSize: "15px" }}>No requests found for this filter.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="dashboard-sidebar">
                {/* CTA Card */}
                <div className="sidebar-cta">
                    <h3>Need a new service?</h3>
                    <p>Find reliable workers for your next project instantly.</p>
                    <button className="btn-book-now" onClick={() => navigate("/services")}>Book Now</button>
                </div>

                {/* Top Rated Nearby */}
                <div className="sidebar-panel">
                    <div className="sidebar-panel-header">
                        <h3>Top Rated Nearby</h3>
                        <button className="view-all" onClick={() => navigate("/services")}>View All</button>
                    </div>
                    <div className="top-rated-list">
                        {topWorkers.filter(w => w.rating >= minRating).map(worker => (
                            <div className="top-rated-item" key={worker.id}>
                                <div className="top-rated-avatar">
                                    <span style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "16px",
                                        background: "var(--bg-2)",
                                        borderRadius: "50%",
                                    }}>
                                        <i className={worker.avatar || "fa-solid fa-user"} />
                                    </span>
                                    {worker.verified && (
                                        <span className="verified-badge"><i className="fa-solid fa-check" style={{ fontSize: "8px" }} /></span>
                                    )}
                                </div>
                                <div className="top-rated-info">
                                    <div className="top-rated-name">{worker.name}</div>
                                    <div className="top-rated-specialty">{worker.specialty}</div>
                                </div>
                                <div className="top-rated-score">
                                    <div className="top-rated-rating">
                                        {worker.rating}
                                        <span className="star"><i className="fa-solid fa-star" /></span>
                                    </div>
                                    <div className={`top-rated-reliability ${worker.belowThreshold ? "top-rated-below-threshold" : ""}`}>
                                        {worker.reliability}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {topWorkers.filter(w => w.rating >= minRating).length === 0 && (
                            <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "13px" }}>
                                No workers match this rating filter.
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications */}
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

            {/* Details Modal */}
            {selectedRequest && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
                    justifyContent: "center", zIndex: 2000, backdropFilter: "blur(4px)"
                }} onClick={() => setSelectedRequest(null)}>
                    <div style={{
                        background: "var(--card-bg-solid)", border: "1px solid var(--card-border)",
                        borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "460px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0, fontSize: "20px", color: "var(--text)" }}>Request Details</h3>
                            <button onClick={() => setSelectedRequest(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "22px", cursor: "pointer" }}>×</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Service</span>
                                <span style={{ color: "var(--text)", fontWeight: "600", fontSize: "14px" }}>{selectedRequest.title}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Category</span>
                                <span style={{ color: "var(--text)", fontWeight: "600", fontSize: "14px" }}>{selectedRequest.category}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Priority</span>
                                <span style={{ color: selectedRequest.priority === "Emergency" ? "#fc5c65" : "var(--text)", fontWeight: "600", fontSize: "14px" }}>{selectedRequest.priority}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Schedule</span>
                                <span style={{ color: "var(--text)", fontWeight: "600", fontSize: "14px" }}>{selectedRequest.date}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Estimated Cost</span>
                                <span style={{ color: "var(--accent)", fontWeight: "700", fontSize: "14px" }}>{selectedRequest.estimatedCost}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Status</span>
                                <span style={{ color: "#f39c12", fontWeight: "600", fontSize: "14px" }}>{selectedRequest.statusLabel}</span>
                            </div>
                            {selectedRequest.worker && (
                                <div style={{ marginTop: "8px", padding: "14px", background: "var(--input-bg)", borderRadius: "12px", border: "1px solid var(--card-border)" }}>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Assigned Worker</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={{ fontSize: "24px", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", background: "var(--bg-2)", borderRadius: "50%" }}>
                                            <i className={selectedRequest.worker.avatar || "fa-solid fa-user"} style={{ fontSize: "18px" }} />
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "14px" }}>{selectedRequest.worker.name}</div>
                                            <div style={{ fontSize: "12px", color: "#f39c12" }}>
                                                <i className="fa-solid fa-star" /> {selectedRequest.worker.rating} ({selectedRequest.worker.reviews} reviews)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setSelectedRequest(null)} className="btn-primary" style={{ marginTop: "24px" }}>Close</button>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {messageRequest && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center",
                    justifyContent: "center", zIndex: 2000, backdropFilter: "blur(4px)"
                }} onClick={() => { setMessageRequest(null); setMessageSent(false); }}>
                    <div style={{
                        background: "var(--card-bg-solid)", border: "1px solid var(--card-border)",
                        borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "460px",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0, fontSize: "20px", color: "var(--text)" }}>
                                Message {messageRequest.worker?.name}
                            </h3>
                            <button onClick={() => { setMessageRequest(null); setMessageSent(false); }} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "22px", cursor: "pointer" }}>×</button>
                        </div>

                        {messageSent ? (
                            <div style={{
                                textAlign: "center", padding: "30px",
                                background: "rgba(46, 213, 115, 0.1)", borderRadius: "12px",
                                border: "1px solid rgba(46, 213, 115, 0.2)"
                            }}>
                                <div style={{ fontSize: "36px", marginBottom: "10px", color: "#2ed573" }}><i className="fa-solid fa-circle-check" /></div>
                                <div style={{ color: "#2ed573", fontWeight: "600", fontSize: "16px" }}>Message Sent!</div>
                                <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "6px" }}>
                                    {messageRequest.worker?.name} will be notified.
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSendMessage} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: 0, background: "none", border: "none", boxShadow: "none", backdropFilter: "none" }}>
                                <div style={{ fontSize: "13px", color: "var(--text-muted)", padding: "10px 14px", background: "var(--input-bg)", borderRadius: "10px" }}>
                                    Re: <strong style={{ color: "var(--text)" }}>{messageRequest.title}</strong> — {messageRequest.category}
                                </div>
                                <div className="form-row">
                                    <label>Your Message</label>
                                    <textarea
                                        placeholder="Type your message here..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        required
                                        rows="4"
                                        style={{
                                            width: "100%", background: "var(--input-bg)",
                                            border: "1px solid var(--input-border)", color: "var(--text)",
                                            borderRadius: "10px", padding: "12px", fontFamily: "inherit",
                                            fontSize: "14px", resize: "vertical"
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 2 }}>Send Message</button>
                                    <button type="button" onClick={() => setMessageRequest(null)} style={{
                                        flex: 1, padding: "12px", borderRadius: "12px",
                                        border: "1px solid var(--card-border)", background: "transparent",
                                        color: "var(--text)", fontSize: "14px", fontWeight: "500",
                                        cursor: "pointer", fontFamily: "inherit"
                                    }}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
            {/* Rating Modal */}
            {showRatingModal && ratingRequest && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center",
                    justifyContent: "center", zIndex: 3000, backdropFilter: "blur(8px)"
                }}>
                    <div style={{
                        background: "var(--card-bg-solid)", border: "1px solid var(--accent)",
                        borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "400px",
                        textAlign: "center", boxShadow: "0 20px 60px var(--accent-glow)"
                    }}>
                        <h2 style={{ color: "var(--text)", margin: "0 0 10px 0" }}>Rate Service</h2>
                        <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>How was your experience with {ratingRequest.worker?.name}?</p>
                        
                        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button 
                                    key={star} 
                                    onClick={() => setStarRating(star)}
                                    style={{ 
                                        background: "none", border: "none", cursor: "pointer", 
                                        fontSize: "32px", color: star <= starRating ? "#f39c12" : "var(--card-border)",
                                        transition: "transform 0.2s"
                                    }}
                                >
                                    <i className={star <= starRating ? "fa-solid fa-star" : "fa-regular fa-star"}></i>
                                </button>
                            ))}
                        </div>

                        <textarea 
                            placeholder="Add a comment (optional)..."
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            style={{ 
                                width: "100%", height: "100px", background: "var(--input-bg)", 
                                border: "1px solid var(--input-border)", borderRadius: "12px",
                                color: "var(--text)", padding: "12px", marginBottom: "24px",
                                resize: "none", fontFamily: "inherit"
                            }}
                        />

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button 
                                onClick={() => setShowRatingModal(false)}
                                style={{ flex: 1, padding: "14px", borderRadius: "12px", border: "1px solid var(--card-border)", background: "transparent", color: "var(--text)", fontWeight: "600", cursor: "pointer" }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={async () => {
                                    try {
                                        await bookingsAPI.updateBooking(ratingRequest.id, { 
                                            rating: starRating, 
                                            comment: reviewComment 
                                        });
                                        alert(`Thank you! Your ${starRating}-star review has been saved.`);
                                        setRequests(prev => prev.filter(r => r.id !== ratingRequest.id));
                                        setShowRatingModal(false);
                                        setReviewComment("");
                                    } catch (err) {
                                        console.error("Failed to save review:", err);
                                        alert("Could not save review. Please try again.");
                                    }
                                }}
                                style={{ flex: 2, padding: "14px", borderRadius: "12px", border: "none", background: "var(--accent)", color: "var(--btn-text)", fontWeight: "700", cursor: "pointer" }}
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomeownerDashboardPage;
