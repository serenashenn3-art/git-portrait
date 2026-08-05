/* assets/app.js
 * 渲染层:输入 + 加载 + 渲染画像 + 雷达图 + 交互
 */

(function() {

  // ---- Theme variables for ECharts ----
  function getTheme() {
    const s = getComputedStyle(document.documentElement);
    return {
      accent: s.getPropertyValue('--accent').trim(),
      accent2: s.getPropertyValue('--accent2').trim(),
      accent3: s.getPropertyValue('--accent3').trim(),
      ink: s.getPropertyValue('--ink').trim(),
      muted: s.getPropertyValue('--muted').trim(),
      rule: s.getPropertyValue('--rule').trim(),
      bg2: s.getPropertyValue('--bg2').trim(),
      warn: s.getPropertyValue('--warn').trim(),
      good: s.getPropertyValue('--accent3').trim(),
      bad: s.getPropertyValue('--bad').trim()
    };
  }

  // ---- Init sample grid ----
  function initSamples() {
    const grid = document.getElementById('sampleGrid');
    const samples = [
      { u: "serenashenn3-art", n: "Serena Shen", t: "Vibe Coder · Kimi", letter: "S" },
      { u: "torvalds", n: "Linus Torvalds", t: "Linux & Git 之父", letter: "L" },
      { u: "gaearon", n: "Dan Abramov", t: "React 联合作者", letter: "D" },
      { u: "sindresorhus", n: "Sindre Sorhus", t: "微库之神", letter: "S" },
      { u: "addyosmani", n: "Addy Osmani", t: "Chrome 团队", letter: "A" }
    ];
    grid.innerHTML = samples.map(s => `
      <div class="sample" data-u="${s.u}">
        <div class="avatar">${s.letter}</div>
        <div class="name">${s.n}</div>
        <div class="tag">@${s.u} · ${s.t}</div>
      </div>
    `).join('');
    grid.querySelectorAll('.sample').forEach(el => {
      el.addEventListener('click', () => {
        document.getElementById('ghInput').value = 'https://github.com/' + el.dataset.u;
        runAnalyze();
      });
    });
  }

  // ---- Parse input ----
  function parseLogin(input) {
    if (!input) return null;
    const v = input.trim().replace(/\/+$/, "");
    // 1. https://github.com/xxx
    let m = v.match(/github\.com\/([\w-]+)/i);
    if (m) return m[1];
    // 2. xxx (direct login)
    if (/^[\w-]+$/.test(v)) return v;
    return null;
  }

  // ---- Loading toggle ----
  function showLoading(show, msg) {
    const el = document.getElementById('loading');
    el.classList.toggle('show', show);
    if (msg) el.querySelector('.loading-msg').innerHTML = msg;
  }

  // ---- Render profile card ----
  function renderProfileCard(report) {
    const d = report.data;
    const tier = report.tier;
    return `
      <div class="profile-card">
        <div class="profile-avatar">${escape(d.avatarLetter)}</div>
        <div>
          <div class="profile-name">${escape(d.name || d.login)}</div>
          <div class="profile-bio">${d.bio ? escape(d.bio) : '<span style="color:var(--muted)">没有写 bio</span>'}</div>
          <div class="profile-meta">
            <span>🆔 @${escape(d.login)}</span>
            ${d.status ? `<span>📍 ${escape(d.status)}</span>` : ''}
            ${d.location ? `<span>🌍 ${escape(d.location)}</span>` : ''}
            ${d.company ? `<span>🏢 ${escape(d.company)}</span>` : ''}
            <span>👥 ${d.followers} 关注者</span>
            <span>⭐ ${d.totalStars} 总 Star</span>
            <span>📦 ${d.publicRepos} 仓库</span>
          </div>
        </div>
        <div class="profile-score">
          <div class="num">${report.overall}</div>
          <div class="lbl">综合评分</div>
          <div class="tier" style="background:${tier.c}22; color:${tier.c}; border:1px solid ${tier.c}66">${tier.t} · ${tier.l}</div>
        </div>
      </div>
    `;
  }

  // ---- Render summary block ----
  function renderSummary(report) {
    return `
      <div class="summary" style="margin-bottom:24px">
        ${report.summary.map(p => `<p>${p}</p>`).join('')}
      </div>
    `;
  }

  // ---- Render radar chart ----
  function renderRadar(report) {
    return `
      <div class="card">
        <h2><span class="ico"></span>六维能力雷达</h2>
        <div class="sub">工程实践 · 创新性 · 完成度 · 持续性 · 影响力 · 文档</div>
        <div id="radarChart" class="radar-wrap"></div>
      </div>
    `;
  }

  function initRadar(report) {
    const t = getTheme();
    const radar = report.radar;
    const chart = echarts.init(document.getElementById('radarChart'), null, { renderer: 'svg' });
    chart.setOption({
      animation: false,
      tooltip: {
        appendToBody: true,
        backgroundColor: t.bg2,
        borderColor: t.rule,
        textStyle: { color: t.ink, fontFamily: 'Bricolage' }
      },
      radar: {
        indicator: [
          { name: '工程实践', max: 100 },
          { name: '创新性', max: 100 },
          { name: '完成度', max: 100 },
          { name: '持续性', max: 100 },
          { name: '影响力', max: 100 },
          { name: '文档', max: 100 }
        ],
        shape: 'polygon',
        splitNumber: 4,
        center: ['50%', '52%'],
        radius: '64%',
        name: { textStyle: { color: t.muted, fontSize: 12, fontFamily: 'Bricolage' } },
        splitLine: { lineStyle: { color: t.rule } },
        splitArea: { areaStyle: { color: ['transparent', t.bg2 + '88'] } },
        axisLine: { lineStyle: { color: t.rule } }
      },
      series: [{
        type: 'radar',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: t.accent },
        itemStyle: { color: t.accent },
        areaStyle: { color: t.accent, opacity: 0.18 },
        data: [{
          value: [radar.engineering, radar.innovation, radar.completion, radar.persistence, radar.influence, radar.doc],
          name: '能力值'
        }]
      }]
    });
    window.addEventListener('resize', () => chart.resize());
  }

  // ---- Render metric bars (left column) ----
  function renderMetrics(report) {
    const t = getTheme();
    const r = report.radar;
    const items = [
      { n: '工程实践', v: r.engineering, w: 'README/测试/License 完整度' },
      { n: '创新性', v: r.innovation, w: '脑洞 + 关键词命中 + 描述多样性' },
      { n: '完成度', v: r.completion, w: '所有项目均分' },
      { n: '持续性', v: r.persistence, w: '近 30 天更新占比' },
      { n: '影响力', v: r.influence, w: '粉丝 + Star + 仓库数' },
      { n: '文档', v: r.doc, w: 'README + 描述长度 + 双语' }
    ];
    return `
      <div class="card">
        <h2><span class="ico"></span>六维评分</h2>
        <div class="sub">点哪个维度看详情,数据来源 GitHub 主页 + 启发式</div>
        <div class="metric-list">
          ${items.map(i => `
            <div class="metric">
              <div class="head">
                <span class="name">${i.n}</span>
                <span class="val">${i.v}/100</span>
              </div>
              <div class="bar"><div class="bar-fill" style="width:${i.v}%"></div></div>
              <div class="why">${i.w}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ---- Render gender + preferences (right column) ----
  function renderTagsCard(report) {
    const g = report.gender || { guess: 'unknown', confidence: 0, method: '' };
    const p = report.preferences || {};
    const genderMap = { female: { lbl: '♀ 女性(启发式)', cls: 'warm' }, male: { lbl: '♂ 男性(启发式)', cls: '' }, unknown: { lbl: '? 未知', cls: 'warn' } };
    const gInfo = genderMap[g.guess] || genderMap.unknown;
    const confPct = Math.round((g.confidence || 0) * 100);

    function tagList(arr, cls) {
      if (!arr || !arr.length) return '<span style="color:var(--muted); font-size:12px">暂无数据</span>';
      return arr.map(x => `<span class="tag ${cls || ''}">${escape(x)}</span>`).join('');
    }

    return `
      <div class="card">
        <h2><span class="ico"></span>性别 / 偏好 / 风格</h2>
        <div class="sub">启发式推断,纯属娱乐</div>
        <div style="margin-bottom:14px">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <span class="tag ${gInfo.cls}" style="font-size:13px; padding:6px 12px">${gInfo.lbl}</span>
            <span style="font-size:12px; color:var(--muted)">置信度 ${confPct}%</span>
          </div>
          <div style="font-size:12px; color:var(--muted)">推断依据:${escape(g.method || '默认')}</div>
        </div>

        <div style="margin-top:14px">
          <div style="font-size:12px; color:var(--muted); margin-bottom:6px">技术栈</div>
          <div class="tags">${tagList(p.tech)}</div>
        </div>
        <div style="margin-top:14px">
          <div style="font-size:12px; color:var(--muted); margin-bottom:6px">关注领域</div>
          <div class="tags">${tagList(p.domains, 'good')}</div>
        </div>
        <div style="margin-top:14px">
          <div style="font-size:12px; color:var(--muted); margin-bottom:6px">常用工具</div>
          <div class="tags">${tagList(p.tools, 'warm')}</div>
        </div>
        <div style="margin-top:14px">
          <div style="font-size:12px; color:var(--muted); margin-bottom:6px">风格</div>
          <div class="tags">${tagList(p.style, 'good')}</div>
        </div>
        <div style="margin-top:14px">
          <div style="font-size:12px; color:var(--muted); margin-bottom:6px">避开</div>
          <div class="tags">${tagList(p.avoid, 'bad')}</div>
        </div>
      </div>
    `;
  }

  // ---- Render project list ----
  function renderProjects(report) {
    const projects = report.projects;
    return `
      <div class="card" style="grid-column: 1 / -1">
        <h2><span class="ico"></span>项目质量评分(${projects.length}个)</h2>
        <div class="sub">每个项目 100 分,7 个子项加权:Stars · Commits · README · Tests · License · 描述 · 时新</div>
        ${projects.map(p => `
          <div class="proj">
            <div class="left">
              <div class="ptitle">
                <a href="https://github.com/${escape(report.data.login)}/${escape(p.name)}" target="_blank" rel="noopener">${escape(p.name)}</a>
                <span class="tag good" style="font-size:10px">⭐ ${p.stars}</span>
                ${p.license ? `<span class="tag" style="font-size:10px">${escape(p.license)}</span>` : ''}
                ${p.hasSkill ? `<span class="tag warm" style="font-size:10px">Skill</span>` : ''}
                ${p.hasTests ? `<span class="tag" style="font-size:10px">Tests</span>` : ''}
              </div>
              <div class="pdesc">${escape(p.desc || '无描述')}</div>
              <div class="pmeta">
                ${(p.langs || []).map(l => `<span class="pill">${escape(l)}</span>`).join('')}
                <span class="pill">${p.commits} commits</span>
                ${p.updated ? `<span class="pill">${escape(p.updated)}</span>` : ''}
              </div>
            </div>
            <div class="pright">
              <div class="pscore">${p.score.total}</div>
              <div class="pgrade">Grade ${p.score.grade}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ---- Render nicknames ----
  function renderNicknames(report) {
    return `
      <div class="card" style="grid-column: 1 / -1">
        <h2><span class="ico"></span>江湖外号(点击复制)</h2>
        <div class="sub">综合画像 → 风格标签 → 派别名 · 配合外号有理有据</div>
        <div class="nick-list">
          ${report.nicks.map(n => `
            <div class="nick" data-nick="${escape(n.n)}" title="点击复制">
              <div class="name">${escape(n.n)}</div>
              <div class="reason">${escape(n.r)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ---- Render investment value ----
  function renderInvestment(report) {
    const v = report.investment;
    const tier = report.tier;
    const msgs = {
      SS: ['真·值得 All in', '商业/技术/影响力三栖齐飞,极稀缺'],
      S: ['非常值得关注', '高潜力 + 强执行力 + 已有代表作'],
      A: ['明确值得跟踪', '至少 1-2 个高潜力项目,可作为协作者关注'],
      B: ['值得观察', '正在快速成长期,持续监控'],
      C: ['保留观察', '暂未充分验证,可加入候选池'],
      D: ['暂不投入', '需要更多信号'],
      E: ['跳过', '没有显著价值']
    };
    return `
      <div class="card" style="grid-column: 1 / -1">
        <h2><span class="ico"></span>投资 / 关注价值</h2>
        <div class="verdict">
          <div class="big">${tier.t} · ${v}/100</div>
          <div class="desc"><strong style="color:var(--ink)">${msgs[tier.t][0]}</strong> · ${msgs[tier.t][1]}</div>
        </div>
      </div>
    `;
  }

  // ---- Render value analysis ----
  function renderValue(report) {
    const v = report.value;
    return `
      <div class="card">
        <h2><span class="ico"></span>商业 vs 技术价值</h2>
        <div class="sub">两条腿走路,看哪条更粗</div>
        <div class="metric-list">
          <div class="metric">
            <div class="head"><span class="name">💼 商业价值(产品化能力)</span><span class="val">${v.commercial.score}/100</span></div>
            <div class="bar"><div class="bar-fill" style="width:${v.commercial.score}%"></div></div>
            <div class="why">${v.commercial.desc} · 面向用户的项目占比 ${v.commercial.ratio}%</div>
          </div>
          <div class="metric">
            <div class="head"><span class="name">⚙️ 技术价值(复用与生态)</span><span class="val">${v.technical.score}/100</span></div>
            <div class="bar"><div class="bar-fill" style="width:${v.technical.score}%; background:linear-gradient(90deg, var(--accent2), var(--accent3))"></div></div>
            <div class="why">${v.technical.desc} · 工具/库/SDK 类项目占比 ${v.technical.ratio}%</div>
          </div>
        </div>
      </div>
    `;
  }

  // ---- Render extensibility ----
  function renderExtensibility(report) {
    return `
      <div class="card">
        <h2><span class="ico"></span>扩展可能性</h2>
        <div class="sub">基于已有项目,下一步可能长成什么</div>
        <div class="ext-grid">
          ${report.ext.map(e => `
            <div class="ext">
              <div class="tt">→ ${escape(e.t)}</div>
              <div class="dd">${escape(e.d)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ---- Render full report ----
  function renderReport(report) {
    const root = document.getElementById('report');
    root.innerHTML = `
      ${renderProfileCard(report)}
      ${renderSummary(report)}
      <div class="grid-2">
        ${renderRadar(report)}
        ${renderMetrics(report)}
      </div>
      <div class="grid-2">
        ${renderTagsCard(report)}
        ${renderValue(report)}
      </div>
      ${renderProjects(report)}
      ${renderNicknames(report)}
      ${renderInvestment(report)}
      <div class="grid-2">
        ${renderExtensibility(report)}
        <div class="card">
          <h2><span class="ico"></span>数据来源 & 玩法</h2>
          <div class="sub">点开玩起来</div>
          <p style="font-size:14px; line-height:1.7; color:var(--muted)">
            <strong style="color:var(--ink)">数据来源</strong>:${report.data.source === 'real' ? 'GitHub 公开主页快照' : '启发式模拟数据(数据库未收录该用户)'}<br>
            <strong style="color:var(--ink)">算法</strong>:七子项项目评分 + 六维雷达 + 投资指数<br>
            <strong style="color:var(--ink)">玩法</strong>:试试输入同事/朋友/自己 GitHub 主页,看画像准不准<br>
            <strong style="color:var(--ink)">支持</strong>:预置样本 5 位 · 启发式兜底无限
          </p>
          <div style="margin-top:14px">
            <button class="btn btn-ghost" id="shareBtn" style="margin-right:8px">复制外号</button>
            <button class="btn btn-ghost" id="generateArticleBtn" style="margin-right:8px">📝 生成报告</button>
            <button class="btn btn-ghost" id="resetBtn">换个用户</button>
          </div>
        </div>
      </div>
    `;
    initRadar(report);
    bindReportEvents(report);
    root.classList.add('show');
    setTimeout(() => root.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  function bindReportEvents(report) {
    // 当前报告和语言
    let currentReport = report;
    let currentLang = 'zh-CN';

    // 复制外号
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const text = report.nicks.map(n => `${n.n} —— ${n.r}`).join('\n');
        const full = `${report.data.name || report.data.login} · 综合 ${report.overall} · 评级 ${report.tier.t}\n\n外号集:\n${text}\n\n— via GitPortrait`;
        copyText(full);
        shareBtn.textContent = '✓ 已复制';
        setTimeout(() => shareBtn.textContent = '复制外号', 1500);
      });
    }

    // 生成文章
    const generateArticleBtn = document.getElementById('generateArticleBtn');
    if (generateArticleBtn) {
      generateArticleBtn.addEventListener('click', () => {
        showArticleModal(currentReport, currentLang);
      });
    }

    // 重置
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        document.getElementById('report').classList.remove('show');
        document.getElementById('ghInput').focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    // 单个外号复制
    document.querySelectorAll('.nick').forEach(el => {
      el.addEventListener('click', () => {
        copyText(`${el.querySelector('.name').textContent} —— ${el.querySelector('.reason').textContent}`);
        const orig = el.querySelector('.name').textContent;
        el.querySelector('.name').textContent = '✓ 已复制';
        setTimeout(() => el.querySelector('.name').textContent = orig, 1200);
      });
    });
  }

  // ---- Article Modal ----
  function showArticleModal(report, lang) {
    const modal = document.getElementById('articleModal');
    const content = document.getElementById('articleContent');
    const langBtns = document.querySelectorAll('.lang-btn');
    const copyBtn = document.getElementById('copyArticleBtn');
    const closeBtn = document.getElementById('modalClose');

    // 生成文章
    function generate(langCode) {
      const article = window.GP_ARTICLE.generate(report, langCode);
      content.textContent = article;
      // 更新按钮状态
      langBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === langCode);
      });
    }

    // 初始化
    generate(lang);

    // 语言切换
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        generate(btn.dataset.lang);
      });
    });

    // 复制
    copyBtn.addEventListener('click', () => {
      copyText(content.textContent);
      copyBtn.textContent = '✓ 已复制！';
      setTimeout(() => copyBtn.textContent = '📋 复制报告', 1500);
    });

    // 关闭
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });

    // 显示
    modal.classList.add('show');
  }

  function copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  // ---- Escape ----
  function escape(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ---- Main: run analyze ----
  function runAnalyze() {
    const input = document.getElementById('ghInput').value;
    const login = parseLogin(input);
    if (!login) {
      alert('请输入合法的 GitHub 主页或用户名\n例如:https://github.com/torvalds 或 torvalds');
      return;
    }

    // Hide report
    const reportEl = document.getElementById('report');
    reportEl.classList.remove('show');
    reportEl.innerHTML = '';

    // Loading
    showLoading(true, `正在解析 <strong style="color:var(--ink)">@${escape(login)}</strong> 的画像 <span class="dots"></span>`);
    document.getElementById('analyzeBtn').disabled = true;

    // Simulate async (looks like real fetch)
    setTimeout(() => {
      try {
        const data = window.GP_DATA.get(login);
        const report = window.GP_ANALYZER.analyze(data);
        showLoading(false);
        document.getElementById('analyzeBtn').disabled = false;
        renderReport(report);
      } catch (e) {
        showLoading(false);
        document.getElementById('analyzeBtn').disabled = false;
        console.error(e);
        alert('画像生成失败:' + e.message);
      }
    }, 900);
  }

  // ---- Init ----
  function init() {
    initSamples();
    const btn = document.getElementById('analyzeBtn');
    btn.addEventListener('click', runAnalyze);
    document.getElementById('ghInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') runAnalyze();
    });
    document.querySelectorAll('.chip').forEach(c => {
      c.addEventListener('click', () => {
        document.getElementById('ghInput').value = c.dataset.u;
        runAnalyze();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);

})();
