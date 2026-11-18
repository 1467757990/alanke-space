/** 首页 Hero 与个人介绍内容（与组件样式分离，可直接修改）。 */
export interface HomeProfile {
	eyebrow: string;
	title: string;
	subtitle: string;
	intro: string;
	tags: string[];
	github: string;
}

export const homeProfile: HomeProfile = {
	eyebrow: "PERSONAL DIGITAL GARDEN",
	title: "你好，欢迎来到我的数字花园。",
	subtitle: "记录技术探索、科研实践，以及生活中的音乐与美好瞬间。",
	intro:
		"我是 Alanke，一名计算机硕士。这里收纳我的 RAG / Agent / NLP 笔记、项目档案，以及那些让生活变得具体的音乐与照片。",
	tags: ["RAG", "Agent", "NLP", "Python", "PyTorch", "Knowledge Graph"],
	github: "https://github.com/",
};
