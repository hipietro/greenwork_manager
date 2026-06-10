import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { JobsPage } from "./pages/JobsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { EquipmentPage } from "./pages/EquipmentPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AttendancePage } from "./pages/AttendancePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "cantieri",
        element: <JobsPage />,
      },
      {
        path: "dipendenti",
        element: <EmployeesPage />,
      },
      {
        path: "presenze",
        element: <AttendancePage />,
      },
      {
        path: "attrezzature",
        element: <EquipmentPage />,
      },
      {
        path: "impostazioni",
        element: <SettingsPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;