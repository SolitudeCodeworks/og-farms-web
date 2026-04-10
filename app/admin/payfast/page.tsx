"use client"

import { useState } from "react"
import { Download, RefreshCw, AlertCircle, FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface Transaction {
  Date: string
  Type: string
  Sign: string
  Party: string
  Name: string
  Description: string
  Currency: string
  "Funding Type": string
  Gross: string
  Fee: string
  Net: string
  Balance: string
  "M Payment ID": string
  "PF Payment ID": string
  [key: string]: string
}

type FetchType = "monthly" | "weekly" | "daily" | "range"

export default function PayFastStatementsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [raw, setRaw] = useState("")
  const [fetchType, setFetchType] = useState<FetchType>("monthly")
  const [date, setDate] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [hasFetched, setHasFetched] = useState(false)

  const fetchTransactions = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ type: fetchType })
      if (fetchType === "range") {
        if (dateFrom) params.set("from", dateFrom)
        if (dateTo) params.set("to", dateTo)
      } else if (date) {
        params.set("date", date)
      }

      const res = await fetch(`/api/admin/payfast/transactions?${params}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to fetch transactions")
        return
      }

      setTransactions(data.transactions || [])
      setRaw(data.raw || "")
      setHasFetched(true)
    } catch (err) {
      setError("Network error - could not reach PayFast API")
    } finally {
      setLoading(false)
    }
  }

  const downloadCSV = () => {
    const blob = new Blob([raw], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payfast-statement-${fetchType}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate summary
  const totalGross = transactions
    .filter((t) => t.Sign === "CREDIT")
    .reduce((sum, t) => sum + parseFloat(t.Gross || "0"), 0)

  const totalFees = transactions
    .filter((t) => t.Sign === "CREDIT")
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.Fee || "0")), 0)

  const totalNet = transactions
    .filter((t) => t.Sign === "CREDIT")
    .reduce((sum, t) => sum + parseFloat(t.Net || "0"), 0)

  const currentBalance = transactions.length > 0
    ? parseFloat(transactions[transactions.length - 1].Balance?.replace(/,/g, "") || "0")
    : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">PayFast Statements</h1>
          <p className="text-gray-400 text-sm mt-1">Pull transaction history directly from your PayFast account</p>
        </div>
        {hasFetched && transactions.length > 0 && (
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)", color: "#000" }}
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 space-y-4">
        <h2 className="text-white font-bold">Select Period</h2>
        <div className="flex flex-wrap gap-3">
          {(["monthly", "weekly", "daily", "range"] as FetchType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFetchType(type)}
              className="px-4 py-2 rounded-lg capitalize font-semibold text-sm transition-all"
              style={{
                background: fetchType === type ? "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)" : "rgba(255,255,255,0.05)",
                color: fetchType === type ? "#000" : "#aaa",
                border: fetchType === type ? "none" : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {fetchType !== "range" && (
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              {fetchType === "monthly" ? "Month (YYYY-MM) — leave blank for current month" : "Date (YYYY-MM-DD) — leave blank for current period"}
            </label>
            <input
              type={fetchType === "monthly" ? "month" : "date"}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500"
            />
          </div>
        )}

        {fetchType === "range" && (
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">From (YYYY-MM-DD)</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">To (YYYY-MM-DD)</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        )}

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          style={{
            background: loading ? "rgba(100,100,100,0.3)" : "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
            color: loading ? "#666" : "#000",
          }}
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          {loading ? "Fetching..." : "Fetch Statement"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-bold">Error</p>
            <p className="text-red-300 text-sm">{error}</p>
            {error.includes("PAYFAST_PASSPHRASE") && (
              <p className="text-yellow-400 text-sm mt-2">
                Add <code className="bg-black/30 px-1 rounded">PAYFAST_PASSPHRASE=your_passphrase</code> to your <code>.env</code> file.{" "}
                Set it in PayFast → Settings → Security Pass Phrase.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {hasFetched && transactions.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Received (Gross)", value: `R ${totalGross.toFixed(2)}`, icon: TrendingUp, color: "#4ade80" },
            { label: "PayFast Fees", value: `R ${totalFees.toFixed(2)}`, icon: TrendingDown, color: "#f97316" },
            { label: "Total Net", value: `R ${totalNet.toFixed(2)}`, icon: DollarSign, color: "#60a5fa" },
            { label: "Account Balance", value: `R ${currentBalance.toFixed(2)}`, icon: DollarSign, color: "#a78bfa" },
          ].map((card) => (
            <div key={card.label} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900">
              <p className="text-gray-400 text-xs mb-1">{card.label}</p>
              <p className="text-white text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Transactions Table */}
      {hasFetched && transactions.length === 0 && !error && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <p>No transactions found for this period</p>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900">
                  {["Date", "Type", "Sign", "Name", "Description", "Funding Type", "Gross (R)", "Fee (R)", "Net (R)", "Balance (R)", "M Payment ID", "PF Payment ID"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-gray-400 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr
                    key={i}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{tx.Date}</td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{tx.Type}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{
                          background: tx.Sign === "CREDIT" ? "rgba(74,222,128,0.15)" : "rgba(249,115,22,0.15)",
                          color: tx.Sign === "CREDIT" ? "#4ade80" : "#f97316",
                        }}
                      >
                        {tx.Sign}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{tx.Name}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[160px] truncate">{tx.Description}</td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{tx["Funding Type"]}</td>
                    <td className="px-4 py-3 text-green-400 font-mono whitespace-nowrap">{tx.Gross}</td>
                    <td className="px-4 py-3 text-orange-400 font-mono whitespace-nowrap">{tx.Fee}</td>
                    <td className="px-4 py-3 text-blue-400 font-mono whitespace-nowrap">{tx.Net}</td>
                    <td className="px-4 py-3 text-purple-400 font-mono whitespace-nowrap">{tx.Balance}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{tx["M Payment ID"]}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{tx["PF Payment ID"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
