import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import StudentDashboard from "./Pages/StudentDashboard";
import InstructorDashboard from "./Pages/InstructorDashboard";
import ProtectedRoute from "./route/ProtectedRoute";
import ForgotPassword from "./Pages/ForgetPassword";
import ResetPassword from "./Pages/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={["Student"]}>
          <StudentDashboard />
        </ProtectedRoute>
      }/>
      <Route path="/instructor" element={
        <ProtectedRoute allowedRoles={["Instructor"]}>
          <InstructorDashboard />
        </ProtectedRoute>
      }/>
    </Routes>
  );
}

export default App;
