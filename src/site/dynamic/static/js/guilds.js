let choices;

document.addEventListener('DOMContentLoaded', function () {
  const selectElement = document.getElementById('blockedChannels');

  if (selectElement) {
    choices = new Choices(selectElement, {
      removeItemButton: true,
      searchEnabled: true,
      placeholder: true,
      placeholderValue: 'Selecione os canais',
      searchPlaceholderValue: 'Buscar canal...',
      classNames: {
        containerInner: 'choices__inner',
        listDropdown: 'choices__list--dropdown',
        item: 'choices__item',
        input: 'choices__input'
      }
    });
  }

  document.getElementById('guildForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const prefix = document.getElementById('prefix').value;
    const restricted = document.getElementById('toggleMessage')?.checked;
    const messageRestr = document.getElementById('messageRestricted').value;

    const selectedChannels = choices?.getValue(true) || [];


    const response = await fetch('/api/update-guild-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guildId: document.location.pathname.split('/')[2],
        prefix,
        restricted,
        messageRestr,
        blockedChannels: selectedChannels
      })
    });

    const result = await response.json();
    alert(result.message || 'Alterações salvas com sucesso!');
  });
});


document.getElementById('testWelcomeMessage')?.addEventListener('click', async () => {
  const response = await fetch('/api/test-welcome-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      guildId: document.location.pathname.split('/')[2],
    })
  });
  
  const result = await response.json();
  alert(result.message || 'Mensagem de boas-vindas enviada com sucesso!');
});