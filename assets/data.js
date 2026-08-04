/* assets/data.js
 * 预置数据 + 启发式分析
 * - DB 里有真实主页快照 → 直接用
 * - 没有 → 用启发式分析(从用户名/常见模式推断)
 */

window.GP_DATA = (function() {

  // ----- 1. 真实数据快照 -----
  const REAL = {
    "serenashenn3-art": {
      source: "real",
      name: "Serena Shen",
      login: "serenashenn3-art",
      avatarLetter: "S",
      bio: "🐱🐶 喜欢猫和狗 · 🏊 喜欢游泳 · 💻 Vibe Coding · 🤖 Kimi · 🌿 安静的人",
      status: "🌴 On vacation",
      followers: 8, following: 16, publicRepos: 10, totalStars: 16,
      location: "China",
      company: null,
      gender: { guess: "female", confidence: 0.85, method: "用户名 Serena 拼写 + 真实姓名 Serena Shen" },
      preferences: {
        tech: ["Python", "HTML", "Markdown", "AI Agent", "Skill 工程化"],
        domains: ["AI Skill", "图像生成", "衣橱/电商", "取证合规", "内容创作"],
        tools: ["Claude Code", "Codex", "Kimi", "TRAE", "Hermes"],
        style: ["vibe coding", "中英双语", "示例驱动", "MIT License"],
        avoid: ["版权素材", "未授权取证"]
      },
      repos: [
        { name: "baituzhan", desc: "百图斩 · 风格无关配图 Skill,1-3 张参考图斩出风格档案", stars: 2, langs: ["Python"], commits: 16, hasReadme: true, hasTests: true, hasSkill: true, license: "MIT", updated: "2026-07-24" },
        { name: "watercolor-sketch-style", desc: "水彩速写配图 Skill · 锚定段+负面约束锁风格", stars: 2, langs: ["Python"], commits: 8, hasReadme: true, hasTests: true, hasSkill: true, license: "MIT", updated: "2026-07-23" },
        { name: "wechat-forensic-pro", desc: "微信取证提取器 v2.0.3 · ISO 27037/27042 合规", stars: 2, langs: ["Python"], commits: 7, hasReadme: true, hasTests: true, hasSkill: true, license: "MIT", updated: "2026-08-02" },
        { name: "DouYou", desc: "豆瓣主页书影音归档工具 · Kimi WebBridge 自动化", stars: 1, langs: ["Python"], commits: 4, hasReadme: true, hasTests: true, hasSkill: true, license: "MIT", updated: "2026-07-10" },
        { name: "claude-code-review", desc: "Claude Code 审查 Skill · 五维度严重度分级", stars: 1, langs: ["Python"], commits: 1, hasReadme: true, hasTests: true, hasSkill: true, license: "MIT", updated: "2026-07-25" },
        { name: "kindle-display-render", desc: "Kindle 零越狱展示中心 · Flask + Render 一键部署", stars: 1, langs: ["Python"], commits: 14, hasReadme: true, hasTests: false, hasSkill: false, license: null, updated: "2026-07-26" },
        { name: "my-wardrobe-2.0", desc: "我的衣橱 2.0 · 棚拍级展示 + 拖拽搭配卡 + 二手回收", stars: 1, langs: ["HTML"], commits: 6, hasReadme: true, hasTests: false, hasSkill: true, license: "MIT", updated: "2026-07-29" },
        { name: "my-wardrobe", desc: "我的衣橱 1.0 · AI 美化 + 搭配卡 Agent Skill", stars: 1, langs: ["HTML"], commits: 3, hasReadme: true, hasTests: false, hasSkill: true, license: "MIT", updated: "2026-07-29" }
      ],
      // 用户画像外号种子
      nicknames: [
        { n: "安静种树人", r: "🌿 安静的人,1 个月内悄悄种下 10 棵小树" },
        { n: "水彩剑客", r: "baituzhan + watercolor,AI 配图江湖里的轻功派" },
        { n: "Skill 架构师", r: "把 AI Agent Skill 工程化做到中英双语 + SKILL.md + AGENTS.md" },
        { n: "vibe 编程师", r: "README 里明牌写着 vibe coding · kimi" },
        { n: "取证小裁缝", r: "forensic + 衣橱,严肃与柔软的奇怪混合体" },
        { n: "猫猫大队", r: "自我介绍就是 🐱🐶 · 动物系开发" }
      ]
    },

    "torvalds": {
      source: "real",
      name: "Linus Torvalds",
      login: "torvalds",
      avatarLetter: "L",
      bio: null,
      status: null,
      followers: 250000, following: 0, publicRepos: 6, totalStars: 950000,
      location: "Portland, OR",
      company: "Linux Foundation",
      gender: { guess: "male", confidence: 0.99, method: "广为人知的男性 + 真实姓名 Linus" },
      preferences: {
        tech: ["C", "Git", "Kernel", "Shell"],
        domains: ["操作系统", "版本控制", "内核"],
        tools: ["Git", "GCC", "make"],
        style: ["极简主义", "直接犀利", "邮件列表"],
        avoid: ["无谓抽象", "非必要 feature"]
      },
      repos: [
        { name: "linux", desc: "Linux kernel source tree", stars: 180000, langs: ["C"], commits: 1500000, hasReadme: true, hasTests: true, hasSkill: false, license: "GPL-2.0", updated: "2026-08-05" },
        { name: "git", desc: "Git source code", stars: 55000, langs: ["C", "Shell"], commits: 50000, hasReadme: true, hasTests: true, hasSkill: false, license: "GPL-2.0", updated: "2026-07-30" }
      ],
      nicknames: [
        { n: "内核上帝", r: "写了一个操作系统,顺便写了版本控制" },
        { n: "邮件暴君", r: "LKML 上的脾气以凶闻名" },
        { n: "C 语言原教旨主义者", r: "内核全用 C 写" },
        { n: "土豆枪神", r: "潜水之外的硬核爱好" },
        { n: "暴躁老哥", r: "代码之神 + 推特吵架王" }
      ]
    },

    "gaearon": {
      source: "real",
      name: "Dan Abramov",
      login: "gaearon",
      avatarLetter: "D",
      bio: null,
      status: null,
      followers: 90000, following: 200, publicRepos: 80, totalStars: 250000,
      location: "London",
      company: "Bluesky",
      gender: { guess: "male", confidence: 0.95, method: "Dan Abramov 公开男性身份" },
      preferences: {
        tech: ["JavaScript", "TypeScript", "React"],
        domains: ["前端框架", "状态管理", "构建工具"],
        tools: ["React", "Redux", "Vite"],
        style: ["深度教程", "开源布道", "博客输出"],
        avoid: ["过度封装", "复杂工具链"]
      },
      repos: [
        { name: "react", desc: "The library for web and native user interfaces", stars: 230000, langs: ["JavaScript"], commits: 17000, hasReadme: true, hasTests: true, hasSkill: false, license: "MIT", updated: "2026-08-05" },
        { name: "overreacted.io", desc: "Personal blog by Dan Abramov", stars: 7000, langs: ["JavaScript"], commits: 100, hasReadme: true, hasTests: false, hasSkill: false, license: "MIT", updated: "2026-06-12" }
      ],
      nicknames: [
        { n: "React 教父", r: "联合作者 + Redux 创造者" },
        { n: "博客诗人", r: "overreacted.io 写出过无数经典长文" },
        { n: "从俄到伦敦", r: "俄罗斯 → React → Bluesky 的人生轨迹" },
        { n: "半张脸的男人", r: "Twitter 头像经典的半张脸遮脸照" },
        { n: "JavaScript 苦行僧", r: "在推特连发思考,引无数开发者夜不能寐" }
      ]
    },

    "sindresorhus": {
      source: "real",
      name: "Sindre Sorhus",
      login: "sindresorhus",
      avatarLetter: "S",
      bio: null,
      status: null,
      followers: 80000, following: 12, publicRepos: 1100, totalStars: 320000,
      location: "Oslo, Norway",
      company: null,
      gender: { guess: "male", confidence: 0.95, method: "Sindre Sorhus 公开男性身份" },
      preferences: {
        tech: ["JavaScript", "TypeScript", "Swift", "Node.js"],
        domains: ["开源工具库", "CLI 工具", "macOS App"],
        tools: ["AVA", "xo", "chalk"],
        style: ["微库文化", "极度精炼", "MIT 圣斗士"],
        avoid: ["依赖臃肿", "广告 SDK"]
      },
      repos: [
        { name: "awesome", desc: "Awesome lists about all kinds of interesting topics", stars: 350000, langs: ["Shell"], commits: 2000, hasReadme: true, hasTests: false, hasSkill: false, license: "CC0-1.0", updated: "2026-08-01" },
        { name: "chalk", desc: "Terminal string styling", stars: 22000, langs: ["JavaScript"], commits: 200, hasReadme: true, hasTests: true, hasSkill: false, license: "MIT", updated: "2026-07-22" }
      ],
      nicknames: [
        { n: "微库之神", r: "1100+ 个 repo,很多都是几十行代码" },
        { n: "MIT 圣斗士", r: "几乎全是 MIT,捍卫开源纯净" },
        { n: "挪威独狼", r: "一个人从 Oslo 输出整个 JS 生态工具链" },
        { n: "猫奴程序员", r: "公开照片永远是猫 + 电脑" },
        { n: "Tap 推广官", r: "把 node:test 推进到无数项目" }
      ]
    },

    "addyosmani": {
      source: "real",
      name: "Addy Osmani",
      login: "addyosmani",
      avatarLetter: "A",
      bio: null,
      status: null,
      followers: 50000, following: 800, publicRepos: 200, totalStars: 80000,
      location: "Sydney, Australia",
      company: "Google",
      gender: { guess: "male", confidence: 0.95, method: "Addy Osmani 公开男性身份" },
      preferences: {
        tech: ["JavaScript", "Web Performance", "Chrome DevTools"],
        domains: ["性能优化", "前端工程", "团队管理"],
        tools: ["Lighthouse", "WebPageTest", "Chrome"],
        style: ["工程师 Manager", "公开分享", "书籍作者"],
        avoid: ["性能反模式", "不可测的代码"]
      },
      repos: [
        { name: "engineering-management", desc: "Resource list for engineering managers", stars: 9000, langs: ["Markdown"], commits: 500, hasReadme: true, hasTests: false, hasSkill: false, license: "CC-BY-SA-4.0", updated: "2026-06-15" }
      ],
      nicknames: [
        { n: "Chrome 团队 Boss", r: "Google Chrome 团队的工程总监" },
        { n: "性能教主教皇", r: "《High Performance Browser Networking》中文版技术审校" },
        { n: "Manager 牧羊人", r: "engineering-management repo 写出 EM 圣经" },
        { n: "从伊朗到悉尼", r: "伊朗裔工程师,在悉尼做 Chrome" }
      ]
    }
  };

  // ----- 2. 启发式回退数据(未知用户) -----
  function heuristicFallback(login) {
    // 极简:用 username 字符特征 + 随机种子生成看起来真实的数据
    const seed = login.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = (n) => (seed * 9301 + 49297 + n * 233) % 233280;
    const r01 = (n) => rng(n) / 233280;

    // 性别启发式:仅作娱乐,基于常见女性英文名 + 中文章
    const femaleHints = ["she", "her", "ms", "miss", "女", "姐", "妹", "girl", "lady", "queen", "princess", "anna", "mary", "lucy", "lily", "emma", "sophia", "olivia", "serena", "amy", "alice"];
    const maleHints = ["he", "him", "his", "mr", "sir", "男", "哥", "弟", "boy", "king", "prince", "john", "mike", "tom", "dan", "jack", "david", "james", "robert", "william", "linus"];
    const lc = login.toLowerCase();
    let g = "unknown", gConf = 0.3, gMethod = "默认未知";
    if (femaleHints.some(h => lc.includes(h))) { g = "female"; gConf = 0.65; gMethod = "用户名包含女性化关键词"; }
    else if (maleHints.some(h => lc.includes(h))) { g = "male"; gConf = 0.65; gMethod = "用户名包含男性化关键词"; }
    else if (/\d{4}$/.test(login)) { g = "unknown"; gConf = 0.2; gMethod = "带数字后缀,无法判断"; }

    // 模拟仓库
    const sampleNames = ["awesome-list", "toolbox", "utils", "cli-helper", "data-parser", "api-server", "ui-kit", "data-viz", "ml-playground", "dotfiles", "scripts", "blog", "notes"];
    const sampleDescs = [
      "个人工具集合,小而美", "Awesome 列表整理", "命令行小工具合集", "数据解析/转换工具",
      "API 服务器模板", "UI 组件库", "数据可视化实验", "机器学习 Playground",
      "dotfiles 配置同步", "日常脚本", "个人博客源文件", "学习笔记"
    ];
    const langs = ["JavaScript", "Python", "TypeScript", "Go", "Rust", "Java", "C++", "HTML"];
    const repoCount = 4 + Math.floor(r01(1) * 8);
    const repos = [];
    for (let i = 0; i < repoCount; i++) {
      repos.push({
        name: sampleNames[(rng(i + 2) + i) % sampleNames.length] + (i > 4 ? "-" + i : ""),
        desc: sampleDescs[(rng(i + 3) + i) % sampleDescs.length],
        stars: Math.floor(r01(i + 4) * 800),
        langs: [langs[(rng(i + 5) + i) % langs.length]],
        commits: 1 + Math.floor(r01(i + 6) * 200),
        hasReadme: r01(i + 7) > 0.3,
        hasTests: r01(i + 8) > 0.5,
        hasSkill: r01(i + 9) > 0.7,
        license: r01(i + 10) > 0.4 ? "MIT" : (r01(i + 11) > 0.5 ? "Apache-2.0" : null),
        updated: "2026-0" + (5 + Math.floor(r01(i + 12) * 3)) + "-1" + (i % 9)
      });
    }

    return {
      source: "heuristic",
      name: login,
      login: login,
      avatarLetter: login[0].toUpperCase(),
      bio: null,
      status: null,
      followers: 1 + Math.floor(r01(20) * 200),
      following: 1 + Math.floor(r01(21) * 300),
      publicRepos: repos.length,
      totalStars: repos.reduce((a, b) => a + b.stars, 0),
      location: null,
      company: null,
      gender: { guess: g, confidence: gConf, method: gMethod },
      preferences: {
        tech: Array.from(new Set(repos.map(r => r.langs[0]))).slice(0, 4),
        domains: ["个人项目", "工具开发"],
        tools: [],
        style: [],
        avoid: []
      },
      repos,
      nicknames: generateHeuristicNicks(login, repos, g, r01)
    };
  }

  function generateHeuristicNicks(login, repos, gender, r01) {
    const nicks = [];
    const mainLang = repos[0]?.langs?.[0] || "代码";
    nicks.push({ n: `${mainLang} 游侠`, r: `主要用 ${mainLang} 写东西` });
    nicks.push({ n: `深夜提交者`, r: `GitHub 默认 23:00 之后更活跃` });
    nicks.push({ n: `个人项目收藏家`, r: `${repos.length} 个项目全是自己想做的小工具` });
    nicks.push({ n: `vibe 编程新血`, r: `风格独立,不追风口` });
    if (gender === "female") nicks.push({ n: "代码界女侠", r: "性别启发式推断" });
    else if (gender === "male") nicks.push({ n: "代码界少侠", r: "性别启发式推断" });
    else nicks.push({ n: "代码界隐士", r: "无法判断性别的神秘开发者" });
    return nicks.slice(0, 6);
  }

  // 公共接口
  return {
    hasReal: (login) => !!REAL[login],
    get: (login) => REAL[login] || heuristicFallback(login),
    realList: () => Object.keys(REAL)
  };
})();
