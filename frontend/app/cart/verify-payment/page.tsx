"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { paymentsApi } from "@/lib/api"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingBag, XCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

function VerifyPaymentContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { clearCart } = useCart()
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
    const [message, setMessage] = useState("Verifying your payment...")
    const [orderId, setOrderId] = useState<string | null>(null)

    useEffect(() => {
        const reference = searchParams.get("reference")
        const trxref = searchParams.get("trxref")
        const transaction_id = searchParams.get("transaction_id")
        const transactionID = searchParams.get("transactionID")

        const finalRef = reference || trxref || transaction_id || transactionID

        if (!finalRef) {
            setStatus("error")
            setMessage("No payment reference found.")
            return
        }

        const verifyPayment = async () => {
            try {
                const response = await paymentsApi.verify(finalRef)

                if (response.success) {
                    setStatus("success")
                    setMessage("Payment successful! Your order has been placed.")
                    setOrderId(response.data?.orderId || null)
                    clearCart()
                } else {
                    setStatus("error")
                    setMessage(response.message || "Payment verification failed.")
                }
            } catch (error) {
                console.error("Verification error:", error)
                setStatus("error")
                setMessage("An error occurred while verifying your payment.")
            }
        }

        verifyPayment()
    }, [searchParams, clearCart])

    return (
        <div className="min-h-screen bg-background pt-24 pb-16">
            <div className="container mx-auto px-4">
                <div className="max-w-lg mx-auto text-center py-16 bg-card border border-border rounded-2xl shadow-sm p-8">
                    {status === "verifying" && (
                        <>
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                            <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">Verifying Payment</h1>
                            <p className="text-muted-foreground mb-8">{message}</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">Payment Successful!</h1>
                            <p className="text-muted-foreground mb-4">{message}</p>
                            {orderId && (
                                <p className="text-sm font-mono bg-muted p-2 rounded mb-8 text-foreground">
                                    Order ID: {orderId}
                                </p>
                            )}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/dashboard">
                                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-primary-foreground">
                                        View My Orders
                                    </Button>
                                </Link>
                                <Link href="/">
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10 text-destructive" />
                            </div>
                            <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">Payment Failed</h1>
                            <p className="text-muted-foreground mb-8">{message}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/cart">
                                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-primary-foreground">
                                        Back to Cart
                                    </Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="outline" className="w-full sm:w-auto">
                                        Contact Support
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function VerifyPaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>}>
            <VerifyPaymentContent />
        </Suspense>
    )
}
