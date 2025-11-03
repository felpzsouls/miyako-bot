document.getElementById('guildForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const autoRoleEnabled = document.getElementById('toggleAutorole')?.checked;
    const roleId = document.getElementById('autoroleRole').value;
    const response = await fetch('/api/update-guild-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            guildId: document.location.pathname.split('/')[2],
            autorole: {
                active: autoRoleEnabled,
                roleId: roleId
            }
        })
    });
    const result = await response.json();
    alert(result.message || 'Configurações salvas com sucesso!');
});
