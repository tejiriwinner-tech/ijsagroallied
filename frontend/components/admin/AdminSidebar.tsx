"use client"

import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"
import { createNavigationItems } from "./navigation-config"
import { NavigationItem } from "./NavigationItem"

interface AdminSidebarProps {
    activeSection: string
    onSectionChange: (section: string) => void
    isSidebarOpen: boolean
    onSidebarClose: () => void
    lowStockCount: number
}

interface MobileSidebarToggleProps {
    isSidebarOpen: boolean
    onToggle: () => void
}

// Custom CSS for animations
const sidebarStyles = `
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(var(--primary), 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(var(--primary), 0.6);
    }
  }
  
  .sidebar-enter {
    animation: fadeInScale 0.3s ease-out;
  }
  
  .navigation-item-enter {
    animation: slideInLeft 0.3s ease-out;
  }
  
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`

export function MobileSidebarToggle({ isSidebarOpen, onToggle }: MobileSidebarToggleProps) {
    return (
        <div className="lg:hidden bg-card/95 border-b border-border p-4 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 ease-in-out backdrop-blur-sm">
            <h1 className="font-serif font-bold text-lg text-primary transition-all duration-300 ease-in-out hover:scale-105 cursor-default select-none">
                ADMIN DASHBOARD
            </h1>
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                className="hover:bg-muted transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 focus:scale-105 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-primary/10 rounded-md transform scale-0 transition-transform duration-200 group-active:scale-100" />
                {isSidebarOpen ? (
                    <X className="w-5 h-5 transition-all duration-300 ease-in-out rotate-0 hover:rotate-90 relative z-10" />
                ) : (
                    <Menu className="w-5 h-5 transition-all duration-300 ease-in-out hover:rotate-180 relative z-10" />
                )}
            </Button>
        </div>
    )
}

export function AdminSidebar({
    activeSection,
    onSectionChange,
    isSidebarOpen,
    onSidebarClose,
    lowStockCount
}: AdminSidebarProps) {
    const navigationItems = createNavigationItems(lowStockCount)

    const handleLogout = () => {
        // This will be handled by the parent component
        // For now, we'll redirect to login
        window.location.href = "/login"
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && isSidebarOpen) {
            onSidebarClose()
        }
    }

    return (
        <>
            {/* Inject custom styles */}
            <style jsx>{sidebarStyles}</style>

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:static inset-0 z-40 bg-card border-r border-border w-64 lg:translate-x-0
                    transition-all duration-300 ease-in-out sidebar-enter
                    ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"}
                `}
                onKeyDown={handleKeyDown}
                role="navigation"
                aria-label="Admin navigation"
            >
                <div className="p-6 h-full flex flex-col">
                    <a
                        href="#main-content"
                        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-50 transition-all duration-300 ease-in-out"
                    >
                        Skip to main content
                    </a>

                    <h1 className="hidden lg:block font-serif font-bold text-2xl text-primary mb-8 ml-2 transition-all duration-300 ease-in-out hover:scale-105 cursor-default">
                        ADMIN DASHBOARD
                    </h1>

                    <nav className="space-y-1 flex-1" role="list" aria-label="Admin navigation menu">
                        {navigationItems.map((item, index) => (
                            <div
                                key={item.id}
                                role="listitem"
                                className="transition-all duration-300 ease-in-out"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animation: isSidebarOpen ? 'slideInLeft 0.3s ease-out forwards' : undefined
                                }}
                            >
                                <NavigationItem
                                    item={item}
                                    isActive={activeSection === item.id}
                                    onClick={() => {
                                        onSectionChange(item.id)
                                        onSidebarClose()
                                    }}
                                />
                            </div>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-border">
                        <button
                            onClick={handleLogout}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    handleLogout()
                                }
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-card hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                            aria-label="Logout from admin dashboard"
                            tabIndex={0}
                        >
                            <div className="absolute inset-0 bg-destructive/5 rounded-xl transform scale-0 transition-transform duration-200 group-active:scale-100" />
                            <LogOut className="w-5 h-5 transition-all duration-300 ease-in-out group-hover:rotate-12 group-hover:scale-110 relative z-10" />
                            <span className="font-medium transition-all duration-300 ease-in-out group-hover:translate-x-1 relative z-10">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div
                    data-testid="sidebar-backdrop"
                    className={`
                        fixed inset-0 bg-black z-30 lg:hidden
                        transition-all duration-300 ease-in-out
                        ${isSidebarOpen ? "opacity-50 backdrop-blur-sm" : "opacity-0 pointer-events-none"}
                    `}
                    onClick={onSidebarClose}
                    onTouchStart={onSidebarClose}
                    aria-label="Close sidebar"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                            onSidebarClose()
                        }
                    }}
                />
            )}
        </>
    )
}