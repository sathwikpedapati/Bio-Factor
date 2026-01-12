import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Dashboards
import ExecutiveDashboard from "@/pages/dashboards/ExecutiveDashboard";
import SalesDashboard from "@/pages/dashboards/SalesDashboard";
import ManufacturingDashboard from "@/pages/dashboards/ManufacturingDashboard";
import QCDashboard from "@/pages/dashboards/QCDashboard";
import WarehouseDashboard from "@/pages/dashboards/WarehouseDashboard";
import FinanceDashboard from "@/pages/dashboards/FinanceDashboard";
import HRDashboard from "@/pages/dashboards/HRDashboard";
import FieldOpsDashboard from "@/pages/dashboards/FieldOpsDashboard";
import RnDDashboard from "@/pages/dashboards/RnDDashboard";

// CRUD Pages
import DealersPage from "@/pages/sales/DealersPage";
import OrdersPage from "@/pages/sales/OrdersPage";
import FarmersPage from "@/pages/sales/FarmersPage";
import CampaignsPage from "@/pages/sales/CampaignsPage";
import BatchesPage from "@/pages/manufacturing/BatchesPage";
import ProductsPage from "@/pages/manufacturing/ProductsPage";
import MachinesPage from "@/pages/manufacturing/MachinesPage";
import EmployeesPage from "@/pages/hr/EmployeesPage";
import AttendancePage from "@/pages/hr/AttendancePage";
import LeavesPage from "@/pages/hr/LeavesPage";
import QCTestsPage from "@/pages/qc/QCTestsPage";
import InventoryPage from "@/pages/warehouse/InventoryPage";
import WarehousesPage from "@/pages/warehouse/WarehousesPage";
import InvoicesPage from "@/pages/finance/InvoicesPage";
import PaymentsPage from "@/pages/finance/PaymentsPage";
import FinanceReportsPage from "@/pages/finance/FinanceReportsPage";
import VisitsPage from "@/pages/fieldops/VisitsPage";
import TrialsPage from "@/pages/rnd/TrialsPage";
import PayrollPage from "@/pages/hr/PayrollPage";
import InwardPage from "@/pages/warehouse/InwardPage";
import DispatchPage from "@/pages/warehouse/DispatchPage";
import TransfersPage from "@/pages/warehouse/TransfersPage";
import DemosPage from "@/pages/fieldops/DemosPage";
import IssuesPage from "@/pages/fieldops/IssuesPage";
import ResearchPage from "@/pages/rnd/ResearchPage";
import AuditLogsPage from "@/pages/admin/AuditLogsPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import RolesPage from "@/pages/admin/RolesPage";
import RecruitmentPage from "@/pages/hr/RecruitmentPage";
import DemosAndIssuesPage from "@/pages/fieldops/DemosAndIssuesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route element={<DashboardLayout />}>
              {/* Dashboards */}
              <Route path="/dashboard/executive" element={<ExecutiveDashboard />} />
              <Route path="/dashboard/sales" element={<SalesDashboard />} />
              <Route path="/dashboard/manufacturing" element={<ManufacturingDashboard />} />
              <Route path="/dashboard/qc" element={<QCDashboard />} />
              <Route path="/dashboard/warehouse" element={<WarehouseDashboard />} />
              <Route path="/dashboard/finance" element={<FinanceDashboard />} />
              <Route path="/dashboard/hr" element={<HRDashboard />} />
              <Route path="/dashboard/fieldops" element={<FieldOpsDashboard />} />
              <Route path="/dashboard/rnd" element={<RnDDashboard />} />
              
              {/* Sales */}
              <Route path="/sales/dealers" element={<DealersPage />} />
              <Route path="/sales/orders" element={<OrdersPage />} />
              <Route path="/sales/farmers" element={<FarmersPage />} />
              <Route path="/sales/campaigns" element={<CampaignsPage />} />
              <Route path="/sales/reports" element={<SalesDashboard />} />
              
              {/* Manufacturing */}
              <Route path="/manufacturing/batches" element={<BatchesPage />} />
              <Route path="/manufacturing/production" element={<ProductsPage />} />
              <Route path="/manufacturing/machines" element={<MachinesPage />} />
              
              {/* HR */}
              <Route path="/hr/employees" element={<EmployeesPage />} />
              <Route path="/hr/attendance" element={<AttendancePage />} />
              <Route path="/hr/leaves" element={<LeavesPage />} />
              <Route path="/hr/recruitment" element={<RecruitmentPage />} />
                <Route path="/hr/payroll" element={<PayrollPage />} />
              
              {/* QC */}
              <Route path="/qc/tests" element={<QCTestsPage />} />
              <Route path="/qc/batches" element={<QCDashboard />} />
              <Route path="/qc/deviations" element={<QCDashboard />} />
              
              {/* Warehouse */}
              <Route path="/warehouse/inventory" element={<InventoryPage />} />
              <Route path="/warehouse/inward" element={<InwardPage />} />
              <Route path="/warehouse/dispatch" element={<DispatchPage />} />
              <Route path="/warehouse/transfers" element={<TransfersPage />} />
              
              {/* Finance */}
              <Route path="/finance/invoices" element={<InvoicesPage />} />
              <Route path="/finance/payments" element={<PaymentsPage />} />
              <Route path="/finance/reports" element={<FinanceReportsPage />} />
              
              {/* Field Ops */}
              <Route path="/fieldops/visits" element={<VisitsPage />} />
              <Route path="/fieldops/demos" element={<DemosPage />} />
              <Route path="/fieldops/issues" element={<IssuesPage />} />
              
              {/* R&D */}
              <Route path="/rnd/trials" element={<TrialsPage />} />
              <Route path="/rnd/research" element={<ResearchPage />} />
              
              {/* Admin */}
              <Route path="/admin/audit" element={<AuditLogsPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
              <Route path="/admin/roles" element={<RolesPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
