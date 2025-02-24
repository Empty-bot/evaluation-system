import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminDashboard from "../pages/AdminDashboard";
import TeacherDashboard from "../pages/TeacherDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import QualityDashboard from "../pages/QualityDashboard";
import PrivateRoute from "./PrivateRoute";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Routes protégées */}
      / Dans les routes protégées pour admin
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['student']} />}>
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['quality_manager']} />}>
        <Route path="/quality-dashboard" element={<QualityDashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
