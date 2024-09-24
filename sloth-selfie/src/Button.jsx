import Styles from "./css/App.css";

function Button({ text }) {
  return <button className={Styles.btn}>{text}</button>;
}

export default Button;
