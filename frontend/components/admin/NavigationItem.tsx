"use client"

import { type NavigationItem as NavigationItemType } from "./navigation-config"
import { NavigationBadge } from "./NavigationBadge"

interface NavigationItemProps {
    item: NavigationItemType
    isActive: boolean
    onClick: () => void
}

export function NavigationItem({ item, isActive, onClick }: NavigationItemProps) {
    const Icon = item.icon

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
        }
    }

    return (
        <button
            onClick={onClick}
            onKeyDown={handleKeyDown}
            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl relative group
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card
                transition-all duration-300 ease-in-out transform
                ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02] ring-2 ring-primary/20"
                    : "text-foreground hover:bg-muted hover:shadow-md hover:scale-[1.01] active:scale-[0.99] focus:scale-[1.01]"}
                before:absolute before:inset-0 before:rounded-xl before:bg-linear-to-r before:from-transparent before:to-transparent
                hover:before:from-primary/5 hover:before:to-primary/10 before:transition-all before:duration-300
            `}
            title={item.description}
            aria-label={`Navigate to ${item.label}`}
            aria-current={isActive ? "page" : undefined}
            tabIndex={0}
        >
            <Icon className={`
        w-5 h-5 transition-all duration-300 ease-in-out
        ${isActive ? "text-white drop-shadow-sm" : "text-muted-foreground group-hover:text-foreground"}
        group-hover:scale-110 group-hover:rotate-3 group-active:scale-95
        group-focus:scale-105 group-focus:drop-shadow-md
      `} />

            <span className={`
        font-medium flex-1 text-left transition-all duration-300 ease-in-out
        ${isActive ? "text-white drop-shadow-sm" : "text-foreground"}
        group-hover:translate-x-1 group-focus:translate-x-0.5
      `}>
                {item.label}
            </span>

            {item.badge !== undefined && (
                <NavigationBadge
                    count={item.badge}
                    isActive={isActive}
                />
            )}

            {/* Hover indicator */}
            <div className={`
        absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-linear-to-b from-primary to-primary/70 rounded-r-full
        transition-all duration-300 ease-in-out opacity-0 -translate-x-2
        ${!isActive ? "group-hover:opacity-100 group-hover:translate-x-0 group-hover:w-2 group-hover:shadow-lg group-hover:shadow-primary/50" : ""}
        ${isActive ? "opacity-100 translate-x-0 w-2 shadow-lg shadow-primary/50" : ""}
      `} />

            {/* Ripple effect container */}
            <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <div className={`
            absolute inset-0 bg-primary/10 rounded-xl transform scale-0 
            transition-transform duration-300 ease-out
            group-active:scale-100 group-active:opacity-50
          `} />
            </div>
        </button>
    )
}