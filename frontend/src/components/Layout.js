import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, LayoutDashboard, Database, FileText, ClipboardList, LogOut, User, Wrench } from "lucide-react";

export default function Layout({ user, onLogout, children }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/masters", label: "Masters", icon: Database },
    { path: "/master-builder", label: "Master Builder", icon: Wrench },
    { path: "/boms", label: "BOM Management", icon: FileText },
    { path: "/mrp", label: "MRP Management", icon: ClipboardList }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">GarmentERP</h1>
                <p className="text-xs text-slate-600">Manufacturing System</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                    data-testid={`nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{user.username}</span>
                <span className="text-xs text-slate-500 px-2 py-1 bg-slate-200 rounded">{user.role}</span>
              </div>
              <Button
                onClick={onLogout}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
