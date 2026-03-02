import { Routes } from '@angular/router';
import { TabbedShellComponent } from './core/ui/TabbedShell/tabbed-shell.component';
import { FinancialAdvisorSummaryPageComponent } from './features/FinancialAdvisorSummary/FinancialAdvisorSummaryPage/financial-advisor-summary-page.component';
import { MonthlyTrendPageComponent } from './features/MonthlyTrend/MonthlyTrendPage/monthly-trend-page.component';
import { InsuranceCarrierBreakdownPageComponent } from './features/InsuranceCarrierBreakdown/InsuranceCarrierBreakdownPage/insurance-carrier-breakdown-page.component';

export const routes: Routes = [
	{
		path: '',
		component: TabbedShellComponent,
		children: [
			{
				path: 'financial-advisor-summary',
				component: FinancialAdvisorSummaryPageComponent,
			},
			{
				path: 'monthly-trend',
				component: MonthlyTrendPageComponent,
			},
			{
				path: 'insurance-carrier-breakdown',
				component: InsuranceCarrierBreakdownPageComponent,
			},
			{
				path: '',
				pathMatch: 'full',
				redirectTo: 'financial-advisor-summary',
			},
		],
	},
];
