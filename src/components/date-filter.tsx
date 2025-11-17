"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface DateFilterProps {
  onFilterChange: (startDate: Date, endDate: Date) => void
}

export function DateFilter({ onFilterChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>("todos")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  const applyFilter = (filterType: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let start = new Date()
    let end = new Date()
    
    switch (filterType) {
      case "hoje":
        start = today
        end = new Date(today)
        end.setHours(23, 59, 59, 999)
        break
        
      case "semana":
        const dayOfWeek = today.getDay()
        start = new Date(today)
        start.setDate(today.getDate() - dayOfWeek)
        start.setHours(0, 0, 0, 0)
        
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        break
        
      case "mes":
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        end.setHours(23, 59, 59, 999)
        break
        
      case "personalizado":
        if (!startDate || !endDate) return
        start = startDate
        end = endDate
        end.setHours(23, 59, 59, 999)
        break
        
      default:
        start = new Date(2020, 0, 1)
        end = new Date(2030, 11, 31)
        break
    }
    
    setSelectedFilter(filterType)
    onFilterChange(start, end)
    setIsOpen(false)
  }

  const getFilterLabel = () => {
    switch (selectedFilter) {
      case "hoje":
        return "Hoje"
      case "semana":
        return "Essa Semana"
      case "mes":
        return "Esse Mês"
      case "personalizado":
        if (startDate && endDate) {
          return `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`
        }
        return "Personalizado"
      default:
        return "Todos os Períodos"
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>{getFilterLabel()}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-3">
          <h4 className="font-medium">Filtrar por Período</h4>
          
          <div className="space-y-2">
            <Button
              variant={selectedFilter === "todos" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => applyFilter("todos")}
            >
              Todos os Períodos
            </Button>
            
            <Button
              variant={selectedFilter === "hoje" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => applyFilter("hoje")}
            >
              Hoje
            </Button>
            
            <Button
              variant={selectedFilter === "semana" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => applyFilter("semana")}
            >
              Essa Semana
            </Button>
            
            <Button
              variant={selectedFilter === "mes" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => applyFilter("mes")}
            >
              Esse Mês
            </Button>
            
            <Button
              variant={selectedFilter === "personalizado" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedFilter("personalizado")}
            >
              Personalizado
            </Button>
          </div>
          
          {selectedFilter === "personalizado" && (
            <div className="space-y-3 border-t pt-3">
              <div>
                <label className="text-sm font-medium">Data Inicial</label>
                <CalendarComponent
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date)
                    if (date && endDate) {
                      applyFilter("personalizado")
                    }
                  }}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Data Final</label>
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date)
                    if (startDate && date) {
                      applyFilter("personalizado")
                    }
                  }}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}