import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export interface OccupancyTrendPoint {
  name: string;
  ocupacao: number;
  receita: number;
}

interface OccupancyChartProps {
  data?: OccupancyTrendPoint[];
  loading?: boolean;
}

const emptyWeek = [
  { name: "Seg", ocupacao: 0, receita: 0 },
  { name: "Ter", ocupacao: 0, receita: 0 },
  { name: "Qua", ocupacao: 0, receita: 0 },
  { name: "Qui", ocupacao: 0, receita: 0 },
  { name: "Sex", ocupacao: 0, receita: 0 },
  { name: "Sáb", ocupacao: 0, receita: 0 },
  { name: "Dom", ocupacao: 0, receita: 0 },
];

export function OccupancyChart({ data = [], loading }: OccupancyChartProps) {
  const chartData = data.length > 0 ? data : emptyWeek;

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
            <span className="text-[10px] sm:text-sm text-muted-foreground">Receita (check-in)</span>
          </div>
        </div>
      </div>

      <div className="h-[200px] sm:h-[280px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Carregando...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOcupacao" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                domain={[0, 100]}
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
                formatter={(value: number, key: string) => {
                  if (key === "ocupacao") return [`${value}%`, "Ocupação"];
                  return [
                    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),
                    "Receita",
                  ];
                }}
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
        )}
      </div>
    </div>
  );
}
