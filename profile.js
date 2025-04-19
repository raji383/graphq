// Check authentication
if (!localStorage.getItem('jwt')) {
    window.location.href = 'index.html';
}

async function fetchGraphQLData(query) {
    const response = await fetch('https://learn.zone01oujda.ma/api/gra.phql-engine/v1/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
        throw new Error('GraphQL query failed');
    }
    return response.json();
}

async function loadUserData() {
    const query = `{
        user {
            login
            transactions(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
                amount
                createdAt
                path
            }
            progress(order_by: {createdAt: asc}) {
                grade
                path
                createdAt
            }
        }
    }`;

    try {
        const data = await fetchGraphQLData(query);
        const userData = data.data.user[0];
        displayUserInfo(userData);
        createXPGraph(userData.transactions);
        createAuditGraph(userData.progress);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function displayUserInfo(userData) {
    const totalXP = userData.transactions.reduce((sum, t) => sum + t.amount, 0);
    const userDetails = document.getElementById('user-details');
    userDetails.innerHTML = `
        <p><strong>Login:</strong> ${userData.login}</p>
        <p><strong>Total XP:</strong> ${totalXP}</p>
    `;
}

function createXPGraph(transactions) {
    const svg = document.getElementById('xp-graph');
    const width = svg.width.baseVal.value;
    const height = svg.height.baseVal.value;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };

    const cumulativeXP = transactions.reduce((acc, t) => {
        const last = acc[acc.length - 1] || { total: 0 };
        acc.push({
            date: new Date(t.createdAt),
            total: last.total + t.amount
        });
        return acc;
    }, []);

    const xScale = (date) => {
        const min = cumulativeXP[0].date;
        const max = cumulativeXP[cumulativeXP.length - 1].date;
        return margin.left + ((date - min) / (max - min)) * (width - margin.left - margin.right);
    };

    const yScale = (value) => {
        const max = cumulativeXP[cumulativeXP.length - 1].total;
        return height - margin.bottom - (value / max) * (height - margin.top - margin.bottom);
    };

    // Create path
    const pathData = cumulativeXP.map((point, i) => 
        (i === 0 ? 'M' : 'L') + xScale(point.date) + ',' + yScale(point.total)
    ).join(' ');

    svg.innerHTML = `
        <path d="${pathData}" stroke="blue" fill="none" />
        <g class="axis x-axis"></g>
        <g class="axis y-axis"></g>
    `;
}

function createAuditGraph(progress) {
    const svg = document.getElementById('audit-graph');
    const width = svg.width.baseVal.value;
    const height = svg.height.baseVal.value;
    const radius = Math.min(width, height) / 2 - 20;

    const passed = progress.filter(p => p.grade > 0).length;
    const failed = progress.filter(p => p.grade === 0).length;
    const total = passed + failed;

    const createSlice = (startAngle, endAngle, color) => {
        const start = {
            x: width/2 + radius * Math.cos(startAngle),
            y: height/2 + radius * Math.sin(startAngle)
        };
        const end = {
            x: width/2 + radius * Math.cos(endAngle),
            y: height/2 + radius * Math.sin(endAngle)
        };
        const largeArc = (endAngle - startAngle > Math.PI) ? 1 : 0;
        
        return `M ${width/2} ${height/2}
                L ${start.x} ${start.y}
                A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}
                Z`;
    };

    const passedAngle = (passed / total) * Math.PI * 2;
    
    svg.innerHTML = `
        <path d="${createSlice(0, passedAngle, '#4CAF50')}" fill="#4CAF50" />
        <path d="${createSlice(passedAngle, Math.PI * 2, '#F44336')}" fill="#F44336" />
        <text x="${width/2}" y="${height/2 - 20}" text-anchor="middle">Pass Rate</text>
        <text x="${width/2}" y="${height/2 + 20}" text-anchor="middle">${Math.round(passed/total * 100)}%</text>
    `;
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadUserData);