"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Shield, AlertTriangle, Users, Monitor, TrendingUp, Globe, Activity, Clock, Search, Download, RefreshCw, Eye, Flag, MoreHorizontal, AlertCircle, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react'

// Data interfaces, kept for type safety
interface LoginAttempt {
  id: string
  timestamp: Date
  userId: string
  username: string
  email: string
  ipAddress: string
  country: string
  city: string
  device: string
  browser: string
  userAgent: string
  success: boolean
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  riskScore: number
  anomalyReasons: string[]
  sessionId?: string
  isNewDevice: boolean
  isNewLocation: boolean
  vpnDetected: boolean
  tor: boolean
  failedAttempts: number
}

interface SecurityAlert {
  id: string
  timestamp: Date
  type: "anomaly" | "breach" | "suspicious" | "policy_violation"
  severity: "Low" | "Medium" | "High" | "Critical"
  title: string
  description: string
  userId?: string
  username?: string
  ipAddress?: string
  country?: string
  status: "new" | "investigating" | "resolved" | "false_positive"
  assignedTo?: string
}

interface DashboardMetrics {
  totalLogins24h: number
  anomalousLogins24h: number
  activeUsers: number
  newDevices24h: number
  criticalAlerts: number
  avgRiskScore: number
  topRiskCountries: Array<{ country: string; count: number; riskScore: number }>
  loginTrends: Array<{ time: string; successful: number; failed: number; anomalous: number }>
  riskDistribution: Array<{ level: string; count: number; percentage: number }>
}

export function SOCAnalystDashboard() {
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Initialize data and refetch when date changes
  useEffect(() => {
    loadData()
  }, [selectedDate])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadData()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const loadData = async () => {
    setLoading(true)
    const dateString = format(selectedDate, "yyyy-MM-dd")
    try {
      const [metricsRes, alertsRes, attemptsRes] = await Promise.all([
        fetch(`/api/soc/metrics?date=${dateString}`),
        fetch(`/api/soc/alerts?date=${dateString}`),
        fetch(`/api/soc/login-attempts?date=${dateString}`),
      ])

      if (!metricsRes.ok || !alertsRes.ok || !attemptsRes.ok) {
        throw new Error("Failed to fetch SOC data")
      }

      const metricsData = await metricsRes.json()
      const alertsData = await alertsRes.json()
      const attemptsData = await attemptsRes.json()

      const parsedAlerts = alertsData.map((alert: SecurityAlert) => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      }))
      const parsedAttempts = attemptsData.map((attempt: LoginAttempt) => ({
        ...attempt,
        timestamp: new Date(attempt.timestamp),
      }))

      const liveMetrics: DashboardMetrics = {
        ...metricsData,
        topRiskCountries: metricsData.topRiskCountries || [],
        loginTrends: metricsData.loginTrends || [],
        riskDistribution: metricsData.riskDistribution || [],
      };

      setMetrics(liveMetrics)
      setSecurityAlerts(parsedAlerts)
      setLoginAttempts(parsedAttempts)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading SOC data:", error)
      setMetrics(null)
    } finally {
      setLoading(false)
    }
  }

  const handleAlertAction = (alertId: string, action: string) => {
    setSecurityAlerts((alerts) =>
      alerts.map((alert) => (alert.id === alertId ? { ...alert, status: action as SecurityAlert["status"] } : alert)),
    )
  }

  const filteredAlerts = securityAlerts.filter((alert) => {
    const matchesSearch =
      searchQuery === "" ||
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter

    return matchesSearch && matchesSeverity
  })

  const filteredLoginAttempts = loginAttempts
    .filter((attempt) => {
      const matchesSearch =
        searchQuery === "" ||
        attempt.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attempt.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attempt.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attempt.ipAddress.includes(searchQuery)

      const matchesSeverity = severityFilter === "all" || attempt.riskLevel === severityFilter

      return matchesSearch && matchesSeverity
    })
    .slice(0, 50) // Show latest 50 for performance

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-600"
      case "High":
        return "bg-orange-600"
      case "Medium":
        return "bg-yellow-600"
      case "Low":
        return "bg-green-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="w-4 h-4 text-red-400" />
      case "investigating":
        return <Clock className="w-4 h-4 text-yellow-400" />
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "false_positive":
        return <XCircle className="w-4 h-4 text-gray-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-400" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"]

  if (loading || !metrics) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-600 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">SOC Analyst Dashboard</h1>
          <p className="text-slate-400">
            Security overview for {format(selectedDate, "PPP")} • Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`border-slate-600 ${autoRefresh ? "text-green-400" : "text-slate-300"} bg-transparent`}
          >
            <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-pulse" : ""}`} />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="border-slate-600 text-slate-300 bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 bg-transparent"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(day) => day && setSelectedDate(day)}
                initialFocus
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Logins (24h)</p>
                <p className="text-2xl font-bold text-white">{metrics.totalLogins24h.toLocaleString()}</p>
              </div>
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-red-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Anomalous Logins</p>
                <p className="text-2xl font-bold text-white">{metrics.anomalousLogins24h}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{metrics.activeUsers}</p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">New Devices</p>
                <p className="text-2xl font-bold text-white">{metrics.newDevices24h}</p>
              </div>
              <Monitor className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-red-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Critical Alerts</p>
                <p className="text-2xl font-bold text-white">{metrics.criticalAlerts}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Risk Score</p>
                <p className="text-2xl font-bold text-white">{metrics.avgRiskScore}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Trends Chart */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 text-cyan-400 mr-2" />
              Login Trends (24h)
            </CardTitle>
            <CardDescription className="text-slate-400">Hourly breakdown of login attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.loginTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="successful" stroke="#22C55E" strokeWidth={2} name="Successful" />
                <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} name="Failed" />
                <Line type="monotone" dataKey="anomalous" stroke="#F97316" strokeWidth={2} name="Anomalous" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="w-5 h-5 text-cyan-400 mr-2" />
              Risk Level Distribution
            </CardTitle>
            <CardDescription className="text-slate-400">Login attempts by risk severity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ level, percentage }) => `${level}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Risk Countries */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Globe className="w-5 h-5 text-cyan-400 mr-2" />
            Top Risk Countries (24h)
          </CardTitle>
          <CardDescription className="text-slate-400">Countries with highest average risk scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topRiskCountries.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 text-sm w-4">#{index + 1}</span>
                  <span className="text-white font-medium">{country.country}</span>
                  <Badge
                    className={`${getSeverityColor(country.riskScore >= 60 ? "High" : country.riskScore >= 30 ? "Medium" : "Low")} text-white`}
                  >
                    {country.count} logins
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <Progress value={country.riskScore} className="w-24" />
                  <span className="text-white font-bold w-8">{country.riskScore}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              Real-time Alerts
            </CardTitle>
            <CardDescription className="text-slate-400">Latest security alerts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {securityAlerts.slice(0, 10).map((alert) => (
                <Alert
                  key={alert.id}
                  className={`border-l-4 ${
                    alert.severity === "Critical"
                      ? "border-l-red-500 bg-red-900/10"
                      : alert.severity === "High"
                        ? "border-l-orange-500 bg-orange-900/10"
                        : alert.severity === "Medium"
                          ? "border-l-yellow-500 bg-yellow-900/10"
                          : "border-l-green-500 bg-green-900/10"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(alert.status)}
                        <Badge className={`${getSeverityColor(alert.severity)} text-white text-xs`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <AlertDescription className="text-white text-sm font-medium mb-1">{alert.title}</AlertDescription>
                      <AlertDescription className="text-slate-400 text-xs mb-2">{alert.description}</AlertDescription>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{alert.username || "System"}</span>
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-600">
                        <DropdownMenuItem onClick={() => handleAlertAction(alert.id, "investigating")}>
                          <Clock className="mr-2 h-3 w-3" />
                          Investigate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAlertAction(alert.id, "resolved")}>
                          <CheckCircle className="mr-2 h-3 w-3" />
                          Resolve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAlertAction(alert.id, "false_positive")}>
                          <XCircle className="mr-2 h-3 w-3" />
                          False Positive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Log Table */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 text-cyan-400 mr-2" />
                  Login Activity Log
                </CardTitle>
                <CardDescription className="text-slate-400">Detailed view of recent login attempts</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Time</TableHead>
                    <TableHead className="text-slate-300">User</TableHead>
                    <TableHead className="text-slate-300">IP Address</TableHead>
                    <TableHead className="text-slate-300">Location</TableHead>
                    <TableHead className="text-slate-300">Risk</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoginAttempts.map((attempt) => (
                    <TableRow key={attempt.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="text-slate-300 text-sm">{attempt.timestamp.toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-white font-medium text-sm">{attempt.username}</div>
                          <div className="text-slate-400 text-xs">{attempt.device}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm font-mono">{attempt.ipAddress}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-white text-sm">{attempt.country}</div>
                          <div className="text-slate-400 text-xs">{attempt.city}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getSeverityColor(attempt.riskLevel)} text-white text-xs`}>
                            {attempt.riskLevel}
                          </Badge>
                          <span className="text-slate-400 text-xs">{attempt.riskScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {attempt.success ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Flag className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 