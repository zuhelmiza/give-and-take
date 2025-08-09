(function(){
  const STORE_KEY = "gt_items_v1";
  function getItems(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || [] }catch(e){ return [] } }
  function saveItems(items){ localStorage.setItem(STORE_KEY, JSON.stringify(items)); }
  function uid(){ return Math.random().toString(36).slice(2,9) }
  function readFileAsImage(file){ return new Promise((resolve, reject)=>{ const fr=new FileReader(); fr.onload=()=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=reject; img.src=fr.result; }; fr.onerror=reject; fr.readAsDataURL(file); }); }
  async function compressImageToDataURL(file, maxDim=900, quality=0.82){
    try{ const img=await readFileAsImage(file); const c=document.createElement('canvas'); let {width,height}=img;
      const scale=Math.min(1, maxDim/Math.max(width,height)); width=Math.round(width*scale); height=Math.round(height*scale);
      c.width=width; c.height=height; c.getContext('2d').drawImage(img,0,0,width,height); return c.toDataURL('image/jpeg',quality);
    }catch(e){ console.warn('Image processing failed:',e); return ''; }
  }
  function renderListings(){
    const grid=document.querySelector("[data-listings]"); if(!grid) return;
    const q=(document.querySelector("[data-search]")||{}).value?.toLowerCase()||"";
    const cat=(document.querySelector("[data-cat]")||{}).value||"all";
    const items=getItems().filter(it=>{ const mq=q?(it.title.toLowerCase().includes(q)||it.desc.toLowerCase().includes(q)):true; const mc=(cat==="all")?true:it.category===cat; return mq&&mc; });
    grid.innerHTML = items.map(it => `
      <article class="card">
        <div class="media"><img alt="" src="${it.img || 'assets/img/placeholder.svg'}"></div>
        <div class="content">
          <h3>${it.title}</h3>
          <div class="meta">Type: ${it.type} • Category: ${it.category}</div>
          <p>${it.desc}</p>
          <div class="chips">
            <span class="chip">${it.location||'Unknown location'}</span>
            <span class="chip">${it.contact||'No contact'}</span>
          </div>
        </div>
      </article>`
    ).join("") || `<p class="help">No items yet. Be the first to post on the <a href="post.html">Give</a> or <a href="request.html">Request</a> page.</p>`;
  }
  function handlePostForm(){
    const form=document.querySelector("#postForm"); if(!form) return;
    form.addEventListener("submit", async e=>{
      e.preventDefault(); const fd=new FormData(form);
      let imgData=""; const file=form.querySelector('input[name="image"]')?.files?.[0]; if(file){ imgData=await compressImageToDataURL(file); }
      const item={ id:uid(), type:"give", title:fd.get("title").trim(), category:fd.get("category"), desc:fd.get("desc").trim(), contact:fd.get("contact").trim(), location:fd.get("location").trim(), img:imgData };
      const items=getItems(); items.unshift(item); saveItems(items); form.reset(); alert("Thanks! Your item has been saved locally (demo). See it on Browse."); window.location.href="listings.html";
    });
  }
  function handleRequestForm(){
    const form=document.querySelector("#requestForm"); if(!form) return;
    form.addEventListener("submit", async e=>{
      e.preventDefault(); const fd=new FormData(form);
      let imgData=""; const file=form.querySelector('input[name="image"]')?.files?.[0]; if(file){ imgData=await compressImageToDataURL(file); }
      const item={ id:uid(), type:"request", title:fd.get("title").trim(), category:fd.get("category"), desc:fd.get("desc").trim(), contact:fd.get("contact").trim(), location:fd.get("location").trim(), img:imgData };
      const items=getItems(); items.unshift(item); saveItems(items); form.reset(); alert("Request saved locally (demo). See it on Browse."); window.location.href="listings.html";
    });
  }
  function seedIfEmpty(){ if(getItems().length) return;
    const seed=[
      {id:uid(),type:"give",title:"Baby stroller (good condition)",category:"household",desc:"Lightweight stroller, gently used. Pick-up only.",contact:"wa.me/0123456789",location:"Cyberjaya",img:"assets/img/placeholder.svg"},
      {id:uid(),type:"request",title:"Looking for Form 4 Math reference book",category:"books",desc:"Any edition is fine. Will return after exam.",contact:"email@example.com",location:"Putrajaya",img:"assets/img/placeholder.svg"},
      {id:uid(),type:"give",title:"Weekend lawn-mowing help",category:"services",desc:"Can help neighbors on Sunday mornings.",contact:"@zuhelmiza",location:"Seri Kembangan",img:"assets/img/placeholder.svg"}
    ]; saveItems(seed);
  }
  function bindFilters(){ const s=document.querySelector("[data-search]"); const c=document.querySelector("[data-cat]"); if(s){ s.addEventListener("input",renderListings) } if(c){ c.addEventListener("change",renderListings) } }
  document.addEventListener("DOMContentLoaded", ()=>{ seedIfEmpty(); renderListings(); handlePostForm(); handleRequestForm(); bindFilters(); });
})();
