document.addEventListener("DOMContentLoaded", function(){
    let weekly = document.querySelector(".weekly");
    if (weekly){
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }
        
        Date.prototype.getMMDDFormat = function() {
            var mm = this.getMonth() + 1; // getMonth() is zero-based
            var dd = this.getDate();
    
            return [(mm > 9 ? '' : '0') + mm,
                    (dd > 9 ? '' : '0') + dd].join('/');
            };
    
        const memorize = function(){
            [].slice.apply(document.querySelectorAll("input, select"))
                .filter(input => input.getAttribute("type") !== "file")
                .forEach(input => {
                    localStorage.setItem(input.id, input.value);
                });
        }
    
        const updateWeekly = function(){
            const weekly = document.querySelector(".weekly");
            const backgroundColor = document.querySelector("#backgroundColor").value;
            const backgroundImage = document.querySelector("#backgroundImage").value;
            weekly.style.backgroundColor = backgroundColor;
            weekly.style.backgroundImage = backgroundImage
                ?`url("${backgroundImage}")`
                : "";

            const weeklyLeftPart = document.querySelector(".weekly_left_part");
            const coverArtUrl = document.querySelector("#coverArt").value;
            weeklyLeftPart.style.backgroundImage = coverArtUrl ? `url("${coverArtUrl}")` : "";
    
            const weeklyAuthorPart = document.querySelector(".weekly_author_part");
            const coverDescription = document.querySelector("#coverDescription").value;
            if (coverDescription) {
                weeklyAuthorPart.style.display = "block";
                weeklyAuthorPart.innerHTML = coverDescription;
            }
            else {
                weeklyAuthorPart.style.display = "none";
            }
    
            const startDate = new Date(document.querySelector("#startDate").value);
            let contents = [];
            for(let day = 1 ; day <= 7 ; ++day){
                let currentDate = startDate.addDays(day - 1);
                contents.push({
                    "date": currentDate,
                    "title": document.querySelector(`#day${day}Title`).value,
                    "style": document.querySelector(`#day${day}Style`).value,
                    "tag": document.querySelector(`#day${day}Tag`).value,
                    "time": document.querySelector(`#day${day}Time`).value,
                })
            }
    
            const options = { weekday: 'short'};
            const dayItems = document.querySelectorAll(".weekly_item");
            for(let day = 0; day < 7; ++day){
                dayItems[day].querySelector(".date_part").innerText = contents[day].date.getMMDDFormat();
                dayItems[day].querySelector(".time_part").innerText = 
                    `(${new Intl.DateTimeFormat('zh-TW', options).format(contents[day].date)[1]}) ${contents[day].time}`;
                
                const content = dayItems[day].querySelector(".content");
                if (contents[day].style === "holiday"){
                    if (!content.classList.contains("stream_off")){
                        content.classList.add("stream_off");
                    }
                }
                else {
                    if (content.classList.contains("stream_off")){
                        content.classList.remove("stream_off");
                    }
                }
    
                content.innerHTML = "";
                if (contents[day].tag) {
                    content.innerHTML += `<ul class="weekly_tags">`
                                      + contents[day].tag.split(",").map(tag => `<li>${tag}</li>`).join("")
                                      + `</ul>`;
                }
                content.innerHTML += contents[day].title;
            }
    
            memorize();
        }
    
        document.querySelectorAll("input, select").forEach(input => {
            input.addEventListener("change", updateWeekly); 
            const memorizedContent = localStorage.getItem(input.id);
            if (memorizedContent && input.getAttribute("type") !== "file") {
                input.value = memorizedContent;
            }
        });
    
        updateWeekly();

        function changeWeeklyToFitParent(){
            weekly.style.transform = `scale(${weekly.parentElement.clientWidth / 1920})`; 
        }

        window.addEventListener("resize", function(){
            changeWeeklyToFitParent();
        });
        changeWeeklyToFitParent();

        let downloadButton = document.querySelector("#download_weekly");
        downloadButton.addEventListener("click", function(){
            weekly.style.transform = "scale(1)";

            let originalBorder = weekly.style.border;
            weekly.style.border = "0";
            let newWindow = window.open();
            newWindow.document.write("載入中......");
            domtoimage.toPng(weekly)
                .then(function (_) {
                    domtoimage.toPng(weekly)
                        .then(function (dataUrl) {
                        var img = "<img src='" + dataUrl + "'/>"
                        newWindow.document.body.innerText = "";
                        newWindow.document.write(img);
                        weekly.style.border = originalBorder;
                        changeWeeklyToFitParent();
                    });
                });
        });

        let fileInputs = document.querySelectorAll("input[type=file]");
        if (fileInputs.length > 0){
            for (let fileInput of fileInputs){
                fileInput.addEventListener("change", function(event){
                    const reader = new FileReader();
                    reader.readAsDataURL(fileInput.files[0]);
                    reader.onload = () => {
                        event.target.parentElement.querySelector("input[type=text]").value = reader.result;
                        updateWeekly();
                    };
                })
            }
        }
    }
});