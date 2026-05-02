import { useState, useEffect } from "react";
import { bookingsAPI } from "../../api/api";
import "./HistoryPage.css";

// Mock history entries for developer testing
const mockHistory = [
    { id: "m1", title: "Pipe Leak Repair", category: "Plumbing", workerName: "Alex Martinez", date: "Apr 28, 2026", status: "completed", rating: 5 },
    { id: "m2", title: "Ceiling Fan Installation", category: "Electrical", workerName: "Sarah Lim", date: "Apr 25, 2026", status: "completed", rating: 4 },
    { id: "m3", title: "Deep House Cleaning", category: "Cleaning", workerName: "Miguel Santos", date: "Apr 22, 2026", status: "cancelled", rating: null },
    { id: "m4", title: "Kitchen Cabinet Repair", category: "Carpentry", workerName: "Roberto G.", date: "Apr 18, 2026", status: "completed", rating: 5 },
    { id: "m5", title: "Overnight Babysitting", category: "Babysitting", workerName: "Liza Soberano", date: "Apr 15, 2026", status: "completed", rating: 3 },
];

function HistoryPage({ user, settings }) {
    const showMock = settings?.showMockData || false;
    const [filterStatus, setFilterStatus] = useState("all");
    const [serviceHistory, setServiceHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch real bookings from Django on mount
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const data = await bookingsAPI.getBookings();
                const safeData = Array.isArray(data) ? data : (data?.results || []);
                
                // Map Django Booking model to UI structure
                const mappedHistory = safeData.map(booking => ({
                    id: booking.id,
                    title: booking.service_details?.name || "Service Booking",
                    category: booking.service_details?.category || "General",
                    workerName: booking.service_details?.provider?.full_name || "Assigned Worker",
                    date: new Date(booking.scheduled_date).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                    }),
                    status: booking.status,
                    rating: booking.rating, 
                }));
                setServiceHistory(mappedHistory);
            } catch (err) {
                console.error("Failed to fetch history:", err);
                setError("Could not load your history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user.uid]);

    // Resolve display data based on mock toggle
    const displayHistory = showMock ? mockHistory : serviceHistory;

    const filteredHistory = displayHistory.filter(h => filterStatus === "all" || h.status === filterStatus);
    const completedCount = displayHistory.filter(h => h.status === "completed").length;

    const getCategoryIcon = (category) => {
        switch (category) {
            case "Plumbing": return "fa-solid fa-wrench";
            case "Electrical": return "fa-solid fa-bolt";
            case "Cleaning": return "fa-solid fa-broom";
            case "Babysitting": return "fa-solid fa-baby-carriage";
            case "Pet Care": return "fa-solid fa-paw";
            case "Carpentry": return "fa-solid fa-hammer";
            case "HVAC": return "fa-solid fa-fan";
            default: return "fa-solid fa-screwdriver-wrench";
        }
    };

    return (
        <div className="history-page">
            {/* Header */}
            <div className="history-header">
                <h1>Service History</h1>
                <p>View your past bookings and completed services.</p>
            </div>

            {/* Stats Cards */}
            <div className="history-stats">
                <div className="history-stat-card">
                    <div className="history-stat-num">{displayHistory.length}</div>
                    <div className="history-stat-label">Total Bookings</div>
                </div>
                <div className="history-stat-card">
                    <div className="history-stat-num completed">{completedCount}</div>
                    <div className="history-stat-label">Completed</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="history-filter-bar">
                {["all", "completed", "cancelled"].map(status => (
                    <button
                        key={status}
                        className={`history-filter-btn ${filterStatus === status ? "active" : ""}`}
                        onClick={() => setFilterStatus(status)}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* History List */}
            {filteredHistory.length > 0 ? (
                <div className="history-list">
                    {filteredHistory.map(item => (
                        <div className="history-item" key={item.id}>
                            {/* Category Icon */}
                            <div className="history-item-icon">
                                <i className={getCategoryIcon(item.category)}></i>
                            </div>

                            {/* Info */}
                            <div className="history-item-info">
                                <h3>{item.title}</h3>
                                <div className="history-item-meta">
                                    <span>{item.category}</span>
                                    <span>•</span>
                                    <span>{item.workerName}</span>
                                    <span>•</span>
                                    <span>{item.date}</span>
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="history-item-rating">
                                {item.rating ? (
                                    [...Array(5)].map((_, i) => (
                                        <span key={i} className={i < item.rating ? "star-filled" : "star-empty"}>
                                            <i className="fa-solid fa-star"></i>
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>No rating</span>
                                )}
                            </div>

                            {/* Status Badge */}
                            <span className={`history-item-status ${item.status}`}>
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="history-empty">
                    <div className="history-empty-icon">
                        <i className="fa-regular fa-calendar"></i>
                    </div>
                    <h4>No services found for this filter</h4>
                    <p>Once you complete or cancel bookings, they'll appear here so you can track your history.</p>
                </div>
            )}
        </div>
    );
}

export default HistoryPage;
