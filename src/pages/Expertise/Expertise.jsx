import { Placeholder } from "../../components/placeholder/Placeholder";
import styles from "./Expertise.module.css";

export const Expertise = () => {
  return (
    <div className={styles.screen}>
      <h2>Step 1: Expertise</h2>
      <p>Upload expert assessments from CSV files or enter manually</p>

      <Placeholder text="[CSV Upload Zone]" />
      <Placeholder text="[Data Preview Table]" />

    </div>
  );
};
