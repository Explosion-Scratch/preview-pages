let ctrl = false;
let mouse = {x: 0, y: 0}
window.onkeydown = (e) => {
    ctrl = e.ctrlKey || e.metaKey;
}
window.onkeyup = (e) => {
    ctrl = e.ctrlKey || e.metaKey;
}
window.onblur = () => (ctrl = false);

window.onmousemove = (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    const el = e.target.closest('a');
    if (el && ctrl && !findEl(el.href)){
        popup(el);
    }
}

function popup(element){
    chrome.runtime.sendMessage({msg: "iframe-unlock", url: element.href});
    console.log(element);
    const a = document.createElement("div");
    a.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" stroke-opacity=".3" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.3s" values="60;0"/></path><path stroke-dasharray="15" stroke-dashoffset="15" d="M12 3C16.9706 3 21 7.02944 21 12"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="15;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></g></svg>`;
    const ifr = document.createElement("iframe");
    ifr.src = element.href;
    ifr.setAttribute("sandbox", "")
   let timeout = null;
   let loaded = false;
    ifr.onload = () => {
       loaded = true;
        ifr.style.opacity = 1;
    }
    setTimeout(() => {
      if (!loaded){
         console.log("Not loaded");
         a.innerHTML = "<i style='color: #888'>There was an error</i>";
      }
    }, 5000)
    const SCALE = .8;
    a.appendChild(ifr);
    a.setAttribute("data-link", hash(element.href));
    ifr.setAttribute("style", `
        border: none;
        padding: 0;
        margin: 0;
        position: absolute;
        top: 0;
        right: 0;
        height: ${100 / SCALE}%;
        width: ${100 / SCALE}%;
        display: block;
        opacity: 0;
        transform-origin: top right;
        transform: scale(${SCALE});
        background: white !important;
        transition: opacity .4s ease;
    `)
    a.setAttribute("style", `
        z-index: 1000000000000;
        width: clamp(400px, 40vw, 600px);
        display: flex;
        justify-content: center;
        align-items: center;
        height: clamp(300px, 40vh, 600px);
        padding: 0;
        margin: 0;
        overflow: hidden;
        position: fixed;
        background: white !important;
        top: ${mouse.y + 10}px;
        left: ${mouse.x + 10}px;
        border-radius: 4px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
    `)
    document.body.appendChild(a);
   const del = () => {
      loaded = true;
      a.remove();
      chrome.runtime.sendMessage({msg: "iframe-relock"});
   };
    element.onmouseleave = () => {
       timeout = setTimeout(del, 600);
    }
    a.onmouseenter = () => {
       if (timeout){clearTimeout(timeout)};
       a.onmouseleave = del;
    }
}

function findEl(url){
    return [...document.querySelectorAll("div")].find(i => i.getAttribute("data-link") === hash(url))
}

function hash(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1>>>0)).toString(16);
};