const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'components', 'AdminDashboardPage.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Fix Sidebar Active Background
content = content.replace(
  /className=\{`w-full text-left h-10 rounded-xl px-3 text-\[12px\] font-semibold transition-colors \$\{\s*isActive\s*\?\s*"bg-\[#0f3a2b\] text-white"\s*:\s*"text-white\/72 hover:text-white hover:bg-white\/8"\s*\}`\}/,
  'className={`w-full text-left h-10 rounded-xl px-3 text-[12px] font-semibold transition-colors ${isActive ? "bg-[#0f3a2b] text-white shadow-inner" : "text-white/72 hover:text-white hover:bg-white/8"}`}'
);

// 2. Fix Header
content = content.replace(
  /<div className="flex items-start justify-between gap-4 mb-5">\s*<div>\s*<h1 className="text-\[44px\] leading-\[0\.92\] font-black tracking-\[-0\.03em\] text-\[#10261d\]">\s*Admin Dashboard\s*<\/h1>\s*<p className="text-\[12px\] text-\[#1a3326\]\/55 mt-1">\s*Live user insights · Auto-refreshing every 30s\s*<\/p>\s*<\/div>/,
  `<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#046241] mb-2 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-[#046241] animate-pulse" />
                   Overview Dashboard
                </p>
                <h1 className="text-[36px] md:text-[44px] leading-[0.92] font-black tracking-[-0.03em] text-[#10261d]">
                  Welcome back, {user?.name?.split(" ")[0] || "Admin"}
                </h1>
                <p className="mt-2 text-[12px] text-[#1a3326]/62 font-medium">
                  {todayLabel}. Today's system overview.
                </p>
              </div>`
);

// 3. Fix Refresh Button
content = content.replace(
  /<button\s*type="button"\s*onClick=\{\(\) => void fetchUsers\(\)\}\s*className="h-9 px-4 rounded-full border border-\[#d7e4dd\] bg-white text-\[10px\] font-black uppercase tracking-\[0\.12em\] text-\[#25473a\]"\s*>\s*\{isRefreshing \? "Refreshing\.\.\." : "Refresh"\}\s*<\/button>\s*<div className="h-9 px-4 rounded-full border border-\[#d7e4dd\] bg-white text-\[10px\] font-black uppercase tracking-\[0\.12em\] text-\[#25473a\] flex items-center">\s*\{lastSyncAt \? `Last sync \$\{formatRelativeTime\(lastSyncAt\.toISOString\(\)\)\}` : "Sync pending"\}\s*<\/div>/,
  `<button
                  type="button"
                  onClick={() => void fetchUsers()}
                  disabled={loadingUsers || isRefreshing}
                  className="h-10 w-10 flex items-center justify-center rounded-full border border-[#d7e4dd] bg-white text-[#25473a] hover:bg-[#f0f4f1] transition-colors disabled:opacity-50 group"
                  title="Refresh Dashboard"
                >
                  <svg className={\`w-4 h-4 text-[#046241] group-hover:scale-110 transition-transform \${loadingUsers || isRefreshing ? 'animate-spin' : ''}\`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>`
);

// 4. Fix Grid Stats
content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-3 gap-3">[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-6">
              <PremiumStatCard
                title="Total accounts"
                value={loadingUsers ? "—" : totalUsers}
                subtitle={\`\${newUsers7d} joined this week\`}
                trend="up"
                trendValue="Active"
              />
              <PremiumStatCard
                title="Total Applicants"
                value={loadingUsers ? "—" : totalApplicants}
                subtitle={\`\${newApplicants7d} this week\`}
                trend="up"
                trendValue={\`\${acceptedApplicants} Hired\`}
              />
              <PremiumStatCard
                title="Active today"
                value={loadingUsers ? "—" : activeToday}
                trend="neutral"
                trendValue="Live"
              />
              <PremiumStatCard
                title="Pending setup"
                value={loadingUsers ? "—" : pendingUsers}
                subtitle="Users awaiting verification"
                trend={pendingUsers > 0 ? "down" : "neutral"}
                trendValue={pendingUsers > 0 ? "Action needed" : "-"}
              />
            </div>`
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated properties in AdminDashboardPage.tsx via AST/Regex matching!');
