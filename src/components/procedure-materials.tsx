'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Search,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface Material {
  id: string
  nome: string
  quantidade: number
  quantidadeMinima: number
  unidade: string
  valorUnitario: number
  categoria: string
  createdAt: string
}

interface ProcedureMaterialsProps {
  materials: Material[]
  onMaterialsUpdate: (materials: Material[]) => void
}

export function ProcedureMaterials({ materials, onMaterialsUpdate }: ProcedureMaterialsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [materialsList, setMaterialsList] = useState<Material[]>(materials)
  
  const [materialForm, setMaterialForm] = useState({
    nome: '',
    quantidade: '',
    quantidadeMinima: '',
    unidade: 'un',
    valorUnitario: '',
    categoria: ''
  })

  const handleAddMaterial = () => {
    if (!materialForm.nome || !materialForm.quantidade || !materialForm.valorUnitario) {
      toast.error('Preencha nome, quantidade e valor unitário')
      return
    }

    const newMaterial: Material = {
      id: Date.now().toString(),
      nome: materialForm.nome,
      quantidade: parseInt(materialForm.quantidade),
      quantidadeMinima: parseInt(materialForm.quantidadeMinima) || 10,
      unidade: materialForm.unidade,
      valorUnitario: parseFloat(materialForm.valorUnitario),
      categoria: materialForm.categoria,
      createdAt: new Date().toISOString().split('T')[0]
    }

    if (editingMaterial) {
      setMaterialsList(materialsList.map(m => m.id === editingMaterial.id ? { ...newMaterial, id: editingMaterial.id } : m))
      toast.success('Material atualizado com sucesso!')
    } else {
      setMaterialsList([...materialsList, newMaterial])
      toast.success('Material adicionado com sucesso!')
    }

    setMaterialForm({
      nome: '',
      quantidade: '',
      quantidadeMinima: '',
      unidade: 'un',
      valorUnitario: '',
      categoria: ''
    })
    setEditingMaterial(null)
    setIsAddMaterialOpen(false)
  }

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material)
    setMaterialForm({
      nome: material.nome,
      quantidade: material.quantidade.toString(),
      quantidadeMinima: material.quantidadeMinima.toString(),
      unidade: material.unidade,
      valorUnitario: material.valorUnitario.toString(),
      categoria: material.categoria
    })
    setIsAddMaterialOpen(true)
  }

  const handleDeleteMaterial = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      setMaterialsList(materialsList.filter(m => m.id !== id))
      toast.success('Material excluído com sucesso!')
    }
  }

  const handleUpdateProcedureMaterials = () => {
    onMaterialsUpdate(materialsList)
  }

  const getStockStatus = (quantidade: number, quantidadeMinima: number) => {
    if (quantidade < 10) return { color: 'bg-red-500', text: 'Crítico', icon: AlertTriangle }
    if (quantidade < quantidadeMinima) return { color: 'bg-yellow-500', text: 'Baixo', icon: AlertTriangle }
    return { color: 'bg-green-500', text: 'Normal', icon: Package }
  }

  const filteredMaterials = materialsList.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalValue = materialsList.reduce((sum, m) => sum + (m.quantidade * m.valorUnitario), 0)
  const criticalItems = materialsList.filter(m => m.quantidade < 10).length
  const lowItems = materialsList.filter(m => m.quantidade < m.quantidadeMinima).length

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Materiais</p>
                <p className="text-2xl font-bold text-blue-600">{materialsList.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalValue.toFixed(2)}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estoque Crítico</p>
                <p className="text-2xl font-bold text-red-600">{criticalItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-yellow-600">{lowItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Ações */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar materiais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddMaterialOpen} onOpenChange={setIsAddMaterialOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Material
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingMaterial ? 'Editar Material' : 'Adicionar Material'}
                </DialogTitle>
                <DialogDescription>
                  Cadastre os dados do material
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      value={materialForm.nome}
                      onChange={(e) => setMaterialForm(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Nome do material"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input
                      id="categoria"
                      value={materialForm.categoria}
                      onChange={(e) => setMaterialForm(prev => ({ ...prev, categoria: e.target.value }))}
                      placeholder="Categoria"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={materialForm.quantidade}
                      onChange={(e) => setMaterialForm(prev => ({ ...prev, quantidade: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantidadeMinima">Qtd. Mínima</Label>
                    <Input
                      id="quantidadeMinima"
                      type="number"
                      value={materialForm.quantidadeMinima}
                      onChange={(e) => setMaterialForm(prev => ({ ...prev, quantidadeMinima: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unidade">Unidade</Label>
                    <Input
                      id="unidade"
                      value={materialForm.unidade}
                      onChange={(e) => setMaterialForm(prev => ({ ...prev, unidade: e.target.value }))}
                      placeholder="un, cx, frasco"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                    <Input
                      id="valorUnitario"
                      type="number"
                      step="0.01"
                      value={materialForm.valorUnitario}
                      onChange={(e) => setMaterialForm(prev => ({ ...prev, valorUnitario: e.target.value }))}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Total</Label>
                    <Input
                      value={`R$ ${(parseInt(materialForm.quantidade || '0') * parseFloat(materialForm.valorUnitario || '0')).toFixed(2)}`}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddMaterialOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddMaterial} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingMaterial ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={handleUpdateProcedureMaterials}
            className="bg-green-600 hover:bg-green-700"
          >
            Atualizar Materiais do Procedimento
          </Button>
        </div>
      </div>

      {/* Lista de Materiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((material) => {
          const stockStatus = getStockStatus(material.quantidade, material.quantidadeMinima)
          const StatusIcon = stockStatus.icon
          
          return (
            <Card key={material.id} className={`hover:shadow-md transition-shadow border-l-4 ${
              material.quantidade < 10 ? 'border-l-red-500' : 
              material.quantidade < material.quantidadeMinima ? 'border-l-yellow-500' : 
              'border-l-green-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{material.nome}</h3>
                    <p className="text-sm text-gray-600">{material.categoria}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={`${stockStatus.color} text-white`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {stockStatus.text}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditMaterial(material)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Quantidade:</span>
                    <span className="font-medium">{material.quantidade} {material.unidade}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mínimo:</span>
                    <span className="font-medium">{material.quantidadeMinima} {material.unidade}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valor Unitário:</span>
                    <span className="font-medium">R$ {material.valorUnitario.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valor Total:</span>
                    <span className="font-bold text-green-600">R$ {(material.quantidade * material.valorUnitario).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}