import { useState, useEffect } from "react";
import { openJobsAPI } from "../../api/api";
import "./JobsPage.css";

const CATEGORY_ICONS = {
    "Cleaning":    "fa-solid fa-broom",
    "Plumbing":    "fa-solid fa-wrench",
    "Electrical":  "fa-solid fa-bolt",
    "Carpentry":   "fa-solid fa-hammer",
    "HVAC":        "fa-solid fa-wind",
    "Babysitting": "fa-solid fa-baby",
    "Home Repair": "fa-solid fa-house-chimney-crack",
    "default":     "fa-solid fa-briefcase",
};

function JobsPage({ user }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const categories = ["All", "Cleaning", "Plumbing", "Electrical", "Carpentry", "HVAC", "Babysitting", "Home Repair"];

    const fetchJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await openJobsAPI.getOpenJobs();
            const safe = Array.isArray(data) ? data : (data?.results || []);
            setJobs(safe);
        } catch (err) {
            setError("Failed to load available jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, []);

    const handleAccept = async (job) => {
        if (!window.confirm(`Accept this job: "${job.service_details?.name}"?`)) return;
        setAccepting(job.id);
        try {
            await openJobsAPI.acceptJob(job.id);
            setSuccessMsg(`✅ Job accepted! "${job.service_details?.name}" is now in your Active Jobs.`);
            setTimeout(() => setSuccessMsg(null), 4000);
            fetchJobs(); // Refresh — accepted job disappears from open list
        } catch (err) {
            setError("Failed to accept job. It may have already been taken.");
            setTimeout(() => setError(null), 3000);
        } finally {
            setAccepting(null);
        }
    };

    const filtered = jobs.filter(j => {
        const matchSearch = search === "" ||
            j.service_details?.name?.toLowerCase().includes(search.toLowerCase()) ||
            j.service_details?.category?.toLowerCase().includes(search.toLowerCase()) ||
            j.homeowner_details?.full_name?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filter === "All" || j.service_details?.category === filter;
        return matchSearch && matchCategory;
    });

    const getIcon = (category) => CATEGORY_ICONS[category] || CATEGORY_ICONS["default"];

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
    };

    return (
        <div className="jobs-page">
            {/* Header */}
            <div className="jobs-header">
                <div className="jobs-header-left">
                    <h1 className="jobs-title">Browse Available Jobs</h1>
                    <p className="jobs-subtitle">
                        {loading ? "Loading jobs..." : `${filtered.length} job${filtered.length !== 1 ? "s" : ""} available near you`}
                    </p>
                </div>
                <button className="jobs-refresh-btn" onClick={fetchJobs} disabled={loading}>
                    <i className={`fa-solid fa-rotate ${loading ? "fa-spin" : ""}`}></i>
                    Refresh
                </button>
            </div>

            {/* Success / Error banners */}
            {successMsg && (
                <div className="jobs-alert success">
                    <i className="fa-solid fa-circle-check"></i> {successMsg}
                </div>
            )}
            {error && (
                <div className="jobs-alert error">
                    <i className="fa-solid fa-triangle-exclamation"></i> {error}
                </div>
            )}

            {/* Search + Filter */}
            <div className="jobs-controls">
                <div className="jobs-search-wrap">
                    <i className="fa-solid fa-magnifying-glass jobs-search-icon"></i>
                    <input
                        className="jobs-search"
                        type="text"
                        placeholder="Search by service, category, or client..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="jobs-filters">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`jobs-filter-chip ${filter === cat ? "active" : ""}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Job Cards */}
            {loading ? (
                <div className="jobs-loading">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <p>Finding available jobs...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="jobs-empty">
                    <div className="jobs-empty-icon">
                        <i className="fa-solid fa-briefcase"></i>
                    </div>
                    <h3>No jobs available right now</h3>
                    <p>Check back later or try a different filter.</p>
                    <button className="jobs-refresh-btn" onClick={fetchJobs}>
                        <i className="fa-solid fa-rotate"></i> Refresh
                    </button>
                </div>
            ) : (
                <div className="jobs-grid">
                    {filtered.map(job => (
                        <div className="job-card" key={job.id}>
                            {/* Card Top */}
                            <div className="job-card-top">
                                <div className="job-icon-wrap">
                                    <i className={getIcon(job.service_details?.category)}></i>
                                </div>
                                <div className="job-card-info">
                                    <span className="job-category">{job.service_details?.category || "General"}</span>
                                    <h3 className="job-name">{job.service_details?.name || "Service Request"}</h3>
                                </div>
                                <span className="job-price">₱{parseFloat(job.service_details?.price || 0).toLocaleString()}</span>
                            </div>

                            {/* Description */}
                            {job.service_details?.description && (
                                <p className="job-desc">{job.service_details.description}</p>
                            )}

                            {/* Meta */}
                            <div className="job-meta">
                                <div className="job-meta-row">
                                    <i className="fa-regular fa-calendar"></i>
                                    <span><strong>Date needed:</strong> {formatDate(job.scheduled_date)}</span>
                                </div>
                                <div className="job-meta-row">
                                    <i className="fa-solid fa-user"></i>
                                    <span><strong>Client:</strong> {job.homeowner_details?.full_name || "Homeowner"}</span>
                                </div>
                                <div className="job-meta-row">
                                    <i className="fa-solid fa-location-dot"></i>
                                    <span><strong>Location:</strong> Davao City</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="job-card-footer">
                                <span className="job-status-badge pending">
                                    <i className="fa-solid fa-clock"></i> Open
                                </span>
                                <button
                                    className="job-accept-btn"
                                    onClick={() => handleAccept(job)}
                                    disabled={accepting === job.id}
                                >
                                    {accepting === job.id ? (
                                        <><i className="fa-solid fa-spinner fa-spin"></i> Accepting...</>
                                    ) : (
                                        <><i className="fa-solid fa-handshake"></i> Accept Job</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default JobsPage;
