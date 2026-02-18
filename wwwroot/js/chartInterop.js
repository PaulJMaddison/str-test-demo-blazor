window.chartInstances = window.chartInstances || {};

function clearFallbackChart(id) {
    const canvas = document.getElementById(id);
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawBarChartFallback(ctx, canvas, labels, data, colors) {
    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 300;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 24, right: 20, bottom: 72, left: 44 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...data, 1);
    const barSlot = chartWidth / Math.max(labels.length, 1);
    const barWidth = Math.min(48, barSlot * 0.65);

    ctx.strokeStyle = '#cfd8e3';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i += 1) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }

    ctx.fillStyle = '#5a6b86';
    ctx.font = '12px Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= 4; i += 1) {
        const value = Math.round(maxValue * (1 - i / 4));
        const y = padding.top + (chartHeight / 4) * i + 4;
        ctx.fillText(value.toString(), padding.left - 8, y);
    }

    labels.forEach((label, index) => {
        const value = data[index] ?? 0;
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding.left + barSlot * index + (barSlot - barWidth) / 2;
        const y = padding.top + chartHeight - barHeight;

        ctx.fillStyle = colors[index % colors.length] || '#4472c4';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 6);
        ctx.fill();

        ctx.fillStyle = '#1f2a44';
        ctx.textAlign = 'center';
        ctx.font = '12px Segoe UI, Arial, sans-serif';
        ctx.fillText(value.toString(), x + barWidth / 2, y - 8);

        const shortLabel = label.length > 14 ? `${label.slice(0, 12)}…` : label;
        ctx.fillStyle = '#42536e';
        ctx.fillText(shortLabel, x + barWidth / 2, padding.top + chartHeight + 24);
    });
}

function drawDoughnutFallback(ctx, canvas, labels, data, colors) {
    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 300;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const total = Math.max(data.reduce((sum, value) => sum + value, 0), 1);
    const centerX = width * 0.36;
    const centerY = height * 0.5;
    const radius = Math.min(width, height) * 0.28;
    const innerRadius = radius * 0.58;

    let start = -Math.PI / 2;

    data.forEach((value, index) => {
        const angle = (value / total) * Math.PI * 2;
        const end = start + angle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length] || '#4472c4';
        ctx.fill();

        start = end;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#1f2a44';
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px Segoe UI, Arial, sans-serif';
    ctx.fillText(total.toString(), centerX, centerY + 8);

    const legendX = width * 0.62;
    const legendY = height * 0.28;
    ctx.textAlign = 'left';
    ctx.font = '12px Segoe UI, Arial, sans-serif';

    labels.forEach((label, index) => {
        const value = data[index] ?? 0;
        const percentage = Math.round((value / total) * 100);
        const y = legendY + index * 28;

        ctx.fillStyle = colors[index % colors.length] || '#4472c4';
        ctx.fillRect(legendX, y - 10, 12, 12);

        ctx.fillStyle = '#34445f';
        ctx.fillText(`${label}: ${value} (${percentage}%)`, legendX + 20, y);
    });
}

function renderFallbackChart(id, type, labels, data, colors) {
    const canvas = document.getElementById(id);
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    if (type === 'doughnut') {
        drawDoughnutFallback(ctx, canvas, labels, data, colors);
        return;
    }

    drawBarChartFallback(ctx, canvas, labels, data, colors);
}

window.renderChart = (id, type, labels, data, colors) => {
    const canvas = document.getElementById(id);
    if (!canvas) {
        return;
    }

    if (window.chartInstances[id]) {
        window.chartInstances[id].destroy();
        delete window.chartInstances[id];
    }

    if (typeof Chart === 'undefined') {
        clearFallbackChart(id);
        renderFallbackChart(id, type, labels, data, colors);
        window.chartInstances[id] = {
            data: {
                datasets: [{ data: [...data] }]
            },
            destroy: () => clearFallbackChart(id)
        };
        return;
    }

    const ctx = canvas.getContext('2d');

    window.chartInstances[id] = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: type === 'doughnut' ? 'Outcomes' : 'Value',
                data: data,
                backgroundColor: colors,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: type === 'bar' && id.toLowerCase().includes('workload') ? 'y' : 'x',
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    enabled: true
                }
            },
            animation: {
                duration: 800
            }
        }
    });
};
