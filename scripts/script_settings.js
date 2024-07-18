
let isDragging = false;

let menu;

function openSettings()
{
    if(document.querySelector('.settingsWindow'))
    {
        menu.remove();
        return;
    }
    let cancel = [];
    let body = document.querySelector('body');
    menu = document.createElement('div');
    let cancelContainer =document.createElement('div');
    let header = document.createElement('div');
    let repeatModeContainer = document.createElement('div');
    let repeatModeText = document.createElement('p');
    repeatModeText.textContent = "Repeat mode";
    repeatModeText.style.width = '10vh';
    repeatModeText.style.paddingRight = '2%';
    repeatModeContainer.classList.add('repeatModeContainer');
    repeatModeContainer.appendChild(repeatModeText);
    let repeatModeDropdown = createDropDown()
    repeatModeContainer.appendChild(repeatModeDropdown);
    cancel[0] = document.createElement('div');
    cancel[1] = document.createElement('div');
    header.classList.add('settingsWindowHeader');
    menu.classList.add('settingsWindow');
    cancel[0].classList.add('settingsClose');
    cancel[1].classList.add('settingsClose');
    cancel[1].style.transform = "translate(-50%, -50%) rotate(-45deg)";
    cancelContainer.classList.add('cancelContainer')
    cancelContainer.appendChild(cancel[0]);
    cancelContainer.appendChild(cancel[1]);
    menu.appendChild(header);
    menu.appendChild(cancelContainer);
    menu.appendChild(repeatModeContainer);
    body.appendChild(menu);

    cancelContainer.addEventListener('click', () =>
    {
        menu.remove();
    })
    header.addEventListener('mousedown', (event) =>
    {
        const rect = menu.getBoundingClientRect();
        startPosX = event.clientX;
        startPosY = event.clientY;
        offsetX = startPosX - rect.left;
        offsetY = startPosY - rect.top;
        isDragging = true;
        document.addEventListener('mousemove', handleMouseMove)
    })
    header.addEventListener('mouseup', () =>
    {
        document.removeEventListener('mousemove', handleMouseMove)
        isDragging = false;
    })

    repeatModeDropdown.addEventListener('change', () =>
    {
        repeatMode = repeatModeDropdown.value;
    })
}

let options = [];

function createDropDown()
{
    let menu = document.createElement('select')
    for(let i = 0; i < 4; i++)
    {
        options[i] = document.createElement('option');
        menu.appendChild(options[i]);
    }
    options[0].textContent = "None";
    options[1].textContent = "Album";
    options[2].textContent = "Artist";
    options[3].textContent = "Library";

    options[0].value = 'none';
    options[1].value = 'album';
    options[2].value = 'artist';
    options[3].value = 'library';

    menu.value = repeatMode;

    return menu;
}

let startPosX, startPosY;
let offsetX, offsetY;

function handleMouseMove(event)
{
    if(isDragging)
    {
        let posX = event.x;
        let posY = event.y;
        posX = ((((posX - offsetX) + (0.3*visualViewport.height)) / visualViewport.width) * 100) ;
        posY = ((posY - offsetY) / visualViewport.height) * 100;
        menu.style.left = "calc(" + posX + "vw - 30vh)";
        menu.style.top = posY + "vh";
    }
}


