// salvar configurações de boas-vindas e despedidas

document.getElementById('guildForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const welcomeActive = document.getElementById('toggleWelcome')?.checked;
    const welcomeChannel = document.getElementById('welcomeChannel')?.value;
    const welcomeMessage = document.getElementById('welcomeMessage')?.value;
    const goodbyeActive = document.getElementById('toggleGoodbye')?.checked;
    const goodbyeChannel = document.getElementById('goodbyeChannel')?.value;
    const goodbyeMessage = document.getElementById('goodbyeMessage')?.value;

    const response = await fetch('/api/update-guild-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            guildId: document.location.pathname.split('/')[2],
            welcome: {
                active: welcomeActive,
                channel: welcomeChannel,
                message: welcomeMessage
            },
            goodbye: {
                active: goodbyeActive,
                channel: goodbyeChannel,
                message: goodbyeMessage
            }
        })
    });
    const result = await response.json();
    alert(result.message || 'Configurações salvas com sucesso!');
});