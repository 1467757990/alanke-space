/**
 * 项目页数据源（纯内容）。
 * 页面展示与筛选规则由 src/config/projectsConfig.ts 控制。
 */
import type { ProjectItem } from "@/types/projectsConfig";

export const projectsData: ProjectItem[] = [
	{
		key: "q-restore",
		title: "Q-Restore",
		summary:
			"面向多跳问答的 RAG 研究原型，关注推理链中的证据恢复与上下文组织。当前为个人研究项目，指标与论文信息待补充。",
		category: "research",
		phase: "building",
		technologies: ["Python", "PyTorch", "Transformers", "RAG"],
		icon: "material-symbols:hub-outline-rounded",
		cover: "/assets/projects/q-restore.webp",
		coverAlt: "Q-Restore 项目占位封面：蓝紫色网络节点",
		featured: true,
		year: "2026",
	},
	{
		key: "judicial-events",
		title: "司法事件检测",
		summary:
			"面向司法长文本的事件检测探索，涉及 NLP、知识蒸馏与长上下文建模。仓库、数据和实验结果尚未公开。",
		category: "nlp",
		phase: "building",
		technologies: ["Python", "PyTorch", "Transformers", "知识蒸馏"],
		icon: "material-symbols:gavel-rounded",
		cover: "/assets/projects/judicial-events.webp",
		coverAlt: "司法事件检测项目占位封面：蓝绿色抽象天平",
		year: "2026",
	},
	{
		key: "architecture-kg",
		title: "传统建筑知识图谱系统",
		summary:
			"以传统建筑知识为对象的图谱与检索增强问答系统，结合 Neo4j、Python 与 LLM 组织结构化知识。",
		category: "knowledge",
		phase: "exploring",
		technologies: ["Neo4j", "Python", "LLM", "RAG"],
		icon: "material-symbols:account-balance-rounded",
		cover: "/assets/projects/architecture-kg.webp",
		coverAlt: "传统建筑知识图谱项目占位封面：暖色图谱节点",
		featured: true,
		year: "2026",
	},
	{
		key: "agent-lab",
		title: "AI Agent Lab",
		summary:
			"面向智能体、Tool Calling 与 AI Coding 的个人实验空间。目前处于规划阶段，具体实现与评测方式仍在设计。",
		category: "agent",
		phase: "planning",
		technologies: ["Agent", "Tool Calling", "AI Coding"],
		icon: "material-symbols:smart-toy-outline-rounded",
		cover: "/assets/projects/agent-lab.webp",
		coverAlt: "AI Agent Lab 项目占位封面：紫色同心轨道",
		year: "2026",
	},
];

/** 获取所有项目数据列表 */
export function getProjectsList(): ProjectItem[] {
	return projectsData;
}
