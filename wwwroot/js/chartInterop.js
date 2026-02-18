window.chartInstances = window.chartInstances || {};

const normalizeNumberArray = (values) => (Array.isArray(values) ? values.map((value) => Number(value) || 0) : []);

const clearCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return null;
    }

    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width || canvas.parentElement?.clientWidth || 320));
    const height = Math.max(220, Math.floor(rect.height || canvas.parentElement?.clientHeight || 220));

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    return { ctx, width, height };
};

const drawFallbackBar = (ctx, width, height, labels, data, colors) => {
    const padding = { top: 20, right: 18, bottom: 56, left: 42 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const maxValue = Math.max(...data, 1);
    const slot = chartWidth / Math.max(labels.length, 1);
    const barWidth = Math.min(48, slot * 0.65);

    labels.forEach((label, index) => {
        const value = data[index] ?? 0;
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding.left + slot * index + (slot - barWidth) / 2;
        const y = padding.top + chartHeight - barHeight;

        ctx.fillStyle = colors[index % colors.length] || '#3f6ed4';
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#2f3e58';
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(value), x + (barWidth / 2), y - 6);

        const shortLabel = label.length > 14 ? `${label.slice(0, 12)}…` : label;
        ctx.fillText(shortLabel, x + (barWidth / 2), padding.top + chartHeight + 20);
    });
};

const drawFallbackDoughnut = (ctx, width, height, labels, data, colors) => {
    const total = Math.max(data.reduce((sum, value) => sum + value, 0), 1);
    const centerX = width * 0.35;
    const centerY = height * 0.5;
    const radius = Math.min(width, height) * 0.25;
    const innerRadius = radius * 0.58;

    let startAngle = -Math.PI / 2;
    data.forEach((value, index) => {
        const endAngle = startAngle + ((value / total) * Math.PI * 2);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length] || '#3f6ed4';
        ctx.fill();

        startAngle = endAngle;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const legendX = width * 0.58;
    labels.forEach((label, index) => {
        const y = height * 0.25 + index * 24;
        const value = data[index] ?? 0;
        const percentage = Math.round((value / total) * 100);

        ctx.fillStyle = colors[index % colors.length] || '#3f6ed4';
        ctx.fillRect(legendX, y - 10, 12, 12);

        ctx.fillStyle = '#2f3e58';
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${label}: ${value} (${percentage}%)`, legendX + 18, y);
    });
};

const renderFallbackChart = (canvas, type, labels, data, colors) => {
    const surface = clearCanvas(canvas);
    if (!surface) {
        return;
    }

    const { ctx, width, height } = surface;

    if (type === 'doughnut') {
        drawFallbackDoughnut(ctx, width, height, labels, data, colors);
        return;
    }

    drawFallbackBar(ctx, width, height, labels, data, colors);
};

window.renderChart = (id, type, labels, data, colors) => {
    const canvas = document.getElementById(id);
    if (!canvas) {
        return;
    }

    if (window.chartInstances[id]) {
        window.chartInstances[id].destroy();
        delete window.chartInstances[id];
    }

    const numericData = normalizeNumberArray(data);

    if (typeof Chart === 'undefined') {
        renderFallbackChart(canvas, type, labels, numericData, colors);
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    window.chartInstances[id] = new Chart(ctx, {
        type,
        data: {
            labels,
            datasets: [{
                label: type === 'doughnut' ? 'Outcomes' : 'Value',
                data: numericData,
                backgroundColor: colors,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: type === 'bar' && id.toLowerCase().includes('workload') ? 'y' : 'x',
            plugins: {
                legend: { position: 'bottom' }
            },
            animation: { duration: 500 }
        }
    });
};
