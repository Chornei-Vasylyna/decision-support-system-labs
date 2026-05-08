import styles from "./Placeholder.module.css";

export const Placeholder = ({ text }) => {
  return (
    <section className={styles.section}>
      <div className={styles.placeholder}>
        <p>{text}</p>
      </div>
    </section>
  );
};
