# Survey System

Survey System is a comprehensive full-stack web application designed for creating, managing, and analyzing dynamic surveys and forms. It features a modern React frontend and a robust Node.js/Express backend with MongoDB for scalable data storage.

---

## Key Features

- **Dynamic Form Builder:**  
  Create surveys with multiple question types including short answer, multiple choice, checkboxes, dropdowns, linear scales, and more. This allows for flexible and customizable survey creation tailored to various data collection needs.

- **Form Management:**  
  Easily publish, update, and organize your surveys. Admin users can manage the lifecycle of forms, including editing existing forms and controlling their availability to employees.

- **User Roles and Dashboards:**  
  - **Admin:**  
    Manage employees, departments, designations, and forms through a dedicated dashboard. View summary statistics such as total employees, total forms, and total responses to monitor system usage and engagement.  
  - **Employee:**  
    Register their profile using a registration form and fill out surveys assigned by the admin. Employees have a personalized dashboard to access their tasks and surveys.

- **Response Collection & Analysis:**  
  Collect survey responses in real-time and view detailed results. The system supports response submission, retrieval, and summary statistics to facilitate data-driven decision making.

- **Authentication & Security:**  
  Secure login and registration with OTP verification. Role-based access control ensures that users can only access features appropriate to their role (admin or employee). Input validation and secure data transactions are implemented to protect data integrity.

---

## Technology Stack

- **Frontend:** React, Material-UI (MUI), React Router  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB with Mongoose ODM  
- **Authentication:** JWT tokens, OTP verification  
- **Other:** RESTful API architecture, Axios for API calls

---

## How It Works

1. **Admin Workflow:**  
   - Logs in to the system and accesses the Admin Dashboard.  
   - Manages organizational data such as employees, departments, and designations.  
   - Creates and publishes dynamic survey forms using the form builder.  
   - Views summary statistics and detailed reports on survey responses.  

2. **Employee Workflow:**  
   - Registers their profile through the Employee Registration Form.  
   - Logs in and accesses the Employee Dashboard.  
   - Views and fills surveys assigned by the admin.  
   - Submits responses which are stored and made available for admin analysis.

---

## Project Structure Overview

- **Client (React Frontend)**  
  - `src/components/` - Reusable UI components  
  - `src/pages/` - Application pages and views  
  - `src/services/` - API service layer for backend communication  
  - `public/` - Static assets and HTML template  

- **Server (Node.js Backend)**  
  - `src/config/` - Database and environment configuration  
  - `src/models/` - Mongoose schemas and data models  
  - `src/routes/` - API route handlers  
  - `src/server.js` - Server entry point and middleware setup  

---

## Environment Configuration

Create a `.env` file in the `server/` directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
PORT=4000
```

Ensure your MongoDB instance is accessible and the connection string is correctly set.

---

## Running the Application

1. **Backend Setup**

   Navigate to the server directory, install dependencies, and start the server:

   ```bash
   cd server
   npm install
   npm start
   ```

2. **Frontend Setup**

   In a separate terminal, navigate to the client directory, install dependencies, and start the React app:

   ```bash
   cd client
   npm install
   npm start
   ```

3. Open your browser and visit `http://localhost:3000` to access the Survey System.

---

## Testing Recommendations

- Verify form creation, editing, and deletion workflows.  
- Test response submission and data persistence.  
- Validate API endpoints for expected behavior and error handling.  
- Ensure UI responsiveness and accessibility across devices.

---

## Deployment

Refer to the `DEPLOYMENT_INSTRUCTIONS.md` file for detailed guidance on deploying both the client and server applications to production environments.

---

This documentation aims to provide a clear understanding of the Survey System project, facilitating easy setup, development, and deployment.
