import { useState, useEffect } from "react";
import { bookingsAPI, servicesAPI } from "../../api/api";
import { workerStats, reviews } from "../../data/workerDashboard";
import "./WorkerDashboard.css";

function WorkerDashboardPage({ user }) {
    const [isOnline, setIsOnline] = useState(true);
    const [requests, setRequests] = useState([]);
    const [myServices, setMyServices] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [stats, setStats] = useState(workerStats);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newService, setNewService] = useState({
        name: "",
        category: "Cleaning",
        price: "",
        description: ""
    });

    // Fetch real data from Django on mount
    const fetchWorkerData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Bookings
            const bookingsData = await bookingsAPI.getBookings();
            const safeBookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData?.results || []);
            
            const mappedRequests = safeBookings.map(b => ({
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

            // 2. Fetch My Services
            const servicesData = await servicesAPI.getServices();
            const allServices = Array.isArray(servicesData) ? servicesData : (servicesData?.results || []);
            const filtered = allServices.filter(s => s.provider?.id === user.uid || s.provider === user.uid);
            setMyServices(filtered);

            // 3. Extract real reviews from bookings
            const realReviews = safeBookings.filter(b => b.rating).map(b => ({
                id: b.id,
                author: b.homeowner_details?.full_name || "Client",
                rating: b.rating,
                text: b.comment || "No comment left.",
                date: new Date(b.scheduled_date).toLocaleDateString()
            }));
            setRecentReviews(realReviews);

            // 4. Update Stats
            const completedCount = safeBookings.filter(b => b.status === 'completed').length;
            setStats(prev => ({ ...prev, jobsCompleted: completedCount }));

        } catch (err) {
            console.error("Worker dashboard fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchWorkerData();
    }, [user.uid]);

    const handleAccept = async (id) => {
        try {
            await bookingsAPI.updateBooking(id, { status: 'confirmed' });
            alert("Job Accepted! It's now in your Active Jobs.");
            fetchWorkerData(); // Refresh list
        } catch (err) {
            console.error("Failed to accept job:", err);
        }
    };

    const handleCompleteJob = async (id) => {
        if (!window.confirm("Are you sure you have completed this job?")) return;
        try {
            await bookingsAPI.updateBooking(id, { status: 'completed' });
            alert("Job Marked as Completed! Great work.");
            fetchWorkerData(); // Refresh list
        } catch (err) {
            console.error("Failed to complete job:", err);
        }
    };

    const handleDecline = async (id) => {
        if (!window.confirm("Are you sure you want to decline this request?")) return;
        try {
            await bookingsAPI.updateBooking(id, { status: 'cancelled' });
            fetchWorkerData();
        } catch (err) {
            console.error("Failed to decline:", err);
        }
    };

    const handlePostService = async (e) => {
        e.preventDefault();
        try {
            const result = await servicesAPI.createService(newService);
            setMyServices(prev => [...prev, result]);
            setIsModalOpen(false);
            setNewService({ name: "", category: "Cleaning", price: "", description: "" });
            alert("Service posted successfully!");
        } catch (err) {
            console.error("Failed to post service:", err);
            alert("Failed to post service. Please try again.");
        }
    };

    const handleDeleteService = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        try {
            await servicesAPI.deleteService(id);
            setMyServices(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error("Failed to delete service:", err);
        }
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
                        <div className="stat-value">{stats.profileViews}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Rating</h4>
                        <div className="stat-value">{stats.rating} <span style={{ fontSize: "14px", fontWeight: "normal" }}>/ 5.0</span></div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Jobs Done</h4>
                        <div className="stat-value">{stats.jobsCompleted}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h4>Response</h4>
                        <div className="stat-value">{stats.responseRate}</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="worker-content">
                {/* Left Side: Requests & Jobs */}
                <div className="worker-main">
                    
                    {/* MY SERVICES SECTION */}
                    <div className="worker-section">
                        <div className="worker-section-header">
                            <h2>My Services ({myServices.length})</h2>
                            <button className="btn-accept" onClick={() => setIsModalOpen(true)}>+ Post New Service</button>
                        </div>
                        <div className="requests-grid">
                            {myServices.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>You haven't posted any services yet.</p>
                            ) : (
                                myServices.map(service => (
                                    <div className="worker-request-card" key={service.id}>
                                        <div className="req-header">
                                            <div className="req-title-area">
                                                <span className="req-category">{service.category}</span>
                                                <h3 style={{ marginTop: "8px" }}>{service.name}</h3>
                                            </div>
                                            <div className="req-pay">₱{service.price}</div>
                                        </div>
                                        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>{service.description}</p>
                                        <div className="req-actions" style={{ borderTop: "1px solid var(--card-border)", paddingTop: "12px", justifyContent: "flex-end" }}>
                                            <button className="btn-decline" onClick={() => handleDeleteService(service.id)}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="worker-section">
                        <div className="worker-section-header">
                            <h2>Incoming Requests ({requests.filter(r => r.status === 'pending').length})</h2>
                            <button className="view-all-link" onClick={() => window.location.reload()}>Refresh</button>
                        </div>

                        <div className="requests-grid">
                            {requests.filter(r => r.status === 'pending').length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>No new requests at the moment.</p>
                            ) : (
                                requests.filter(r => r.status === 'pending').map(req => (
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
                                    <div className="worker-request-card" key={job.id} style={{ borderLeft: "4px solid var(--accent)" }}>
                                        <div className="req-header">
                                            <div className="req-title-area">
                                                <span className="req-category">{job.category}</span>
                                                <h3 style={{ marginTop: "8px" }}>{job.title}</h3>
                                            </div>
                                            <div className="req-status-badge">Active</div>
                                        </div>
                                        <div className="req-details" style={{ marginBottom: "16px" }}>
                                            <div className="req-detail-row">
                                                <span><i className="fa-solid fa-user"></i></span> <strong>Client:</strong> {job.homeowner.name}
                                            </div>
                                        </div>
                                        <div className="req-actions" style={{ borderTop: "1px solid var(--card-border)", paddingTop: "12px" }}>
                                            <button 
                                                className="btn-accept" 
                                                style={{ width: "100%", background: "linear-gradient(135deg, #2ed573, #26af5a)" }}
                                                onClick={() => handleCompleteJob(job.id)}
                                            >
                                                Mark as Completed
                                            </button>
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
                            {recentReviews.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "13px", padding: "10px" }}>No reviews yet. Keep up the good work!</p>
                            ) : (
                                recentReviews.map(rev => (
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
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Service Modal */}
            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%", 
                    backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", 
                    alignItems: "center", zIndex: 1000, padding: "20px"
                }}>
                    <div className="reg-card" style={{ maxWidth: "500px", width: "100%" }}>
                        <h2 className="reg-title">Post a Service</h2>
                        <p className="reg-subtitle">Offer your skills to homeowners</p>
                        <form onSubmit={handlePostService} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div className="reg-field lifted">
                                <label className="reg-label">Service Title</label>
                                <input className="reg-input" required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} placeholder="e.g. Master Plumbing" />
                            </div>
                            <div className="reg-field lifted">
                                <label className="reg-label">Category</label>
                                <select className="reg-input reg-select" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})}>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="HVAC">HVAC (Aircon)</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Carpentry">Carpentry</option>
                                    <option value="Babysitting">Babysitting</option>
                                </select>
                            </div>
                            <div className="reg-field lifted">
                                <label className="reg-label">Price (₱)</label>
                                <input className="reg-input" type="number" required value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} placeholder="0.00" />
                            </div>
                            <div className="reg-field lifted">
                                <label className="reg-label">Description</label>
                                <textarea className="reg-input" style={{ height: "100px", padding: "12px", resize: "none" }} required value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} placeholder="Describe what you offer..." />
                            </div>
                            <div className="reg-btn-row">
                                <button type="button" className="reg-btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="reg-btn">Post Service</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default WorkerDashboardPage;
