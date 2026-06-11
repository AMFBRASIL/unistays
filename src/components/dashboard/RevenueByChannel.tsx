import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Booking.com", value: 42, color: "hsl(217, 91%, 60%)" },
  { name: "Direto", value: 28, color: "hsl(142, 76%, 36%)" },
  { name: "Airbnb", value: 18, color: "hsl(0, 84%, 60%)" },
  { name: "Expedia", value: 8, color: "hsl(38, 92%, 50%)" },
  { name: "Outros", value: 4, color: "hsl(262, 83%, 58%)" },
];

export function RevenueByChannel() {
  return (
    <div className="rounded-xl bg-card border border-border p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-lg font-semibold text-foreground">Receita por Canal</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Distribuição mensal</p>
      </div>

      <div className="h-[180px] sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value}%`, "Participação"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 sm:mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground truncate">{item.name}</span>
            <span className="ml-auto font-medium text-foreground shrink-0">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
