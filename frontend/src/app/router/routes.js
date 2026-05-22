import { redirect } from "react-router";
import { AlternativesPage } from "@/pages/Alternatives";
import { AnalysisPage } from "@/pages/Analysis/Analysis";
import { ConstraintsPage } from "@/pages/Constraints";
import { CriteriaPage } from "@/pages/Criteria";
import { ExplanationPage } from "@/pages/Explanation";
import { Layout } from "@/pages/Layout";
import { MatrixPage } from "@/pages/Matrix";
import { RulesPage } from "@/pages/Rules/Rules";
import { VotingPage } from "@/pages/Voting";

export const routes = [
	{
		path: "/",
		Component: Layout,
		children: [
			{
				index: true,
				loader: () => redirect("/alternatives"),
			},
			{
				path: "alternatives",
				Component: AlternativesPage,
			},
			{
				path: "criteria",
				Component: CriteriaPage,
			},
			{
				path: "matrix",
				Component: MatrixPage,
			},
			{
				path: "voting",
				Component: VotingPage,
			},
			{
				path: "constraints",
				Component: ConstraintsPage,
			},
			{
				path: "rules",
				Component: RulesPage,
			},
			{
				path: "analysis",
				Component: AnalysisPage,
			},
			{
				path: "explanation",
				Component: ExplanationPage,
			},
		],
	},
];
