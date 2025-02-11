# TechFlow App


📄 **[View The App](https://techflow484.netlify.app/login)**  


**TechFlow** is a project management web application that streamlines the task creation and management process for tech projects. It allows users to submit project ideas, automatically generate structured tasks, and integrates directly with **Linear** for effective workflow management. Additionally, TechFlow enables users to update tasks, view an activity log, and securely manage their session with Linear.

## Key Features

1. **Login & Authorization**

   - **Login Page**: When users first visit TechFlow, they are prompted to log in to their Linear account.
   - **Authorization**: After signing in through Linear (in a new browser tab), users return to the TechFlow tab to authorize access, allowing TechFlow to manage tasks on their behalf.

2. **Task Board**

   - **Overview**: Once authorized, users see a **Task Board** displaying all existing tasks.
   - **Quick Task Creation**: A **"Create New Task"** box lets users easily open the task creation form.

3. **Create New Task**

   - **Input Form**: Users can provide key details about their project:
     - **App Idea**: A concise description of the application.
     - **Main Features**: The core functionalities or features requested.
     - **Tech Stack**: Preferred technologies and tools for development.
     - **Deadline**: The desired completion date.

4. **Task Generation & Integration**

   - **Automated Task Creation**: On submission, details are sent to the **Groq API**, which generates a structured set of tasks tailored to the user’s inputs.
   - **Linear Integration**: Generated tasks are automatically sent to **Linear**, where they are added to the Backlog, facilitating centralized and efficient task management.

5. **Task Updates**

   - **Editing Capabilities**: Users can update tasks directly from the Task Board or an individual task view:
     - **Description**: Modify the summary or instructions for the task.
     - **Assignee**: Assign or reassign tasks to team members.
     - **Due Date**: Adjust deadlines as needed.
     - **Status**: Change the task’s workflow state (e.g., "To Do," "In Progress," "Done").

6. **View Logs**

   - **Activity History**: The **View Logs** tab provides a chronological record of all task-related events, including creation, updates, and status changes.
   - **Audit & Transparency**: Logs help trace changes, ensuring accountability and ease of troubleshooting.

7. **Logout & Token Revocation**
   - **Secure Logout**: Users can log out from TechFlow, which revokes the Linear access token and securely logs them out of Linear.
   - **Privacy & Security**: This ensures user accounts remain protected, preventing unauthorized use of their credentials.

---

## Tech Stack

- **Frontend**: React + TypeScript (with Redux-Saga for state management)
- **Backend**: Express.js hosted on Vercel
- **API Integration**:
  - **groq API** for generating tasks based on user inputs
  - **Linear** for task management and storage

---

## Usage

1. **Login & Authorize**

- Navigate to the homepage.
- If not logged in, a login prompt will appear.
- Follow the instructions to authorize TechFlow with your Linear account.

2. **Create a New Task**

- Click **"Create New Task"** on the Task Board.
- Fill out the form:
  - **App Idea**: Describe your project idea.
  - **Main Features**: List the key functionalities.
  - **Tech Stack**: Specify preferred technologies.
  - **Deadline**: Set an expected completion date.
- Submit the form to generate tasks.
- After submission, you will be redirected to the Task Board with the newly generated tasks displayed.

3. **Managing Tasks**

- Click on any existing task on the Task Board to view or update its details.
- Modify:
  - **Description**
  - **Assignee**
  - **Due Date**
  - **Status** (e.g., "To Do," "In Progress," "Done")
- Updates are automatically synced back to Linear.

4. **View Logs**

- Open the **View Logs** tab.
- You can see the history of task events of the team, including creation, updates, and status changes.

5. **Logout**

- Click **Logout**.
- This action revokes your Linear access token and securely logs you out.

---

**TechFlow** aims to be a streamlined, intelligent task management solution, helping users transform project ideas into structured, actionable plans effortlessly. Happy Tasking!
