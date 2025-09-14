import React, { useState, useRef, useEffect } from "react";

import { Card, CardContent, CardHeader,CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select,SelectContent,SelectItem,SelectTrigger,SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Trash2, ChevronLeft, ChevronRight, Plus, FileInput } from "lucide-react";

import ContextMenu from "../SVComponents/ContextMenu";
import { API_BASE_URL } from "../config";
import { shop_response } from "./types/shopType";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { defaultMessage } from "@/types/DefaultMessage";


export default function ShopsBoard() {
    const [rowsToShow, setRowsToShow] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const menuRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [shopsData, setShopsData] = useState<shop_response[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    //Usuwanie polskich znakow i innych gowien  serio
    function normalizeText(text: string) {
      return text
        .normalize("NFD") // split accented letters into base + diacritic
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .toLowerCase();
    }

    //Wczytywanie danych o sklepach itd
    useEffect(() => {
      const fetchShopsData = async () => {
          try {
              const response = await apiFetch<shop_response[]>("/api/general/getAllShops", {
                  method: "GET",
              });

              const data: shop_response[] = await response;
              setShopsData(data);
          }
          catch(error) {
              toast.error("Erorr: " + error);
          }
      };
      fetchShopsData();
    }, []);

    //Lista sklepow po przefilrowaniu adresu
    const filteredShops = shopsData.filter((shop) =>
      normalizeText(shop.address).includes(normalizeText(searchQuery))
    );

    //Paging
    const totalPages = Math.ceil(filteredShops.length / rowsToShow);
    const startIndex = (currentPage - 1) * rowsToShow;
    const endIndex = startIndex + rowsToShow;
    const displayedShops = filteredShops.slice((currentPage - 1) * rowsToShow, currentPage * rowsToShow);


    const [shopAddress, setShopAddress] = useState("");
    const [shopName, setShopName] = useState("");
    const [shopZipCode, setShopZipCode] = useState("");

    //TO DO: wczytywanie przez json
    const [jsonContent, setJsonContent] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    //TO DO:
    const handleJsonUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if(!file) { return; }

      if(file.type !== "application/json") {
        toast.error("Musi to byc .json!");
        return;
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = JSON.parse(text);

          setJsonContent(parsed);

          const response = await fetch(`${API_BASE_URL}/api/general/addShopsJson`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type":"application/json",
            },
            body: JSON.stringify(parsed),
          });

          if(!response.ok){
            toast.error("Problem z upload json");
          }
        }
        catch (error) {
          toast.error("Error: " + error);
        }
      }
      reader.readAsText(file);
    };

    const handleDelete = async (id_: number) => {
      try {
        const response = await apiFetch<defaultMessage>("/api/general/delShop", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_shop: id_
          })
        });

        toast.success(response.message);
      } catch (err) {
        toast.error("[!] An error: " + err);
      }
      setShopsData((prev) => prev.filter((shop) => shop.id_shop !== id_));
    };

    const handleAddShop = async () => {
      if (!shopAddress || !shopName || !shopZipCode) {
        toast.error("Please fill all fields.");
        return;
      }

      try {
        const response = await apiFetch<defaultMessage>("/api/general/addShop", {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            address: shopAddress,
            name: shopName,
            zipcode: shopZipCode
          })
        });

        toast.success(response.message || "[+] BM created successfully!");
      } catch(err) {
        toast.error("[!] An error: " + err);
      }
    };

    
    const handleAddShopFromFile = () => {
      fileInputRef.current?.click();
    };
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center px-6 py-10 space-y-10">
      <Card className="bg-gray-800/60 border border-gray-700 rounded-2xl shadow-xl backdrop-blur-md max-w-7xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-semibold text-white">
            Zarzadzaj sklepami w swoim area
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="flex justify-end items-center w-full mb-4">
            <div className="relative w-full max-w-md">
              <Input
                type="text"
                placeholder="Szukaj po adresie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </div>
            </div>
          </div>
          <Table className="min-w-full text-sm">
            <TableHeader>
              <TableRow className="bg-gray-800 rounded-t-xl">
                <TableHead className="text-left text-gray-300 px-4 py-3">Nazwa</TableHead>
                <TableHead className="text-left text-gray-300 px-4 py-3">Address</TableHead>
                <TableHead className="text-left text-gray-300 px-4 py-3">Lon</TableHead>
                <TableHead className="text-left text-gray-300 px-4 py-3">Lat</TableHead>
                <TableHead className="text-left text-gray-300 px-4 py-3">Zip-code</TableHead>
                <TableHead className="text-center text-gray-300 px-4 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedShops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No shops found.
                  </TableCell>
                </TableRow>
              ) : (
                displayedShops.map((shop) => (
                  <TableRow
                    key={shop.id_shop}
                    className="hover:bg-gray-700 transition-colors duration-200"
                  >
                    <TableCell className="px-4 py-3 text-gray-50">{shop.name}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-50">{shop.address}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-50">{shop.lon}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-50">{shop.lat}</TableCell>
                    <TableCell className="px-4 py-3 text-gray-50">{shop.zipcode}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(shop.id_shop)}
                        className="rounded-full px-3 py-1"
                        aria-label={`Delete shop ${shop.name}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center space-x-3">
              <label
                htmlFor="rowsToShow"
                className="text-gray-300 font-medium select-none"
              >
                Ilosc rekordow:
              </label>
              <Select
                value={rowsToShow.toString()}
                onValueChange={(val) => {
                  setRowsToShow(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-24 border-gray-600 bg-gray-700 text-gray-200 rounded-full" />
                <SelectContent>
                  {[5, 10, 15, 20].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-full flex items-center gap-2 px-4 py-1 text-gray-200 hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft size={18} /> Cofnij
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-full flex items-center gap-2 px-4 py-1 text-gray-200 hover:bg-gray-700 disabled:opacity-50"
              >
                Dalej <ChevronRight size={18} />
              </Button>
            </div>

            <div className="flex gap-3">
                <Dialog>
                <DialogTrigger asChild>
                    <Button className="rounded-full px-5 py-2 flex items-center gap-2 bg-blue-900 border border-blue-700 hover:bg-blue-800">
                        <Plus size={18} /> Dodaj sklep
                        </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 text-white border border-gray-700 max-w-md w-full rounded-xl backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Dodaj nowy sklep</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                        <Label htmlFor="shop_address">Address</Label>
                        <Input id="shop_address" placeholder="Zbawiciela 5" value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} className="mt-1 bg-gray-800 text-white border border-gray-600 rounded-xl"/>

                        <Label htmlFor="shop_name">Name</Label>
                        <Input id="shop_name" placeholder="Zabka" value={shopName} onChange={(e) => setShopName(e.target.value)} className="mt-1 bg-gray-800 text-white border border-gray-600 rounded-xl"/>

                        <Label htmlFor="shop_zipcode">ZipCode</Label>
                        <Input id="shop_zipcode" placeholder="04-444" value={shopZipCode} onChange={(e) => setShopZipCode(e.target.value)} className="mt-1 bg-gray-800 text-white border border-gray-600 rounded-xl"/>

                        </div>
                        <Button onClick={handleAddShop} className="w-full bg-green-600 hover:bg-green-500 text-white rounded-xl" >
                            Dodaj Sklep
                        </Button>
                    </div>
                </DialogContent>
                </Dialog>
                <div>
                  <input type="file" accept=".json, application/json" ref={fileInputRef} onChange={handleJsonUpload} style={{display: "none"}} />
                  <Button variant="secondary" onClick={handleAddShopFromFile} className="rounded-full px-5 py-2 flex items-center gap-2 bg-gray-700 border border-gray-600 hover:bg-gray-600">
                    <FileInput size={18} /> Dodaj sklepy z .json
                  </Button>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
