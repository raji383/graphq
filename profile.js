export async function fetchData() {
    const jwt = localStorage.getItem('jwt');

    const query = `
    {
        user {
            login
            firstName
            lastName
            city : attrs(path: "city")
            totalUp
            totalDown
            transactions(where: { type: { _eq: "xp" }, event: { object: { name: { _eq: "Module" } } } }, order_by: {createdAt:desc}) {
                path
                createdAt
                amount
            }
        }
        lvl: transaction_aggregate(
            where: { type: { _eq: "level" }, event: { object: { name: { _eq: "Module" } } } }
        ) {
            aggregate {
                max {
                    amount
                }
            }
        }
        back: transaction_aggregate(
            where: { type: { _eq: "skill_back-end" }, event: { object: { name: { _eq: "Module" } } } }
        ) {
            aggregate {
                max {
                    amount
                }
            }
        }
        front: transaction_aggregate(
            where: { type: { _eq: "skill_front-end" }, event: { object: { name: { _eq: "Module" } } } }
        ) {
            aggregate {
                max {
                    amount
                }
            }
        }
        html: transaction_aggregate(
            where: { type: { _eq: "skill_html" }, event: { object: { name: { _eq: "Module" } } } }
        ) {
            aggregate {
                max {
                    amount
                }
            }
        }
        go: transaction_aggregate(
            where: { type: { _eq: "skill_go" }, event: { object: { name: { _eq: "Module" } } } }
        ) {
            aggregate {
                max {
                    amount
                }
            }
        }
        prog: transaction_aggregate(
            where: { type: { _eq: "skill_prog" }, event: { object: { name: { _eq: "Module" } } } }
        ) {
            aggregate {
                max {
                    amount
                }
            }
        }
        js: transaction_aggregate(
            where: { type: { _eq: "skill_js" }, event: { object: { name: { _eq: "Module" } } } }
        ) {
            aggregate {
                max {
                    amount
                }
            }
        }
    }`;

    try {
        const response = await fetch('https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            console.error("HTTP error:", response.status, await response.text());
            throw new Error('Unauthorized');
        }

        const data = await response.json();

        renderUserData(data);
    } catch (error) {
        console.error('Error:', error);
        if (error.message === 'Unauthorized') {
            logout();
        }
    }
}

function renderUserData(data) {
    const userInfo = data.data;
    if (!userInfo) {
        logout();
        return
    }
    const transactions = userInfo.user[0].transactions;
    const filtered = transactions.filter(tx => tx.amount >= 5000 || tx.amount < 0);
    let total = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    let up = userInfo.user[0].totalUp;
    let down = userInfo.user[0].totalDown;
    let sinup = "kB", sindwon = "kB", sin = "kB";

    if (up > 1000000) {
        up = (up / 1000000).toFixed(2);
        sinup = "MB";
    } else if (up > 1000) {
        up = (up / 1000).toFixed(2);
    }

    if (down > 1000000) {
        down = (down / 1000000).toFixed(2);
        sindwon = "MB";
    } else if (down > 1000) {
        down = (down / 1000).toFixed(2);
    }
    if (total > 1000000) {
        total = (total / 1000000).toFixed(2);
        sin = "MB";
    } else if (total > 1000) {
        total = (total / 1000).toFixed(2);
    }

    document.getElementById('user-details').innerHTML = `
        <p>Login: ${userInfo.user[0].login}</p>
        <p>Name: ${userInfo.user[0].firstName} ${userInfo.user[0].lastName}</p>
        <p>Total Up: ${up} ${sinup}</p>
        <p>Total Down: ${down} ${sindwon}</p>
        <p>Level: ${userInfo.lvl.aggregate.max.amount}</p>
        <p>XP: ${total} ${sin}</p>
    `;


    renderSkillsGraph(userInfo);
    progclear(userInfo.user[0]);
}

function renderSkillsGraph(userInfo) {
    const skills = [
        { name: "Go", color: "blue", value: userInfo.go.aggregate.max.amount ?? 0 },
        { name: "JS", color: "green", value: userInfo.js.aggregate.max.amount ?? 0 },
        { name: "HTML", color: "orange", value: userInfo.html.aggregate.max.amount ?? 0 },
        { name: "Prog", color: "purple", value: userInfo.prog.aggregate.max.amount ?? 0 },
        { name: "Front", color: "red", value: userInfo.front.aggregate.max.amount ?? 0 },
        { name: "Back", color: "gold", value: userInfo.back.aggregate.max.amount ?? 0 },
    ];

    const max = Math.max(...skills.map(s => s.value));
    const svgHeight = 300, svgWidth = 600, barWidth = 50, gap = 20;

    let bars = `
        <line x1="40" y1="10" x2="40" y2="${svgHeight - 20}" stroke="black" stroke-width="2" />
        <line x1="40" y1="${svgHeight - 20}" x2="${svgWidth}" y2="${svgHeight - 20}" stroke="black" stroke-width="2" />
    `;

    skills.forEach((skill, index) => {
        const heightPercent = skill.value / max;
        const barHeight = heightPercent * (svgHeight - 60);
        const x = 60 + index * (barWidth + gap);
        const y = svgHeight - 20 - barHeight;

        bars += `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${skill.color}" />
            <text x="${x + barWidth / 2}" y="${svgHeight - 5}" text-anchor="middle" font-size="12" fill="aliceblue" > ${skill.name}</text>
            <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="12"  fill="aliceblue">${skill.value}</text>
        `;
    });

    document.getElementById("xp-graph").innerHTML = bars;
}
function progclear(user) {
    if (!user || !user.transactions || !Array.isArray(user.transactions)) {
        console.error("User data is incorrect.");
        return;
    }

    const transactions = user.transactions;

    const filtered = transactions.filter(tx => tx.amount >= 5000 || tx.amount < 0);

    if (filtered.length === 0) {
        document.getElementById("audit-graph").innerHTML = `
            <div style="color: white; text-align: center; padding: 20px;">
                no data
            </div>
        `;
        return;
    }

    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    let xp = total;
    let xpFormatted;

    console.log(xp);
    if (xp >= 1000000) {
        xpFormatted = (xp / 1000000).toFixed(2) + " MB";
    } else if (xp >= 1000) {
        xpFormatted = (xp / 1000).toFixed(2) + " KB";
    } else {
        xpFormatted = xp.toFixed(2) + " B";
    }

    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4', '#8BC34A'];

    const width = 1000;
    const height = 400;
    const margin = { top: 50, right: 160, bottom: 60, left: 60 };
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    const amounts = filtered.map(tx => tx.amount);
    const maxAmount = Math.max(...amounts);
    const minAmount = Math.min(...amounts);
    const range = maxAmount - minAmount || 1;

    let points = "";
    filtered.forEach((tx, i) => {
        const x = margin.left + (i * graphWidth) / Math.max(filtered.length - 1, 1);
        const y = margin.top + graphHeight - ((tx.amount - minAmount) / range) * graphHeight;
        points += `${x},${y} `;
    });

    const svgLine = points.trim() ? `
        <polyline 
            fill="none" 
            stroke="#2196F3" 
            stroke-width="2" 
            points="${points.trim()}"
            stroke-linejoin="round"
            stroke-linecap="round" />
    ` : '';

    let circles = "";
    filtered.forEach((tx, i) => {
        const x = margin.left + (i * graphWidth) / Math.max(filtered.length - 1, 1);
        const y = margin.top + graphHeight - ((tx.amount - minAmount) / range) * graphHeight;
        const color = colors[i % colors.length];
        let XP = tx.amount;
        if (XP < 0) {


            console.log(Math.abs(tx.amount));
        }

        if (Math.abs(tx.amount) >= 1000000) {

            XP = (XP / 1000000).toFixed(0) + " MB";
        } else if (Math.abs(tx.amount) >= 1000) {
            XP = (XP / 1000).toFixed(0) + " KB";
        } else {
            XP = XP.toFixed(2) + " B";
        }
        circles += `
            <circle cx="${x}" cy="${y}" r="6" fill="${color}" stroke="white" stroke-width="2">
                <title>${tx.path ? tx.path.split('/').pop() : 'project' + (i + 1)}: ${XP}</title>
            </circle>
        `;
    });

    let legends = "";
    const legendX = width - 140;
    const legendY = 60;
    const maxLegendItems = 10;

    filtered.slice(0, maxLegendItems).forEach((tx, i) => {
        const color = colors[i % colors.length];
        const name = tx.path ? tx.path.split('/').pop() : `project ${i + 1}`;
        const percent = total > 0 ? ((Math.abs(tx.amount) / total) * 100).toFixed(1) : 0;
        legends += `
            <rect x="${legendX}" y="${legendY + i * 25}" width="12" height="12" fill="${color}" rx="2" />
            <text x="${legendX + 17}" y="${legendY + i * 25 + 10}" font-size="11" fill="#333">
                ${name.length > 15 ? name.substring(0, 15) + '...' : name} (${percent}%)
            </text>
        `;
    });

    if (filtered.length > maxLegendItems) {
        legends += `
            <text x="${legendX}" y="${legendY + maxLegendItems * 25 + 10}" font-size="10" fill="#666">
                and ${filtered.length - maxLegendItems} others ...
            </text>
        `;
    }

    let gridLines = "";
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
        const y = margin.top + (i * graphHeight) / gridCount;
        const value = maxAmount - (i * range) / gridCount;
        gridLines += `
            <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" 
                  stroke="#e0e0e0" stroke-width="0.5" stroke-dasharray="2,2" />
            <text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#666">
                ${value.toFixed(0).toLocaleString()}
            </text>
        `;
    }
    console.log(xpFormatted);

    const svgContent = `
        <svg width="${width}" height="${height}" style="background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <text x="${width / 3}" y="25" text-anchor="middle" font-size="18" font-weight="bold" fill="#63b4daff">
                total XP: ${xpFormatted}
            </text>
            
            ${gridLines}
            
            <line x1="${margin.left}" y1="${margin.top + graphHeight}" 
                  x2="${width - margin.right}" y2="${margin.top + graphHeight}" 
                  stroke="#333" stroke-width="2"/>
            <line x1="${margin.left}" y1="${margin.top}" 
                  x2="${margin.left}" y2="${margin.top + graphHeight}" 
                  stroke="#333" stroke-width="2"/>
            
            ${svgLine}
            
            ${circles}
            
            <g>
                <rect x="${legendX - 10}" y="${legendY - 20}" width="145" height="${Math.min(filtered.length, maxLegendItems) * 25 + 30}" 
                      fill="white" stroke="#ddd" rx="4" opacity="0.95"/>
                <text x="${legendX + 55}" y="${legendY - 5}" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">
                    Details
                </text>
                ${legends}
            </g>
            
            <text x="${width / 2}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#666">
                project
            </text>
            <text x="20" y="${height / 2}" text-anchor="middle" font-size="12" fill="#666" transform="rotate(-90 20 ${height / 2})">
                XP
            </text>
        </svg>
    `;

    const targetElement = document.getElementById("audit-graph");
    if (targetElement) {
        targetElement.innerHTML = svgContent;
    }
}


fetchData();
