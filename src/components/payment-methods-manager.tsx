'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  Search,
  Percent,
  DollarSign,
  Wallet
} from 'lucide-react'
import { toast } from 'sonner'

interface PaymentMethod {
  id: string
  nome: string
  taxa: number
  tipo: string
  ativo: boolean
  createdAt: string
}

interface PaymentMethodsProps {
  onAddPaymentMethod: (method: PaymentMethod) => void
}

export function PaymentMethodsManager({ onAddPaymentMethod }: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)
  
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    nome: '',
    taxa: '',
    tipo: 'fixo',
    ativo: true
  })

  useEffect(() => {
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: '1',
        nome: 'Cartão de Crédito',
        taxa: 3.5,
        tipo: 'percentual',
        ativo: true,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        nome: 'Cartão de Débito',
        taxa: 1.2,
        tipo: 'percentual',
        ativo: true,
        createdAt: '2024-01-10'
      },
      {
        id: '3',
        nome: 'PIX',
        taxa: 0,
        tipo: 'fixo',
        ativo: true,
        createdAt: '2024-01-12'
      },
      {
        id: '4',
        nome: 'Dinheiro',
        taxa: 0,
        tipo: 'fixo',
        ativo: true,
        createdAt: '2024-01-08'
      },
      {
        id: '5',
        nome: 'Transferência Bancária',
        taxa: 2.5,
        tipo: 'percentual',
        ativo: true,
        createdAt: '2024-01-05'
      }
    ]
    setPaymentMethods(mockPaymentMethods)
  }, [])

  const handleAddPaymentMethod = () => {
    if (!paymentMethodForm.nome || paymentMethodForm.taxa === '') {
      toast.error('Preencha nome e taxa')
      return
    }

    const newPaymentMethod: PaymentMethod = {
      id: Date.now().toString(),
      nome: paymentMethodForm.nome,
      taxa: parseFloat(paymentMethodForm.taxa),
      tipo: paymentMethodForm.tipo,
      ativo: paymentMethodForm.ativo,
      createdAt: new Date().toISOString().split('T')[0]
    }

    if (editingPaymentMethod) {
      setPaymentMethods(paymentMethods.map(pm => pm.id === editingPaymentMethod.id ? { ...newPaymentMethod, id: editingPaymentMethod.id } : pm))
      toast.success('Meio de pagamento atualizado com sucesso!')
    } else {
      setPaymentMethods([...paymentMethods, newPaymentMethod])
      toast.success('Meio de pagamento adicionado com sucesso!')
    }

    setPaymentMethodForm({
      nome: '',
      taxa: '',
      tipo: 'fixo',
      ativo: true
    })
    setEditingPaymentMethod(null)
    setIsAddPaymentMethodOpen(false)
  }

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setEditingPaymentMethod(method)
    setPaymentMethodForm({
      nome: method.nome,
      taxa: method.taxa.toString(),
      tipo: method.tipo,
      ativo: method.ativo
    })
    setIsAddPaymentMethodOpen(true)
  }

  const handleDeletePaymentMethod = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este meio de pagamento?')) {
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id))
      toast.success('Meio de pagamento excluído com sucesso!')
    }
  }

  const calculateNetValue = (grossValue: number, tax: number, taxType: string) => {
    if (taxType === 'percentual') {
      return grossValue - (grossValue * (tax / 100))
    } else {
      return grossValue - tax
    }
  }

  const filteredPaymentMethods = paymentMethods.filter(pm => 
    pm.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activePaymentMethods = paymentMethods.filter(pm => pm.ativo)

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Meios</p>
                <p className="text-2xl font-bold text-blue-600">{paymentMethods.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Meios Ativos</p>
                <p className="text-2xl font-bold text-green-600">{activePaymentMethods.length}</p>
              </div>
              <Wallet className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {paymentMethods.length > 0 
                    ? (paymentMethods.reduce((sum, pm) => sum + pm.taxa, 0) / paymentMethods.length).toFixed(2)
                    : '0.00'
                  }%
                </p>
              </div>
              <Percent className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Ações */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar meios de pagamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Dialog open={isAddPaymentMethodOpen} onOpenChange={setIsAddPaymentMethodOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Meio de Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingPaymentMethod ? 'Editar Meio de Pagamento' : 'Adicionar Novo Meio de Pagamento'}
              </DialogTitle>
              <DialogDescription>
                Cadastre os dados do meio de pagamento
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={paymentMethodForm.nome}
                  onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Cartão de Crédito"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxa">Taxa</Label>
                  <Input
                    id="taxa"
                    type="number"
                    step="0.01"
                    value={paymentMethodForm.taxa}
                    onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, taxa: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <select
                    id="tipo"
                    value={paymentMethodForm.tipo}
                    onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="fixo">Fixo (R$)</option>
                    <option value="percentual">Percentual (%)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ativo">Status</Label>
                <select
                  id="ativo"
                  value={paymentMethodForm.ativo.toString()}
                  onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, ativo: e.target.value === 'true' }))}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddPaymentMethodOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPaymentMethod} className="bg-purple-600 hover:bg-purple-700">
                <Save className="w-4 h-4 mr-2" />
                {editingPaymentMethod ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Meios de Pagamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPaymentMethods.map((method) => (
          <Card key={method.id} className={`hover:shadow-md transition-shadow ${
            !method.ativo ? 'opacity-60 bg-gray-50' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{method.nome}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={method.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {method.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                      {method.tipo === 'percentual' ? `${method.taxa}%` : `R$ ${method.taxa.toFixed(2)}`}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEditPaymentMethod(method)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeletePaymentMethod(method.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taxa:</span>
                  <span className="font-medium">
                    {method.tipo === 'percentual' ? `${method.taxa}%` : `R$ ${method.taxa.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exemplo (R$ 100):</span>
                  <span className="font-bold text-green-600">
                    R$ {calculateNetValue(100, method.taxa, method.tipo).toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    {method.tipo === 'percentual' 
                      ? `Desconto de ${method.taxa}% sobre o valor total`
                      : `Desconto fixo de R$ ${method.taxa.toFixed(2)} por transação`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}