import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Kanban from "./pages/Kanban";
import Login from "./pages/Login";
import Notes from "./pages/Notes";
import Notifications from "./pages/Notifications";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Workspace from "./pages/Workspace";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      <Route path="/workspace/:workspaceId" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Workspace />} />
        <Route path="notes" element={<Notes />} />
        <Route path="tasks" element={<Kanban />} />
        <Route path="search" element={<Search />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>
    </Routes>
  );
}