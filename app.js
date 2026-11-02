const toast = document.getElementById("toast");
let toastTimer;
function notify(message){toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2400)}
function setView(view){const labels={overview:"Overview",ideas:"Idea lab",scripts:"Script studio",calendar:"Content calendar",analytics:"Analytics"};document.getElementById("breadcrumbCurrent").textContent=labels[view]||"Overview";document.querySelectorAll(".nav-item").forEach(item=>item.classList.toggle("active",item.dataset.view===view));if(view!=="overview")notify(labels[view]+" is in the next build phase.");document.getElementById("sidebar").classList.remove("open")}
document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",()=>setView(button.dataset.view)));
document.getElementById("newIdeaButton").addEventListener("click",()=>{setView("ideas");notify("Idea Lab selected — generator is coming in the next phase.")});
document.querySelectorAll(".use-idea").forEach(button=>button.addEventListener("click",()=>notify("Idea saved for your review — local demo only.")));
document.getElementById("menuButton").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
