import logoImg from "../../assets/logo.png";

function BrandingHeader({ title }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
      <img src={logoImg} alt="SerbiSure Logo" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
      <h1 className="hero-brand" style={{ margin: 0 }}>{title}</h1>
    </header>
  );
}

export default BrandingHeader;
