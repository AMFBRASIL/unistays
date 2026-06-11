import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NewContractModal } from "@/components/contracts/NewContractModal";
import { ViewContractModal } from "@/components/contracts/ViewContractModal";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Edit,
  Eye,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Contract {
  id: string;
  company: string;
  logo?: string;
  cnpj: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  discount: number;
  validFrom: string;
  validTo: string;
  status: "active" | "expiring" | "expired" | "pending";
  roomNightsUsed: number;
  roomNightsLimit: number;
  totalRevenue: number;
  lastBooking: string;
}

const contracts: Contract[] = [
  {
    id: "1",
    company: "TechCorp Brasil",
    cnpj: "12.345.678/0001-90",
    contact: "Roberto Silva",
    email: "roberto@techcorp.com.br",
    phone: "(11) 98765-4321",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    discount: 25,
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    status: "active",
    roomNightsUsed: 450,
    roomNightsLimit: 600,
    totalRevenue: 225000,
    lastBooking: "2024-12-10"
  },
  {
    id: "2",
    company: "Banco Nacional",
    cnpj: "98.765.432/0001-10",
    contact: "Marina Costa",
    email: "marina@banconacional.com.br",
    phone: "(21) 99876-5432",
    address: "Av. Rio Branco, 500 - Rio de Janeiro, RJ",
    discount: 30,
    validFrom: "2024-01-01",
    validTo: "2025-01-31",
    status: "active",
    roomNightsUsed: 280,
    roomNightsLimit: 400,
    totalRevenue: 168000,
    lastBooking: "2024-12-12"
  },
  {
    id: "3",
    company: "Consultoria Global",
    cnpj: "11.222.333/0001-44",
    contact: "Pedro Mendes",
    email: "pedro@consultoriaglobal.com",
    phone: "(31) 97654-3210",
    address: "Av. Afonso Pena, 2000 - Belo Horizonte, MG",
    discount: 20,
    validFrom: "2024-06-01",
    validTo: "2024-12-31",
    status: "expiring",
    roomNightsUsed: 180,
    roomNightsLimit: 200,
    totalRevenue: 90000,
    lastBooking: "2024-12-08"
  },
  {
    id: "4",
    company: "Indústria Metalúrgica ABC",
    cnpj: "55.666.777/0001-88",
    contact: "João Ferreira",
    email: "joao@metalurgicaabc.com.br",
    phone: "(41) 96543-2109",
    address: "Av. Industrial, 100 - Curitiba, PR",
    discount: 15,
    validFrom: "2023-01-01",
    validTo: "2023-12-31",
    status: "expired",
    roomNightsUsed: 120,
    roomNightsLimit: 150,
    totalRevenue: 54000,
    lastBooking: "2023-11-20"
  },
  {
    id: "5",
    company: "Startup Inovação",
    cnpj: "77.888.999/0001-11",
    contact: "Ana Clara",
    email: "ana@startupinovacao.com",
    phone: "(51) 95432-1098",
    address: "Rua da Tecnologia, 50 - Porto Alegre, RS",
    discount: 18,
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
    status: "pending",
    roomNightsUsed: 0,
    roomNightsLimit: 100,
    totalRevenue: 0,
    lastBooking: "-"
  },
];

const statusConfig = {
  active: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
  expiring: { label: "Expirando", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: AlertCircle },
  expired: { label: "Expirado", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: AlertCircle },
  pending: { label: "Pendente", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Clock },
};

export default function CorporateContracts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [editContract, setEditContract] = useState<Contract | null>(null);

  const activeContracts = contracts.filter(c => c.status === "active").length;
  const totalRevenue = contracts.reduce((acc, c) => acc + c.totalRevenue, 0);
  const totalRoomNights = contracts.reduce((acc, c) => acc + c.roomNightsUsed, 0);
  const expiringContracts = contracts.filter(c => c.status === "expiring").length;

  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setViewModalOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setEditContract(contract);
    setContractModalOpen(true);
  };

  const handleNewContract = () => {
    setEditContract(null);
    setContractModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Contratos Corporativos</h1>
              <p className="text-muted-foreground">Gestão de contratos com empresas e agências</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
            <Button
              onClick={handleNewContract}
              className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Novo Contrato
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contratos Ativos</p>
                  <p className="text-2xl font-bold text-blue-500">{activeContracts}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/5 border-emerald-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-emerald-500">R$ {(totalRevenue / 1000).toFixed(0)}k</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Room Nights</p>
                  <p className="text-2xl font-bold text-purple-500">{totalRoomNights}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">A Vencer</p>
                  <p className="text-2xl font-bold text-amber-500">{expiringContracts}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contratos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Contracts List */}
        <div className="space-y-4">
          {contracts.filter(c => c.company.toLowerCase().includes(searchQuery.toLowerCase())).map((contract) => {
            const status = statusConfig[contract.status];
            const usagePercent = (contract.roomNightsUsed / contract.roomNightsLimit) * 100;

            return (
              <Card key={contract.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Company Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="w-14 h-14 rounded-xl">
                        <AvatarImage src={contract.logo} />
                        <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                          {contract.company.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{contract.company}</h3>
                          <Badge variant="outline" className={status.color}>
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{contract.cnpj}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {contract.contact}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contract.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contract Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{contract.discount}%</p>
                        <p className="text-xs text-muted-foreground">Desconto</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-500">R$ {(contract.totalRevenue / 1000).toFixed(0)}k</p>
                        <p className="text-xs text-muted-foreground">Receita</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{contract.roomNightsUsed}</p>
                        <p className="text-xs text-muted-foreground">Room Nights</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{new Date(contract.validTo).toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs text-muted-foreground">Vencimento</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleView(contract)}>
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleEdit(contract)}>
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Utilização de Room Nights</span>
                      <span className="text-sm font-medium">{contract.roomNightsUsed} / {contract.roomNightsLimit}</span>
                    </div>
                    <Progress
                      value={usagePercent}
                      className={cn(
                        "h-2",
                        usagePercent > 90 && "[&>div]:bg-red-500",
                        usagePercent > 75 && usagePercent <= 90 && "[&>div]:bg-amber-500"
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <NewContractModal
          open={contractModalOpen}
          onOpenChange={setContractModalOpen}
          editContract={editContract ? {
            id: editContract.id,
            company: editContract.company,
            cnpj: editContract.cnpj,
            contact: editContract.contact,
            email: editContract.email,
            phone: editContract.phone,
            address: editContract.address,
            discount: editContract.discount,
            validFrom: editContract.validFrom,
            validTo: editContract.validTo,
            roomNightsLimit: editContract.roomNightsLimit,
          } : null}
        />
        <ViewContractModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          contract={selectedContract}
          onEdit={() => selectedContract && handleEdit(selectedContract)}
        />
      </div>
    </DashboardLayout>
  );
}
