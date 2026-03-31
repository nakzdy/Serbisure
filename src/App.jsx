import { useState, useEffect } from "react";
import { registerUser, loginUser, logoutUser, onAuthChange } from "./firebase/auth";
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

function AppContent() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState({ name: "", email: "", role: "", about: "", skills: "", location: "", isWorkerOnboarded: false });
    const [notifications, setNotifications] = useState([]);
    const [authLoading, setAuthLoading] = useState(true);
    const [isValidatingRole, setIsValidatingRole] = useState(false);
    const [needsRoleSetup, setNeedsRoleSetup] = useState(false); // true when Google user has no role yet
    const [settings, setSettings] = useState({
        darkMode: true,
        language: "English"
    });

    // Mock initial workers
    const [workers, setWorkers] = useState([
        { id: 1, name: "Juana Dela Cruz", tesdaCertificate: true, status: "verified", reliabilityScore: 92, skills: "Plumbing, Pipes, Drainage" },
        { id: 2, name: "Mario Rossi", tesdaCertificate: false, status: "verified", reliabilityScore: 85, skills: "Electrical, Wiring, Lighting" },
        { id: 3, name: "Maria Clara", tesdaCertificate: true, status: "pending", reliabilityScore: 60, skills: "Cleaning, Janitorial" },
        { id: 4, name: "Roberto G.", tesdaCertificate: true, status: "verified", reliabilityScore: 95, skills: "Carpentry, Furniture, Repair" },
        { id: 5, name: "Elena R.", tesdaCertificate: false, status: "verified", reliabilityScore: 88, skills: "Babysitting, Child Care" },
        { id: 6, name: "Paolo M.", tesdaCertificate: false, status: "pending", reliabilityScore: 78, skills: "Pet Care, Dog Walking" },
        { id: 7, name: "Liza S.", tesdaCertificate: true, status: "verified", reliabilityScore: 90, skills: "General Help, Gardening" },
        { id: 8, name: "Daniel A.", tesdaCertificate: false, status: "verified", reliabilityScore: 82, skills: "Carpentry, Home Repair" },
    ]);

    // Mock initial bookings
    const [bookings, setBookings] = useState([
        { id: 1, workerName: "Juana Dela Cruz", serviceType: "Plumbing", status: "pending" },
    ]);

    // Firebase Auth state observer — listens for session changes over HTTPS/TLS
    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            // ONLY auto-authenticate if we aren't in the middle of a manual login validation
            if (firebaseUser && !isValidatingRole) {
                // User is signed in — Fetch their persistent profile from Firestore
                const profile = await getUserProfile(firebaseUser.uid);

                // If no role saved yet (new Google sign-in) — pause and let role picker show
                if (!profile?.role) {
                    setNeedsRoleSetup(true);
                    setAuthLoading(false);
                    return;
                }

                setNeedsRoleSetup(false);
                setIsAuthenticated(true);
                setUser(prev => ({
                    ...prev,
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                    email: firebaseUser.email,
                    role: profile?.role || prev.role || "homeowner",
                    skills: profile?.skills || prev.skills || "",
                    isWorkerOnboarded: profile?.isWorkerOnboarded || prev.isWorkerOnboarded || false,
                    workerProfile: profile?.workerProfile || prev.workerProfile || null
                }));
            } else if (!firebaseUser) {
                // User is signed out
                setNeedsRoleSetup(false);
                setIsAuthenticated(false);
                setUser({ name: "", email: "", role: "", about: "", skills: "", location: "", isWorkerOnboarded: false });
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, [isValidatingRole]); // Re-subscribe if validation state changes

    const addNotification = (message) => {
        setNotifications((prev) => [...prev, { id: Date.now(), message }]);
    };

    // Firebase Auth: Email/Password sign-in (encrypted via HTTPS/TLS)
    const handleLogin = async (email, password, role) => {
        setIsValidatingRole(true); // LOCK: Prevent onAuthChange from auto-redirecting
        try {
            const userCredential = await loginUser(email, password);
            const isWorkerSelection = role === "Service Worker";

            // Check if user already has a role in Firestore
            const profile = await getUserProfile(userCredential.user.uid);

            if (profile) {
                const actualRole = profile.role; // "worker" or "homeowner"
                const expectedRole = isWorkerSelection ? "worker" : "homeowner";

                // VALIDATION: Block if the role doesn't match the registration
                if (actualRole !== expectedRole) {
                    await logoutUser(); // Immediately sign out the invalid session
                    setIsValidatingRole(false);
                    return { success: false, error: "auth/role-mismatch" };
                }
            }

            const finalRole = profile?.role || (isWorkerSelection ? "worker" : "homeowner");

            setUser(prev => ({
                ...prev,
                uid: userCredential.user.uid,
                role: finalRole,
                isWorkerOnboarded: profile?.isWorkerOnboarded || isWorkerSelection
            }));

            // Persist the login role if it's new (fallback for legacy accounts)
            if (!profile) {
                await setUserProfile(userCredential.user.uid, {
                    role: finalRole,
                    isWorkerOnboarded: false
                });
            }

            setIsAuthenticated(true); // Finalize authentication state
            setIsValidatingRole(false);
            addNotification(`Welcome back!`);
            navigate("/dashboard");
            return { success: true };
        } catch (error) {
            setIsValidatingRole(false);
            return { success: false, error: error.code };
        }
    };

    // Google OAuth: Called after user picks their role in the role picker
    const handleGoogleComplete = async (googleUser, role, skill) => {
        try {
            const isWorker = role === "Service Worker";
            const profileData = {
                name: googleUser.displayName || "",
                email: googleUser.email,
                role: isWorker ? "worker" : "homeowner",
                skills: isWorker ? skill : "",
                isWorkerOnboarded: isWorker,
                workerProfile: isWorker ? { skills: [skill] } : null,
                photoURL: googleUser.photoURL || "",
                provider: "google",
            };
            await setUserProfile(googleUser.uid, profileData);
            setNeedsRoleSetup(false);
            setIsAuthenticated(true);
            setUser(prev => ({
                ...prev,
                uid: googleUser.uid,
                name: googleUser.displayName || googleUser.email.split('@')[0],
                email: googleUser.email,
                ...profileData
            }));
            addNotification(`Welcome to SerbiSure, ${googleUser.displayName || googleUser.email}!`);
            navigate("/dashboard");
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Firebase Auth: Create account with email/password (encrypted via HTTPS/TLS)
    const handleRegister = async (email, role, name, password, skill) => {
        try {
            const userCredential = await registerUser(email, password, name);
            const isWorker = role === "Service Worker";

            const profileData = {
                role: isWorker ? "worker" : "homeowner",
                skills: isWorker ? skill : "",
                isWorkerOnboarded: isWorker,
                workerProfile: isWorker ? { skills: [skill] } : null
            };

            // PERMANENTLY save to Firestore
            await setUserProfile(userCredential.user.uid, profileData);

            setUser(prev => ({
                ...prev,
                uid: userCredential.user.uid,
                ...profileData
            }));

            addNotification(`Welcome to SerbiSure, ${name}!`);
            navigate("/dashboard");
            return { success: true };
        } catch (error) {
            return { success: false, error: error.code };
        }
    };

    // Firebase Auth: Sign out (invalidates session token)
    const handleLogout = async () => {
        try {
            await logoutUser();
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

    return (
        <div className={`app-container ${!settings.darkMode ? "light-theme" : ""}`}>
            {isAuthenticated && <Navbar user={user} notifications={notifications} onLogout={handleLogout} />}
            <div className="page-content">
                <Routes>
                    <Route path="/login" element={
                        !isAuthenticated ?
                            <Login onLogin={handleLogin} /> :
                            <Navigate to="/dashboard" />
                    } />
                    <Route path="/register" element={
                        !isAuthenticated || needsRoleSetup ?
                            <Registration 
                                onRegister={handleRegister} 
                                onGoogleComplete={handleGoogleComplete}
                                onValidateStart={() => setIsValidatingRole(true)}
                                onValidateEnd={() => setIsValidatingRole(false)}
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
