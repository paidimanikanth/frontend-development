let students = [];
let oldVDOM = [];

function render(data) {
    const list = document.getElementById("list");
    list.innerHTML = "";

    data.forEach((s, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${s.id}</td>
            <td>${s.name}</td>
            <td class="${s.present ? 'present' : 'absent'}">
                ${s.present ? "Present" : "Absent"}
            </td>
            <td>
                <button onclick="toggleDOM(${index})">DOM</button>
                <button onclick="toggleVDOM(${index})">VDOM</button>
                <button onclick="deleteStudent(${index})">Delete</button>
            </td>
        `;

        list.appendChild(row);
    });
}

function addStudent() {
    const id = document.getElementById("id").value;
    const name = document.getElementById("name").value;
    const present = document.getElementById("status").value === "true";

    if (!id || !name) return alert("Enter ID & Name");

    students.push({ id, name, present });
    oldVDOM = JSON.parse(JSON.stringify(students));

    render(students);

    document.getElementById("id").value = "";
    document.getElementById("name").value = "";
}

function toggleDOM(index) {
    students[index].present = !students[index].present;
    render(students);
}

function toggleVDOM(index) {
    let newVDOM = JSON.parse(JSON.stringify(students));
    newVDOM[index].present = !newVDOM[index].present;

    const rows = document.getElementById("list").children;

    if (students[index].present !== newVDOM[index].present) {
        rows[index].cells[2].textContent =
            newVDOM[index].present ? "Present" : "Absent";

        rows[index].cells[2].className =
            newVDOM[index].present ? "present" : "absent";
    }

    students = newVDOM;
    oldVDOM = newVDOM;
}

function deleteStudent(index) {
    students.splice(index, 1);
    oldVDOM = JSON.parse(JSON.stringify(students));
    render(students);
}

function updateAllDOM() {
    students.forEach(s => s.present = !s.present);
    render(students);
}

function updateAllVDOM() {
    let newVDOM = JSON.parse(JSON.stringify(students));
    const rows = document.getElementById("list").children;

    newVDOM.forEach((s, i) => {
        s.present = !s.present;

        rows[i].cells[2].textContent =
            s.present ? "Present" : "Absent";

        rows[i].cells[2].className =
            s.present ? "present" : "absent";
    });

    students = newVDOM;
    oldVDOM = newVDOM;
}