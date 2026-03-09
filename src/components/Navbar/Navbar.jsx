import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user, notifications, onLogout }) {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogoutClick = () => {
        onLogout();
        navigate("/login");
    };

    const getInitials = (name) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                <div className="navbar-logo-icon">◆</div>
                <Link to="/" className="navbar-brand">
                    SerbiSure
                </Link>
            </div>

            <nav className="navbar-links">
                {user.role === "homeowner" ? (
                    <>
                        <NavLink to="/dashboard" className="nav-link-item">Dashboard</NavLink>
                        <NavLink to="/feedback" className="nav-link-item">Services</NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/dashboard" className="nav-link-item">Dashboard</NavLink>
                    </>
                )}
                <NavLink to="/history" className="nav-link-item">History</NavLink>
                <NavLink to="/settings" className="nav-link-item">Settings</NavLink>
            </nav>

            <div className="navbar-actions">
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="btn-icon"
                        title="Notifications"
                    >
                        <span><i className="fa-regular fa-bell"></i></span>
                        {notifications.length > 0 && (
                            <span className="notification-badge">
                                {notifications.length > 9 ? "9+" : notifications.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-dropdown-header">
                                <h4>Recent Activity</h4>
                                <button className="btn-close" onClick={() => setShowNotifications(false)}>×</button>
                            </div>
                            <div className="notification-dropdown-list">
                                {notifications.length > 0 ? (
                                    notifications.slice().reverse().map(n => (
                                        <div key={n.id} className="notification-dropdown-item">
                                            {n.message}
                                        </div>
                                    ))
                                ) : (
                                    <p className="notification-dropdown-empty">No new notifications</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="navbar-user" onClick={() => navigate("/profile")}>
                    <div className="navbar-avatar">
                        {getInitials(user.name)}
                    </div>
                    <span className="navbar-user-name">{user.name ? `${user.name.split(" ")[0]} ${user.name.split(" ").length > 1 ? user.name.split(" ")[1][0] + "." : ""}`.trim() : "User"}</span>
                </div>
                <button
                    onClick={onLogout}
                    className="btn-icon"
                    title="Log Out"
                    style={{ marginLeft: "12px", color: "#fc5c65", fontSize: "14px", fontWeight: "600" }}
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Navbar;
