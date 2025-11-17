'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home,
  Calendar,
  Users,
  CreditCard,
  FileText,
  Stethoscope,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface NavigationItem {
  label: string
  href: string
  icon: any
  requiredUserType?: string
}

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logout realizado com sucesso!')
    router.push('/login')
  }

  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home
    },
    {
      label: 'Consultas',
      href: '/consultas',
      icon: Calendar
    },
    {
      label: 'Pacientes',
      href: '/pacientes',
      icon: Users
    },
    {
      label: 'Procedimentos',
      href: '/procedimentos',
      icon: FileText
    },
    {
      label: 'Financeiro',
      href: '/financeiro',
      icon: CreditCard
    },
    {
      label: 'Painel da Dra',
      href: '/dra-panel',
      icon: Stethoscope,
      requiredUserType: 'DRA_JOSIANE'
    }
  ]

  const filteredNavigationItems = navigationItems.filter(item => {
    if (!item.requiredUserType) return true
    return user?.userType === item.requiredUserType
  })

  const getUserTypeDisplay = (userType: string) => {
    const types = {
      'FINANCEIRO': { label: 'Financeiro', color: 'bg-green-100 text-green-800', icon: CreditCard },
      'DRA_JOSIANE': { label: 'Dra. Josiane Canali', color: 'bg-purple-100 text-purple-800', icon: Stethoscope },
      'SECRETARIA': { label: 'Secretaria', color: 'bg-blue-100 text-blue-800', icon: Users },
      'DESENVOLVEDOR': { label: 'Desenvolvedor', color: 'bg-gray-100 text-gray-800', icon: Settings }
    }
    return types[userType as keyof typeof types] || types['SECRETARIA']
  }

  const userTypeDisplay = getUserTypeDisplay(user?.userType || '')
  const UserIcon = userTypeDisplay.icon

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Clínica Médica</span>
              </div>
              
              <div className="flex items-center space-x-1">
                {filteredNavigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center space-x-2 ${
                        isActive 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      onClick={() => router.push(item.href)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className={`${userTypeDisplay.color} border-0`}>
                <UserIcon className="w-3 h-3 mr-1" />
                {userTypeDisplay.label}
              </Badge>
              <span className="text-sm text-gray-600">{user?.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Clínica Médica</span>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={`${userTypeDisplay.color} border-0 text-xs`}>
                <UserIcon className="w-3 h-3 mr-1" />
                {userTypeDisplay.label}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t bg-white">
            <div className="px-4 py-2 space-y-1">
              {filteredNavigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start flex items-center space-x-2 ${
                      isActive 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => {
                      router.push(item.href)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
              
              <div className="border-t pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-600">
                  {user?.name}
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}