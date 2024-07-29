import Router from "./router.js";

export default class Homepage extends HTMLElement {
    constructor() {
        super();
        this.Router = new Router()
    }

    connectedCallback() {
        this.renderHTML();
        const data = this.query();
        if (data) {
            this.createUserProfile(data.user);
            this.createXPEvolutionGraph(data.transaction_xp);
            this.createAuditGraph(data.user);
            this.createSkillsGraph(data.transaction_skills, "skillsGraph");
            this.logoutButtonListener();
        }
    }

    renderHTML() {
        this.innerHTML = `
            <div class="dashboard">
                <header class="dashboard-header">
                    <h1>User Dashboard</h1>
                    <button id="logoutBtn" class="btn btn-primary">Logout</button>
                </header>
                <div class="dashboard-grid">
                    <div class="dashboard-card" id="userProfile"></div>
                    <div class="dashboard-card" id="auditGraph"></div>
                    <div class="dashboard-card" id="xpEvolutionGraph"></div>
                    <div class="dashboard-card" id="skillsGraph"></div>
                </div>
            </div>
        `;
    }

    query = () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            console.log(userData);
            return userData;
        } else {
            console.log('No user data found');
            return null; // Ensure to handle this case in connectedCallback
        }
    };

    createUserProfile(userData) {
        const svg = d3.select('#userProfile')
            .append('svg')
            .attr('viewBox', '0 0 200 200') // Adjusted viewBox for smaller size
            .attr('preserveAspectRatio', 'xMidYMid meet');
    
        // Level circle
        const arc = d3.arc()
            .innerRadius(35) // Reduced inner radius
            .outerRadius(50) // Reduced outer radius
            .startAngle(0)
            .endAngle(2 * Math.PI * (userData[0].events[0].level / 60));
    
        svg.append('path')
            .attr('d', arc)
            .attr('transform', 'translate(100,100)')
            .attr('fill', '#3498db');
    
        // Level text
        svg.append('text')
            .attr('x', 100)
            .attr('y', 95) // Adjusted y position
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-size', '14px')
            .style('font-weight', 'bold')
            .text(userData[0].events[0].level);
    
        // "Level" text
        svg.append('text')
            .attr('x', 100)
            .attr('y', 115) // Adjusted y position
            .attr('text-anchor', 'middle')
            .style('font-size', '9px') // Reduced font size
            .text('Level');
    
        // User name
        svg.append('text')
            .attr('x', 100)
            .attr('y', 155) // Adjusted y position
            .attr('text-anchor', 'middle')
            .style('font-size', '9px') // Reduced font size
            .style('font-weight', 'bold')
            .text(`${userData[0].firstName} ${userData[0].lastName}`);
    
    }
    
    createXPEvolutionGraph(xpData) {
        const margin = {top: 30, right: 20, bottom: 30, left: 50};
        const width = 460 - margin.left - margin.right;
        const height = 280 - margin.top - margin.bottom;
    
        const svg = d3.select('#xpEvolutionGraph')
            .append('svg')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
    
        const x = d3.scaleTime()
            .range([0, width]);
    
        const y = d3.scaleLinear()
            .range([height, 0]);
    
        const line = d3.line()
            .x(d => x(new Date(d.createdAt)))
            .y(d => y(d.cumulativeXP / 1000000)); // Convert to Mo
    
        // Process data
        let cumulativeXP = 0;
        const processedData = xpData
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map(d => {
                cumulativeXP += d.amount;
                return {...d, cumulativeXP};
            });
    
        x.domain(d3.extent(processedData, d => new Date(d.createdAt)));
        y.domain([0, d3.max(processedData, d => d.cumulativeXP / 1000000)]); // Convert to Mo
    
        svg.append('path')
            .datum(processedData)
            .attr('fill', 'none')
            .attr('stroke', '#3498db')
            .attr('stroke-width', 2)
            .attr('d', line);
    
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5));
    
        svg.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + ' Mo')); // Add 'Mo' to y-axis labels
    
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -margin.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('XP Evolution (Mo)');
    }

    createAuditGraph(userData) {
        const width = 100;
        const height = 100;
        const radius = Math.min(width, height) / 3;
    
        const svg = d3.select('#auditGraph')
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);
    
        const color = d3.scaleOrdinal()
            .domain(['up', 'down'])
            .range(['#2ecc71', '#e74c3c']);
    
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null);
    
        const arc = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius/2);
    
        const data = [
            {name: 'up', value: userData[0].totalUp},
            {name: 'down', value: userData[0].totalDown}
        ];
    
        const arcs = svg.selectAll('arc')
            .data(pie(data))
            .enter()
            .append('g');
    
        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.name));
    
        const auditRatio = userData[0].totalUp / userData[0].totalDown;
    
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('font-size', '9px')
            .text(auditRatio.toFixed(1));
    
        svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('dy', '1.5em')
            .style('font-size', '4px')
            .text('Audit Ratio');
    
        svg.append('text')
            .attr('x', 0)
            .attr('y', -radius - 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '6px')
            .style('font-weight', 'bold')
            .text('Audit Performance');
    }

    createSkillsGraph(skillData, containerId) {
        // Process skill data
        const skillMap = new Map();
        skillData.forEach(item => {
            const skill = item.type.replace('skill_', '');
            const value = parseInt(item.amount, 10);
            if (!isNaN(value) && (!skillMap.has(skill) || value > skillMap.get(skill))) {
                skillMap.set(skill, value);
            }
        });

        const processedSkillData = Array.from(skillMap, ([skill, value]) => ({skill, value}));

        const margin = {top: 20, right: 20, bottom: 40, left: 40};
        const width = 500 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .range([height, 0]);

        x.domain(processedSkillData.map(d => d.skill));
        y.domain([0, d3.max(processedSkillData, d => d.value)]);

        svg.selectAll('.bar')
            .data(processedSkillData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.skill))
            .attr('width', x.bandwidth())
            .attr('y', d => y(d.value))
            .attr('height', d => height - y(d.value))
            .attr('fill', '#3498db');

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        svg.append('g')
            .call(d3.axisLeft(y));

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -margin.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .text('Skills Overview');
    }

    logoutButtonListener() {
        console.log("logout")
        const button = this.querySelector('#logoutBtn');
        if (button) {
            button.addEventListener('click', () => {
               localStorage.removeItem("jwt")
               localStorage.removeItem("userData")
               this.Router.route("", true)
            });
        }
    }

}
customElements.define('dashboard-page', Homepage);