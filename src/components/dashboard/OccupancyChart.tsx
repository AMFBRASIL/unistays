import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Seg", ocupacao: 72, receita: 12400 },
  { name: "Ter", ocupacao: 68, receita: 11200 },
  { name: "Qua", ocupacao: 75, receita: 13100 },
  { name: "Qui", ocupacao: 82, receita: 15600 },
  { name: "Sex", ocupacao: 95, receita: 22400 },
  { name: "Sáb", ocupacao: 98, receita: 24800 },
  { name: "Dom", ocupacao: 88, receita: 19200 },
];

export function OccupancyChart() {
  return (
    <div className="rounded-xl bg-card border border-border p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h3 className="text-sm sm:text-lg font-semibold text-foreground">Ocupação & Receita</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Últimos 7 dias</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary" />
            <span className="text-[10px] sm:text-sm text-muted-foreground">Ocupação</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-accent" />
            <span className="text-[10px] sm:text-sm text-muted-foreground">Receita</span>
          </div>
        </div>
      </div>

      <div className="h-[200px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOcupacao" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickFormatter={(value) => `${value}%`}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="ocupacao"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOcupacao)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
