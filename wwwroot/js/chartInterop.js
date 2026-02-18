window.chartInstances = window.chartInstances || {};

window.renderChart = (id, type, labels, data, colors) => {
    const canvas = document.getElementById(id);
    if (!canvas || typeof Chart === 'undefined') {
        return;
    }

    const ctx = canvas.getContext('2d');

    if (window.chartInstances[id]) {
        window.chartInstances[id].destroy();
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
