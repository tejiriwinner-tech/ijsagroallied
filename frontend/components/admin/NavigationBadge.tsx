"use client"

import { Badge } from "@/components/ui/badge"

interface NavigationBadgeProps {
    count: number
    isActive: boolean
    className?: string
}

export function NavigationBadge({ count, isActive, className = "" }: NavigationBadgeProps) {
    // Don't render badge if count is 0 or negative
    if (count <= 0) {
        return null
    }

    return (
        <Badge
            variant={isActive ? "secondary" : "default"}
            className={`
        text-xs px-2 py-1 min-w-[20px] h-5 flex items-center justify-center
        transition-all duration-300 ease-in-out font-semibold relative overflow-hidden
        animate-pulse hover:animate-none hover:scale-110 focus:scale-105
        ${isActive
                    ? "bg-white/20 text-white hover:bg-white/30 shadow-sm border-white/30"
                    : "bg-accent text-accent-foreground hover:bg-accent/80 shadow-sm hover:shadow-md"}
        ${className}
      `}
            title={`${count} item${count !== 1 ? 's' : ''} requiring attention`}
            aria-label={`${count} item${count !== 1 ? 's' : ''} requiring attention`}
        >
            {count > 99 ? '99+' : count}
        </Badge>
    )
}