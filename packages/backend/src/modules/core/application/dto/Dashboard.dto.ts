export interface MonthlyActivityDto {
    month: string; // Nome do mês (Jan, Fev, etc.)
    count: number; // Quantidade de atividades naquele mês
}

export interface DashboardOverviewDto {
    last30DaysActivities: MonthlyActivityDto[]; // Atividades dos últimos 30 dias
    fullYearActivities: MonthlyActivityDto[]; // Atividades do ano todo
}
