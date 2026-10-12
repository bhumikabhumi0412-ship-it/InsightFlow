import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import { useUpload } from "../context/UploadContent";

const COLORS = {
    Positive: "#22c55e",
    Neutral: "#f59e0b",
    Negative: "#ef4444",
};

function SentimentChart() {
    const { uploadResult } = useUpload();

    const sentimentCounts = uploadResult?.sentimentCounts;

    const data = sentimentCounts
        ? [
              {
                  name: "Positive",
                  value: sentimentCounts.positive ?? 0,
                  color: COLORS.Positive,
              },
              {
                  name: "Neutral",
                  value: sentimentCounts.neutral ?? 0,
                  color: COLORS.Neutral,
              },
              {
                  name: "Negative",
                  value: sentimentCounts.negative ?? 0,
                  color: COLORS.Negative,
              },
          ]
        : [];

    const total = data.reduce(
        (sum, item) => sum + item.value,
        0
    );

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold text-slate-800">
                Sentiment Distribution
            </h2>

            <p className="mb-4 text-sm text-slate-500">
                Overview of customer feedback sentiment
            </p>

            {!uploadResult || total === 0 ? (
                <div className="flex h-72 items-center justify-center text-center text-slate-400">
                    Upload a CSV to view sentiment distribution.
                </div>
            ) : (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="45%"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={4}
                                stroke="none"
                            >
                                {data.map((entry) => (
                                    <Cell
                                        key={entry.name}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>

                            <Tooltip
                                formatter={(value, name) => [
                                    `${Number(value).toLocaleString()} reviews (${(
                                        (Number(value) / total) *
                                        100
                                    ).toFixed(1)}%)`,
                                    name,
                                ]}
                            />

                            <Legend verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

export default SentimentChart;
