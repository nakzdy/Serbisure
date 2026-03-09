function RegistrationFooter({ name, tagline, version }) {
    return (
        <footer>
            <p className="muted-footer" style={{ textAlign: "center" }}>
                <i className="fa-regular fa-copyright"></i> 2026 {name} — {tagline} | v{version}
            </p>
        </footer>
    );
}

export default RegistrationFooter;
