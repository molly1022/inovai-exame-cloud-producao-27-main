import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Search, Filter, X, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TenantGuard } from "@/components/TenantGuard";
import { TenantDemoInterface } from "@/components/TenantDemoInterface";
import { useRelatoriosExames } from "@/hooks/useRelatoriosExames";

interface ExamsFiltersProps {
  onFiltersChange: (filtros: any) => void;
  filtros: any;
}

const ExamsFilters = ({ onFiltersChange, filtros }: ExamsFiltersProps) => {
  return (
    <TenantGuard requiresOperationalDB={true}>
      <TenantDemoInterface 
        title="Filtros de Exames"
        description="Sistema de filtros avançados para exames"
        onBack={() => {}}
      />
    </TenantGuard>
  );
};

export default ExamsFilters;