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

  //function to adjust the activities with 0 days duration for gantt
  const AdjustZeroDuration = (activity) => {
    const start = new Date(activity.startDate);
    let end = new Date(activity.deadline);
    
    if (end <= start) {
      end.setHours(start.getHours() + 1); // Adds 1 hour
    }
  
    return { ...activity, deadline: end };
  };

  const disableDefaultBehaviour = (gantt) => {
    // Disable the default gantt behavior
    gantt.bind_bar = () => {};
    gantt.bind_bar_progress = () => {};
    gantt.bind_resize = () => {};
    gantt.bind_dependency = () => {};
    gantt.update_bar_position = () => {};
    gantt.setup_dependencies = () => {};
    gantt.unselect_all = () => {};

    // Overwrite the SVG listeners to disable the default behavior
    gantt.$svg.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
    }, true);

    gantt.$svg.addEventListener('mouseup', (e) => {
      e.stopPropagation();
      e.preventDefault();
    }, true);

    gantt.$svg.addEventListener('mousemove', (e) => {
      e.stopPropagation();
      e.preventDefault();
    }, true);
  }

  useEffect(() => {
    if (project) {
      // Creates activities for the Gantt chart
      const tasks = [];
      project.phases.forEach(phase => {
        // Adjust zero duration activities
        const adjustedMacroActivity = AdjustZeroDuration(phase.macroActivity);
        // Adds macro of the phase
        tasks.push({
          id: `macro-${phase.macroActivity._id}`,
          name: `Macro: ${phase.macroActivity.title}`,
          start: new Date(phase.macroActivity.startDate),
          end: new Date(adjustedMacroActivity.deadline),  
        });

        // Adds activities of the phase macro
        phase.activities.forEach(activity => {
        const adjustedActivity = AdjustZeroDuration(activity);
          tasks.push({
            id: activity._id,
            name: activity.title,
            start: new Date(activity.startDate),
            end: new Date(adjustedActivity.deadline),
            assignee: activity.sharedWith.map(a => a.username).join(", "),
            dependencies: activity.dependencies || [],
            custom_class: `activities-of-${phase.macroActivity._id}`,
          });
        });

        phase.subphases.forEach(subphase => {
        const adjustedSubphaseMacroActivity = AdjustZeroDuration(subphase.macroActivity);
        // Adds macro of the subphase
          tasks.push({
            id: `macro-${subphase.macroActivity._id}`,
            name: `Macro: ${subphase.macroActivity.title}`,
            start: new Date(subphase.macroActivity.startDate),
            end: new Date(adjustedSubphaseMacroActivity.deadline),
          });

          //adds activities of the subphase macro
          subphase.activities.forEach(activity => {
            const adjustedActivity = AdjustZeroDuration(activity);
            tasks.push({
              id: activity._id,
              name: activity.title,
              start: new Date(activity.startDate),
              end: new Date(adjustedActivity.deadline),
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

        //Disable default gantt behavior
        disableDefaultBehaviour(gantt);
        gantt.render();
      }
    }
  }, [project]);

  if (!project) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div id="gantt-container"></div>
      </div>
    </div>
  );
};

export default GanttChartView;
