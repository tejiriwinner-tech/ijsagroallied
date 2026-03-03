"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, Check, AlertTriangle, Loader2 } from "lucide-react"

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!token) {
            router.push("/login")
        }
    }, [token, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long")
            return
        }

        if (!token) {
            setError("Invalid reset token")
            return
        }

        setIsLoading(true)

        try {
            const response = await authApi.resetPassword(token, password)

            if (response.success) {
                setIsSuccess(true)
                setTimeout(() => {
                    router.push("/login")
                }, 3000)
            } else {
                setError(response.message || "Failed to reset password")
            }
        } catch (error) {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-card rounded-2xl p-8 shadow-xl border border-border text-center">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>
                        <h1 className="font-serif text-2xl font-bold text-foreground mb-4">Invalid Link</h1>
                        <p className="text-foreground mb-6">
                            This password reset link is invalid or has expired.
                        </p>
                        <Link href="/forgot-password">
                            <Button className="w-full bg-primary hover:bg-primary-dark text-primary-foreground">
                                Request New Link
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-card rounded-2xl p-8 shadow-xl border border-border text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-serif text-2xl font-bold text-foreground mb-4">Password Reset Successful!</h1>
                        <p className="text-foreground mb-6">
                            Your password has been successfully reset. You can now log in with your new password.
                        </p>
                        <p className="text-sm text-foreground mb-6">
                            Redirecting to login page in 3 seconds...
                        </p>
                        <Link href="/login">
                            <Button className="w-full bg-primary hover:bg-primary-dark text-primary-foreground">
                                Go to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Reset Your Password</h1>
                        <p className="text-foreground">
                            Enter your new password below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="password">New Password</Label>
                            <div className="relative mt-1">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-primary"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative mt-1">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-primary"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                <p className="text-destructive text-sm">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-dark text-primary-foreground gap-2"
                        >
                            <Lock className="w-4 h-4" />
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="text-sm text-primary hover:text-primary-dark transition-colors"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    )
}
