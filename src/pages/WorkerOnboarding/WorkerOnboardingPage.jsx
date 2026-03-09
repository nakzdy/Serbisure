import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WorkerOnboarding.css";

function WorkerOnboardingPage({ user, onComplete }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        profession: "",
        bio: "",
        skills: [],
        hourlyRate: "",
        availability: "Full-time",
        address: ""
    });

    const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillToggle = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In real app: save to DB, set isWorkerOnboarded to true on user obj
        onComplete(formData);
        navigate("/dashboard");
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-card">
                <div className="onboarding-header">
                    <h1>Set Up Your Worker Profile</h1>
                    <p>Tell us about your services to start matching with jobs.</p>
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-line"></div>
                    <div className="progress-line-fill" style={{ width: `${(step - 1) * 50}%` }}></div>
                    <div className={`progress-step ${step >= 1 ? "active" : ""}`}>1</div>
                    <div className={`progress-step ${step >= 2 ? "active" : ""}`}>2</div>
                    <div className={`progress-step ${step >= 3 ? "active" : ""}`}>3</div>
                </div>

                <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="onboarding-form">

                    {/* Step 1: Basics */}
                    {step === 1 && (
                        <div className="step-content">
                            <div className="form-group">
                                <label>Your Profession / Job Title</label>
                                <input
                                    type="text"
                                    name="profession"
                                    placeholder="e.g. Master Plumber, Head Electrician"
                                    value={formData.profession}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: "20px" }}>
                                <label>Short Bio</label>
                                <textarea
                                    name="bio"
                                    placeholder="Tell homeowners about your experience and expertise..."
                                    value={formData.bio}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Skills & Rates */}
                    {step === 2 && (
                        <div className="step-content">
                            <div className="form-group">
                                <label>Select Your Skills</label>
                                <div className="checkbox-grid">
                                    {["Plumbing", "Electrical", "Carpentry", "Cleaning", "Babysitting", "Pet Care", "Painting", "General Help"].map(skill => (
                                        <label key={skill} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.skills.includes(skill)}
                                                onChange={() => handleSkillToggle(skill)}
                                            />
                                            {skill}
                                        </label>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* Step 3: Verification & Finish */}
                    {step === 3 && (
                        <div className="step-content">
                            <div className="form-group">
                                <label>Home Address / Work Area</label>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Your city or specific work radius"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginTop: "20px" }}>
                                <label>Upload Valid ID or TESDA Certificate</label>
                                <div className="file-upload-box">
                                    <div className="upload-icon"><i className="fa-solid fa-file-arrow-up"></i></div>
                                    <div className="file-upload-text">
                                        Drag & drop or <span>Browse files</span>
                                    </div>
                                    <input type="file" className="file-input" />
                                </div>
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", display: "block" }}>Supported formats: JPG, PNG, PDF</span>
                            </div>
                        </div>
                    )}

                    <div className="onboarding-actions">
                        {step > 1 ? (
                            <button type="button" className="btn-prev" onClick={handlePrev}>Back</button>
                        ) : (
                            <div></div> /* Empty div to push next button to right */
                        )}
                        <button type="submit" className="btn-next">
                            {step === 3 ? "Complete Profile" : "Next Step"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WorkerOnboardingPage;
