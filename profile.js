const username = "your_username";
const password = "your_password";
const credentials = btoa(`${username}:${password}`);

async function fetchData() {
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

    
    document.getElementById('user-details').innerHTML = `
        <p>Login: ${userInfo.user[0].login}</p>
        <p>Name: ${userInfo.user[0].firstName} ${userInfo.user[0].lastName}</p>
        <p>Total Up: ${userInfo.user[0].totalUp}</p>
        <p>Total Down: ${userInfo.user[0].totalDown}</p>
        <p>Level: ${userInfo.lvl.aggregate.max.amount}</p>
    `;

  
    renderSkillsGraph(userInfo);
    progclear(userInfo.user[0])

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
    const svgHeight = 300;
    const svgWidth = 600;
    const barWidth = 50;
    const gap = 20;

    let bars = `
        <!-- Axes -->
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
            <text x="${x + barWidth / 2}" y="${svgHeight - 5}" text-anchor="middle" font-size="12">${skill.name}</text>
            <text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="12">${skill.value}</text>
        `;
    });

    document.getElementById("xp-graph").innerHTML = bars;
}
function progclear(userInfo) {
    const transactions = userInfo.transactions;

    
    const filtered = transactions.filter(tx => tx.amount >= 5000);

    const maxXP = Math.max(...filtered.map(tx => tx.amount)); 
    const svgHeight = 300;
    const barWidth = 50;
    const spacing = 20;

    let bars = '';
    
    filtered.forEach((tx, i) => {
        const barHeight = (tx.amount / maxXP) * svgHeight;
        const x = i * (barWidth + spacing) + 50;
        const y = svgHeight - barHeight;

        bars += `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="#4CAF50" />
            <text x="${x + barWidth / 2}" y="${svgHeight + 15}" font-size="12" text-anchor="middle">${tx.path.split('/').pop()}</text>
            <text x="${x + barWidth / 2}" y="${y - 5}" font-size="12" text-anchor="middle">${tx.amount}</text>
        `;
    });

    const svgContent = `
        <line x1="40" y1="0" x2="40" y2="${svgHeight}" stroke="black" />
        <line x1="40" y1="${svgHeight}" x2="800" y2="${svgHeight}" stroke="black" />
        ${bars}
    `;

    document.getElementById("audit-graph").innerHTML = svgContent;
}





fetchData();
