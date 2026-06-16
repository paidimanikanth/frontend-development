import { state, subscribe } from "./wk2state.js";
import { render } from "./wk2renderer.js";
import { EmployeeList } from "./wk2compoEmpoList.js";
import "./week2.js";
const root = document.getElementById("app");
function App() {
 return `
 ${EmployeeList(state.employees)}
 `;
}
function updateUI() {
 render(App(), root);
}
subscribe(updateUI);
updateUI();