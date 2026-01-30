"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DebugAuthPage() {
    const { user, login, logout } = useAuth()
    const [email, setEmail] = useState("admin@ijs.com")
    const [password, setPassword] = useState("admin123")
    const [logs, setLogs] = useState<string[]>([])
    const [localStorageData, setLocalStorageData] = useState<any>({})

    const addLog = (message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
    }

    const checkLocalStorage = () => {
        if (typeof window !== "undefined") {
            const user = localStorage.getItem("user")
            const token = localStorage.getItem("auth_token")
            setLocalStorageData({
                user: user ? JSON.parse(user) : null,
                token: token
            })
        }
    }

    useEffect(() => {
        checkLocalStorage()
        addLog("Page loaded")
        addLog(`User from context: ${user ? JSON.stringify(user) : "null"}`)
    }, [user])

    const testDirectLogin = async () => {
        addLog("🔍 Testing direct API call...")
        setLogs([])

        try {
            const response = await authApi.login(email, password)
            addLog(`API Response: ${JSON.stringify(response, null, 2)}`)

            if (response.success && response.data) {
                addLog("✅ API call successful")
                addLog(`User data: ${JSON.stringify(response.data.user)}`)
                addLog(`Token: ${response.data.token}`)
            } else {
                addLog("❌ API call failed")
                addLog(`Message: ${response.message || "Unknown error"}`)
            }
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`)
        }

        checkLocalStorage()
    }

    const testContextLogin = async () => {
        addLog("🔍 Testing login via context...")
        setLogs([])

        try {
            addLog("Calling login function...")
            const success = await login(email, password)
            addLog(`Login result: ${success}`)

            if (success) {
                addLog("✅ Login successful via context")
            } else {
                addLog("❌ Login failed via context")
            }
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`)
        }

        checkLocalStorage()
    }

    const clearStorage = () => {
        localStorage.clear()
        addLog("🗑️ Cleared localStorage")
        checkLocalStorage()
        window.location.reload()
    }

    return (
        <div className="container mx-auto px-4 py-24">
            <h1 className="text-3xl font-bold mb-8">🔧 Authentication Debug Tool</h1>

            {/* Current Auth State */}
            <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950 rounded border">
                <h2 className="font-bold mb-2">Current Auth State</h2>
                <div className="space-y-2 text-sm font-mono">
                    <div>
                        <strong>User from Context:</strong> {user ? JSON.stringify(user, null, 2) : "null"}
                    </div>
                    <div>
                        <strong>Is Logged In:</strong> {user ? "✅ Yes" : "❌ No"}
                    </div>
                </div>
            </div>

            {/* LocalStorage State */}
            <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-950 rounded border">
                <h2 className="font-bold mb-2">LocalStorage State</h2>
                <div className="space-y-2 text-sm font-mono">
                    <div>
                        <strong>Stored User:</strong>
                        <pre className="mt-1 p-2 bg-black text-green-400 rounded overflow-x-auto">
                            {localStorageData.user ? JSON.stringify(localStorageData.user, null, 2) : "null"}
                        </pre>
                    </div>
                    <div>
                        <strong>Stored Token:</strong> {localStorageData.token || "null"}
                    </div>
                </div>
            </div>

            {/* Test Login */}
            <div className="mb-8 p-4 bg-white dark:bg-gray-900 rounded border">
                <h2 className="font-bold mb-4">Test Login</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={testDirectLogin}>
                            Test Direct API Call
                        </Button>
                        <Button onClick={testContextLogin} variant="outline">
                            Test Context Login
                        </Button>
                        <Button onClick={logout} variant="outline">
                            Logout
                        </Button>
                        <Button onClick={clearStorage} variant="destructive">
                            Clear Storage & Reload
                        </Button>
                    </div>
                </div>
            </div>

            {/* Logs */}
            {logs.length > 0 && (
                <div className="p-4 bg-black text-green-400 rounded">
                    <h2 className="font-bold mb-2 text-white">Logs</h2>
                    <div className="space-y-1 text-sm font-mono">
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded">
                <h2 className="font-bold mb-2">How to Use</h2>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Check the "Current Auth State" - this shows if you're logged in</li>
                    <li>Check "LocalStorage State" - this shows what's stored in the browser</li>
                    <li>Click "Test Direct API Call" to test the backend directly</li>
                    <li>Click "Test Context Login" to test the full login flow</li>
                    <li>Check the logs to see what happened</li>
                    <li>If something is wrong, click "Clear Storage & Reload"</li>
                </ol>
            </div>
        </div>
    )
}
