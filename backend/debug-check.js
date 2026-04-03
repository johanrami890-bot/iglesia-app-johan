const API_URL = 'http://localhost:5000/api';

async function checkDebug() {
    try {
        console.log('Consultando API Debug...');
        const res = await fetch(`${API_URL}/debug/tables`);
        const data = await res.json();
        console.log('--- TABLAS VISIBLES POR BACKEND ---');
        console.log(data);

        const countRes = await fetch(`${API_URL}/debug/check-asignaciones`);
        if (countRes.ok) {
            console.log('Count asignaciones:', await countRes.json());
        } else {
            console.log('Error check asignaciones:', await countRes.json());
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

checkDebug();
