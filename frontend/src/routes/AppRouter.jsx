import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import DashboardAdmin from "../pages/DashboardAdmin";
import DashboardTeacher from "../pages/DashboardTeacher";
import DashboardStudent from "../pages/DashboardStudent";
import DashboardQuality from "../pages/DashboardQuality";
import PrivateRoute from "./PrivateRoute";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Routes protégées */}
      / Dans les routes protégées pour admin
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/register" element={<Register />} />
      </Route>
  
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route path="/admin-dashboard" element={<DashboardAdmin />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['teacher']} />}>
        <Route path="/teacher-dashboard" element={<DashboardTeacher />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['student']} />}>
        <Route path="/student-dashboard" element={<DashboardStudent />} />
      </Route>

      <Route element={<PrivateRoute allowedRoles={['quality_manager']} />}>
        <Route path="/quality-dashboard" element={<DashboardQuality />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
