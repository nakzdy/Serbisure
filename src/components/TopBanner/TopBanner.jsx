import { useState } from "react";

function TopBanner({ notifications }) {
    const [showList, setShowList] = useState(false);
    return (
        <div className="top-banner" style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 25px",
            background: "var(--card-bg)",
            backdropFilter: "blur(24px)",
            borderRadius: "15px",
            marginBottom: "20px",
            border: "1px solid var(--card-border)"
        }}>
            <h2 style={{ fontSize: "18px", margin: 0 }}>SerbiSure</h2>
            <div className="notification-icon" style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowList(!showList)}>
                <span style={{ fontSize: "20px" }}><i className="fa-regular fa-bell"></i></span>
                {notifications.length > 0 && (
                    <span style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "#ff4d4d",
                        color: "#fff",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700"
                    }}>
                        {notifications.length}
                    </span>
                )}
                {showList && notifications.length > 0 && (
                    <div style={{
                        position: "absolute",
                        top: "50px",
                        right: "0",
                        width: "300px",
                        background: "var(--bg-2)",
                        border: "1px solid var(--card-border)",
                        borderRadius: "15px",
                        padding: "15px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                        zIndex: 100,
                        backdropFilter: "blur(20px)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                            <h4 style={{ margin: 0, fontSize: "14px" }}>Notifications</h4>
                            <button className="btn-close" onClick={(e) => { e.stopPropagation(); setShowList(false); }}>×</button>
                        </div>
                        <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                            {notifications.map(n => (
                                <div key={n.id} style={{ fontSize: "13px", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    {n.message}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TopBanner;
