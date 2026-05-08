import { useState } from "react";
import styles from "./App.module.css";
import { Expertise } from "./pages/Expertise/Expertise";
import { ModelData } from "./pages/ModelData/ModelData";
import { Results } from "./pages/Results/Results";
import { RulesLogic } from "./pages/RulesLogic/RulesLogic";

export const App = () => {
  const [activeTab, setActiveTab] = useState("expertise");

  const tabs = [
    { id: "expertise", label: "Step 1: Expertise" },
    { id: "model", label: "Step 2: Model & Data" },
    { id: "rules", label: "Step 3: Rules & Logic" },
    { id: "results", label: "Step 4: Results" },
  ];

  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <h1 className={styles.mainTitle}>Decision Support System</h1>
        <p className={styles.subtitle}>
          Job Offer Selection for IT Professionals
        </p>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabNavigation}>
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <main className={styles.tabContent}>
        {activeTab === "expertise" && <Expertise />}
        {activeTab === "model" && <ModelData />}
        {activeTab === "rules" && <RulesLogic />}
        {activeTab === "results" && <Results />}
      </main>

      {/* Footer */}
      <footer className={styles.appFooter}>
        <p>&copy; 2026 Decision Support System</p>
      </footer>
    </div>
  );
};
