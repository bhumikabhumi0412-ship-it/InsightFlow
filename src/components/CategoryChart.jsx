import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

import { useUpload } from "../context/UploadContent";

function CategoryChart() {
    const { uploadResult } = useUpload();

    const categoryCounts = uploadResult?.categoryCounts;

    const data = categoryCounts
        ? Object.entries(categoryCounts).map(([name, value]) => ({
              name,
              value,
          }))
        : [];

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-lg font-semibold text-slate-800">
                Feedback Categories
            </h2>

            <p className="mb-4 text-sm text-slate-500">
                Number of reviews by category
            </p>

            {data.length === 0 ? (
                <div className="flex h-72 items-center justify-center text-center text-slate-400">
                    Upload a CSV to view feedback categories.
                </div>
            ) : (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 0,
                                bottom: 45,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="name"
                                angle={-20}
                                textAnchor="end"
                                interval={0}
                                height={60}
                                tick={{ fontSize: 11 }}
                            />

                            <YAxis allowDecimals={false} />

                            <Tooltip
                                formatter={(value) => [
                                    Number(value).toLocaleString(),
                                    "Reviews",
                                ]}
                            />

                            <Bar
                                dataKey="value"
                                fill="#6366f1"
                                radius={[6, 6, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

export default CategoryChart;
