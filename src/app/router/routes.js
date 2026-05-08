import { Alternatives } from "@/pages/Alternatives";
import { Analysis } from "@/pages/Analysis";
import { Constraints } from "@/pages/Constraints";
import { Criteria } from "@/pages/Criteria";
import { DecisionEngine } from "@/pages/DecisionEngine";
import { Explanation } from "@/pages/Explanation";
import { Layout } from "@/pages/Layout";
import { Matrix } from "@/pages/Matrix";
import { Rules } from "@/pages/Rules";
import { Voting } from "@/pages/Voting";

export const routes = [
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Alternatives,
      },
      {
        path: "criteria",
        Component: Criteria,
      },
      {
        path: "matrix",
        Component: Matrix,
      },
      {
        path: "voting",
        Component: Voting,
      },
      {
        path: "engine",
        Component: DecisionEngine,
      },
      {
        path: "constraints",
        Component: Constraints,
      },
      {
        path: "rules",
        Component: Rules,
      },
      {
        path: "analysis",
        Component: Analysis,
      },
      {
        path: "explanation",
        Component: Explanation,
      },
    ],
  },
];
