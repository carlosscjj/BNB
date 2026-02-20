"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "chart.js/auto";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardChartsClient() {
  const [ganhosMes, setGanhosMes] = useState<any[]>([]);
  const [reservasMes, setReservasMes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");
        const resGanhos = await fetch("/api/dashboard/ganhos-mes");
        if (!resGanhos.ok) throw new Error("Erro ao carregar ganhos");
        const ganhos = await resGanhos.json();
        setGanhosMes(ganhos || []);
        
        const resReservas = await fetch("/api/dashboard/reservas-mes");
        if (!resReservas.ok) throw new Error("Erro ao carregar reservas");
        const reservas = await resReservas.json();
        setReservasMes(reservas || []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erro ao carregar dados";
        console.error(errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {loading && (
        <div className="col-span-2 bg-yellow-100 border border-yellow-400 rounded p-6 text-black">
          A carregar gráficos...
        </div>
      )}
      {error && (
        <div className="col-span-2 bg-red-100 border border-red-400 rounded p-6 text-red-700">
          Erro: {error}
        </div>
      )}
      {!loading && ganhosMes.length > 0 && (
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-orange-500">Ganhos por Mês</h2>
          <Bar
            data={{
              labels: ganhosMes.map((item: any) => item.mes),
              datasets: [{
                label: "Ganhos (€)",
                data: ganhosMes.map((item: any) => item.valor),
                backgroundColor: "#f97316"
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context: any) {
                      const value = context.parsed.y || 0;
                      return `Ganhos: €${value.toFixed(2)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: function(value: any) {
                      return `€${value}`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      )}
      {!loading && reservasMes.length > 0 && (
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-orange-500">Reservas por Mês</h2>
          <Bar
            data={{
              labels: reservasMes.map((item: any) => item.mes),
              datasets: [{
                label: "Reservas",
                data: reservasMes.map((item: any) => item.count),
                backgroundColor: "#10b981"
              }]
            }}
            options={{ 
              responsive: true, 
              plugins: { 
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context: any) {
                      const value = context.parsed.y || 0;
                      return `Reservas: ${value}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: function(value: any) {
                      return `${value}`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
