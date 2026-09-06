import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export interface RevenueChannelPoint {
  name: string;
  value: number;
  amount?: number;
}

interface RevenueByChannelProps {
  data?: RevenueChannelPoint[];
  loading?: boolean;
}

const CHANNEL_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 76%, 36%)",
  "hsl(0, 84%, 60%)",
  "hsl(38, 92%, 50%)",
  "hsl(262, 83%, 58%)",
  "hsl(199, 89%, 48%)",
  "hsl(24, 95%, 53%)",
  "hsl(160, 60%, 45%)",
];

export function RevenueByChannel({ data = [], loading }: RevenueByChannelProps) {
  const chartData = data.length > 0 ? data : [{ name: "Sem dados", value: 100, amount: 0 }];
  const hasRealData = data.length > 0;

  return (
    <div className="rounded-xl bg-card border border-border p-3 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-lg font-semibold text-foreground">Receita por Canal</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">Distribuição mensal (check-in)</p>
      </div>

      <div className="h-[180px] sm:h-[240px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Carregando...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={hasRealData ? 4 : 0}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} stroke="transparent" />
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
                formatter={(value: number, _name: string, item: { payload?: RevenueChannelPoint }) => {
                  const amount = item?.payload?.amount ?? 0;
                  return [
                    `${value}% (${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)})`,
                    "Participação",
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {hasRealData && (
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <div
                className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: CHANNEL_COLORS[index % CHANNEL_COLORS.length] }}
              />
              <span className="text-muted-foreground truncate">{item.name}</span>
              <span className="ml-auto font-medium text-foreground shrink-0">{item.value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
