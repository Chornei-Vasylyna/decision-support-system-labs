import { Placeholder } from "../../components/placeholder/Placeholder";
import styles from "./RulesLogic.module.css";

export const RulesLogic = () => {
  return (
    <div className={styles.screen}>
      <h2>Step 3: Rules & Logic</h2>
      <p>Set thresholds and create expert IF-THEN rules</p>

      <Placeholder text="[Method Selection: Average | Median]" />
    </div>
  );
};
