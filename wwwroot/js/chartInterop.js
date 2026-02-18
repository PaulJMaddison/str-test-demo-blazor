window.chartInstances = window.chartInstances || {};

const toRgba = (hex, alpha) => {
    if (typeof hex !== 'string') {
        return `rgba(68,114,196,${alpha})`;
    }

    const value = hex.replace('#', '').trim();
    const normalized = value.length === 3
        ? value.split('').map((char) => char + char).join('')
        : value.padEnd(6, '0').slice(0, 6);

    const red = parseInt(normalized.slice(0, 2), 16);
    const green = parseInt(normalized.slice(2, 4), 16);
    const blue = parseInt(normalized.slice(4, 6), 16);

    if ([red, green, blue].some(Number.isNaN)) {
        return `rgba(68,114,196,${alpha})`;
    }

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

const drawBarFallback = (ctx, canvas, labels, data, colors, horizontal) => {
    const width = canvas.width;
    const height = canvas.height;
    const padding = 26;
    const labelSpace = horizontal ? 110 : 28;
    const chartWidth = width - padding * 2 - (horizontal ? labelSpace : 0);
    const chartHeight = height - padding * 2 - (!horizontal ? labelSpace : 0);
    const maxValue = Math.max(...data, 1);

    ctx.strokeStyle = '#d5deed';
    ctx.lineWidth = 1;

    if (horizontal) {
        const rowHeight = chartHeight / Math.max(labels.length, 1);

        labels.forEach((label, index) => {
            const value = Number(data[index] ?? 0);
            const barLength = (value / maxValue) * chartWidth;
            const y = padding + index * rowHeight + rowHeight * 0.2;
            const h = rowHeight * 0.6;

            ctx.fillStyle = '#eef2f9';
            ctx.fillRect(padding + labelSpace, y, chartWidth, h);

            ctx.fillStyle = colors[index % colors.length] || '#4472c4';
            ctx.fillRect(padding + labelSpace, y, barLength, h);

            ctx.fillStyle = '#223047';
            ctx.font = '12px Segoe UI, sans-serif';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillText(label, padding, y + h / 2);
            ctx.textAlign = 'right';
            ctx.fillText(String(value), width - padding, y + h / 2);
        });
    } else {
        const slot = chartWidth / Math.max(labels.length, 1);

        labels.forEach((label, index) => {
            const value = Number(data[index] ?? 0);
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * slot + slot * 0.14;
            const y = padding + (chartHeight - barHeight);
            const w = slot * 0.72;

            ctx.fillStyle = '#eef2f9';
            ctx.fillRect(x, padding, w, chartHeight);

            ctx.fillStyle = colors[index % colors.length] || '#4472c4';
            ctx.fillRect(x, y, w, barHeight);

            ctx.fillStyle = '#223047';
            ctx.font = '11px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(label, x + w / 2, height - padding - 18);
            ctx.textBaseline = 'bottom';
            ctx.fillText(String(value), x + w / 2, y - 4);
        });
    }
};

const drawDoughnutFallback = (ctx, canvas, labels, data, colors) => {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = Math.min(width * 0.35, width - 100);
    const centerY = height * 0.48;
    const radius = Math.min(width, height) * 0.22;
    const hole = radius * 0.55;
    const total = Math.max(data.reduce((sum, value) => sum + Number(value || 0), 0), 1);

    let angle = -Math.PI / 2;

    data.forEach((rawValue, index) => {
        const value = Number(rawValue ?? 0);
        const slice = (value / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + slice);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length] || '#4472c4';
        ctx.fill();

        angle += slice;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, hole, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#223047';
    ctx.font = '600 13px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Total ${Math.round(total)}`, centerX, centerY);

    const legendX = width * 0.58;
    const itemHeight = 22;

    labels.forEach((label, index) => {
        const y = height * 0.2 + index * itemHeight;
        const value = Number(data[index] ?? 0);
        const percentage = Math.round((value / total) * 100);

        ctx.fillStyle = colors[index % colors.length] || '#4472c4';
        ctx.fillRect(legendX, y, 12, 12);

        ctx.fillStyle = '#223047';
        ctx.font = '12px Segoe UI, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${label}: ${value} (${percentage}%)`, legendX + 18, y - 1);
    });
};

const drawFallbackChart = (canvas, type, labels, data, colors, id) => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width || canvas.parentElement?.clientWidth || 320));
    const height = Math.max(220, Math.floor(rect.height || canvas.parentElement?.clientHeight || 220));

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (type === 'doughnut') {
        drawDoughnutFallback(ctx, canvas, labels, data, colors);
        return;
    }

    const isHorizontalBar = type === 'bar' && String(id).toLowerCase().includes('workload');
    drawBarFallback(ctx, canvas, labels, data, colors, isHorizontalBar);

    if (typeof Chart === 'undefined') {
        ctx.fillStyle = toRgba('#223047', 0.65);
        ctx.font = '11px Segoe UI, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('Fallback chart view', width - 10, height - 8);
    }
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

    if (typeof Chart === 'undefined') {
        drawFallbackChart(canvas, type, labels, data, colors, id);
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return;
    }

    window.chartInstances[id] = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
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
