import { useState, useEffect } from "react";
import { registerUser, loginUser, logoutUser, onAuthChange, signInWithGoogle } from "./firebase/auth";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./styles/App.css";
import Registration from "./pages/Registration/Registration";
import Login from "./pages/Login/Login";
import Navbar from "./components/Navbar/Navbar";
import HomeownerDashboardPage from "./pages/HomeownerDashboard/HomeownerDashboardPage";
import ServicesPage from "./pages/Feedback/FeedbackPage";

import HistoryPage from "./pages/History/HistoryPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import SettingsPage from "./pages/Settings/SettingsPage";

import WorkerDashboardPage from "./pages/WorkerDashboard/WorkerDashboardPage";
import WorkerOnboardingPage from "./pages/WorkerOnboarding/WorkerOnboardingPage";
import { setUserProfile, getUserProfile } from "./firebase/db";
import { authAPI, servicesAPI, bookingsAPI } from "./api/api";

function AppContent() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState({ name: "", email: "", role: "", about: "", skills: "", location: "", isWorkerOnboarded: false });
    const [notifications, setNotifications] = useState([]);
    const [authLoading, setAuthLoading] = useState(true);
    const [isAppInitializing, setIsAppInitializing] = useState(true); // Control Splash Screen only on first mount
    const [isValidatingRole, setIsValidatingRole] = useState(false);
    const [needsRoleSetup, setNeedsRoleSetup] = useState(false); 
    const [pendingGoogleUser, setPendingGoogleUser] = useState(null); 
    const [settings, setSettings] = useState({
        darkMode: true,
        language: "English"
    });

    // Mock initial workers
    const [workers, setWorkers] = useState([]); // Will play real data from Django
    const [loadingWorkers, setLoadingWorkers] = useState(true);

    // Mock initial bookings
    const [bookings, setBookings] = useState([
        { id: 1, workerName: "Juana Dela Cruz", serviceType: "Plumbing", status: "pending" },
    ]);

    // Fetch real workers/services from Django on mount
    useEffect(() => {
        const fetchRealServices = async () => {
            try {
                const data = await servicesAPI.getServices();
                // Map Django service model to frontend worker model
                const mappedWorkers = data.map(service => ({
                    id: service.id,
                    name: service.provider_name || service.name,
                    status: "verified",
                    reliabilityScore: 90,
                    skills: service.description,
                    price: service.price_per_hour
                }));
                setWorkers(mappedWorkers);
            } catch (err) {
                console.error("Failed to fetch real services:", err);
            } finally {
                setLoadingWorkers(false);
            }
        };
        fetchRealServices();
    }, []);

    // Django Session Persistence: Check for token on mount
    useEffect(() => {
        const checkDjangoSession = async () => {
            const token = localStorage.getItem('serbisure_token');
            if (token && !isAuthenticated) {
                try {
                    const djangoData = await authAPI.getProfile();
                    const djangoUser = djangoData?.user || djangoData;
                    
                    if (djangoUser && djangoUser.email) {
                        setUser({
                            uid: djangoUser.id,
                            name: djangoUser.full_name || djangoUser.email.split('@')[0],
                            email: djangoUser.email,
                            role: djangoUser.role === "service_worker" ? "worker" : "homeowner",
                            isWorkerOnboarded: djangoUser.role === "service_worker",
                        });
                        setIsAuthenticated(true);
                    }
                } catch (err) {
                    console.error("Session restoration failed:", err);
                    localStorage.removeItem('serbisure_token');
                }
            }
            // Ensure these always run to stop the loading screen/white screen
            setAuthLoading(false);
            setIsAppInitializing(false);
        };
        
        checkDjangoSession();
    }, []);

    // Firebase Auth state observer — Only used for Google Login now
    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            // ONLY handle Google users here
            if (firebaseUser && firebaseUser.providerData[0]?.providerId === 'google.com' && !isValidatingRole) {
                try {
                    const djangoData = await authAPI.googleSync({
                        email: firebaseUser.email,
                        password: firebaseUser.uid,
                        full_name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                    });

                    const djangoUser = djangoData?.user || djangoData;
                    if (djangoUser) {
                        setIsAuthenticated(true);
                        setUser(prev => ({
                            ...prev,
                            uid: djangoUser.id,
                            name: djangoUser.full_name,
                            email: djangoUser.email,
                            role: djangoUser.role === "service_worker" ? "worker" : "homeowner",
                            isWorkerOnboarded: djangoUser.role === "service_worker",
                        }));
                    }
                } catch (err) {
                    console.error("Google sync failed:", err.message);
                }
            }
        });
        return () => unsubscribe();
    }, [isValidatingRole]);

    const addNotification = (message) => {
        setNotifications((prev) => [...prev, { id: Date.now(), message }]);
    };

    // Integrated Auth: RELIES ON DJANGO TOKEN (Bypasses Firebase for standard users)
    const handleLogin = async (email, password, role) => {
        setIsValidatingRole(true);
        try {
            // 1. Authenticate with Django Backend (Single Source of Truth)
            const djangoData = await authAPI.login(email, password);
            const djangoUser = djangoData?.user || djangoData;

            if (!djangoUser) throw new Error("Invalid response from server");

            // 2. Validate Role if provided
            const isWorkerSelection = role === "Service Worker";
            const actualRole = djangoUser.role; // "service_worker" or "homeowner"
            const expectedRole = isWorkerSelection ? "service_worker" : "homeowner";

            if (role && actualRole !== expectedRole) {
                authAPI.logout();
                setIsValidatingRole(false);
                return { success: false, error: "auth/role-mismatch" };
            }

            // 3. Update Global State
            setUser({
                uid: djangoUser.id,
                name: djangoUser.full_name || djangoUser.email.split('@')[0],
                email: djangoUser.email,
                role: actualRole === "service_worker" ? "worker" : "homeowner",
                isWorkerOnboarded: actualRole === "service_worker",
            });

            setIsAuthenticated(true);
            setIsValidatingRole(false);
            addNotification(`Welcome back to SerbiSure!`);
            navigate("/dashboard");
            return { success: true };
        } catch (error) {
            setIsValidatingRole(false);
            console.error("Manual Login Error:", error);
            const errorMsg = error.response?.data?.message || "Login failed. Please check your credentials.";
            return { success: false, error: errorMsg };
        }
    };

    // Google Login: Called from Login.jsx
    const handleGoogleLogin = async () => {
        setIsValidatingRole(true);
        try {
            // 1. Firebase Google Sign-in
            const firebaseResult = await signInWithGoogle();
            const { user: googleUser } = firebaseResult;

            // 2. Check if user already has a setup profile in Firestore
            const profile = await getUserProfile(googleUser.uid);

            if (!profile || !profile.role) {
                // Not registered yet — don't logout, just tell the user so they can click register
                setIsValidatingRole(false);
                return { success: false, error: "no-account" };
            }

            // 3. User exists — Sync with Django Backend
            const djangoData = await authAPI.googleSync({
                email: googleUser.email,
                password: googleUser.uid,
                full_name: googleUser.displayName || googleUser.email.split('@')[0],
                role: profile.role === "worker" ? "service_worker" : "homeowner"
            });

            // 4. Update Global State
            setUser({
                uid: djangoData.user.id,
                name: djangoData.user.full_name,
                email: djangoData.user.email,
                role: profile.role,
                ...profile
            });

            setIsAuthenticated(true);
            setIsValidatingRole(false);
            addNotification(`Welcome back, ${djangoData.user.full_name}!`);
            navigate("/dashboard");
            return { success: true };
        } catch (error) {
            setIsValidatingRole(false);
            console.error("Google Login Error:", error);

            const djangoErrors = error.response?.data?.errors;
            let errorMsg = error.response?.data?.message || error.code || "Google sign-in failed.";

            if (djangoErrors) {
                const firstKey = Object.keys(djangoErrors)[0];
                const firstError = djangoErrors[firstKey];
                errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            }

            return { success: false, error: errorMsg };
        }
    };

    // Google OAuth: Called after user picks their role in the role picker
    const handleGoogleComplete = async (googleUser, role, skill) => {
        try {
            const isWorker = role === "Service Worker";
            const djangoRole = isWorker ? "service_worker" : "homeowner";

            // 1. Unified Sync: Link Google user with Django backend
            const djangoData = await authAPI.googleSync({
                email: googleUser.email,
                password: googleUser.uid, // Passing UID as a secure placeholder password
                full_name: googleUser.displayName || googleUser.email.split('@')[0],
                role: djangoRole
            });

            const profileData = {
                name: djangoData.user.full_name,
                email: djangoData.user.email,
                role: isWorker ? "worker" : "homeowner",
                skills: isWorker ? skill : "",
                isWorkerOnboarded: isWorker,
                workerProfile: isWorker ? { skills: [skill] } : null,
                photoURL: googleUser.photoURL || "",
                provider: "google",
            };

            // 2. Persist to Firestore (Legacy Support)
            await setUserProfile(googleUser.uid, profileData);

            setNeedsRoleSetup(false);
            setIsAuthenticated(true);
            setUser({
                uid: djangoData.user.id,
                name: djangoData.user.full_name,
                email: djangoData.user.email,
                role: profileData.role,
                ...profileData
            });

            addNotification(`Welcome to SerbiSure!`);
            navigate("/dashboard");
            return { success: true };
        } catch (err) {
            console.error("Google Sync Error:", err);
            const djangoErrors = err.response?.data?.errors;
            let errorMsg = err.response?.data?.message || err.code || "System synchronization failed.";

            if (djangoErrors) {
                const firstKey = Object.keys(djangoErrors)[0];
                const firstError = djangoErrors[firstKey];
                errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            }

            return { success: false, error: errorMsg };
        }
    };

    // Integrated Auth: Register with Firebase + Django + Firestore
    const handleRegister = async (email, role, name, password, skill) => {
        try {
            const isWorker = role === "Service Worker";
            const djangoRole = isWorker ? "service_worker" : "homeowner";

            // 1. Register with Django Backend (Primary Data Source)
            await authAPI.register({
                email,
                password,
                full_name: name,
                role: djangoRole
            });

            // 2. Register with Firebase (For OAuth & Legacy Support)
            const userCredential = await registerUser(email, password, name);

            const profileData = {
                role: isWorker ? "worker" : "homeowner",
                skills: isWorker ? skill : "",
                isWorkerOnboarded: isWorker,
                workerProfile: isWorker ? { skills: [skill] } : null
            };

            // 3. Save to Firestore
            await setUserProfile(userCredential.user.uid, profileData);

            setUser(prev => ({
                ...prev,
                uid: userCredential.user.uid,
                ...profileData
            }));

            setIsAuthenticated(true);
            addNotification(`Welcome to SerbiSure, ${name}!`);
            navigate("/dashboard");
            return { success: true };
        } catch (error) {
            console.error("Registration Error:", error);
            // Extract the first error message from Django if possible (e.g. "password too short")
            const djangoErrors = error.response?.data?.errors;
            let errorMsg = error.code || "Registration failed.";

            if (djangoErrors) {
                const firstKey = Object.keys(djangoErrors)[0];
                const firstError = djangoErrors[firstKey];
                errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
            }

            return { success: false, error: errorMsg };
        }
    };

    // Firebase Auth: Sign out (invalidates session token)
    const handleLogout = async () => {
        try {
            authAPI.logout();
            await logoutUser(); // Clear Firebase too if used
            setIsAuthenticated(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const handleUpdateProfile = async (updatedUser) => {
        if (updatedUser.uid) {
            await setUserProfile(updatedUser.uid, {
                about: updatedUser.about,
                skills: updatedUser.skills,
                location: updatedUser.location
            });
        }
        setUser(updatedUser);
        addNotification("Profile updated successfully!");
    };

    const handleWorkerOnboardingComplete = async (data) => {
        const profileUpdate = {
            workerProfile: data,
            isWorkerOnboarded: true,
            skills: data.skills.join(", ")
        };

        if (user.uid) {
            await setUserProfile(user.uid, profileUpdate);
        }

        setUser(prev => ({
            ...prev,
            ...profileUpdate
        }));
        addNotification("Worker profile completed successfully!");
    };

    const handleUpdateSettings = (newSettings) => {
        setSettings(newSettings);
        addNotification("Settings updated!");
    };

    if (isAppInitializing) {
        return (
            <div style={{
                height: "100vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-1)",
                color: "white",
                fontFamily: "var(--font-family)"
            }}>
                <div style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "24px",
                    boxShadow: "0 0 30px var(--accent-glow)",
                    animation: "pulse 2s infinite"
                }}>
                    S
                </div>
                <div style={{ fontSize: "14px", color: "var(--text-muted)", letterSpacing: "2px", textTransform: "uppercase" }}>
                    Loading SerbiSure...
                </div>
                <style>{`
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.05); opacity: 0.8; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className={`app-container ${!settings.darkMode ? "light-theme" : ""}`}>
            {isAuthenticated && <Navbar user={user} notifications={notifications} onLogout={handleLogout} />}
            <div className="page-content">
                <Routes>
                    <Route path="/login" element={
                        !isAuthenticated ?
                            <Login onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} /> :
                            <Navigate to="/dashboard" />
                    } />
                    <Route path="/register" element={
                        !isAuthenticated || needsRoleSetup ?
                            <Registration
                                onRegister={handleRegister}
                                onGoogleComplete={handleGoogleComplete}
                                onValidateStart={() => setIsValidatingRole(true)}
                                onValidateEnd={() => setIsValidatingRole(false)}
                                pendingGoogleUser={pendingGoogleUser}
                                setPendingGoogleUser={setPendingGoogleUser}
                            /> :
                            <Navigate to="/dashboard" />
                    } />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                        isAuthenticated ?
                            (user.role === "worker" ?
                                <WorkerDashboardPage user={user} /> :
                                <HomeownerDashboardPage user={user} />
                            ) :
                            <Navigate to="/login" />
                    } />

                    <Route path="/onboarding" element={
                        isAuthenticated && user.role === "worker" ?
                            <WorkerOnboardingPage user={user} onComplete={handleWorkerOnboardingComplete} /> :
                            <Navigate to="/dashboard" />
                    } />

                    <Route path="/feedback" element={
                        isAuthenticated && user.role === "homeowner" ?
                            <ServicesPage workers={workers} addNotification={addNotification} /> :
                            <Navigate to="/login" />
                    } />

                    <Route path="/profile" element={
                        isAuthenticated ?
                            <ProfilePage user={user} onUpdateProfile={handleUpdateProfile} /> :
                            <Navigate to="/login" />
                    } />

                    <Route path="/history" element={
                        isAuthenticated ?
                            <HistoryPage user={user} /> :
                            <Navigate to="/login" />
                    } />

                    <Route path="/settings" element={
                        isAuthenticated ?
                            <SettingsPage settings={settings} onUpdateSettings={handleUpdateSettings} /> :
                            <Navigate to="/login" />
                    } />

                    <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                </Routes>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
