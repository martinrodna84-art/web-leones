type SocialIconProps = {
  label: string;
  className?: string;
};

export function SocialIcon({ label, className = "social-icon" }: SocialIconProps) {
  const iconClass = (() => {
    switch (label) {
      case "YouTube":
        return "fa-youtube";
      case "Facebook":
        return "fa-facebook-f";
      case "X":
        return "fa-x-twitter";
      case "Instagram":
        return "fa-instagram";
      case "Strava":
        return "fa-strava";
      default:
        return null;
    }
  })();

  if (!iconClass) {
    return null;
  }

  return <i className={`${className} fa-brands ${iconClass}`} aria-hidden="true" />;
}
