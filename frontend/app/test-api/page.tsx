"use client"

import { useState, useEffect } from "react"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"

export default function TestApiPage() {
    const [result, setResult] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [envInfo, setEnvInfo] = useState<string>("")

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_PHP_API_URL || "NOT SET (using default)"
        setEnvInfo(apiUrl)
    }, [])

    const testDirectFetch = async () => {
        setLoading(true)

        const apiUrl = process.env.NEXT_PUBLIC_PHP_API_URL || "http://localhost/ijsagroallied/backend/api/api"
        const fullUrl = `${apiUrl}/auth/login.php`

        setResult(`Testing: ${fullUrl}\n\nSending request...`)

        try {
            const response = await fetch(fullUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: "admin@ijs.com",
                    password: "admin123"
                })
            })

            const responseText = await response.text()

            let data
            try {
                data = JSON.parse(responseText)
            } catch {
                data = responseText
            }

            setResult(`URL: ${fullUrl}\n\nStatus: ${response.status}\n\nResponse:\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`)
        } catch (error: any) {
            setResult(`URL: ${fullUrl}\n\nError: ${error.message}`)
        }

        setLoading(false)
    }

    return (
        <div className="container mx-auto px-4 py-24">
            <h1 className="text-3xl font-bold mb-8">API Test</h1>

            <div className="space-y-4 mb-8">
                <div className="p-4 bg-muted rounded">
                    <p className="font-mono text-sm">
                        <strong>API URL:</strong> {envInfo}
                    </p>
                </div>

                <Button onClick={testDirectFetch} disabled={loading}>
                    Test Backend Connection
                </Button>
            </div>

            {result && (
                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap">
                    {result}
                </div>
            )}
        </div>
    )
}
