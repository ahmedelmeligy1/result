(() => {
  "use strict";
  const octet = "(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)";
  const ipv4 = `${octet}\\.${octet}\\.${octet}\\.${octet}`;
  const pattern = new RegExp(`^${ipv4}(\\/(3[0-2]|[12]?\\d))?$`);
  const results = document.getElementById("results");

  /* ================= Results view ================= */
  
  // بيانات تجريبية — استبدلها بالـ response الحقيقي من /api/scan
  const DEMO = {
    hosts: 1, services: 12, risk: "High", scanTime: "1 min 32 sec", ports: "1 – 1024 (TCP)", type: "Authorized Scan",
    mlLabel: "Vulnerable", mlConf: 96,
    vulns: [
      { cve: "CVE-2021-41773", service: "Apache HTTP Server", version: "2.4.49", cvss: 9.8, sev: "Critical", ml: "Vulnerable",  conf: 96 },
      { cve: "CVE-2021-41524", service: "Apache HTTP Server", version: "2.4.49", cvss: 7.5, sev: "High",     ml: "At Risk",     conf: 94 },
      { cve: "CVE-2022-0778",  service: "OpenSSL",            version: "1.1.1k", cvss: 7.5, sev: "High",     ml: "At Risk",     conf: 92 },
      { cve: "CVE-2020-14812", service: "MySQL",              version: "5.7.31", cvss: 4.9, sev: "Medium",   ml: "Likely Risk", conf: 88 },
    ],
    recs: [
      "Update Apache HTTP Server to version 2.4.54 or later.",
      "Upgrade MySQL to a supported secure version (8.0+).",
      "Apply the latest OpenSSL patches (use a supported 3.x release).",
      "Review and harden server configuration (disable unused services and ports).",
    ],
  };
  const COLORS = { Critical: "#e8294d", High: "#f97316", Medium: "#facc15", Low: "#2f8cff" };
  const SEV_CLASS = { Critical: "crit", High: "high", Medium: "med", Low: "low" };
  const ML_CLASS = { "Vulnerable": "crit", "At Risk": "high", "Likely Risk": "med" };

  const I = {
    host: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2" fill="#2f8cff"/><path d="M8 20h8M12 16v4" stroke="#2f8cff" stroke-width="2" stroke-linecap="round"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="#8b7bff" stroke-width="2" stroke-linejoin="round"><path d="M12 3 3 8l9 5 9-5-9-5z" fill="#8b7bff"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>',
    warn: '<svg viewBox="0 0 24 24"><path d="M12 3 2 20h20L12 3z" fill="#ef2f55"/><path d="M12 9.5v5M12 17v.6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
    gauge: '<svg viewBox="0 0 100 58"><g fill="none" stroke-width="11"><path d="M10 52A40 40 0 0 1 30 17.4" stroke="#facc15"/><path d="M30 17.4A40 40 0 0 1 70 17.4" stroke="#f97316"/><path d="M70 17.4A40 40 0 0 1 90 52" stroke="#ef2f55"/></g></svg>',
    bars: '<svg viewBox="0 0 24 24" fill="#2f8cff"><rect x="3" y="12" width="5" height="9" rx="1"/><rect x="10" y="4" width="5" height="17" rx="1"/><rect x="17" y="9" width="4" height="12" rx="1"/></svg>',
    brainSm: '<svg viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linejoin="round"><path d="M12 3 3 8l9 5 9-5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" stroke="#22e08a" stroke-width="1.3" stroke-linejoin="round"><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 3 3 3 0 0 0 1 2.5A3 3 0 0 0 6 17a3 3 0 0 0 5 1.5V5.5A3 3 0 0 0 9 4zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 3 3 3 0 0 1-1 2.5A3 3 0 0 1 18 17a3 3 0 0 1-5 1.5V5.5A3 3 0 0 1 15 4z"/><path d="M8 10h2M14 10h2M8 14h2M14 14h2" stroke-linecap="round"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#2f8cff"/><path d="M12 11v6M12 7.2v.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" fill="#2f8cff"/><path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>',
    check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#16a06b"/><path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0-4-4m4 4 4-4M4 20h16"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"><path d="M7 5v14l12-7z"/></svg>',
    net: '<svg viewBox="0 0 24 24" fill="none" stroke="#9fb3d9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="5" rx="1.2"/><rect x="2.5" y="16" width="6" height="5" rx="1.2"/><rect x="15.5" y="16" width="6" height="5" rx="1.2"/><path d="M12 8v4M5.5 16v-4h13v4"/></svg>',
  };

  const stamp = () => {
    const d = new Date();
    const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    return `${date} – ${time}`;
  };

  function renderResults(target, scannedAt) {
    const d = DEMO, v = d.vulns, total = v.length;
    const order = ["Critical", "High", "Medium", "Low"];
    const cnt = (s) => v.filter((x) => x.sev === s).length;
    let acc = 0;
    const stops = order.map((s) => { const a = (acc / total) * 100; acc += cnt(s); return `${COLORS[s]} ${a}% ${(acc / total) * 100}%`; }).join(",");
    const legend = order.map((s) => `<li><i style="background:${COLORS[s]}"></i><span>${s}</span><b>${cnt(s)} (${Math.round((cnt(s) / total) * 100)}%)</b></li>`).join("");
    const rows = v.map((x, i) => `
      <tr>
        <td><a class="cve" href="https://nvd.nist.gov/vuln/detail/${x.cve}" target="_blank" rel="noopener">${x.cve}</a></td>
        <td>${x.service}</td><td>${x.version}</td><td>${x.cvss.toFixed(1)}</td>
        <td><span class="pill ${SEV_CLASS[x.sev]}">${x.sev}</span></td>
        <td><b class="ml ${ML_CLASS[x.ml]}">${x.ml}</b></td>
        <td>${x.conf}%</td>
        <td><button type="button" class="btn-detail" data-i="${i}">View Details</button></td>
      </tr>`).join("");

    results.innerHTML = `
      <header class="r-top">
        <div class="brand">
          <svg class="brand-logo" viewBox="0 0 64 72" aria-hidden="true"><defs><linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs><path d="M32 4 6 14v22c0 16 11 28 26 32 15-4 26-16 26-32V14L32 4z" fill="rgba(37,99,235,.15)" stroke="url(#lg2)" stroke-width="4" stroke-linejoin="round"/><rect x="21" y="31" width="22" height="18" rx="4" fill="url(#lg2)"/><path d="M25 31v-5a7 7 0 0 1 14 0v5" fill="none" stroke="url(#lg2)" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="39" r="2.6" fill="#07122e"/><rect x="30.8" y="39" width="2.4" height="6" rx="1.2" fill="#07122e"/></svg>
          <div class="brand-text"><h1 class="brand-name">NetGuard <span>AI</span></h1><p class="brand-sub">Machine Learning-Based <br />Network Vulnerability Assessment</p></div>
        </div>
        <div class="r-status"><span class="ic">${I.check}</span><div><b>Scan Completed Successfully</b><small>Scanned at: ${scannedAt}</small></div></div>
      </header>

      <form class="r-bar" id="r-form" novalidate>
        <label class="input-wrap" for="r-target"><span class="ic-md">${I.net}</span><span class="divider"></span>
          <input id="r-target" type="text" inputmode="text" autocomplete="off" spellcheck="false" value="${target}" aria-describedby="r-msg" /></label>
        <button type="submit" class="btn-scan"><span class="ic-md">${I.play}</span><span>Start Scan</span></button>
      </form>
      <p id="r-msg" class="scan-msg error" role="status" aria-live="polite"></p>

      <section class="stats">
        <article class="rc stat s-blue"><span class="ic-xl">${I.host}</span><div><b>${d.hosts}</b><span>Host Found</span></div></article>
        <article class="rc stat s-indigo"><span class="ic-xl">${I.layers}</span><div><b>${d.services}</b><span>Services Detected</span></div></article>
        <article class="rc stat s-red"><span class="ic-xl">${I.warn}</span><div><b>${total}</b><span>Vulnerabilities</span></div></article>
        <article class="rc stat s-orange"><span class="ic-xl gauge">${I.gauge}</span><div><b>${d.risk}</b><span>Risk Level</span></div></article>
      </section>

      <section class="panels">
        <article class="rc panel">
          <h3><span class="ic-sm">${I.bars}</span>Risk Distribution</h3>
          <div class="risk">
            <div class="donut" style="background:conic-gradient(${stops})"><span><b>${total}</b>Total</span></div>
            <ul class="legend">${legend}</ul>
          </div>
        </article>
        <article class="rc panel">
          <h3><span class="ic-sm">${I.brainSm}</span>ML Analysis Results</h3>
          <div class="ml-box">
            <div class="ml-ic">${I.brain}</div>
            <div class="ml-txt">
              <p>Overall Prediction: <b class="ml crit">${d.mlLabel}</b></p>
              <p>Confidence: <b>${d.mlConf}%</b></p>
              <div class="bar"><span style="width:${d.mlConf}%"></span></div>
              <small>The model detected patterns consistent with vulnerable configurations.</small>
            </div>
          </div>
        </article>
        <article class="rc panel">
          <h3><span class="ic-sm">${I.info}</span>Scan Information</h3>
          <dl class="info">
            <dt>Target IP:</dt><dd>${target}</dd>
            <dt>Scan Time:</dt><dd>${d.scanTime}</dd>
            <dt>Port Range:</dt><dd>${d.ports}</dd>
            <dt>Scan Type:</dt><dd>${d.type}</dd>
          </dl>
        </article>
      </section>

      <section class="rc panel vulns">
        <h3><span class="ic-sm">${I.shield}</span>Found Vulnerabilities</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>CVE ID</th><th>Service</th><th>Version</th><th>CVSS Score</th><th>Severity</th><th>ML Prediction</th><th>Confidence</th><th>Action</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </section>

      <section class="bottom">
        <article class="rc panel recs">
          <h3><span class="ic-sm">${I.bulb}</span>Security Recommendations</h3>
          <ul>${d.recs.map((r) => `<li><span class="ic-sm">${I.check}</span>${r}</li>`).join("")}</ul>
        </article>
        <button type="button" class="btn-scan btn-dl" id="r-download"><span class="ic-md">${I.dl}</span><span>Download Report</span></button>
      </section>
      <p class="r-note">Demo results — connect the scanner backend (<code>/api/scan</code>) to show real data.</p>

      <dialog id="detail" aria-labelledby="d-title"></dialog>`;

    // events
    const rForm = results.querySelector("#r-form"), rInput = results.querySelector("#r-target"), rMsg = results.querySelector("#r-msg");
    rInput.addEventListener("input", () => { rInput.closest(".input-wrap").classList.remove("invalid"); rMsg.textContent = ""; });
    rForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = rInput.value.trim();
      if (!pattern.test(value)) {
        rInput.closest(".input-wrap").classList.add("invalid");
        rMsg.textContent = "Enter a valid IP address (192.168.1.100) or range (192.168.1.0/24).";
        rInput.focus();
        return;
      }
      rescan(value);
    });
    results.querySelector("#r-download").addEventListener("click", () => downloadReport(target, scannedAt));
    const dlg = results.querySelector("#detail");
    results.querySelectorAll(".btn-detail").forEach((b) => b.addEventListener("click", () => {
      const x = d.vulns[+b.dataset.i];
      dlg.innerHTML = `
        <h3 id="d-title">${x.cve}</h3>
        <dl class="info">
          <dt>Service:</dt><dd>${x.service} ${x.version}</dd>
          <dt>CVSS Score:</dt><dd>${x.cvss.toFixed(1)} <span class="pill ${SEV_CLASS[x.sev]}">${x.sev}</span></dd>
          <dt>ML Prediction:</dt><dd><b class="ml ${ML_CLASS[x.ml]}">${x.ml}</b> (${x.conf}%)</dd>
        </dl>
        <div class="dlg-actions">
          <a class="btn-detail" href="https://nvd.nist.gov/vuln/detail/${x.cve}" target="_blank" rel="noopener">Open in NVD</a>
          <button type="button" class="btn-detail ghost" id="d-close">Close</button>
        </div>`;
      dlg.querySelector("#d-close").addEventListener("click", () => dlg.close());
      dlg.showModal();
    }));
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  }

  function rescan(value) {
    const btn = results.querySelector("#r-form .btn-scan");
    btn.disabled = true;
    btn.lastElementChild.textContent = "Scanning…";
    setTimeout(() => {
      history.replaceState(null, "", "?target=" + encodeURIComponent(value));
      renderResults(value, stamp());
      window.scrollTo(0, 0);
    }, 1800);
  }

  function downloadReport(target, scannedAt) {
    const d = DEMO;
    const lines = [
      "NetGuard AI - Vulnerability Report", `Target: ${target}`, `Scanned at: ${scannedAt}`, `Risk level: ${d.risk}`, "",
      "Vulnerabilities:",
      ...d.vulns.map((x) => `- ${x.cve} | ${x.service} ${x.version} | CVSS ${x.cvss.toFixed(1)} (${x.sev}) | ML: ${x.ml} ${x.conf}%`),
      "", "Recommendations:", ...d.recs.map((r) => `- ${r}`), "", "Note: demo data.",
    ];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    a.download = `netguard-report-${target.replace(/[^\d.]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const param = new URLSearchParams(location.search).get("target") || "";
  const target = pattern.test(param.trim()) ? param.trim() : "192.168.1.100";
  renderResults(target, stamp());
})();
