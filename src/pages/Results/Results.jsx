import { Placeholder } from "../../components/placeholder/Placeholder";
import styles from "./Results.module.css";

export const Results = () => {
  return (
    <div className={styles.screen}>
      <h2>Step 4: Results & Analysis</h2>
      <p>View decision results and sensitivity analysis</p>

      <Placeholder text="[Final Rankings & Scores]" />
      <Placeholder text="[Best Alternative Recommendation]" />
      <Placeholder text="[Export (CSV)]" />
    </div>
  );
};
