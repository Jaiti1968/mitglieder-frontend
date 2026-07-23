import { Link } from "react-router-dom";

export default function BackLink({ children, ...props }) {
  return (
    <Link {...props} style={backLinkStyle}>
      ← {children}
    </Link>
  );
}

const backLinkStyle = {
  display: "inline-block",
  marginBottom: "1rem",
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 600,
};
