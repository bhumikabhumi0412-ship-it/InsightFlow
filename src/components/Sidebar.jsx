import { NavLink } from "react-router-dom";

import {
    LayoutDashboard,
    MessageSquare,
    Upload,
    BrainCircuit,
    Lightbulb,
    ClipboardList,
    FileText,
} from "lucide-react";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Reviews", icon: MessageSquare, path: "/reviews" },
    { name: "Upload Reviews", icon: Upload, path: "/upload" },
    { name: "AI Insights", icon: BrainCircuit, path: "/insights" },
    { name: "Recommendations", icon: Lightbulb, path: "/recommendations" },
    { name: "Issues", icon: ClipboardList, path: "/issues" },
    { name: "Reports", icon: FileText, path: "/reports" },
];

function Sidebar() {
    return (
        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white p-5 md:block">
            <h2 className="mb-8 text-2xl font-bold text-indigo-600">
                InsightFlow
            </h2>


            <nav className="space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === "/"}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                }`
                            }
                        >
                            <Icon size={19} />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>


            <div className="mt-10 rounded-xl bg-indigo-50 p-4">
                <p className="text-sm font-semibold text-indigo-900">
                    AI-powered insights
                </p>
                <p className="mt-2 text-xs leading-5 text-indigo-700">
                    Turn customer feedback into better business decisions.
                </p>
            </div>
        </aside>
    );
}

export default Sidebar;
