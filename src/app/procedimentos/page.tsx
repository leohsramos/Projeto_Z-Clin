'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Plus,
  Search,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Package
} from 'lucide-react'
import { toast } from 'sonner'

interface Procedure {
  id: string
  name: string
  description?: string
  value: number
  duration: number
  materials?: string
  createdAt: string
}

export default function ProcedimentosPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    duration: '',
    materials: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadProcedures()
  }, [isAuthenticated, router])

  const loadProcedures = async () => {
    try {
      const response = await fetch('/api/procedures')
      if (response.ok) {
        const data = await response.json()
        setProcedures(data)
      }
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error)
      toast.error('Erro ao carregar procedimentos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProcedure = async () => {
    try {
      const response = await fetch('/api/procedures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Procedimento cadastrado com sucesso!')
        setIsCreateDialogOpen(false)
        setFormData({
          name: '',
          description: '',
          value: '',
          duration: '',
          materials: ''
        })
        loadProcedures()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao cadastrar procedimento')
      }
    } catch (error) {
      toast.error('Erro ao cadastrar procedimento')
    }
  }

  const handleEditProcedure = (procedure: Procedure) => {
    setEditingProcedure(procedure)
    setFormData({
      name: procedure.name,
      description: procedure.description || '',
      value: procedure.value.toString(),
      duration: procedure.duration.toString(),
      materials: procedure.materials || ''
    })
    setIsCreateDialogOpen(true)
  }

  const handleUpdateProcedure = async () => {
    if (!editingProcedure) return

    try {
      const response = await fetch(`/api/procedures/${editingProcedure.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Procedimento atualizado com sucesso!')
        setIsCreateDialogOpen(false)
        setEditingProcedure(null)
        setFormData({
          name: '',
          description: '',
          value: '',
          duration: '',
          materials: ''
        })
        loadProcedures()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao atualizar procedimento')
      }
    } catch (error) {
      toast.error('Erro ao atualizar procedimento')
    }
  }

  const handleDeleteProcedure = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este procedimento?')) {
      return
    }

    try {
      const response = await fetch(`/api/procedures/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Procedimento excluído com sucesso!')
        loadProcedures()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao excluir procedimento')
      }
    } catch (error) {
      toast.error('Erro ao excluir procedimento')
    }
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingProcedure(null)
    setFormData({
      name: '',
      description: '',
      value: '',
      duration: '',
      materials: ''
    })
  }

  const filteredProcedures = procedures.filter(procedure =>
    procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    procedure.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Gestão de Procedimentos</h1>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Procedimento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingProcedure ? 'Editar Procedimento' : 'Cadastrar Novo Procedimento'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProcedure 
                      ? 'Atualize as informações do procedimento.'
                      : 'Preencha os dados do novo procedimento.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome do procedimento"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      placeholder="Descrição detalhada do procedimento"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="value">Valor (R$) *</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={formData.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duração (min) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="30"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="materials">Materiais Necessários</Label>
                    <Textarea
                      id="materials"
                      placeholder="Lista de materiais necessários para o procedimento"
                      value={formData.materials}
                      onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={editingProcedure ? handleUpdateProcedure : handleCreateProcedure} 
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {editingProcedure ? 'Atualizar' : 'Cadastrar'} Procedimento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar procedimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Procedimentos</p>
                  <p className="text-2xl font-bold text-gray-900">{procedures.length}</p>
                </div>
                <Package className="w-8 h-8 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    R$ {procedures.length > 0 
                      ? (procedures.reduce((sum, p) => sum + p.value, 0) / procedures.length).toFixed(2)
                      : '0,00'
                    }
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Duração Média</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {procedures.length > 0 
                      ? Math.round(procedures.reduce((sum, p) => sum + p.duration, 0) / procedures.length)
                      : 0
                    } min
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Procedures Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredProcedures.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm ? 'Nenhum procedimento encontrado' : 'Nenhum procedimento cadastrado'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProcedures.map((procedure) => (
              <Card key={procedure.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{procedure.name}</CardTitle>
                    <Badge variant="secondary">
                      R$ {procedure.value.toFixed(2)}
                    </Badge>
                  </div>
                  {procedure.description && (
                    <CardDescription>{procedure.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {procedure.duration} min
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-1" />
                      R$ {procedure.value.toFixed(2)}
                    </div>
                  </div>
                  {procedure.materials && (
                    <div className="text-sm text-gray-600">
                      <strong>Materiais:</strong> {procedure.materials}
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditProcedure(procedure)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteProcedure(procedure.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}