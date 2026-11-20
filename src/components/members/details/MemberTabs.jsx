const tabs = [
  { id: "stammdaten", label: "Stammdaten" },
  { id: "kontakt", label: "Kontakt" },
  { id: "mitgliedschaft", label: "Mitgliedschaft" },
  { id: "ehrungen", label: "Ehrungen" },
  { id: "datenschutz", label: "Datenschutz" },
  { id: "chorkleidung", label: "Chorkleidung" },
];

export default function MemberTabs({
  activeTab,
  onTabChange,
  disabledTabs = [],
}) {
  return (
    <nav style={tabsStyle}>
      {tabs.map((tab) => {
        const disabled = disabledTabs.includes(tab.id);

        return (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            disabled={disabled}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </TabButton>
        );
      })}
    </nav>
  );
}

function TabButton({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={
        disabled ? "Erst nach dem Anlegen des Mitglieds verfügbar" : undefined
      }
      style={
        disabled
          ? { ...tabButtonStyle, opacity: 0.5, cursor: "not-allowed" }
          : active
            ? activeTabButtonStyle
            : tabButtonStyle
      }
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
