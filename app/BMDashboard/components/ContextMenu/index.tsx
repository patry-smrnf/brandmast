import React from "react";
import { useRouter } from "next/navigation";

type ContextMenuProps = {
  closeMenu: () => void;
};

export default function ContextMenu({ closeMenu }: ContextMenuProps) {
  const router = useRouter();
  return (
    <div className="mt-2 w-44 bg-white rounded-lg shadow-2xl ring-1 ring-black ring-opacity-10 relative">
      {/* Arrow */}
      <div className="absolute -top-2 right-4 w-4 h-4 bg-white rotate-45 shadow-lg"></div>

      <button
        className="block w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white transition-colors rounded-t-lg"
        onClick={() => {
          router.push("/EditNewEvent");
          closeMenu();
        }}
      >
        Dodaj akcje
      </button>
      <button
        className="block w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white transition-colors"
        onClick={() => {
          alert("Option 2 selected");
          closeMenu();
        }}
      >
        Wyloguj
      </button>
            <button
        className="block w-full text-left px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white transition-colors"
        onClick={() => {
          router.push("/TestPage");
          closeMenu();
        }}
      >
        Test Menu
      </button>
    </div>
  );
}
