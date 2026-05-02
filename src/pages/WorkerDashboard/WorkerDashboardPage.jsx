import { useState, useEffect } from "react";
import { bookingsAPI, servicesAPI } from "../../api/api";
import { workerStats as mockStats, incomingRequests as mockRequests, reviews as mockReviews, activeJobs as mockActiveJobs } from "../../data/workerDashboard";
import "./WorkerDashboard.css";

const emptyStats = { profileViews: 0, rating: 0.0, jobsCompleted: 0, responseRate: "0%" };

function WorkerDashboardPage({ user, settings }) {
    const showMock = settings?.showMockData || false;
    const mockStatusOpen = settings?.mockStatusOpen || false;
    const [isOnline, setIsOnline] = useState(true);
    const [requests, setRequests] = useState([]);
    const [myServices, setMyServices] = useState([]);
    const [recentReviews, setRecentReviews] = useState([]);
    const [stats, setStats] = useState(emptyStats);
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

    // Resolve which data set to show based on mock toggle
    const displayStats = showMock ? mockStats : stats;
    const displayRequests = showMock
        ? [...mockRequests, ...mockActiveJobs].map(r => ({
            ...r,
            status: mockStatusOpen ? "pending" : r.status
        }))
        : requests;
    const displayReviews = showMock ? mockReviews : recentReviews;

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

    // Rating breakdown helper
    const getRatingBreakdown = () => {
        const breakdown = [0, 0, 0, 0, 0]; // 1★ to 5★
        displayReviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                breakdown[r.rating - 1]++;
            }
        });
        return breakdown;
    };

    const ratingBreakdown = getRatingBreakdown();
    const totalReviews = displayReviews.length;

    return (
        <div className="worker-dashboard-page">

            {/* ─── Tip Banner ─── */}
            {myServices.length === 0 && (
                <div className="tip-banner">
                    <span className="tip-banner-icon">
                        <i className="fa-solid fa-circle-info"></i>
                    </span>
                    <p className="tip-banner-text">
                        <strong>Get started:</strong> Post your first service to start receiving booking requests from clients.
                    </p>
                </div>
            )}

            {/* ─── Welcome Card ─── */}
            <div className="worker-welcome-card">
                <div>
                    <h2>Hello, {user?.name || "Service Worker"}!</h2>
                    <p>Here's a summary of your account today.</p>
                </div>
                <div className="worker-status-row">
                    <span className={`worker-status-label ${!isOnline ? "offline" : ""}`}>
                        <span className={`dot-pulse ${!isOnline ? "offline" : ""}`}></span>
                        {isOnline ? "Online & Available" : "Offline"}
                    </span>
                    <label className="sw-toggle" title="Toggle availability">
                        <input
                            type="checkbox"
                            checked={isOnline}
                            onChange={(e) => setIsOnline(e.target.checked)}
                        />
                        <span className="sw-track"></span>
                        <span className="sw-thumb"></span>
                    </label>
                </div>
            </div>

            {/* ─── Stats Grid ─── */}
            <div className="worker-stats-grid">
                <div className="worker-stat-card">
                    <div className="stat-icon-badge views">
                        <i className="fa-regular fa-eye"></i>
                    </div>
                    <div className="stat-number">{displayStats.profileViews}</div>
                    <div className="stat-label">Profile Views</div>
                </div>
                <div className="worker-stat-card">
                    <div className="stat-icon-badge rating">
                        <i className="fa-solid fa-star"></i>
                    </div>
                    <div className="stat-number">
                        {displayStats.rating.toFixed ? displayStats.rating.toFixed(1) : displayStats.rating}
                        <span className="stat-number-sub"> / 5.0</span>
                    </div>
                    <div className="stat-label">Rating</div>
                </div>
                <div className="worker-stat-card">
                    <div className="stat-icon-badge jobs">
                        <i className="fa-solid fa-check"></i>
                    </div>
                    <div className="stat-number">{displayStats.jobsCompleted}</div>
                    <div className="stat-label">Jobs Done</div>
                </div>
                <div className="worker-stat-card">
                    <div className="stat-icon-badge response">
                        <i className="fa-solid fa-bolt"></i>
                    </div>
                    <div className="stat-number">{displayStats.responseRate}</div>
                    <div className="stat-label">Response Rate</div>
                </div>
            </div>

            {/* ─── Main Two-Column Grid ─── */}
            <div className="worker-main-grid">

                {/* ─── LEFT COLUMN ─── */}
                <div className="worker-left-col">

                    {/* My Services */}
                    <div className="worker-section-card">
                        <div className="section-header">
                            <div className="section-header-left">
                                <span className="section-header-icon"><i className="fa-solid fa-briefcase"></i></span>
                                <span className="section-header-title">My Services</span>
                                <span className="section-badge">{myServices.length}</span>
                            </div>
                            <button className="btn-primary-sm" onClick={() => setIsModalOpen(true)}>
                                <i className="fa-solid fa-plus" style={{ fontSize: "11px" }}></i>
                                Post New Service
                            </button>
                        </div>

                        {myServices.length === 0 ? (
                            <div className="worker-empty-state">
                                <div className="empty-icon-box">
                                    <i className="fa-solid fa-briefcase"></i>
                                </div>
                                <h4>No services posted yet</h4>
                                <p>Tap "Post New Service" to list the skills you offer to clients.</p>
                            </div>
                        ) : (
                            <div className="service-list">
                                {myServices.map(service => (
                                    <div className="service-item" key={service.id}>
                                        <div className="service-item-header">
                                            <div className="service-item-title">
                                                <span className="service-item-category">{service.category}</span>
                                                <h3>{service.name}</h3>
                                            </div>
                                            <span className="service-item-price">₱{service.price}</span>
                                        </div>
                                        <p className="service-item-desc">{service.description}</p>
                                        <div className="service-item-footer">
                                            <span></span>
                                            <div className="service-item-actions">
                                                <button className="btn-outline-sm" onClick={() => handleDeleteService(service.id)}>
                                                    <i className="fa-regular fa-trash-can" style={{ fontSize: "11px" }}></i>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Incoming Requests */}
                    <div className="worker-section-card">
                        <div className="section-header">
                            <div className="section-header-left">
                                <span className="section-header-icon"><i className="fa-solid fa-wave-square"></i></span>
                                <span className="section-header-title">Incoming Requests</span>
                                <span className="section-badge">{displayRequests.filter(r => r.status === 'pending').length}</span>
                            </div>
                            <button className="btn-outline-sm" onClick={() => fetchWorkerData()}>
                                <i className="fa-solid fa-rotate" style={{ fontSize: "11px" }}></i>
                                Refresh
                            </button>
                        </div>

                        {displayRequests.filter(r => r.status === 'pending').length === 0 ? (
                            <div className="worker-empty-state">
                                <div className="empty-icon-box">
                                    <i className="fa-solid fa-phone"></i>
                                </div>
                                <h4>No new requests</h4>
                                <p>When a client books your service, their request will appear here.</p>
                            </div>
                        ) : (
                            <div className="service-list">
                                {displayRequests.filter(r => r.status === 'pending').map(req => (
                                    <div className="service-item" key={req.id}>
                                        <div className="service-item-header">
                                            <div className="service-item-title">
                                                <span className="service-item-category">{req.category}</span>
                                                <h3>{req.title}</h3>
                                            </div>
                                        </div>
                                        <div className="service-item-meta" style={{ marginBottom: "14px" }}>
                                            <div className="service-item-meta-row">
                                                <i className="fa-regular fa-calendar" style={{ fontSize: "11px" }}></i>
                                                <span><strong>When:</strong> {req.date} ({req.priority})</span>
                                            </div>
                                            <div className="service-item-meta-row">
                                                <i className="fa-solid fa-location-dot" style={{ fontSize: "11px" }}></i>
                                                <span><strong>Where:</strong> {req.distance}</span>
                                            </div>
                                        </div>
                                        <div className="service-item-footer">
                                            <div className="req-client-block">
                                                <div className="req-client-avatar">
                                                    <i className={req.homeowner.avatar}></i>
                                                </div>
                                                <div className="req-client-info">
                                                    <p>{req.homeowner.name}</p>
                                                    <span>{req.homeowner.location}</span>
                                                </div>
                                            </div>
                                            <div className="service-item-actions">
                                                <button className="btn-outline-sm" onClick={() => handleDecline(req.id)}>Decline</button>
                                                <button className="btn-primary-sm" onClick={() => handleAccept(req.id)}>Accept Job</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Jobs */}
                    <div className="worker-section-card">
                        <div className="section-header">
                            <div className="section-header-left">
                                <span className="section-header-icon"><i className="fa-regular fa-clock"></i></span>
                                <span className="section-header-title">Active Jobs</span>
                                <span className="section-badge">{displayRequests.filter(r => r.status === 'confirmed').length}</span>
                            </div>
                        </div>

                        {displayRequests.filter(r => r.status === 'confirmed').length === 0 ? (
                            <div className="worker-empty-state">
                                <div className="empty-icon-box">
                                    <i className="fa-regular fa-clock"></i>
                                </div>
                                <h4>No active jobs</h4>
                                <p>Jobs you're currently working on will be tracked here.</p>
                            </div>
                        ) : (
                            <div className="service-list">
                                {displayRequests.filter(r => r.status === 'confirmed').map(job => (
                                    <div className="service-item active-job" key={job.id}>
                                        <div className="service-item-header">
                                            <div className="service-item-title">
                                                <span className="service-item-category">{job.category}</span>
                                                <h3>{job.title}</h3>
                                            </div>
                                            <span className="active-badge">Active</span>
                                        </div>
                                        <div className="service-item-meta" style={{ marginBottom: "14px" }}>
                                            <div className="service-item-meta-row">
                                                <i className="fa-solid fa-user" style={{ fontSize: "11px" }}></i>
                                                <span><strong>Client:</strong> {job.homeowner.name}</span>
                                            </div>
                                        </div>
                                        <div className="service-item-actions" style={{ borderTop: "1px solid var(--card-border)", paddingTop: "14px" }}>
                                            <button
                                                className="btn-primary-sm"
                                                style={{ width: "100%", justifyContent: "center", background: "linear-gradient(135deg, #059669, #047857)" }}
                                                onClick={() => handleCompleteJob(job.id)}
                                            >
                                                <i className="fa-solid fa-check" style={{ fontSize: "11px" }}></i>
                                                Mark as Completed
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>{/* /left-col */}

                {/* ─── RIGHT COLUMN ─── */}
                <div className="worker-right-col">
                    <div className="worker-section-card">
                        <div className="section-header">
                            <div className="section-header-left">
                                <span className="section-header-icon"><i className="fa-regular fa-comment"></i></span>
                                <span className="section-header-title">Recent Reviews</span>
                            </div>
                            <button className="btn-outline-sm">See All</button>
                        </div>

                        {displayReviews.length === 0 ? (
                            <div className="worker-empty-state">
                                <div className="empty-icon-box">
                                    <i className="fa-regular fa-comment"></i>
                                </div>
                                <h4>No reviews yet</h4>
                                <p>Reviews from clients will show after completing your first job.</p>
                            </div>
                        ) : (
                            <div className="review-list">
                                {displayReviews.map(rev => (
                                    <div className="review-item" key={rev.id}>
                                        <div className="review-header">
                                            <span className="review-author">{rev.author}</span>
                                            <span className="review-rating">
                                                {[...Array(rev.rating)].map((_, i) => (
                                                    <i key={`star-${i}`} className="fa-solid fa-star"></i>
                                                ))}
                                                {[...Array(5 - rev.rating)].map((_, i) => (
                                                    <i key={`empty-${i}`} className="fa-regular fa-star"></i>
                                                ))}
                                            </span>
                                        </div>
                                        <p className="review-text">"{rev.text}"</p>
                                        <span className="review-date">{rev.date}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Rating Breakdown */}
                        <div className="rating-breakdown">
                            <div className="rating-breakdown-label">Rating Breakdown</div>
                            {[5, 4, 3, 2, 1].map(star => (
                                <div className="rb-row" key={star}>
                                    <span className="rb-star-num">{star}</span>
                                    <span className="rb-star-icon"><i className="fa-solid fa-star"></i></span>
                                    <div className="rb-bar-bg">
                                        <div
                                            className="rb-bar"
                                            style={{
                                                width: totalReviews > 0
                                                    ? `${(ratingBreakdown[star - 1] / totalReviews) * 100}%`
                                                    : "0%"
                                            }}
                                        ></div>
                                    </div>
                                    <span className="rb-count">{ratingBreakdown[star - 1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>{/* /right-col */}

            </div>{/* /main-grid */}

            {/* ─── Post Service Modal ─── */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h2>Post a Service</h2>
                        <p className="modal-subtitle">Offer your skills to homeowners</p>
                        <form className="modal-form" onSubmit={handlePostService}>
                            <div className="modal-field">
                                <label>Service Title</label>
                                <input
                                    required
                                    value={newService.name}
                                    onChange={e => setNewService({...newService, name: e.target.value})}
                                    placeholder="e.g. Master Plumbing"
                                />
                            </div>
                            <div className="modal-field">
                                <label>Category</label>
                                <select
                                    value={newService.category}
                                    onChange={e => setNewService({...newService, category: e.target.value})}
                                >
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="HVAC">HVAC (Aircon)</option>
                                    <option value="Plumbing">Plumbing</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Carpentry">Carpentry</option>
                                    <option value="Babysitting">Babysitting</option>
                                </select>
                            </div>
                            <div className="modal-field">
                                <label>Price (₱)</label>
                                <input
                                    type="number"
                                    required
                                    value={newService.price}
                                    onChange={e => setNewService({...newService, price: e.target.value})}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="modal-field">
                                <label>Description</label>
                                <textarea
                                    required
                                    value={newService.description}
                                    onChange={e => setNewService({...newService, description: e.target.value})}
                                    placeholder="Describe what you offer..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="modal-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="modal-btn-submit">Post Service</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default WorkerDashboardPage;
