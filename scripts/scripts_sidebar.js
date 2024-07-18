
let sidebar;

let sidebarExpanded = false;
let hoverItem = null;

const widthMenu = "25vh";
const widthMenuInt = 25;

let lastSong;
let song = [];
let currentSource = 0;
let nextSong;
let immediateTransition = false;
let preloadTimeout
let nextSongTimeout;
let changeRecord;

//Options: 'album', 'artist', 'library' and 'none'
let repeatMode = 'album';

let footer;
let progressBar;

document.addEventListener('DOMContentLoaded', function() {

    sidebar = document.getElementById('sidebar')

    footer = document.getElementById('footer');

    progressBar = document.getElementById('audioProgress');

    sidebar.style.width = '7vh';

    footer.style.width = 'calc(100vw - 7vh)';

    function createMainMenu()
    {
        createMenu('items_main');
        showSubMenu(items, document.getElementById('items_main'));
        for(let i = 0; i < 2; i++)
        {
            if(!document.getElementById('audioPlayer' + i))
            {
                song[i] = document.createElement('audio');
                song[i].id = 'audioPlayer' + i;
                song[i].preload = 'auto';
            }
            else
            {
                song[i] = document.getElementById('audioPlayer' + i)
            }

        }

    }
    createMainMenu();

    sidebar.addEventListener('mouseleave', (event) => {
        let target = event.target;
        for (let i = 0; i < 5 && !target.classList.contains('sidebar'); i++)
        {
            target = target.parentElement;
        }
        collapseSidebar();
    });
});

function getNextSong()
{
    let nextSong;
    changeRecord = false;
    lastSong = song[currentSource].src;
    immediateTransition = true;
    switch(repeatMode)
    {
        case 'album':
            nextSong = getNextSongAlbum();
            changeRecord = false;
            return nextSong;
        case 'artist':
            nextSong = getNextSongArtist();
            return nextSong;
        case 'library':
            nextSong = getNextSongLibrary();
            return nextSong;
        case 'none':

    }
}

function getItem(data, path)
{
    let item = data;
    let newestItem;
    path.forEach(index => {
        if(item)
        {
            item = item[index]
            newestItem = item;
            if(!item)
            {
                return null;
            }
            if(item.children)
            {
                item = item.children;
            }
        }

    })
    return newestItem;
}

function getNextSongGeneric(incrementSteps)
{
    let songSource = song[currentSource].src;
    let songItem = findItemFromSong(songSource, items);
    let itemPath = findIndexPath(songItem, items);
    let lastEntry = itemPath.indexPath.length - 1;

    for (let step = 0; step < incrementSteps.length; step++)
    {
        itemPath.indexPath[lastEntry - step] += incrementSteps[step];
        let nextSong = getItem(items, itemPath.indexPath);
        if (nextSong)
        {
            return nextSong;
        }
        itemPath.indexPath[lastEntry - step] = 0;
        immediateTransition = false;
        changeRecord = true;
    }

    return getItem(items, itemPath.indexPath);
}

function getNextSongAlbum()
{
    return getNextSongGeneric([1]);
}

function getNextSongArtist()
{
    return getNextSongGeneric([1, 1]);
}

function getNextSongLibrary()
{
    return getNextSongGeneric([1, 1, 1]);
}

function expandSidebar()
{
    let children = Array.from(sidebar.querySelectorAll('li'));

    children.forEach(item => {
        item.style.transition = "width 0.1s ease-in-out";
        item.style.width = widthMenu;
    });

    if(parseInt(sidebar.style.width, 10) < 25)
    {
        sidebar.style.width = widthMenu;
    }
    sidebar.style.transition = "width 0.1s ease-in-out";
    sidebar.addEventListener("transitionend", () => {
        sidebarExpanded = true;
    });
    footer.style.width = 'calc(100vw - ' + sidebar.style.width + ")";
}

function collapseSidebar()
{
    for(let i = 0; (i < 20) && document.getElementById("sub-menu_" + (i + 1)); i++)
    {
        hideSubMenu(i);
    }
    let children = Array.from(sidebar.querySelectorAll('li'));

    children.forEach(item => {
        item.style.width = '7vh';
        footer.style.width = 'calc(100vw - 7vh)';
        footer.style.width = '93vh'
        const container = item.querySelector('.container_sidebar');
        if(container)
        {
            container.classList.remove('selected');
        }
    });
    sidebar.style.width = '7vh';
    footer.style.width = 'calc(100vw - 7vh)';

    sidebar.addEventListener("transitionend", () => {
        sidebarExpanded = false;
    });
}

function hideSubMenu(menuNr)
{
    let id = "sub-menu_" + (menuNr + 1);
    for(let i = 0; i < 5 && document.getElementById(id); i++)
    {
        document.getElementById("sub-menu_" + (menuNr + i + 1)).remove();
    }
}

function createMenuItem(item)
{
    const li = document.createElement('li');
    let textDuration;
    let hasDuration = false;
    li.id = item.id;
    li.classList.add('item');

    const div = document.createElement('div');
    div.classList.add('container_sidebar');

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('imageWrapper');
    const img = document.createElement('img');
    img.src = item.icon;
    let imgSRC = getImageFromObject(item);

    if(findIndexPath(item, items).depth === 0)
    {
        div.style.padding = '1.9vh 0 1.9vh 0.9vh';
    }
    else
    {
        div.style.padding = '0.9vh 0 1.9vh 0.9vh';
        textDuration = document.createElement('p');
        textDuration.classList.add('textDuration');
        if(item.albumLength)
        {
            hasDuration = true;
            textDuration.textContent = makeStringFromTime(item.albumLength);
        }
        else if(item.playSong)
        {
            hasDuration = true;

            textDuration.textContent = getLengthOfSongString(item);
        }
    }

    if(imgSRC)
    {
        if(imgSRC.icon)
        {
            img.src = imgSRC.icon;
        }
    }
    img.classList.add('icon');
    img.alt = `Icon for ${item.text}`;

    const span = document.createElement('span');
    span.classList.add('text_main');
    span.textContent = item.text;

    if(item.id === 'settings')
    {
        li.classList.add('settings');
        li.addEventListener('click', openSettings);
    }

    imageWrapper.appendChild(img);
    if(hasDuration)
    {
        imageWrapper.appendChild(textDuration);
    }
    div.appendChild(imageWrapper);
    div.appendChild(span);
    li.appendChild(div);

    li.addEventListener('mouseover', function()
    {
        hoverItem = item;
        if (sidebarExpanded || (findIndexPath(item, items).depth === 0 ))
        {
            if(item.children)
            {
                let ul = document.getElementById("sub-menu_" + (findIndexPath(item, items).depth + 1));
                if (!ul)
                {
                    ul = createMenu("sub-menu_" + (findIndexPath(item, items).depth + 1));
                    if(item.children[0].class === 'song')
                    {
                        ul.classList.add('song_menu');
                        ul.classList.remove('sub_menu');
                    }
                }
                sidebar.style.width = (25 * (findIndexPath(item, items).depth + 2)) + "vh";
                showSubMenu(item.children, ul);
            }
            else
            {
                sidebar.style.width = (widthMenuInt*(findIndexPath(item, items).depth + 1)) + "vh";
            }
            footer.style.width = 'calc(100vw - ' + sidebar.style.width + ")";
            div.classList.add('selected');
        }
        let songSource = song[currentSource].src;
        if(songSource)
        {
            removePlayOverlay();
            addPlayOverlay(songSource);
        }
    });
    if(item.playSong)
    {
        li.addEventListener('click', function()
        {
            playSong(item);
        })
    }
    else if(item.id !== 'settings')
    {
        li.addEventListener('click', function()
        {
            let playItem = item;
            for(let i = 0; (i < 5) && playItem.children; i++)
            {
                playItem = cycleLowerIndex(playItem);
            }
            playSong(playItem);
        })
    }

    li.addEventListener('mouseleave', function(event)
    {
        let target = event.relatedTarget;
        let collapseMenu = false;
        let item_li = target;
        for(let i = 0; (i < 5) && item_li && !item_li.classList.contains('items') && (item_li.tagName !== 'BODY'); i++)
        {
            item_li = item_li.parentElement;
        }
        if(!item_li)
        {
            collapseMenu = true;
        }

        else if((getNumberFromId(item_li.id) < getNumberFromId(item.id) )|| item_li.id.includes('items_main') || !target)
        {
            collapseMenu = true;
        }
        else if(!item.children)
        {
            collapseMenu = true;
        }
        else
        {
            let targetItem = findItemById(target.id, items)
            if(targetItem && !targetItem.children)
            {
                collapseMenu = true;
            }
        }
        if(collapseMenu)
        {
            let targetElement = document.getElementById('sub-menu_' + (findIndexPath(item, items).depth + 1));
            if (targetElement)
            {
                targetElement.collapseSubMenu();
            }
        }
        for(let i = 0; (i < 5) && target && !target.classList.contains('items') && (target.tagName !== 'BODY'); i++)
        {
            target = target.parentElement;
        }
        if(!target)
        {
            return;
        }
        if(!target.classList.contains('items'))
        {
            return;
        }
        if(findIndexPath(item, items).depth === 0)
        {
            if(!target.id.includes("sub-menu_"))
            {
                hoverItem = null;
                div.classList.remove('selected');
            }
        }
        else
        {
            if(target.id === "items_main")
            {
                hoverItem = null;
                div.classList.remove('selected');
            }
            else if(getNumberFromId(target.id) <= findIndexPath(item, items).depth)
            {
                hoverItem = null;
                div.classList.remove('selected');
            }
        }
    });

    return li;
}

function makeStringFromTime(time)
{
    let durationSeconds = Math.floor(time);
    let durationMinutes = Math.floor(durationSeconds / 60);
    let durationHours = Math.floor(durationMinutes / 60);
    durationSeconds -= durationMinutes * 60;
    durationMinutes -= durationHours*60;
    if(durationHours)
    {
        return durationHours.toString() + ":" + durationMinutes.toString().padStart(2, '0') + ":" + durationSeconds.toString().padStart(2, '0');
    }
    else
    {
        return durationMinutes.toString() + ":" + durationSeconds.toString().padStart(2, '0');
    }
}

function createMenu(id)
{
    let ul = document.createElement('ul');
    ul.style.width = widthMenu;
    ul.classList.add('items');
    if(id!=='items_main')
    {
        ul.classList.add('sub_menu');
    }
    ul.id = id;
    sidebar.appendChild(ul);
    ul.addEventListener('mouseenter', (event) =>{
        let children = Array.from(ul.getElementsByClassName('selected'));
        let target = document.elementFromPoint(event.clientX, event.clientY);
        for(let i = 0; (i < 5) && target && !target.classList.contains('container_sidebar'); i++)
        {
            if(target.parentElement)
            {
                target = target.parentElement;
            }
        }
        if(!target.classList.contains('container_sidebar'))
        {
            if(document.getElementById("sub-menu_" + (getNumberFromId(id) + 1)))
            {
                let sub_menu = document.getElementById("sub-menu_" + (getNumberFromId(id) + 1));
                sub_menu.collapseSubMenu();
            }
        }
        children.forEach(item => {
            if(item !== target)
            {
                item.classList.remove('selected');
            }
        })
        let songSource = song[currentSource].src;
        if(songSource)
        {
            removePlayOverlay();
            addPlayOverlay(songSource);
        }
    })
    ul.addEventListener('mouseleave', (event) =>{
        let target = document.elementFromPoint(event.clientX, event.clientY);
        for(let i = 0; (i < 5) && target && !target.classList.contains('items'); i++)
        {
            target = target.parentElement;
        }
        if(!target)
        {
            target = null;
        }
        else if(!target.classList.contains('items'))
        {
            target = null;
        }
        const idNumber = getNumberFromId(id);
        if(!target)
        {
            if(document.getElementById("sub-menu_1"))
            {
                document.getElementById("sub-menu_1").collapseSubMenu();
            }
            else
            {
                collapseSidebar()
            }
        }
        else if(idNumber > getNumberFromId(target.id))
        {
            if(document.getElementById("sub-menu_" + (idNumber + 1)))
            {
                document.getElementById("sub-menu_" + (idNumber + 1)).collapseSubMenu();
            }
        }
    })

    ul.collapseSubMenu = function()
    {
        let idSubMenu = "sub-menu_" + (getNumberFromId(id) + 1);
        if(document.getElementById(idSubMenu))
        {
            if(document.getElementById(idSubMenu).innerHTML !== '')
            {
                let sub_menu = document.getElementById("sub-menu_" + (getNumberFromId(id) + 1));
                sub_menu.collapseSubMenu();
            }
        }
        sidebar.style.width = (widthMenuInt*getNumberFromId(id)) + "vh";
        if((widthMenuInt*getNumberFromId(id)) === 250)
        {
            collapseSidebar();
        }

        footer.style.width = 'calc(100vw - ' + sidebar.style.width + ")";

        ul.remove();
    }
    return ul;
}

function showSubMenu(children, subMenu)
{
    populateSubMenu(children, subMenu);
    //const rect = parentItem.getBoundingClientRect();
    subMenu.style.left = widthMenu;
    subMenu.classList.add('visible');
}

function populateSubMenu(items, subMenu)
{
    subMenu.innerHTML = '';

    items.forEach(item => {
        const li = createMenuItem(item);
        subMenu.appendChild(li);
        if(subMenu.id !== "items_main")
        {
            li.style.width = widthMenu;
        }
    });
}

function findIndexPath(item, items, currentPath = [], currentDepth = 0)
{

    for (let i = 0; i < items.length; i++)
    {
        const parent = items[i];
        const newPath = [...currentPath, i];

        if (parent.id === item.id)
        {
            return { indexPath: newPath, depth: currentDepth };
        }
        if (parent.children)
        {
            const result = findIndexPath(item, parent.children, newPath, currentDepth + 1);
            if (result)
            {
                return result;
            }
        }
    }
    return null;
}

function findItemById(id, items)
{
    for (let item of items)
    {
        if (item.id === id)
        {
            return item;
        }
        if (item.children)
        {
            const result = findItemById(id, item.children);
            if (result)
            {
                return result;
            }
        }
    }
    return null;
}

function getNumberFromId(id)
{
    /*if(id === "items_main")
    {
        return 0;
    }
    const match = id.match(/sub-menu_(\d+)/);
    if (match)
    {
        return parseInt(match[1], 10);
    }
    else
    {
        throw new Error('Invalid ID format');
    }*/
    let item = document.getElementById(id);
    let foundItem;
    if(!item)
    {
        return null;
    }
    if(!(item.tagName === 'LI'))
    {
        foundItem = item.querySelector('li');
    }
    else
    {
        foundItem = item;
    }
    if(foundItem)
    {
        foundItem = findItemById(foundItem.id, items);
        let indexPath = findIndexPath(foundItem, items);

        return indexPath.depth;
    }
    return null;
}

function findParent(itemId, array)
{
    // Recursive function to search for the parent
    function findParentRecursive(item, itemId)
    {
        if (item.id === itemId)
        {
            return null;
        }
        if (item.children)
        {
            for (let child of item.children)
            {
                if (child.id === itemId)
                {
                    return item;
                }
                let parent = findParentRecursive(child, itemId);
                if (parent)
                {
                    return parent;
                }
            }
        }
        return null;
    }
    for (let item of array)
    {
        let parent = findParentRecursive(item, itemId);
        if (parent)
        {
            return parent;
        }
    }
    return null;
}

let startTime;

function playSong(newSong)
{
    clearTimeout(preloadTimeout);
    song[currentSource].pause();
    currentSource = currentSource?0:1;
    if (newSong.playSong)
    {
        song[currentSource].volume = volume;
        song[currentSource].src = newSong.playSong;
        changeRecord = false;
        nextSong = null;
        startAnimation();
    }
}

let startTime2;
let startTime3;

function playNextSong()
{
    clearTimeout(preloadTimeout);
    startTime2 = performance.now();
    song[currentSource].pause();
    currentSource = currentSource?0:1;
    startAnimation();
}

let currentLength = 0;

function startSong()
{
    song[currentSource].currentTime = 0;
    song[currentSource].play().then(() =>{

        document.getElementById('textTotalTime').textContent = getLengthOfSongString(findItemFromSong (song[currentSource].src, items));
        resumeRotation();
        if(nextSongTimeout)
        {
            clearTimeout(nextSongTimeout);
        }
        for(let i = 0; i < 2; i++)
        {
            song[i].volume = volume;
            song[i].removeEventListener('seeked', seekedEventListener)
            song[i].removeEventListener('pause', pauseSeekedEventListener);
            song[i].removeEventListener('play', seekedEventListener);
        }
        removePlayOverlay();
        addPlayOverlay(song[currentSource].src);
        currentLength += song[currentSource].duration;
        nextSong = getNextSong();
        preloadSong(nextSong);
        song[currentSource].addEventListener('seeking', seekedEventListener)
        song[currentSource].addEventListener('pause', pauseSeekedEventListener);
        song[currentSource].addEventListener('play', seekedEventListener);
        seekedEventListener();
    });
    startTime = performance.now();
}

function pauseSeekedEventListener()
{
    if(nextSongTimeout)
    {
        clearTimeout(nextSongTimeout);
    }
    if(rotateTimeout)
    {
        clearTimeout(rotateTimeout);
    }
}

let rotateTimeout;

function seekedEventListener()
{
    if(nextSongTimeout)
    {
        clearTimeout(nextSongTimeout);
    }
    if(repeatMode !== 'none')
    {
        nextSongTimeout = setTimeout(() =>
        {
            canRotate = false;
            startTime3 = performance.now();
            playNextSong(nextSong);
        }, (song[currentSource].duration - song[currentSource].currentTime)*1000)
    }
    if(((song[currentSource].duration - song[currentSource].currentTime)*1000) > 20)
    {
        if(rotateTimeout)
        {
            clearTimeout(rotateTimeout);
        }
        rotateTimeout = setTimeout(() =>
        {
            pauseRotation();
        }, (song[currentSource].duration - song[currentSource].currentTime - 0.005)*1000)
    }
}

function preloadSong(songs)
{
    if(songs && songs.playSong)
    {
        let index = currentSource?0:1;
        song[index].src = songs.playSong;
        song[index].volume = 0;
        song[index].play();
        preloadTimeout = setTimeout(() => {
            song[index].pause();
            song[index].volume = volume;
            if(debug)
            {
                console.log("ready");
            }
        }, 50)
    }
}

function addPlayOverlay(song)
{
    let child = findItemFromSong(song, items);
    let childItem = document.getElementById(child.id);
    let overlay = [];
    if(childItem)
    {
        childItem = childItem.getElementsByClassName('imageWrapper')[0];
        overlay[0] = document.createElement('img');
        overlay[0].classList.add('overlayImage');
        overlay[0].src = 'img/playing-symbol.png';
        if(findInvertOverlay(child))
        {
            overlay[0].style.filter = 'invert(100%)';
        }
        childItem.appendChild(overlay[0]);
    }

    for(let i = 0; (i < 10) && findParent(child.id, items); i++)
    {
        child = findParent(child.id, items);
        let childItem = document.getElementById(child.id);
        if(childItem)
        {
            childItem = childItem.getElementsByClassName('imageWrapper')[0];
            let parentOverlay = document.createElement('img');
            parentOverlay.classList.add('overlayImage');
            parentOverlay.src = 'img/playing-symbol.png';
            parentOverlay.alt = 'Playing';
            if(findInvertOverlay(child))
            {
                parentOverlay.style.filter = 'invert(100%)';
            }
            childItem.appendChild(parentOverlay);
        }
    }
}

function findInvertOverlay(item)
{
    let imgSRC = getImageFromObject(item);
    if(imgSRC.overlay === 'white')
    {
        return 1;
    }
    return 0;
}

function removePlayOverlay()
{
    let items = Array.from(document.getElementsByClassName('overlayImage'));
    if(items)
    {
        items.forEach(item => item.remove());
    }
}

function findItemFromSong(songSearch, items)
{
    songSearch = songSearch.toString();
    for (let item of items)
    {
        if(item.playSong)
        {
            if (songSearch.includes(item.playSong))
            {
                return item;
            }
        }

        if (item.children)
        {
            const result = findItemFromSong(songSearch, item.children);
            if (result)
            {
                return result;
            }
        }
    }
    return null;
}

let skipped;
let timeSkipped;

document.addEventListener('keypress',(event) =>{
    if(event.key === 's')
    {
        skipped = true;
        timeSkipped = performance.now();
        song[currentSource].currentTime = song[currentSource].duration;
    }
    if(event.key === 'o')
    {
        song[currentSource].currentTime = song[currentSource].duration - 5;
    }
    if(event.key === ' ')
    {
        document.getElementById('btn_play').click();
    }
});
