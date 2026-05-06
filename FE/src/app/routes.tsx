import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/layouts/MainLayout";
import { RequireAuth } from "./components/layouts/RequireAuth";
import { Login } from "./components/pages/Login";
import { Dashboard } from "./components/pages/Dashboard";
import { RoomsList } from "./components/pages/rooms/RoomsList";
import { RoomDetail } from "./components/pages/rooms/RoomDetail";
import { RoomForm } from "./components/pages/rooms/RoomForm";
import { TenantsList } from "./components/pages/tenants/TenantsList";
import { TenantDetail } from "./components/pages/tenants/TenantDetail";
import { TenantForm } from "./components/pages/tenants/TenantForm";
import { ContractsList } from "./components/pages/contracts/ContractsList";
import { ContractDetail } from "./components/pages/contracts/ContractDetail";
import { ContractForm } from "./components/pages/contracts/ContractForm";
import { InvoicesList } from "./components/pages/invoices/InvoicesList";
import { InvoiceDetail } from "./components/pages/invoices/InvoiceDetail";
import { InvoiceForm } from "./components/pages/invoices/InvoiceForm";
// TODO: Reports module — to be implemented in the future
// import { Reports } from "./components/pages/Reports";
import { Account } from "./components/pages/Account";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: RequireAuth,
    children: [
      {
        Component: MainLayout,
        children: [
      { index: true, Component: Dashboard },
      { path: "rooms", Component: RoomsList },
      { path: "rooms/new", Component: RoomForm },
      { path: "rooms/:id", Component: RoomDetail },
      { path: "rooms/:id/edit", Component: RoomForm },
      { path: "tenants", Component: TenantsList },
      { path: "tenants/new", Component: TenantForm },
      { path: "tenants/:id", Component: TenantDetail },
      { path: "tenants/:id/edit", Component: TenantForm },
      { path: "contracts", Component: ContractsList },
      { path: "contracts/new", Component: ContractForm },
      { path: "contracts/:id", Component: ContractDetail },
      { path: "contracts/:id/edit", Component: ContractForm },
      { path: "invoices", Component: InvoicesList },
      { path: "invoices/new", Component: InvoiceForm },
      { path: "invoices/:id", Component: InvoiceDetail },
      { path: "invoices/:id/edit", Component: InvoiceForm },
      // { path: "reports", Component: Reports }, // TODO: implement later
      { path: "account", Component: Account },
        ],
      },
    ],
  },
]);
