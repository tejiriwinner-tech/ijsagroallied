"use client"

import { useState } from "react"
import Link from "next/link"
import { authApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Check } from "lucide-react"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const response = await authApi.forgotPassword(email)

            if (response.success) {
                // Check if email was actually sent or if we have a debug link
                if (response.data?.debug_reset_link) {
                    console.log("🔗 PASSWORD RESET LINK:", response.data.debug_reset_link)
                    console.log("📋 Copy this link and paste it in your browser to reset your password")
                    console.log("📧 Note: Email sending may have failed. Using console link for development.")
                }
                setIsSubmitted(true)
            } else {
                setError(response.message || "Failed to send reset email")
            }
        } catch (error) {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-card rounded-2xl p-8 shadow-xl border border-border">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="font-serif text-2xl font-bold text-foreground mb-4">Check Your Email</h1>
                            <p className="text-foreground mb-6">
                                If an account with that email exists, we've sent you a password reset link.
                            </p>
                            <p className="text-sm text-foreground mb-8">
                                <strong>For development:</strong> Check your browser console (F12) for the reset link since emails don't work in local development.
                            </p>
                            <div className="space-y-3">
                                <Link href="/login">
                                    <Button className="w-full bg-primary hover:bg-primary-dark text-primary-foreground">
                                        Back to Login
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsSubmitted(false)}
                                    className="w-full bg-transparent"
                                >
                                    Try Different Email
                                </Button>
                            </div>
                        </div>
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
                        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-accent-dark" />
                        </div>
                        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Forgot Password?</h1>
                        <p className="text-foreground">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="mt-1"
                            />
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                <p className="text-destructive text-sm">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-accent hover:bg-accent-dark text-accent-foreground gap-2"
                        >
                            <Mail className="w-4 h-4" />
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </Button>

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}