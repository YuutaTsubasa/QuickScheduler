document.addEventListener("DOMContentLoaded", function(){
    const setClassName = function(tag, className, value){
        if (value){
            if (!tag.classList.contains(className)){
                tag.classList.add(className);
            }
        }
        else {
            if (tag.classList.contains(className)){
                tag.classList.remove(className);
            }
        }
    }

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
            const backgroundImageUrl = document.querySelector("#backgroundImageUrl").value;
            weekly.style.backgroundColor = backgroundColor;
            weekly.style.backgroundImage = backgroundImageUrl
                ?`url("${backgroundImageUrl}")`
                : "";

            const styleColorSettingName = "styleColor";
            weekly.classList.forEach(className => {
                if (className.includes(styleColorSettingName)){
                    weekly.classList.remove(className);
                }
            });
            const styleColor = document.querySelector(`#${styleColorSettingName}`).value;
            if (styleColor){
                weekly.classList.add(`${styleColorSettingName}_${styleColor}`);
            }
                
            const weeklyLeftPart = document.querySelector(".weekly_left_part");
            const reverseClassName = "reverse";
            const coverArtPosition = document.querySelector("#coverArtPosition").value;
            const coverArtUrl = document.querySelector("#coverArtUrl").value;
            setClassName(weeklyLeftPart, reverseClassName, coverArtPosition === "right");
            
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
    
            const weeklyTitle = document.querySelector(".weekly_title");
            const titleDescription = document.querySelector("#titleDescription").value;
            weeklyTitle.innerHTML = titleDescription 
                ? titleDescription
                : "本週行事曆";

            const channelLogoPart = document.querySelector(".channel_logo_part");
            const channelLogoUrl = document.querySelector("#channelLogoUrl").value;
            if (channelLogoPart){
                channelLogoPart.innerHTML = channelLogoUrl
                    ? `<img src="${channelLogoUrl}" />`
                    : "";
            }


            const communitySettings = document.querySelectorAll(".community_setting input");
            const weeklyCommunity = document.querySelector(".weekly_community ul");
            
            weeklyCommunity.innerHTML = "";
            for(let communitySetting of communitySettings){
                if (!communitySetting.value)
                    continue;

                let className = communitySetting.id.replace("community_", "");
                weeklyCommunity.innerHTML += 
                    `<li><div class="${className}"><img src="/images/community_logo/${className}.svg" alt="${className}" class="logo"/>${communitySetting.value}</div></li>`
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

                let weekday = `(${new Intl.DateTimeFormat('zh-TW', options).format(contents[day].date)[1]})`;
                let weekdayPart = dayItems[day].querySelector(".weekday_part");
                let timePart = dayItems[day].querySelector(".time_part");
                
                if (weekdayPart) weekdayPart.innerText = weekday;
                if (timePart) timePart.innerText = contents[day].time;
                
                const content = dayItems[day].querySelector(".content");
                setClassName(content, "stream_off", contents[day].style === "holiday");
                setClassName(content, "hidden", contents[day].style === "none");
                
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

        document.querySelectorAll(".file_field").forEach(fileFieldSet => {
            let textField = fileFieldSet.querySelector("input[type=text]");
            let fileField = fileFieldSet.querySelector("input[type=file]");
            let hiddenField = fileFieldSet.querySelector("input[type=hidden]");
            
            if (textField.value)
                hiddenField.value = textField.value;

            textField.addEventListener("change", function(){
                hiddenField.value = textField.value;
                fileField.value = "";
                updateWeekly();
            });

            fileField.addEventListener("change", function(event){
                textField.value = "";
                const reader = new FileReader();
                reader.readAsDataURL(event.target.files[0]);
                reader.onload = () => {
                    hiddenField.value = reader.result;
                    updateWeekly();
                };
            });
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
    }
});