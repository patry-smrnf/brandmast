// src/components/dashboard/Dashboard.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from 'recharts';
import ContextMenu from "../BMDashboard/components/ContextMenu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { API_BASE_URL } from '../config';

interface ActionData {
  id_akcja: number;
  status: string;
  date: string;
  type: string;
  address: string;
  szkolenie: boolean;
  start_sys: string;
  stop_sys: string;
  start_real: string;
  stop_real: string;
}

interface DailyHours {
  date: string;
  systemHours: number;
  realHours: number;
}

interface TypeCount {
  type: string;
  count: number;
}

interface DashboardProps {
  data: ActionData[];
}

const calculateHours = (start: string, end: string): number => {
  const startTime = new Date(`1970-01-01T${start}Z`);
  const endTime = new Date(`1970-01-01T${end}Z`);
  if (endTime < startTime) endTime.setDate(endTime.getDate() + 1);
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-md p-4 border border-gray-700 rounded-xl shadow-lg">
        <p className="font-semibold text-zinc-100 mb-1">{`📅 ${label}`}</p>
        {payload[0] && (
          <p className="text-emerald-400">{`System: ${payload[0].value.toFixed(2)}h`}</p>
        )}
        {payload[1] && (
          <p className="text-sky-400">{`Real: ${payload[1].value.toFixed(2)}h`}</p>
        )}
      </div>
    );
  }
  return null;
};

const BMChartBoard: React.FC = () => {
  const [data, setData] = useState<ActionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hourType, setHourType] = useState<'system' | 'real' | 'both'>('both');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [iloscGlo, setIloscGlo] = useState("");
  const [iloscVelo, setIloscVelo] = useState("");
  const [wyplata, setWyplata] = useState<number | null>(null);
  const [bonus, setBonus] = useState<number | null>(null);
  const [efGlo, setEfGlo] =  useState<number | null>(null);
  const [efVelo, setEfVelo] =  useState<number | null>(null);
  const [trybGodzin, setTrybGodzin] = useState("systemowe");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/bm/actionsForChart`, {
            method: "GET",
            credentials: "include",
        });        
      const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  
  const dailyHours = useMemo(() => {
    const grouped: Record<string, DailyHours> = {};
    data.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = { date: item.date, systemHours: 0, realHours: 0 };
      }
      grouped[item.date].systemHours += calculateHours(item.start_sys, item.stop_sys);
      grouped[item.date].realHours += calculateHours(item.start_real, item.stop_real);
    });

    return Object.values(grouped).sort((a, b) => {
      const dateA = new Date(a.date.split('.').reverse().join('-'));
      const dateB = new Date(b.date.split('.').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
  }, [data]);


  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);


  const handleCalculate = () => {
    const gloValue = parseFloat(iloscGlo) || 0;
    const veloValue = parseFloat(iloscVelo) || 0;
    let ilosc_godzin = 0;

    if(trybGodzin === "systemowe") {
      ilosc_godzin = dailyHours.reduce((sum, day) => sum + day.systemHours, 0);
    }
    if(trybGodzin === "realne") {
      ilosc_godzin = dailyHours.reduce((sum, day) => sum + day.realHours, 0);
    }
    const ilosc_akcji = ilosc_godzin / 4;

    const efektywnosc_glo = gloValue / ilosc_akcji;
    const efektywnosc_velo = veloValue / ilosc_akcji;

    let bonus = 0;
    if(efektywnosc_velo > 3 && efektywnosc_velo < 3.9) {
      bonus = 15 * gloValue;
    }

    if(efektywnosc_velo > 4 && efektywnosc_velo < 5.3) {
      if(efektywnosc_glo >= 1.8) {
        if( gloValue >= 34 ) {
          bonus = 39 * gloValue;
        }
        else {
          bonus = 35 * gloValue;
        }
      }
      else {
        if( gloValue >= 34 ) {
          bonus = 30 * gloValue;
        }
        else {
          bonus = 25 * gloValue;
        }
      }
    }
    if(efektywnosc_velo > 5.4 && efektywnosc_velo < 7.3) {
      if(efektywnosc_glo >= 1.8) {
        if( gloValue >= 34 ) {
          bonus = 50 * gloValue;
        }
        else {
          bonus = 44 * gloValue;
        }
      }
      else {
        if( gloValue >= 34 ) {
          bonus = 38 * gloValue;
        }
        else {
          bonus = 31 * gloValue;
        }
      }
    }
    if(efektywnosc_velo > 7.4) {
      if(efektywnosc_glo >= 1.8) {
        if( gloValue >= 34 ) {
          bonus = 55 * gloValue;
        }
        else {
          bonus = 49 * gloValue;
        }
      }
      else {
        if( gloValue >= 34 ) {
          bonus = 42 * gloValue;
        }
        else {
          bonus = 35 * gloValue;
        }
      }
    }

    

    const calculatedWyplata = ilosc_godzin * 45; // example
    const calculatedBonus = bonus; // example

    setEfGlo(Number(efektywnosc_glo.toFixed(2)));
    setEfVelo(Number(efektywnosc_velo.toFixed(2)));
    setWyplata(calculatedWyplata);
    setBonus(calculatedBonus);
  };
  return (
    <>
    {/* Context menu button */}
    <div ref={menuRef} className="fixed top-4 right-4 z-50" onClick={(e) => e.stopPropagation()} >
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center focus:outline-none" type="button">
        <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        </button>
        {menuOpen && <ContextMenu closeMenu={() => setMenuOpen(false)} />}
    </div>
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-zinc-900 text-white p-6">
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calculator */}
                <Card className="bg-gray-800/60 border border-gray-700/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <CardTitle className="text-xl font-semibold text-white">
                      Kalkulator wypłat
                    </CardTitle>
                  </div>
                  <CardContent className="space-y-5">
                    {/* --- Radio Buttons --- */}
                    <div>
                      <Label className="text-gray-300 mb-2 block">Które godziny?</Label>
                    <RadioGroup value={trybGodzin} onValueChange={setTrybGodzin}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="systemowe" id="systemowe" />
                        <Label htmlFor="systemowe" className="text-gray-300 cursor-pointer">Systemowe</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="realne" id="realne" />
                        <Label htmlFor="realne" className="text-gray-300 cursor-pointer">Realne</Label>
                      </div>
                    </RadioGroup>
                    </div>
                    <div>
                      <Label htmlFor="iloscGlo" className="mb-2 block text-gray-300">
                        Ilość GLO
                      </Label>
                      <Input
                        id="iloscGlo"
                        type="number"
                        placeholder="30"
                        value={iloscGlo}
                        onChange={(e) => setIloscGlo(e.target.value)}
                        className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="iloscVelo" className="mb-2 block text-gray-300">
                        Ilość VELO
                      </Label>
                      <Input
                        id="iloscVelo"
                        type="number"
                        placeholder="120"
                        value={iloscVelo}
                        onChange={(e) => setIloscVelo(e.target.value)}
                        className="bg-gray-700 text-white border-gray-600 placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>

                    <Button
                      type="button"
                      variant="default"
                      onClick={handleCalculate}
                      className="w-full sm:w-1/2 text-base bg-green-700 hover:bg-green-600"
                    >
                      Policz wypłatę
                    </Button>
                    {wyplata !== null && bonus !== null && (
                      <div className="mt-6 space-y-3">
                        <div className="flex justify-between items-center bg-gray-700/60 p-3 rounded-lg">
                          <span className="text-gray-300">Efektynosc GLO:</span>
                          <span className="bg-gray-900 text-gray-300 font-semibold px-3 py-1 rounded-md">
                            {efGlo}
                          </span>
                          <span className="text-gray-300">Efektynosc VELO:</span>
                          <span className="bg-gray-900 text-gray-300 font-semibold px-3 py-1 rounded-md">
                            {efVelo}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-700/60 p-3 rounded-lg">
                          <span className="text-gray-300">Twoja wypłata za godziny:</span>
                          <span className="bg-green-900 text-green-300 font-semibold px-3 py-1 rounded-md">
                            {wyplata} zł
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-700/60 p-3 rounded-lg">
                          <span className="text-gray-300">Twój bonus:</span>
                          <span className="bg-yellow-900 text-yellow-300 font-semibold px-3 py-1 rounded-md">
                            {bonus} zł
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* Line Chart */}
                <Card className="bg-gray-800/60 border border-gray-700/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow rounded-2xl">
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle className="text-xl font-semibold text-white">Godziny pracy</CardTitle>
                            <ToggleGroup
                            type="single"
                            value={hourType}
                            onValueChange={(value) => setHourType(value as any)}
                            className="inline-flex gap-1 bg-zinc-800/60 border border-zinc-700 rounded-xl p-1 shadow-inner"
                            >
                            {['system', 'real', 'both'].map((val) => (
                                <ToggleGroupItem
                                key={val}
                                value={val}
                                className={`
                                    px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all duration-200
                                    data-[state=on]:bg-indigo-600 data-[state=on]:text-white
                                    data-[state=off]:bg-transparent data-[state=off]:text-zinc-300
                                    hover:bg-zinc-700 hover:text-white focus-visible:outline-none
                                `}
                                >
                                {val}
                                </ToggleGroupItem>
                            ))}
                            </ToggleGroup>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 rounded-lg overflow-hidden bg-gray-900/30 p-2">
                            <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyHours}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                                <XAxis
                                dataKey="date"
                                stroke="#a1a1aa"
                                tick={{ fill: '#a1a1aa' }}
                                tickFormatter={(dateStr: string) => {
                                    // assuming format is "dd.mm.yyyy"
                                    const [day, month] = dateStr.split('.');
                                    return `${day}.${month}`;
                                }}
                                />
                                <YAxis stroke="#a1a1aa" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                {(hourType === 'system' || hourType === 'both') && (
                                <Line type="monotone" dataKey="systemHours" name="System" stroke="#10b981" strokeWidth={2} />
                                )}
                                {(hourType === 'real' || hourType === 'both') && (
                                <Line type="monotone" dataKey="realHours" name="Real" stroke="#3b82f6" strokeWidth={2} />
                                )}
                            </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                {/* Bar Chart */}
                <Card className="bg-gray-800/60 border border-gray-700/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-shadow rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-white">Typy akcji</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 rounded-xl overflow-hidden bg-gradient-to-br from-gray-900/40 to-gray-800/30 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={typeCounts} margin={{ left: 20, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={false} />
                                    <XAxis type="number" stroke="#a1a1aa" axisLine={false} tickLine={false} tick={{ fill: '#d4d4d8', fontSize: 12 }} />
                                    <YAxis type="category" dataKey="type" stroke="#a1a1aa" width={110} axisLine={false}  tickLine={false} tick={{ fill: '#e5e5e5', fontWeight: 500, fontSize: 13 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',}} itemStyle={{ color: '#f4f4f5' }} labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}/>
                                    <Bar dataKey="count" name="Actions" radius={[0, 12, 12, 0]} barSize={18}>
                                        {typeCounts.map((_, idx) => (
                                        <Cell key={idx} fill={`hsl(${(idx * 45) % 360}, 70%, 60%)`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>  
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
                {
                title: 'Total Actions',
                value: data.length,
                color: 'text-violet-400',
                },
                {
                title: 'System Hours',
                value: dailyHours.reduce((sum, day) => sum + day.systemHours, 0).toFixed(2),
                color: 'text-emerald-400',
                },
                {
                title: 'Real Hours',
                value: dailyHours.reduce((sum, day) => sum + day.realHours, 0).toFixed(2),
                color: 'text-sky-400',
                },
            ].map((stat, i) => (
                <Card
                key={i}
                className="bg-gray-800/50 border border-gray-700/60 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow rounded-2xl"
                >
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                </CardContent>
                </Card>
            ))}
            </div>
      </div>
    </div>
    </>
  );
};

export default BMChartBoard;
