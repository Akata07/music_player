
let div_record_player;

let canRotate;

let record, containerOld, containerNew, needle, label;
let button;
let volume;

let animateNeedle;

function startAnimation()
{
    document.getElementById('textCurrentTime').textContent = '--:--';
    document.getElementById('textTotalTime').textContent = '--:--';
    //Starting the animation to change record/song
    if(!record || changeRecord)
    {
        replaceRecord();
        resumeRotation();
        return;
    }
    if(!label.style.backgroundImage.includes(getImageFromObject(findItemFromSong(song[currentSource].src, items)).icon))
    {
        replaceRecord();
        resumeRotation();
        return;
    }
    resumeRotation();
    startSong();
}

document.addEventListener('DOMContentLoaded', function() {

    needle = document.getElementById("tone_arm");
    document.getElementById("slider_volume").addEventListener('input', function()  {
        volume = logSlider(this.value)
        volume -= 1;
        volume /= 100;
        volume = (volume > 1)?1:volume;
        song[0].volume = volume;
        song[1].volume = volume;
    })
    volume = logSlider(document.getElementById("slider_volume").value);
    volume -= 1;
    volume /= 100;
    volume = (volume > 1)?1:volume;
    button = document.getElementById("btn_play_record_player");
    button.addEventListener("click", () =>
    {
        togglePause();
    })
});

function replaceRecord()
{
    canRotate = false;
    rotateNeedle(0);
    animateNeedle = false;
    needle.addEventListener('transitionend', handlerTransitionNeedle)
}

function handlerTransitionNeedle()
{
    needle.removeEventListener('transitionend', handlerTransitionNeedle);
    div_record_player = document.getElementById("record_player");
    let records = Array.from(div_record_player.getElementsByClassName("container_record"));
    createRecord();
    if(records[0])
    {
        records[0].style.animation = "flyOut 0.5s linear";
        records[0].addEventListener("animationend", ()=>
        {
            records.forEach((element) => element.remove());
            containerNew.style.visibility = "visible";
            containerNew.style.animation = "flyIn 0.5s ease-out";
            containerNew.addEventListener("animationend", handleAnimationEnd);
        });
    }
    else
    {
        containerNew.style.visibility = "visible";
        containerNew.style.animation = "flyIn 0.5s ease-out";
        containerNew.addEventListener("animationend", handleAnimationEnd);
    }
}

function handleAnimationEnd()
{
    record.style.animation = null;
    startSong();
    containerNew.removeEventListener('animationend', handleAnimationEnd);
    containerOld = containerNew;
    containerNew = null;
    animateNeedle = true;
}

function createRecord()
{
    let backgroundImage = findItemFromSong(song[currentSource].src, items)
    backgroundImage = getImageFromObject(backgroundImage);
    containerNew = document.createElement("div");
    containerNew.classList.add("container_record");
    containerNew.style.visibility = "hidden";
    record = document.createElement("div");
    record.classList.add("record");
    label = document.createElement("div");
    label.classList.add("label");
    label.style.backgroundImage = 'url(' + backgroundImage.icon + ')';


    div_record_player.appendChild(containerNew);
    containerNew.appendChild(record);
    record.appendChild(label);

    void containerNew.offsetWidth;
    void record.offsetWidth;

    record.style.animation = "none";
}

function resumeRotation()
{
    canRotate = true;
    requestAnimationFrame(rotationHandler);
}

let rotationTime;

let animationFrameId = null;

function rotationHandler()
{
    if(!canRotate)
    {
        return;
    }
    if(!record)
    {
        return;
    }
    let currentSong = findItemFromSong(song[currentSource].src, items);
    if(!currentSong)
    {
        return;
    }
    let currentTime = currentSong.songStart + song[currentSource].currentTime;
    const rpm = 31;
    const degreesPerSecond = rpm * 6;
    let rotationAngle = (degreesPerSecond * currentTime) % 360;
    record.style.transform = "rotate(" + rotationAngle + "deg) translate(-50%,-50%)";
    if((song[currentSource].currentTime / song[currentSource].duration)*100)
    {
        progressBar.value = (song[currentSource].currentTime / song[currentSource].duration)*100;
        document.getElementById('textCurrentTime').textContent = makeStringFromTime(song[currentSource].currentTime);
    }
    if(animateNeedle)
    {
        rotateNeedle(8 + (currentTime / findParent(currentSong.id, items).albumLength)*27);
    }
    if(canRotate)
    {
        animationFrameId = requestAnimationFrame(rotationHandler);
    }
    rotationTime = performance.now();
}

function pauseRotation()
{
    if(animationFrameId)
    {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        canRotate = false;
    }
}

function getImageFromObject(object)
{
    let imgSRC = object;
    while((imgSRC !== null) && !imgSRC.icon)
    {
        if(!imgSRC.icon)
        {
            imgSRC = findParent(imgSRC.id, items)
        }
    }
    return imgSRC;
}

function rotateNeedle(angle)
{
    let previousAngle = needle.style.transform;
    if(previousAngle)
    {
        let values = previousAngle.split('(')[1];
        values = values.split(')')[0];
        values = values.split(',');

        let a = parseFloat(values[0]);
        let b = parseFloat(values[1]);
        previousAngle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    }
    else
    {
        previousAngle = 0;
    }
    needle.style.transitionDuration = (Math.abs(previousAngle - angle))+0.1 + "s";
    needle.style.transform = "rotate(" + angle + "deg)";
}

function togglePause()
{
    if(!song[currentSource].src)
    {
        return;
    }
    if(song[currentSource].paused)
    {
        document.getElementById('imageBtnPausePlay').src = 'img/icon_pause_button.png';
        song[currentSource].play();
    }
    else
    {
        document.getElementById('imageBtnPausePlay').src = 'img/icon_play_button.png';
        song[currentSource].pause();
    }
}

function logSlider(position)
{
    let minP = 0;
    let maxP = 1;

    let minV = Math.log(1);
    let maxV = Math.log(101);

    let scale = (maxV-minV) / (maxP-minP);

    return Math.exp(minV + scale*(position-minP));
}

function cycleLowerIndex(album)
{
    let children = Array.from(album.children);
    let currentSong = song[currentSource].src;
    if(!currentSong)
    {
        return children[0];
    }
    let currentSongItem = findItemFromSong(currentSong, items);
    let currentSongPath = findIndexPath(currentSongItem, items);
    let albumPath = findIndexPath(album, items);
    if(albumPath.indexPath[albumPath.indexPath.length - 1] !== currentSongPath.indexPath[albumPath.indexPath.length - 1])
    {
        return children[0];
    }
    else if(albumPath.indexPath.length >= 2)
    {
        if(albumPath.indexPath[albumPath.indexPath.length - 2] !== currentSongPath.indexPath[albumPath.indexPath.length - 2])
        {
            return children[0];
        }

    }
    currentSongPath.indexPath[albumPath.indexPath.length] += 1;
    if(getItem(items, currentSongPath.indexPath))
    {
        return getItem(items, currentSongPath.indexPath);
    }
    return children[0];
}

function findNextItem(item)
{
    let itemPath = findIndexPath(item, items).indexPath;
    itemPath[itemPath.length - 1] += 1;
    let nextItem = getItem (items, itemPath)
    if(nextItem)
    {
        return nextItem;
    }
}

function getLengthOfSongString(item)
{
    return makeStringFromTime(getLengthOfSong(item))
}

function getLengthOfSong(item)
{
    if(findNextItem(item))
    {
        return findNextItem(item).songStart - item.songStart;
    }
    else
    {
        let parent = findParent(item.id, items);
        if(parent)
        {
            if(parent.albumLength)
            {
                return parent.albumLength - item.songStart;
            }
        }
    }
}

function handleMarquee()
{
    let marquee = document.getElementById('marqueeSongName');
    let marqueeText = marquee.querySelectorAll('li');
    let newText = findItemFromSong(song[currentSource].src, items).text;
    marqueeText[0].textContent = newText;

    let animationTime = marqueeText[0].offsetWidth/40;

    if(marqueeText[0].offsetWidth > (0.3*visualViewport.width))
    {
        marqueeText[1].textContent = newText;
        marqueeText[0].classList.add('animated');
        marqueeText[0].style.setProperty('--scroll-duration', animationTime + 's');
        marqueeText[1].classList.add('animated');
        marqueeText[1].style.setProperty('--scroll-duration', animationTime + 's');
        marqueeText[1].classList.remove('invisible');
    }
    else
    {
        marqueeText[0].classList.remove('animated');
        marqueeText[1].classList.remove('animated');
        marqueeText[1].classList.add('invisible');
    }
    let currentItem = findItemFromSong(song[currentSource].src, items);
    let artistItem = currentItem;
    for(let i = 0; (i < 5) && (artistItem.class !== 'artist'); i++)
    {
        artistItem = findParent(artistItem.id, items);
    }
    let textArtist = artistItem.text;
    if(currentItem.feat)
    {
        textArtist += " (feat." + currentItem.feat + ")";
    }

    marquee = document.getElementById('marqueeArtist');
    marqueeText = marquee.querySelectorAll('li');
    marqueeText[0].textContent = textArtist;

    animationTime = marqueeText[0].offsetWidth/40;

    if(marqueeText[0].offsetWidth > (0.3*visualViewport.width))
    {
        marqueeText[1].textContent = textArtist;
        marqueeText[1].classList.add('animated');
        marqueeText[1].style.setProperty('--scroll-duration', animationTime + 's');
        marqueeText[0].classList.add('animated');
        marqueeText[0].style.setProperty('--scroll-duration', animationTime + 's');
        marqueeText[1].classList.remove('invisible');
    }
    else
    {
        marqueeText[0].classList.remove('animated');
        marqueeText[1].classList.remove('animated');
        marqueeText[1].classList.add('invisible');
    }
}

function handlerControls(control)
{
    switch(control)
    {
        case 'previous':
            playSong(getPreviousSong());
            break;
        case 'playPause':
            togglePause();
            break;
        case 'next':
            playSong(getNextSong());
            break;
    }
}

function controlsMouseDown(control)
{
    switch(control)
    {
        case 'previous':
            document.getElementById('imageBtnPrevious').classList.add('clicked');
            break;
        case 'playPause':
            document.getElementById('imageBtnPausePlay').classList.add('clicked');
            break;
        case 'next':
            document.getElementById('imageBtnNext').classList.add('clicked');
            break;
    }
}

function controlsMouseUp(control)
{
    switch(control)
    {
        case 'previous':
            document.getElementById('imageBtnPrevious').classList.remove('clicked');
            break;
        case 'playPause':
            document.getElementById('imageBtnPausePlay').classList.remove('clicked');
            break;
        case 'next':
            document.getElementById('imageBtnNext').classList.remove('clicked');
            break;
    }
}
