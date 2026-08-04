/* assets/analyzer.js
 * 核心评分算法:六维画像 + 项目质量 + 投资值 + 外号 + 商业/技术价值
 */

window.GP_ANALYZER = (function() {

  // ---- 1. 项目质量评分(单项目)----
  function scoreProject(repo) {
    // 子项:Stars(0-25) + Commits(0-15) + README(0-15) + Tests(0-15) + License(0-10) + 描述质量(0-10) + 时新(0-10) = 100
    let stars = Math.min(25, Math.log10((repo.stars || 0) + 1) * 12);
    let commits = Math.min(15, Math.log10((repo.commits || 1) + 1) * 8);
    let readme = repo.hasReadme ? 15 : 0;
    let tests = repo.hasTests ? 15 : 5;
    let license = repo.license ? 10 : 0;
    let descLen = (repo.desc || "").length;
    let desc = Math.min(10, descLen / 8);
    let recency = 0;
    if (repo.updated) {
      const u = new Date(repo.updated);
      const days = (Date.now() - u.getTime()) / 86400000;
      if (days < 30) recency = 10;
      else if (days < 90) recency = 7;
      else if (days < 180) recency = 4;
      else recency = 1;
    }
    const total = Math.round(stars + commits + readme + tests + license + desc + recency);
    return {
      total,
      breakdown: {
        stars: Math.round(stars),
        commits: Math.round(commits),
        readme, tests, license, desc: Math.round(desc), recency
      },
      grade: total >= 80 ? "S" : total >= 70 ? "A" : total >= 60 ? "B" : total >= 50 ? "C" : total >= 40 ? "D" : "E"
    };
  }

  // ---- 2. 六维雷达评分(0-100)----
  function radarScores(data) {
    const repos = data.repos || [];
    const r = data;

    // 工程实践:有 README + Tests + License 的比例
    const hasReadme = repos.filter(x => x.hasReadme).length / Math.max(repos.length, 1);
    const hasTests = repos.filter(x => x.hasTests).length / Math.max(repos.length, 1);
    const hasLicense = repos.filter(x => x.license).length / Math.max(repos.length, 1);
    const engineering = Math.round((hasReadme * 0.3 + hasTests * 0.4 + hasLicense * 0.3) * 100);

    // 创新性:描述长度均值 + 描述多样性 + 是否新潮(Skill/AI 相关)
    const avgDesc = repos.reduce((a, b) => a + (b.desc || "").length, 0) / Math.max(repos.length, 1);
    const uniqueDescWords = new Set(repos.flatMap(x => (x.desc || "").split(/\s+/))).size;
    const innovKeywords = /(skill|agent|AI|llm|gpt|claude|forensic|智能|配图|生成|skill)/i;
    const innovHit = repos.filter(x => innovKeywords.test(x.desc || "") || innovKeywords.test(x.name || "")).length;
    const innovation = Math.min(100, Math.round(avgDesc * 1.5 + uniqueDescWords * 1.2 + innovHit * 8));

    // 完成度:平均项目分数
    const completion = Math.round(repos.reduce((a, b) => a + scoreProject(b).total, 0) / Math.max(repos.length, 1));

    // 持续性:最近更新中位数 + 至少有一个 30 天内更新的项目
    const recentUpdates = repos.filter(x => {
      if (!x.updated) return false;
      const days = (Date.now() - new Date(x.updated).getTime()) / 86400000;
      return days < 30;
    }).length;
    const oldRatio = repos.filter(x => {
      if (!x.updated) return true;
      const days = (Date.now() - new Date(x.updated).getTime()) / 86400000;
      return days > 180;
    }).length / Math.max(repos.length, 1);
    const persistence = Math.min(100, Math.round(recentUpdates * 20 + (1 - oldRatio) * 60));

    // 影响力:粉丝 + 总 stars + 仓库数
    const influence = Math.min(100, Math.round(
      Math.log10((r.followers || 1) + 1) * 18 +
      Math.log10((r.totalStars || 1) + 1) * 22 +
      Math.min(20, repos.length * 2)
    ));

    // 文档与可读性:有 README + 描述长度 + 双语
    const docScore = Math.round(
      hasReadme * 40 +
      Math.min(30, avgDesc * 0.6) +
      (data.preferences?.style?.includes("中英双语") ? 20 : 0) +
      10
    );

    return {
      engineering, innovation, completion, persistence, influence, doc: docScore
    };
  }

  // ---- 3. 投资值(0-100)----
  function investmentValue(data, radar) {
    // 创新性 * 0.3 + 工程 * 0.2 + 完成度 * 0.2 + 持续性 * 0.2 + 影响力 * 0.1
    const raw = radar.innovation * 0.3 + radar.engineering * 0.2 + radar.completion * 0.2
      + radar.persistence * 0.2 + radar.influence * 0.1;
    return Math.round(Math.min(100, raw));
  }

  // ---- 4. 商业/技术价值 ----
  function valueAnalysis(data, radar) {
    const repos = data.repos;
    const totalStars = data.totalStars || 0;
    const repoCount = repos.length;

    // 商业价值:面向开发者 vs 面向终端用户
    const consumerKeywords = /(app|应用|商城|购物|衣橱|图床|助手|个人|tool|工具|ui|界面|相框|展示)/i;
    const consumerRepos = repos.filter(x => consumerKeywords.test(x.name + " " + (x.desc || ""))).length;
    const consumerRatio = consumerRepos / Math.max(repoCount, 1);

    // 技术价值:基础设施 / 工具库 / Skill / AI
    const infraKeywords = /(skill|agent|cli|sdk|framework|engine|parser|compiler|toolkit|library|api|kit)/i;
    const infraRepos = repos.filter(x => infraKeywords.test(x.name + " " + (x.desc || ""))).length;
    const infraRatio = infraRepos / Math.max(repoCount, 1);

    // 创新性 + 影响力的综合
    const commercialScore = Math.round(consumerRatio * 60 + radar.completion * 0.2 + radar.doc * 0.1 + radar.innovation * 0.1);
    const technicalScore = Math.round(infraRatio * 50 + radar.engineering * 0.2 + radar.innovation * 0.2 + radar.persistence * 0.1);

    return {
      commercial: { score: Math.min(100, commercialScore), ratio: Math.round(consumerRatio * 100), desc: "面向个人/终端用户的产品化能力" },
      technical: { score: Math.min(100, technicalScore), ratio: Math.round(infraRatio * 100), desc: "面向开发者的技术深度与复用价值" }
    };
  }

  // ---- 5. 扩展可能性 ----
  function extensibility(data, radar) {
    const list = [];
    const all = data.repos.map(r => (r.desc || "") + " " + r.name).join(" ").toLowerCase();
    if (/衣橱|wardrobe|outfit/i.test(all)) list.push({ t: "电商 SaaS 化", d: "搭配卡 → 选品 → 选货 → 个人时尚助理" });
    if (/配图|illustration|sketch|水彩|插画/i.test(all)) list.push({ t: "内容创作工作流", d: "风格档案 → 多端分发(公众号/小红书/Newsletter)" });
    if (/forensic|取证|合规|合规审计/i.test(all)) list.push({ t: "企业合规工具", d: "对接 ISO 27037/27042,做电子证据 SaaS" });
    if (/skill|agent/i.test(all)) list.push({ t: "Skill 市场", d: "把当前 Skill 打包成可订阅的技能商店" });
    if (/kindle|相框|展示|渲染/i.test(all)) list.push({ t: "硬件互动装置", d: "延伸至墨水屏/智能家居仪表盘" });
    if (/豆瓣|douban|archive|归档/i.test(all)) list.push({ t: "数据所有权产品", d: "个人数据导出 → 跨平台迁移(Notion/Obsidian)" });
    if (/review|审查|审计/i.test(all)) list.push({ t: "DevSecOps 平台", d: "从 Skill 升级到 CI Gate,做企业版" });
    if (list.length === 0) {
      list.push({ t: "工具合集 → 平台", d: "把现有 repo 整合为统一 CLI/SDK" });
      list.push({ t: "AI Skill 化", d: "把核心能力封装为 Claude/Codex/Kimi 可调用的 Skill" });
      list.push({ t: "教学/内容产品", d: "用博客 + 视频 + 模板做付费课程" });
      list.push({ t: "开源 → 商业版", d: "开源核心 + 提供托管/付费高级功能" });
    }
    return list.slice(0, 6);
  }

  // ---- 6. 外号生成(基于画像)----
  function generateNicknames(data, radar, value) {
    // 优先用 data.nicknames 里预置的;再补 2-3 个动态生成
    const result = (data.nicknames || []).slice(0, 4);

    // 动态补充
    const tech = (data.preferences?.tech || []).join("+") || "代码";
    const topRepo = (data.repos || []).slice().sort((a, b) => scoreProject(b).total - scoreProject(a).total)[0];
    if (topRepo) {
      const word = (topRepo.desc || topRepo.name).split(/[·\s,，]/)[0];
      if (word && word.length >= 2) {
        result.push({ n: `${word} 大师`, r: `代表作 ${topRepo.name} 是当之无愧的头牌` });
      }
    }
    if (radar.innovation > 80) result.push({ n: "脑洞发射器", r: "创新性爆表,每天一个 idea" });
    if (radar.engineering > 80) result.push({ n: "工程强迫症", r: "README/测试/License 全齐" });
    if (radar.persistence > 80) result.push({ n: "持续输出机", r: "近期保持高频更新" });
    if (radar.influence > 80) result.push({ n: "开源 KOL", r: "影响力已经破圈" });
    if (radar.doc > 80) result.push({ n: "文档卷王", r: "把 README 写成杂志" });
    if (value.commercial.score > 70) result.push({ n: "产品嗅觉", r: "天然有把技术变成产品的直觉" });
    if (value.technical.score > 70) result.push({ n: "硬核技术宅", r: "技术深度一流" });

    // 去重
    const seen = new Set();
    return result.filter(x => {
      if (seen.has(x.n)) return false;
      seen.add(x.n);
      return true;
    }).slice(0, 6);
  }

  // ---- 7. 综合画像文字 ----
  function summaryText(data, radar, investment, value, nicknames) {
    const repos = data.repos;
    const topRepo = repos.slice().sort((a, b) => scoreProject(b).total - scoreProject(a).total)[0];
    const dims = [];
    if (radar.innovation > 75) dims.push("脑洞丰富");
    if (radar.engineering > 75) dims.push("工程严谨");
    if (radar.doc > 75) dims.push("文档强迫症");
    if (radar.persistence > 75) dims.push("持续输出");
    if (radar.influence > 60) dims.push("社区活跃");
    if (radar.completion > 75) dims.push("完成度高");
    const dimStr = dims.length ? dims.join("、") : "各项均衡发展中";

    const typeDesc = data.source === "real" ? "基于真实公开主页" : "基于启发式模拟(数据库未收录)";

    return [
      `${data.name || data.login} 是一个 <mark class="key">${dimStr}</mark> 的 GitHub 贡献者(画像 ${typeDesc})。`,
      `拥有 <mark class="key">${repos.length} 个公开仓库 / ${data.totalStars} Stars / ${data.followers} 关注者</mark>,代表作是 <mark class="key">${topRepo ? topRepo.name : "无"}</mark>(项目评分 ${topRepo ? scoreProject(topRepo).total : "-"})。`,
      `技术画像:${(data.preferences?.tech || []).slice(0, 3).join(" · ") || "未明确"};主要投入:<mark class="key">${(data.preferences?.domains || []).slice(0, 2).join(" · ") || "通用开发"}</mark>。`,
      `综合投资值 <mark class="key">${investment}/100</mark>;商业价值 ${value.commercial.score}/100 · 技术价值 ${value.technical.score}/100。`,
      `最匹配的江湖外号:<mark class="key">"${nicknames[0]?.n || "无名小卒"}"</mark>—— ${nicknames[0]?.r || ""}`
    ];
  }

  // ---- 8. 评级(SS / S / A / B / C / D)----
  function tierOf(score) {
    if (score >= 90) return { t: "SS", l: "传说", c: "var(--accent)" };
    if (score >= 80) return { t: "S", l: "史诗", c: "var(--accent)" };
    if (score >= 70) return { t: "A", l: "优秀", c: "var(--accent2)" };
    if (score >= 60) return { t: "B", l: "良好", c: "var(--accent3)" };
    if (score >= 50) return { t: "C", l: "潜力", c: "var(--warn)" };
    if (score >= 40) return { t: "D", l: "发展中", c: "var(--muted)" };
    return { t: "E", l: "蛰伏", c: "var(--bad)" };
  }

  // ---- 9. 主入口 ----
  function analyze(data) {
    const radar = radarScores(data);
    const investment = investmentValue(data, radar);
    const value = valueAnalysis(data, radar);
    const ext = extensibility(data, radar);
    const nicks = generateNicknames(data, radar, value);
    const projects = data.repos.map(r => ({ ...r, score: scoreProject(r) })).sort((a, b) => b.score.total - a.score.total);
    const summary = summaryText(data, radar, investment, value, nicks);
    const tier = tierOf(investment);
    const overall = Math.round(
      radar.engineering * 0.15 + radar.innovation * 0.2 + radar.completion * 0.2
      + radar.persistence * 0.15 + radar.influence * 0.1 + radar.doc * 0.2
    );

    return {
      data, radar, investment, value, ext, nicks, projects, summary, tier, overall,
      gender: data.gender,
      preferences: data.preferences
    };
  }

  return { analyze, scoreProject, tierOf };
})();
