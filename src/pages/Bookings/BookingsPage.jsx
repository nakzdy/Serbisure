function BookingsPage({ bookings, setBookings, workers, addNotification }) {
    const updateBookingStatus = (id, newStatus) => {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
        addNotification(`Booking status updated to ${newStatus}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "#ffcc00";
            case "confirmed": return "#4ade80";
            case "completed": return "var(--accent)";
            default: return "var(--muted)";
        }
    };

    return (
        <div className="page-wrapper">
            <h2 className="form-title" style={{ marginBottom: "20px" }}>My Bookings</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "40px" }}>
                {bookings.map(booking => (
                    <div key={booking.id} className="glass-card" style={{
                        background: "var(--card-bg)",
                        padding: "20px",
                        borderRadius: "15px",
                        border: "1px solid var(--card-border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div>
                            <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>{booking.workerName} - {booking.serviceType}</h3>
                            <span style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                background: `rgba(255, 255, 255, 0.05)`,
                                color: getStatusColor(booking.status),
                                border: `1px solid ${getStatusColor(booking.status)}`
                            }}>
                                {booking.status}
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            {booking.status === "pending" && (
                                <button
                                    className="btn-primary"
                                    style={{ width: "auto", padding: "8px 15px", fontSize: "13px" }}
                                    onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                >
                                    Confirm Booking
                                </button>
                            )}
                            {booking.status === "confirmed" && (
                                <button
                                    className="btn-primary"
                                    style={{ width: "auto", padding: "8px 15px", fontSize: "13px" }}
                                    onClick={() => updateBookingStatus(booking.id, "completed")}
                                >
                                    Complete Service
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="form-title" style={{ marginBottom: "20px" }}>Verified Workers</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                {workers.filter(w => w.status === "verified").map(worker => (
                    <div key={worker.id} className="glass-card" style={{
                        background: "var(--card-bg)",
                        padding: "20px",
                        borderRadius: "15px",
                        border: "1px solid var(--card-border)"
                    }}>
                        <h3 style={{ margin: "0 0 10px 0", fontSize: "15px" }}>{worker.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ flex: 1, height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                                <div style={{
                                    width: `${worker.reliabilityScore}%`,
                                    height: "100%",
                                    background: worker.reliabilityScore > 70 ? "#4ade80" : worker.reliabilityScore > 40 ? "#ffcc00" : "#ef4444",
                                    transition: "width 0.5s ease"
                                }} />
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: "700" }}>{worker.reliabilityScore}%</span>
                        </div>
                        <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "5px" }}>Reliability Score</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BookingsPage;
