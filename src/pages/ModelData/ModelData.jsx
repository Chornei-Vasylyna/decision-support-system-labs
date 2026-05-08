import { Placeholder } from "../../components/placeholder/Placeholder";
import styles from "./ModelData.module.css";

export const ModelData = () => {
  return (
    <div className={styles.screen}>
      <h2>Step 2: Model & Data</h2>
      <p>
        Manage alternatives (companies), criteria (with weights), and scoring
        matrix
      </p>

      <Placeholder text="[Alternatives Management]" />
      <Placeholder text="[Criteria Management]" />
      <Placeholder text="[Scoring Matrix (Alternatives × Criteria)]" />
      <Placeholder text="[Weight Validation (Sum = 1.0)]" />
    </div>
  );
};
