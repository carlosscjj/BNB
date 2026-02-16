"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function DashboardChartsClient() {
  const [ganhosMes, setGanhosMes] = useState<any[]>([]);
  const [reservasMes, setReservasMes] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const resGanhos = await fetch("/api/dashboard/ganhos-mes");
      const ganhos = await resGanhos.json();
      setGanhosMes(ganhos);
      const resReservas = await fetch("/api/dashboard/reservas-mes");
      const reservas = await resReservas.json();
      setReservasMes(reservas);
    }
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-orange-500">Ganhos por Mês</h2>
        <Bar
          data={{
            labels: ganhosMes.map((item: any) => item.mes),
            datasets: [{
              label: "Ganhos ($)",
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
                  label: function(context) {
                    return `Ganhos: $${context.parsed.y}`;
                  }
                }
              }
            },
            scales: {
              y: {
                ticks: {
                  callback: function(value) {
                    return `$${value}`;
                  }
                }
              }
            }
          }}
        />
      </div>
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
          options={{ responsive: true, plugins: { legend: { display: false } } }}
        />
      </div>
    </div>
  );
}
