
import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useUpload } from "../context/UploadContent";

export default function UploadReviews() {
    const { setUploadResult, clearUpload } = useUpload();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a CSV file first.");
            return;
        }

        setUploading(true);
        setError("");
        setMessage("");
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(
                "http://localhost:5000/api/reviews/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Upload failed.");
            }

            setResult(data);
            setUploadResult(data);
            console.log("Saved upload result:", data);
            setMessage(data.message);
        } catch (err) {
            setError(
                err.message || "Could not connect to the backend."
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Upload Reviews
                </h1>
                <p className="mt-2 text-slate-500">
                    Import your customer feedback CSV dataset.
                </p>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-indigo-200 bg-white p-10 text-center">
                <Upload
                    className="mx-auto mb-4 text-indigo-600"
                    size={42}
                />

                <h2 className="text-lg font-semibold text-slate-800">
                    Choose your CSV file
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Select the customer review dataset from your computer.
                </p>

                <input
                    type="file"
                    accept=".csv,text/csv"
                    className="mx-auto mt-6 block max-w-full text-sm"
                    onChange={(event) => {
                        const selectedFile = event.target.files?.[0];

                        setResult(null);
                        setMessage("");
                        setError("");

                        if (!selectedFile) {
                            setFile(null);
                            return;
                        }

                        if (
                            !selectedFile.name
                                .toLowerCase()
                                .endsWith(".csv")
                        ) {
                            setFile(null);
                            setError("Please select a CSV file.");
                            event.target.value = "";
                            return;
                        }

                        setFile(selectedFile);
                    }}
                />

                {file && (
                    <div className="mt-6 rounded-lg bg-green-50 p-4 text-left">
                        <div className="flex items-center gap-3">
                            <FileText
                                className="text-green-600"
                                size={24}
                            />

                            <div className="min-w-0 flex-1">
                                <p className="break-all font-medium text-slate-800">
                                    {file.name}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>

                            <CheckCircle
                                className="text-green-600"
                                size={22}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {uploading ? "Processing CSV..." : "Upload CSV"}
                </button>

                {message && (
                    <div className="mt-5 rounded-lg bg-green-50 p-4 text-left text-green-700">
                        <p className="font-semibold">{message}</p>

                        <p className="mt-2">
                            Total reviews processed:{" "}
                            <strong>{result.totalReviews}</strong>
                        </p>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg bg-green-100 p-3">
                                <p className="text-sm text-green-700">Positive</p>
                                <p className="text-2xl font-bold text-green-800">
                                    {result.sentimentCounts.positive}
                                </p>
                            </div>

                            <div className="rounded-lg bg-red-100 p-3">
                                <p className="text-sm text-red-700">Negative</p>
                                <p className="text-2xl font-bold text-red-800">
                                    {result.sentimentCounts.negative}
                                </p>
                            </div>

                            <div className="rounded-lg bg-amber-100 p-3">
                                <p className="text-sm text-amber-700">Neutral</p>
                                <p className="text-2xl font-bold text-amber-800">
                                    {result.sentimentCounts.neutral}
                                </p>
                            </div>
                        </div>

                        <p className="mt-2 text-sm">
                            Columns detected:{" "}
                            {result.columns.join(", ") || "None"}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mt-5 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-left text-red-700">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <p className="mt-5 text-xs text-slate-400">
                    CSV files only · Maximum size 20 MB
                </p>
            </div>
        </div>
    );
}
