import { BrandingHeader, RegistrationForm, RegistrationFooter } from "../../components";
import { appName, systemInfo, userRoles } from "../../data/system";
import { skillCategories } from "../../data/skills";

function Registration({ onNavigateToLogin, onRegister, onGoogleComplete, onValidateStart, onValidateEnd }) {
  return (
    <main className="page-wrapper">
      <BrandingHeader title={appName} />
      <RegistrationForm
        title="Registration"
        subtitle={`Join ${systemInfo.totalWorkers}+ verified workers in ${systemInfo.region}`}
        roles={userRoles}
        skills={skillCategories}
        onRegister={onRegister}
        onGoogleComplete={onGoogleComplete}
        onValidateStart={onValidateStart}
        onValidateEnd={onValidateEnd}
      />
      <RegistrationFooter
        name={systemInfo.name}
        tagline={systemInfo.tagline}
        version={systemInfo.version}
      />
    </main>
  );
}

export default Registration;
