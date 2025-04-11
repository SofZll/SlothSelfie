import React, { useEffect, useState } from 'react';
import Gantt from 'frappe-gantt';
import '../dist/frappe-gantt.css'

const GanttChartView = ({ projectId }) => {
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/project/${projectId}`);
        const projectData = await response.json();
        console.log(projectData);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        setProject(projectData);
      } catch (error) {
        console.error("Error while fetching project:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (project) {
      // Creates activities for the Gantt chart
      const tasks = [];
      project.phases.forEach(phase => {
        // Adds macro of the phase
        tasks.push({
          id: `macro-${phase.macroActivity._id}`,
          name: `Macro: ${phase.macroActivity.title}`,
          start: new Date(phase.macroActivity.startDate),
          end: new Date(phase.macroActivity.deadline),
        });

        // Adds activities of the phase macro
        phase.activities.forEach(activity => {
          tasks.push({
            id: activity._id,
            name: activity.title,
            start: new Date(activity.startDate),
            end: new Date(activity.deadline),
            assignee: activity.sharedWith.map(a => a.username).join(", "),
            dependencies: activity.dependencies || [],
            custom_class: `activities-of-${phase.macroActivity._id}`,
          });
        });

        phase.subphases.forEach(subphase => {
        // Adds macro of the subphase
          tasks.push({
            id: `macro-${subphase.macroActivity._id}`,
            name: `Macro: ${subphase.macroActivity.title}`,
            start: new Date(subphase.macroActivity.startDate),
            end: new Date(subphase.macroActivity.deadline),
          });

          //adds activities of the subphase macro
          subphase.activities.forEach(activity => {
            tasks.push({
              id: activity._id,
              name: activity.title,
              start: new Date(activity.startDate),
              end: new Date(activity.deadline),
              assignee: activity.sharedWith.map(a => a.username).join(", "),
              dependencies: activity.dependencies || [],
              custom_class: `activities-of-${subphase.macroActivity._id}`,
            });
          });
        });
      });

      // Creates the Gantt chart
      const ganttContainer = document.getElementById("gantt-container");
      if (ganttContainer) {
        ganttContainer.innerHTML = ''; // Reset del Gantt chart
        const gantt = new Gantt("#gantt-container", tasks, {
          view_mode: "Week", //"Week", "Month"
          on_click: (task) => {
            if (!task) return;
          },
        });
        gantt.render();
      }
    }
  }, [project]);

  if (!project) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div id="gantt-container" style={{ flex: 1, height: "500px" }}></div>
      </div>
    </div>
  );
};

export default GanttChartView;
