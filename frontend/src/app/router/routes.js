import { AlternativesPage } from "@/pages/Alternatives";
import { AnalysisPage } from "@/pages/Analysis";
import { ConstraintsPage } from "@/pages/Constraints";
import { CriteriaPage } from "@/pages/Criteria";
import { DecisionEnginePage } from "@/pages/DecisionEngine";
import { ExplanationPage } from "@/pages/Explanation";
import { Layout } from "@/pages/Layout";
import { MatrixPage } from "@/pages/Matrix";
import { RulesPage } from "@/pages/Rules";
import { VotingPage } from "@/pages/Voting";

export const routes = [
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
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
        path: "engine",
        Component: DecisionEnginePage,
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
