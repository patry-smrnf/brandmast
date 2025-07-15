import React from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  BarChart2,
  PlusCircle,
  LayoutDashboard,
  FlaskConical,
  Users
} from "lucide-react"; // optional icons
import clsx from "clsx";

type ContextMenuProps = {
  closeMenu: () => void;
};

const menuItems = [
  {
    label: "Zarzadzaj BM",
    icon: Users,
    route: "/BMChartboard",
  },
  {
    label: "Team Dashboard",
    icon: LayoutDashboard,
    route: "/",
  },
  {
    label: "Test Menu",
    icon: FlaskConical,
    route: "/TestPage",
  },
];

export default function ContextMenu({ closeMenu }: ContextMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8081/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    router.push("Login");
  };

  return (
    <div className="relative mt-2 w-52 bg-white rounded-xl shadow-2xl ring-1 ring-black/10 overflow-hidden">
      {/* Arrow */}
      <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 shadow-sm z-10"></div>

      <div className="flex flex-col divide-y divide-gray-200">
        {menuItems.map(({ label, icon: Icon, route }, idx) => (
          <button
            key={idx}
            onClick={() => {
              router.push(route);
              closeMenu();
            }}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700",
              "hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white",
              "transition-colors duration-200 ease-in-out"
            )}
          >
            <Icon className="w-4 h-4 opacity-80" />
            {label}
          </button>
        ))}

        <button
          onClick={() => {
            handleLogout();
            closeMenu();
          }}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          Wyloguj
        </button>
      </div>
    </div>
  );
}
