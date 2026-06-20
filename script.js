const API_KEY = "YOUTUBE_API_KEY";
const PLAYLIST_ID = "PL_19reSn5s9k_mAIDve-CT4RzM2hHcD9L";

let allVideos = [];
let currentCategory = "الكل";

function getCategory(title){

    if(/أتمتة|المساعد|تطبيق|الويب|ويب|مساعد/i.test(title))
        return "أدوات ذكية";
 
    if(/مشكلة|مشاكل|تعديل|حلول|حل/i.test(title))
        return "المشاكل والحلول";

    if(/اكسل|Excel|asc|برنامج|استيراد|أكسل|إكسل|تصدير|ملف|برامج|اختبار|المكون|مكون/i.test(title))
        return "البرامج المساعدة";
    
    if(/ورش|ورشة/i.test(title))
        return "ورش العمل";

    if(/مطابقة|مستوفاة|متبقية|التخطيط/i.test(title))
        return "المطابقة والخطط";

    if(/مرشد|الإرشاد/i.test(title))
        return "الإرشاد والتوزيع";

    if(/رزمة|الرزم|رزم|رزمة|التسجيل|تسجيل/i.test(title))
        return "التسجيل والرزم";

    if(/شعبة|شعب|شعبتين|جدول|جداول|الجدول|أنماط|نمط|مقرر|مقررات|الجداول|القاعات|موازنة/i.test(title))
        return "الجداول والشعب";

    if(/طلب|طباعة|السجل|طباعة|الأكاديمي|سلفة|حسم/i.test(title))
        return "الطلبات والطباعة";

    if(/التدقيق|تقارير|تقرير|تدقيق/i.test(title))
        return "التقارير والمتابعة";

    if(/صلاحيات|صلاحية|تفعيل/i.test(title))
        return "الصلاحيات والإعدادات";

    return "أخرى";
}

async function loadVideos(pageToken = ""){

    let url =
        `https://www.googleapis.com/youtube/v3/playlistItems` +
        `?part=snippet` +
        `&maxResults=50` +
        `&playlistId=${PLAYLIST_ID}` +
        `&key=${API_KEY}` +
        `&pageToken=${pageToken}`;

    const response = await fetch(url);
    const data = await response.json();

data.items.forEach(item => {

    if (
    !item.snippet ||
    !item.snippet.resourceId ||
    !item.snippet.resourceId.videoId ||
    !item.snippet.thumbnails
    ) {
        return;
    }
const title = item.snippet.title.toLowerCase();

if (
    title.includes("private video") ||
    title.includes("deleted video")
){
    return;
}
   allVideos.push({
    title: item.snippet.title,
    thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        "",
    videoId: item.snippet.resourceId.videoId,
    category: getCategory(item.snippet.title)
});

});
    if(data.nextPageToken){
        await loadVideos(data.nextPageToken);
    }
    else{
        createButtons();
        renderVideos();
    }
}

function createButtons(){

    const categories = ["الكل"];

    allVideos.forEach(v => {
        if(!categories.includes(v.category))
            categories.push(v.category);
    });

    const container = document.getElementById("categoryButtons");

    categories.forEach(category => {

        container.innerHTML += `
<button
    class="category-btn ${category === currentCategory ? 'active' : ''}"
    onclick="changeCategory('${category}')">
    ${category}
</button>`;
    });
}

function changeCategory(category){
    currentCategory = category;
    document.getElementById("searchInput").value = "";
    document.getElementById("categoryButtons").innerHTML = "";
    createButtons();
    renderVideos();
}

function renderVideos(){
    const search = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();
    const container = document.getElementById("videos");
    container.innerHTML = "";
    let videos;
    if(search){
        videos = allVideos.filter(v =>
            v.title.toLowerCase().includes(search)
        );
    }
    else{
        videos = allVideos;
        if(currentCategory !== "الكل"){
            videos = videos.filter(v =>
                v.category === currentCategory
            );
        }
    }

    videos.forEach(v => {

        container.innerHTML += `
        <div class="card">

            <a target="_blank"
               href="https://youtube.com/watch?v=${v.videoId}">

                <img src="${v.thumbnail}">
            </a>

            <div class="card-content">

                <h3>${v.title}</h3>

                <div class="category">
                    ${v.category}
                </div>

            </div>

        </div>
        `;
    });
}

document
.getElementById("searchInput")
.addEventListener("input", renderVideos);

loadVideos();
let lastScroll = 0;

window.addEventListener("scroll", () => {

    if (window.innerWidth > 768) return;

    const currentScroll = window.pageYOffset;
    const categories = document.getElementById("categoryButtons");

    if (currentScroll > lastScroll && currentScroll > 100) {
        categories.classList.add("hide");
    } else {
        categories.classList.remove("hide");
    }

    lastScroll = currentScroll;
});
