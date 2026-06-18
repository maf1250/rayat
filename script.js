const API_KEY = "AIzaSyBft7vPnq7X_81wcoZEzDi2N72hG6tb4J4";
const PLAYLIST_ID = "PL_19reSn5s9k_mAIDve-CT4RzM2hHcD9L";

let allVideos = [];
let currentCategory = "الكل";

function getCategory(title){

    if(/ورشة/i.test(title))
        return "ورش العمل";

    if(/مطابقة|مستوفاة|متبقية|التخطيط/i.test(title))
        return "المطابقة والخطط";

    if(/مرشد|الإرشاد/i.test(title))
        return "الإرشاد والتوزيع";

    if(/رزمة|تسجيل/i.test(title))
        return "التسجيل والرزم";

    if(/شعبة|شعب|جدول|جداول|الجدول|الجداول|القاعات|موازنة/i.test(title))
        return "الجداول والشعب";

    if(/طلب|طباعة|السجل الأكاديمي|سلفة|حسم/i.test(title))
        return "الطلبات والطباعة";

    if(/غياب|انقطاع|تقرير|تدقيق/i.test(title))
        return "التقارير والمتابعة";

    if(/اكسل|Excel|برنامج|استيراد|تصدير|أداة/i.test(title))
        return "البرامج والأدوات";

    if(/مشكلة|مشاكل|حلول|حل/i.test(title))
        return "المشاكل والحلول";

    if(/صلاحيات|صلاحية|تفعيل/i.test(title))
        return "الصلاحيات والإعدادات";

    if(/أتمتة|مساعد آلي/i.test(title))
        return "أدوات رايات الجديدة";

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
        !item.snippet.thumbnails
    ) {
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

        container.innerHTML +=
        `<button class="category-btn"
            onclick="changeCategory('${category}')">
            ${category}
        </button>`;
    });
}

function changeCategory(category){
    currentCategory = category;
    renderVideos();
}

function renderVideos(){

    const search =
        document.getElementById("searchInput")
        .value
        .toLowerCase();

    const container = document.getElementById("videos");

    container.innerHTML = "";

    let videos = allVideos.filter(v =>
        v.title.toLowerCase().includes(search)
    );

    if(currentCategory !== "الكل"){
        videos = videos.filter(v =>
            v.category === currentCategory
        );
    }

    videos.forEach(v => {

        container.innerHTML += `
        <div class="card">

            <a
              target="_blank"
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
