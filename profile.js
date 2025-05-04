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
    let up = userInfo.user[0].totalUp;
    let down = userInfo.user[0].totalDown;
    let sinup = "kB";
    let sindwon = "kB";

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

    document.getElementById('user-details').innerHTML = `
        <p>Login: ${userInfo.user[0].login}</p>
        <p>Name: ${userInfo.user[0].firstName} ${userInfo.user[0].lastName}</p>
        <p>Total Up: ${up} ${sinup}</p>
        <p>Total Down: ${down} ${sindwon}</p>
        <p>Level: ${userInfo.lvl.aggregate.max.amount}</p>
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

    const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
    let xp=total
    const radius = 100;
    const centerX = 150;
    const centerY = 150;
    const circumference = 2 * Math.PI * radius;


    if (xp>1000000){
        xp=(xp/1000000).toFixed(2)+"MB"
    }else if (xp>1000){
        xp=(xp/1000).toFixed(2)
        
        +"KB"
    }

    let svgCircles = '';
    let offset = 0;
    let colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#00BCD4', '#8BC34A'];

    filtered.forEach((tx, i) => {
        const percent = tx.amount / total;
        const dash = percent * circumference;
        const color = colors[i % colors.length];

        svgCircles += `
            <circle 
                r="${radius}" 
                cx="${centerX}" 
                cy="${centerY}" 
                fill="transparent" 
                stroke="${color}" 
                stroke-width="30"
                stroke-dasharray="${dash} ${circumference - dash}" 
                stroke-dashoffset="${-offset}"
            />
        `;
        offset += dash;
    });

    // Legends
    let legends = '';
    filtered.forEach((tx, i) => {
        const color = colors[i % colors.length];
        const name = tx.path.split('/').pop();
        const percent = ((tx.amount / total) * 100).toFixed(1);
        legends += `
            <rect x="320" y="${30 + i * 25}" width="15" height="15" fill="${color}" />
            <text x="340" y="${42 + i * 25}" font-size="13">${name} (${percent}%)</text>
        `;
    });

    const svgContent = `
        <svg width="600" height="350">
            ${svgCircles}
            ${legends}
            <circle r="${radius}" cx="${centerX}" cy="${centerY}" fill="white"/>
            <text x="${centerX}" y="${centerY}" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="bold">XP % ${xp}</text>
        </svg>
    `;

    document.getElementById("audit-graph").innerHTML = svgContent;
}





fetchData();
