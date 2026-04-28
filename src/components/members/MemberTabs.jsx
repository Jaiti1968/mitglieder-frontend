const tabs = [
  { id: "stammdaten", label: "Stammdaten" },
  { id: "kontakt", label: "Kontakt" },
  { id: "mitgliedschaft", label: "Mitgliedschaft" },
];

export default function MemberTabs({ activeTab, onTabChange }) {
  return (
    <nav style={tabsStyle}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </TabButton>
      ))}
    </nav>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={active ? activeTabButtonStyle : tabButtonStyle}
    >
      {children}
    </button>
  );
}

const tabsStyle = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1rem",
  flexWrap: "wrap",
};

const tabButtonStyle = {
  backgroundColor: "#ffffff",
  color: "#333",
  border: "1px solid #ccc",
};

const activeTabButtonStyle = {
  backgroundColor: "#1f5fbf",
  color: "#ffffff",
  border: "1px solid #1f5fbf",
};