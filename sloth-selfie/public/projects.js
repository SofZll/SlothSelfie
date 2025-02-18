
function loadProjects() {
    fetch("/api/projects")
        .then(response => response.json())
        .then(projects => {
            const list = document.getElementById("projects-list");
            list.innerHTML = ""; // clear the list before loading the projects

            projects.forEach(project => {
                const li = document.createElement("li");
                li.className = "list-group-item";
                li.innerHTML = `<strong>${project.title}</strong> - Capo Progetto: ${project.owner}`;
                list.appendChild(li);
            });
        })
        .catch(error => console.error("Errore nel caricamento progetti:", error));
}


document.addEventListener("DOMContentLoaded", function() {
    loadProjects();
});


 // button to go back to home (React)
 document.getElementById("backToHome").addEventListener("click", function () {
    window.location.href = "/";
});