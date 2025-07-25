import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ContextMenu from "../SVDashBoard/ContextMenu";
import { BMResData } from "../SVDashBoard/types/BMResponse";
import { toast } from "sonner";
import { API_BASE_URL } from "../config";

export default function SVBmChartPage() {
  const [plhLogin, setPLHLogin] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(3);
  const [page, setPage] = useState(0);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bmData, setBmData] = useState<BMResData[]>([]);

  useEffect(() => {
    const fetchBMdata = async () => {
        try {
            const response = await fetch(`/api/sv/myBMs`, {
                method: "GET",
                credentials: "include"
            });

            if(!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message || "Unknown error occurred");
                throw new Error("Failed to fetch data");
            }

            const data: BMResData[] = await response.json();
            setBmData(data);
        }
        catch(error) {
            toast.error("Erorr: " + error);
        }
    };
    fetchBMdata();
  }, []);

  const handleDelete = async (id: number) => {
    const payload = {
      id_bm: id,
    };
    try{
      const response = await fetch(`/api/sv/deleteBM`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if(!response.ok) {
        toast.error(result.message);
        throw new Error(result.message);
      }

      toast.success(result.message || "BM created successfully!");
    }
    catch(error) {
      toast.error("error" + error);
    }

  };

  const handleCreate = async (e: React.FormEvent) =>  {
    e.preventDefault();

    
    if (!plhLogin) {
      toast.error("Please fill all fields.");
      return;
    }

    const payload = {
      login: plhLogin,
    };

    try {
      const response = await fetch(`/api/sv/createBM`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if(!response.ok) {
        toast.error(result.message);
        throw new Error(result.message);
      }

      toast.success(result.message || "BM created successfully!");
      
    }
    catch(error) {
      toast.error("error" + error);
    }

  };

  const paginatedUsers = bmData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <>
      <div ref={menuRef} className="fixed top-4 right-4 z-50" onClick={(e) => e.stopPropagation()} >
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center focus:outline-none" type="button">
          <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          </button>
          {menuOpen && <ContextMenu closeMenu={() => setMenuOpen(false)} />}
      </div>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center px-4 py-6 sm:px-6 space-y-8">
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
          <Card className="bg-gray-800/60 border border-gray-700 rounded-2xl shadow-xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold text-white">Statystyki</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Ilosc bm:</span>
                <span className="text-white font-medium text-lg">{bmData.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Team Name:</span>
                <span className="text-white font-medium text-lg">R210DV3</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 border border-gray-700 rounded-2xl shadow-xl backdrop-blur-md">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="text-lg md:text-xl font-semibold text-white">Zarzadzaj BM-ami</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="default" className="py-2.5 px-5 me-2 mb-2 text-small font-medium text-white focus:outline-none bg-blue-900 rounded-full border border-blue-600 hover:bg-blue-800 focus:z-10 focus:ring-4 focus:ring-gray-400 ">
                    Dodaj nowego BM
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-md w-full rounded-xl backdrop-blur-xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg">Dodaj nowego BM do swojego teamu</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="login">login PLH</Label>
                      <Input
                        id="login"
                        placeholder="PLHXXXXX"
                        value={plhLogin}
                        onChange={(e) => setPLHLogin(e.target.value)}
                        className="mt-1 bg-gray-800 text-white border border-gray-600 rounded-xl"
                      />
                    </div>
                    <Button
                      onClick={handleCreate}
                      className="w-full bg-green-600 hover:bg-green-500 text-white rounded-xl"
                    >
                      Dodaj BM
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="bg-gray-800">
                    <TableHead className="text-left text-gray-200">Login</TableHead>
                    <TableHead className="text-left text-gray-200">Imie</TableHead>
                    <TableHead className="text-left text-gray-200">Nazwisko</TableHead>
                    <TableHead className="text-left text-gray-200">Area</TableHead>
                    <TableHead className="text-left text-gray-200">Usuwanie</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow
                      key={user.id_bm}
                      className="hover:bg-gray-800/40 transition-colors duration-200"
                    >
                      <TableCell className="text-white font-medium whitespace-nowrap">
                        {user.login}
                      </TableCell>
                      <TableCell className="text-gray-300 whitespace-nowrap">
                          Zostanie dodane
                      </TableCell>
                      <TableCell className="text-gray-300 whitespace-nowrap">
                          Zostanie dodane
                      </TableCell>
                      <TableCell className="text-gray-300 whitespace-nowrap">
                        {user.area_name}
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleDelete(user.id_bm)} variant="destructive" className="py-1 px-4 text-xs font-medium text-white focus:outline-none bg-red-900 rounded-full border border-red-600 hover:bg-red-800 focus:z-10 focus:ring-4 focus:ring-gray-400 ">
                          Usun
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4">
                <div className="space-x-2">
                  <label htmlFor="rowsPerPage" className="text-sm text-gray-400">Ilosc rekordow:</label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm"
                  >
                    {[3, 5, 10].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    className="text-white hover:bg-gray-700"
                  >
                    Cofnij
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setPage((prev) => (page + 1) * rowsPerPage < bmData.length ? prev + 1 : prev)}
                    disabled={(page + 1) * rowsPerPage >= bmData.length}
                    className="text-white hover:bg-gray-700"
                  >
                    Dalej
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
