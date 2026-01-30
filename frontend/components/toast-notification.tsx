"use client"

import { useEffect, useState } from "react"

interface ToastProps {
    message: string
    type?: "success" | "error" | "info"
    duration?: number
    onClose: () => void
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onClose, 300) // Wait for fade out animation
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const bgColor = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500"
    }[type]

    const icon = {
        success: "✓",
        error: "✕",
        info: "ℹ"
    }[type]

    return (
        <div
            className={`flex items-center gap-3 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
        >
            <span className="text-xl">{icon}</span>
            <span className="font-medium">{message}</span>
        </div>
    )
}

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type?: "success" | "error" | "info" }>
    removeToast: (id: string) => void
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    )
}
